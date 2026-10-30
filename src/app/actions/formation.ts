"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser, syncUser } from "@/lib/auth";
import { STATES, getPackage, type StateCode } from "@/lib/catalog";
import { newOrderNumber } from "@/lib/format";

const memberSchema = z.object({
  name: z.string().trim().min(1, "Every owner needs a name"),
  email: z.string().trim().email().optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "Pick at least one role per owner"),
  ownershipPct: z.coerce.number().min(0).max(100),
});

const formationSchema = z.object({
  state: z.enum(Object.keys(STATES) as [StateCode, ...StateCode[]]),
  entityType: z.enum(["LLC", "CORPORATION"]),
  name: z.string().trim().min(2, "Enter a company name"),
  purpose: z.string().trim().optional(),
  members: z.array(memberSchema).min(1, "Add at least one owner"),
  principalAddress: z.string().trim().min(5, "Enter a principal address"),
  mailingAddress: z.string().trim().optional(),
  packageCode: z.string(),
  phone: z.string().trim().optional(),
});

export type FormationInput = z.input<typeof formationSchema>;

export async function submitFormation(input: FormationInput): Promise<{ error: string } | { companyId: string }> {
  const parsed = formationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const pkg = getPackage(data.packageCode);
  if (!pkg) return { error: "Choose a package" };

  const totalPct = data.members.reduce((sum, m) => sum + m.ownershipPct, 0);
  if (Math.abs(totalPct - 100) > 0.01) return { error: `Ownership must add up to 100% (currently ${totalPct}%)` };

  // The wizard signs the user up or in (in the browser) before submitting.
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Your session has expired. Log in and submit again." };
  const userId = (await syncUser(sessionUser, data.phone)).id;

  const state = STATES[data.state];
  const nextYear = new Date().getUTCFullYear() + 1;

  const company = await db.company.create({
    data: {
      name: data.name,
      entityType: data.entityType,
      state: data.state,
      purpose: data.purpose || null,
      principalAddress: data.principalAddress,
      mailingAddress: data.mailingAddress || data.principalAddress,
      packageCode: pkg.code,
      ownerId: userId,
      members: {
        create: data.members.map((m, i) => ({
          name: m.name,
          email: m.email || null,
          roles: m.roles,
          ownershipPct: m.ownershipPct,
          isResponsibleParty: i === 0,
        })),
      },
      orders: {
        create: {
          orderNumber: newOrderNumber(),
          description: `${pkg.name} formation — ${data.name}`,
          amountCents: pkg.priceCents + state.formationFeeCents,
          items: {
            create: [
              { label: `${pkg.name} package`, priceCents: pkg.priceCents },
              { label: `${state.name} state filing fee`, priceCents: state.formationFeeCents },
            ],
          },
        },
      },
      subscription: pkg.monthlyCents
        ? {
            create: {
              planName: pkg.name,
              monthlyCents: pkg.monthlyCents,
              nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          }
        : undefined,
      annualReports: state.annualReportFeeCents
        ? { create: { year: nextYear, dueDate: new Date(Date.UTC(nextYear, 4, 1)), feeCents: state.annualReportFeeCents } }
        : undefined,
    },
  });

  return { companyId: company.id };
}
