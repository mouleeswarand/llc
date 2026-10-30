// End-to-end checks for each Neon service this app uses. Run after `neon deploy`:
//   npx tsx --env-file=.env scripts/smoke-test.mts
// Creates a throwaway user/company, exercises Postgres, Object Storage, AI Gateway,
// Realtime and the compliance Function, then deletes what it created.
import { PrismaClient } from "@prisma/client";
import { Files } from "files-sdk";
import { neon as neonFiles } from "files-sdk/neon";
import { generateText } from "ai";
import { neon } from "@neon/ai-sdk-provider";
import { createRealtime } from "@neon/realtime/server";
import { databaseName, mailQuery } from "../src/lib/realtime-queries";

const db = new PrismaClient();
const results: [string, boolean, string][] = [];

async function check(name: string, fn: () => Promise<string>) {
  try {
    results.push([name, true, await fn()]);
  } catch (e) {
    results.push([name, false, e instanceof Error ? e.message : String(e)]);
  }
}

async function main() {
  const tag = `smoke-${Date.now()}`;
  const user = await db.user.create({ data: { id: tag, email: `${tag}@example.invalid`, name: "Smoke Test" } });
  const company = await db.company.create({
    data: { name: `${tag} LLC`, packageCode: "basic", ownerId: user.id },
  });

  try {
    await check("Postgres (Prisma, pooled DATABASE_URL)", async () => {
      const services = await db.service.count();
      return `connected; ${services} services in catalog`;
    });

    await check("Neon Auth (sign-up → sign-in → session)", async () => {
      // Talks to the Managed Auth server directly, as the app's /api/auth proxy does.
      // Leaves a smoke-test account in Neon Auth (visible under Auth → Users).
      const base = process.env.NEON_AUTH_BASE_URL!;
      const headers = { "Content-Type": "application/json", Origin: "http://localhost:3000" };
      const creds = { email: `${tag}@example.com`, password: `Pw-${tag}`, name: "Smoke Test" };
      const signUp = await fetch(`${base}/sign-up/email`, { method: "POST", headers, body: JSON.stringify(creds) });
      if (!signUp.ok) throw new Error(`sign-up ${signUp.status}: ${await signUp.text()}`);
      const signIn = await fetch(`${base}/sign-in/email`, {
        method: "POST", headers, body: JSON.stringify({ email: creds.email, password: creds.password }),
      });
      if (!signIn.ok) throw new Error(`sign-in ${signIn.status}: ${await signIn.text()}`);
      const cookie = signIn.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
      const session = await fetch(`${base}/get-session`, { headers: { ...headers, Cookie: cookie } });
      const body = (await session.json()) as { user?: { email?: string } } | null;
      if (body?.user?.email !== creds.email) throw new Error(`get-session returned ${JSON.stringify(body)}`);
      const badLogin = await fetch(`${base}/sign-in/email`, {
        method: "POST", headers, body: JSON.stringify({ email: creds.email, password: "wrong-password" }),
      });
      if (badLogin.ok) throw new Error("wrong password was accepted");
      return `${creds.email} signed up, signed in, session OK; wrong password rejected (${badLogin.status})`;
    });

    await check("Object Storage (documents bucket)", async () => {
      const files = new Files({ adapter: neonFiles({ bucket: "documents" }) });
      const key = `smoke/${tag}.txt`;
      await files.upload(key, `hello ${tag}`, { contentType: "text/plain" });
      const url = await files.url(key, { expiresIn: 60 });
      const body = await (await fetch(url)).text();
      await files.delete(key);
      if (body !== `hello ${tag}`) throw new Error(`presigned GET returned ${JSON.stringify(body)}`);
      return "upload → presigned download → delete OK";
    });

    await check("AI Gateway", async () => {
      if (!process.env.NEON_AI_GATEWAY_TOKEN) return "skipped (not enabled; needs a paid Neon plan)";
      const { text } = await generateText({
        model: neon(process.env.AI_MODEL || "claude-haiku-4-5"),
        maxOutputTokens: 20,
        prompt: "Reply with exactly: pong",
      });
      if (!/pong/i.test(text)) throw new Error(`unexpected reply: ${text}`);
      return `model replied "${text.trim()}"`;
    });

    await check("Realtime (live mail query)", async () => {
      const realtime = createRealtime({
        url: process.env.NEON_REALTIME_URL!,
        secret: process.env.NEON_REALTIME_SECRET!,
        db: databaseName(),
      });
      try {
        const sub = await realtime.subscribe(mailQuery(user.id, company.id));
        const ref = `${tag}-mail`;
        const seen = new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("no live update within 20s")), 20_000);
          sub.onChange((snap) => {
            if (snap.data?.some((r) => r.reference === ref)) {
              clearTimeout(timer);
              resolve();
            }
          });
        });
        await new Promise((r) => setTimeout(r, 1500)); // let the initial result arrive
        await db.mailItem.create({ data: { companyId: company.id, reference: ref, itemType: "General Mail" } });
        await seen;
        sub.unsubscribe();
        return "insert pushed to subscriber";
      } finally {
        realtime.close();
      }
    });

    await check("Function (compliance)", async () => {
      const url = process.env.NEON_FUNCTION_COMPLIANCE_BASE_URL;
      if (!url) throw new Error("NEON_FUNCTION_COMPLIANCE_BASE_URL missing — run `neon env pull`");
      // The first request after a deploy or idle period can hit a cold start; retry once.
      const res = await fetch(url).catch(() => new Promise((r) => setTimeout(r, 3000)).then(() => fetch(url)));
      const json = (await res.json()) as { ok?: boolean };
      if (!res.ok || !json.ok) throw new Error(`GET / returned ${res.status} ${JSON.stringify(json)}`);
      return "GET / reached Postgres";
    });
  } finally {
    await db.company.delete({ where: { id: company.id } });
    await db.user.delete({ where: { id: user.id } });
  }

  for (const [name, ok, detail] of results) console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${detail}`);
  if (results.some(([, ok]) => !ok)) process.exitCode = 1;
}

main().finally(() => db.$disconnect());
