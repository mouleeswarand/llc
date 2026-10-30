"use client";

import { useState, useTransition } from "react";
import { authClient, goTo } from "@/lib/auth-client";
import { MEMBER_ROLES, PACKAGES, STATES, getPackage, type StateCode } from "@/lib/catalog";
import { money } from "@/lib/format";
import { submitFormation } from "@/app/actions/formation";
import { suggestCompanyNames } from "@/app/actions/ai";

type EntityType = "LLC" | "CORPORATION";
type MemberDraft = { name: string; email: string; roles: string[]; ownershipPct: number };

const STEP_TITLES = ["Entity", "Name", "Owners", "Addresses", "Package", "Review"];

export function FormationWizard({ initialPackage, isLoggedIn, aiEnabled }: { initialPackage?: string; isLoggedIn: boolean; aiEnabled: boolean }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [state, setState] = useState<StateCode>("WY");
  const [entityType, setEntityType] = useState<EntityType>("LLC");
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>([{ name: "", email: "", roles: ["Member"], ownershipPct: 100 }]);
  const [principalAddress, setPrincipalAddress] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [packageCode, setPackageCode] = useState(getPackage(initialPackage ?? "") ? initialPackage! : "standard");
  const [account, setAccount] = useState({ name: "", email: "", phone: "", password: "" });
  const [accountMode, setAccountMode] = useState<"new" | "existing">("new");

  const roles = MEMBER_ROLES[entityType];
  const pkg = getPackage(packageCode)!;
  const stateInfo = STATES[state];
  const totalPct = members.reduce((s, m) => s + (Number(m.ownershipPct) || 0), 0);

  function updateMember(i: number, patch: Partial<MemberDraft>) {
    setMembers((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  }

  function changeEntity(t: EntityType) {
    setEntityType(t);
    setMembers((ms) => ms.map((m) => ({ ...m, roles: [MEMBER_ROLES[t][0]] })));
  }

  function validateStep(): string | null {
    if (step === 1 && name.trim().length < 2) return "Enter a company name.";
    if (step === 2) {
      if (members.some((m) => !m.name.trim())) return "Every owner needs a name.";
      if (members.some((m) => m.roles.length === 0)) return "Pick at least one role per owner.";
      if (Math.abs(totalPct - 100) > 0.01) return `Ownership must add up to 100% (currently ${totalPct}%).`;
    }
    if (step === 3 && principalAddress.trim().length < 5) return "Enter a principal address.";
    return null;
  }

  function next() {
    const err = validateStep();
    setError(err);
    if (!err) setStep((s) => s + 1);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      if (!isLoggedIn) {
        const authError = await signUpOrIn();
        if (authError) return setError(authError);
      }
      const result = await submitFormation({
        state,
        entityType,
        name,
        purpose,
        members,
        principalAddress,
        mailingAddress,
        packageCode,
        phone: account.phone,
      });
      if ("error" in result) setError(result.error);
      else goTo(`/dashboard/${result.companyId}`); // full load so the new session is picked up everywhere
    });
  }

  // Creates the account (or signs in to an existing one) through the Neon Auth client.
  async function signUpOrIn(): Promise<string | null> {
    const email = account.email.trim().toLowerCase();
    if (!email || !account.password) return "Enter your email and password.";
    if (accountMode === "new") {
      if (!account.name.trim()) return "Enter your name.";
      if (account.password.length < 8) return "Use at least 8 characters for your password.";
      const { error } = await authClient.signUp.email({ email, password: account.password, name: account.name.trim() });
      if (!error) return null;
      if (error.status === 422 || error.code?.startsWith("USER_ALREADY_EXISTS")) {
        setAccountMode("existing");
        return "An account with this email already exists. Enter its password to log in.";
      }
      return error.message || "Couldn't create your account.";
    }
    const { error } = await authClient.signIn.email({ email, password: account.password });
    return error ? (error.status === 401 ? "Incorrect email or password." : error.message || "Couldn't log in.") : null;
  }

  return (
    <div>
      <ol className="mb-8 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
        {STEP_TITLES.map((t, i) => (
          <li key={t} className={`rounded-full px-3 py-1 ${i === step ? "bg-brand-600 text-white" : i < step ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}>
            {i + 1}. {t}
          </li>
        ))}
      </ol>

      <div className="card space-y-5">
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold">What are you forming?</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["LLC", "CORPORATION"] as const).map((t) => (
                <button key={t} type="button" onClick={() => changeEntity(t)}
                  className={`rounded-lg border p-4 text-left ${entityType === t ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
                  <div className="font-semibold">{t === "LLC" ? "LLC" : "Corporation"}</div>
                  <div className="text-sm text-slate-600">{t === "LLC" ? "Flexible, pass-through taxation, simple upkeep." : "Shares, a board and officers; suits outside investment."}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="label">State of formation</label>
              <select className="input" value={state} onChange={(e) => setState(e.target.value as StateCode)}>
                {Object.entries(STATES).map(([code, s]) => (
                  <option key={code} value={code}>{s.name} — {money(s.formationFeeCents)} state fee</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">Name your company</h2>
            <div>
              <label className="label">Company name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                placeholder={entityType === "LLC" ? "Acme Ventures LLC" : "Acme Ventures, Inc."} />
              <p className="mt-1 text-xs text-slate-500">
                Must include {entityType === "LLC" ? '"LLC" or "Limited Liability Company"' : '"Inc.", "Corp." or "Corporation"'}. We check availability with the state before filing.
              </p>
            </div>
            <div>
              <label className="label">Business purpose (optional)</label>
              <textarea className="input" rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Residential cleaning services in Sheridan" />
            </div>
            {aiEnabled && <NameSuggestions idea={purpose} entityType={entityType} state={stateInfo.name} onPick={setName} />}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">{entityType === "LLC" ? "Members & managers" : "Shareholders, directors & officers"}</h2>
            {members.map((m, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input className="input" placeholder="Full name" value={m.name} onChange={(e) => updateMember(i, { name: e.target.value })} />
                  <input className="input" placeholder="Email" value={m.email} onChange={(e) => updateMember(i, { email: e.target.value })} />
                  <input className="input" type="number" min={0} max={100} value={m.ownershipPct}
                    onChange={(e) => updateMember(i, { ownershipPct: Number(e.target.value) })} aria-label="Ownership %" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <label key={r} className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={m.roles.includes(r)}
                        onChange={(e) => updateMember(i, { roles: e.target.checked ? [...m.roles, r] : m.roles.filter((x) => x !== r) })} />
                      {r}
                    </label>
                  ))}
                  {members.length > 1 && (
                    <button type="button" className="ml-auto text-sm text-red-600 dark:text-red-400" onClick={() => setMembers((ms) => ms.filter((_, j) => j !== i))}>Remove</button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <button type="button" className="btn-outline" onClick={() => setMembers((ms) => [...ms, { name: "", email: "", roles: [roles[0]], ownershipPct: 0 }])}>+ Add owner</button>
              <span className={`text-sm font-semibold ${Math.abs(totalPct - 100) < 0.01 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>Total ownership: {totalPct}%</span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold">Addresses</h2>
            <div>
              <label className="label">Principal place of business</label>
              <textarea className="input" rows={2} value={principalAddress} onChange={(e) => setPrincipalAddress(e.target.value)} />
            </div>
            <div>
              <label className="label">Mailing address (leave blank to use the principal address)</label>
              <textarea className="input" rows={2} value={mailingAddress} onChange={(e) => setMailingAddress(e.target.value)} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold">Choose a package</h2>
            <div className="grid gap-3">
              {PACKAGES.map((p) => (
                <button key={p.code} type="button" onClick={() => setPackageCode(p.code)}
                  className={`rounded-lg border p-4 text-left ${packageCode === p.code ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
                  <div className="flex justify-between font-semibold">
                    <span>{p.name}</span>
                    <span>{money(p.priceCents)}{p.monthlyCents > 0 && ` + ${money(p.monthlyCents)}/mo`}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{p.features.join(" · ")}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-xl font-semibold">Review</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-slate-500">Company</dt><dd>{name} ({entityType === "LLC" ? "LLC" : "Corporation"}, {stateInfo.name})</dd>
              <dt className="text-slate-500">Owners</dt><dd>{members.map((m) => `${m.name} (${m.ownershipPct}%)`).join(", ")}</dd>
              <dt className="text-slate-500">Package</dt><dd>{pkg.name} — {money(pkg.priceCents)}</dd>
              <dt className="text-slate-500">State fee</dt><dd>{money(stateInfo.formationFeeCents)}</dd>
              <dt className="font-semibold">Due today</dt><dd className="font-semibold">{money(pkg.priceCents + stateInfo.formationFeeCents)}</dd>
            </dl>
            {!isLoggedIn && (
              <div className="space-y-3 border-t border-slate-200 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{accountMode === "new" ? "Create your account" : "Log in to your account"}</h3>
                  <button type="button" className="btn-link" onClick={() => { setError(null); setAccountMode(accountMode === "new" ? "existing" : "new"); }}>
                    {accountMode === "new" ? "I already have an account" : "Create a new account instead"}
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {accountMode === "new" && (
                    <>
                      <input className="input" placeholder="Your name" autoComplete="name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
                      <input className="input" placeholder="Phone (optional)" autoComplete="tel" value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} />
                    </>
                  )}
                  <input className="input" type="email" placeholder="Email" autoComplete="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
                  <input className="input" type="password" autoComplete={accountMode === "new" ? "new-password" : "current-password"}
                    placeholder={accountMode === "new" ? "Password (8+ characters)" : "Password"} value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
                </div>
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-between border-t border-slate-100 pt-5">
          <button type="button" className="btn-outline" disabled={step === 0 || pending} onClick={() => { setError(null); setStep((s) => s - 1); }}>Back</button>
          {step < STEP_TITLES.length - 1 ? (
            <button type="button" className="btn-primary" onClick={next}>Continue</button>
          ) : (
            <button type="button" className="btn-primary" disabled={pending} onClick={submit}>{pending ? "Submitting…" : "Submit order"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function NameSuggestions({ idea, entityType, state, onPick }: { idea: string; entityType: EntityType; state: string; onPick: (name: string) => void }) {
  const [names, setNames] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function suggest() {
    setMessage(null);
    startTransition(async () => {
      const result = await suggestCompanyNames({ idea, entityType, state });
      if ("error" in result) setMessage(result.error);
      else setNames(result.names);
    });
  }

  return (
    <div className="rounded-lg bg-brand-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-700">Need ideas? Describe your business above and we&apos;ll suggest names.</p>
        <button type="button" className="btn-outline shrink-0" disabled={pending || idea.trim().length < 3} onClick={suggest}>
          {pending ? "Thinking…" : "Suggest names"}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message}</p>}
      {names.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {names.map((n) => (
            <button key={n} type="button" onClick={() => onPick(n)} className="rounded-full border border-brand-500 bg-surface px-3 py-1 text-sm text-brand-700 hover:bg-brand-100">{n}</button>
          ))}
        </div>
      )}
    </div>
  );
}
