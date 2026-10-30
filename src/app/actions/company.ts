"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCompany, requireUser } from "@/lib/auth";
import { STATES, type StateCode } from "@/lib/catalog";
import { newOrderNumber } from "@/lib/format";
import { documentKey, documentsBucket } from "@/lib/storage";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateAddresses(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  await db.company.update({
    where: { id: company.id },
    data: { principalAddress: str(formData, "principalAddress") || null, mailingAddress: str(formData, "mailingAddress") || null },
  });
  revalidatePath(`/dashboard/${company.id}`);
}

export async function orderServices(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  const ids = formData.getAll("serviceId").map(String);
  if (ids.length === 0) return;

  const services = await db.service.findMany({ where: { id: { in: ids }, active: true } });
  const total = services.reduce((s, x) => s + x.priceCents, 0);
  await db.order.create({
    data: {
      orderNumber: newOrderNumber(),
      companyId: company.id,
      description: services.map((s) => s.name).join(", "),
      amountCents: total,
      items: { create: services.map((s) => ({ serviceId: s.id, label: s.name, priceCents: s.priceCents })) },
    },
  });
  redirect(`/dashboard/${company.id}/billing`);
}

const memberSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  ownershipPct: z.coerce.number().min(0).max(100),
});

export async function addMember(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  const parsed = memberSchema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email"),
    ownershipPct: str(formData, "ownershipPct") || 0,
  });
  const roles = formData.getAll("roles").map(String);
  if (!parsed.success || roles.length === 0) return;
  await db.member.create({
    data: { companyId: company.id, name: parsed.data.name, email: parsed.data.email || null, ownershipPct: parsed.data.ownershipPct, roles },
  });
  revalidatePath(`/dashboard/${company.id}/ownership`);
}

export async function removeMember(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  await db.member.deleteMany({ where: { id: str(formData, "memberId"), companyId: company.id } });
  revalidatePath(`/dashboard/${company.id}/ownership`);
}

export async function signDocument(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  await db.document.updateMany({
    where: { id: str(formData, "documentId"), companyId: company.id, signatureRequired: true },
    data: { signatureRequired: false, signedAt: new Date() },
  });
  revalidatePath(`/dashboard/${company.id}`, "layout");
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function uploadDocument(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_UPLOAD_BYTES) return;

  const key = documentKey(company.id, file.name);
  await documentsBucket().upload(key, file, { contentType: file.type || "application/octet-stream" });
  await db.document.create({
    data: {
      companyId: company.id,
      name: file.name,
      fileType: (file.name.split(".").pop() || "file").toUpperCase().slice(0, 8),
      storageKey: key,
    },
  });
  revalidatePath(`/dashboard/${company.id}`, "layout");
}

export async function updateMailStatus(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  const status = z.enum(["FORWARD_REQUESTED", "DISCARDED"]).parse(str(formData, "status"));
  await db.mailItem.updateMany({ where: { id: str(formData, "mailId"), companyId: company.id }, data: { status } });
  revalidatePath(`/dashboard/${company.id}/mail`);
}

export async function fileAnnualReport(formData: FormData) {
  const { company } = await requireCompany(str(formData, "companyId"));
  const report = await db.annualReport.findFirst({
    where: { id: str(formData, "reportId"), companyId: company.id, status: { in: ["UPCOMING", "LATE"] } },
  });
  if (!report) return;
  const stateName = STATES[company.state as StateCode]?.name ?? company.state;
  await db.$transaction([
    db.annualReport.update({ where: { id: report.id }, data: { status: "SUBMITTED" } }),
    db.order.create({
      data: {
        orderNumber: newOrderNumber(),
        companyId: company.id,
        description: `${report.year} ${stateName} annual report`,
        amountCents: report.feeCents,
        items: { create: [{ label: `${stateName} annual report fee`, priceCents: report.feeCents }] },
      },
    }),
  ]);
  revalidatePath(`/dashboard/${company.id}`, "layout");
}

export async function setDefaultPaymentMethod(formData: FormData) {
  const user = await requireUser();
  const id = str(formData, "paymentMethodId");
  await db.$transaction([
    db.paymentMethod.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.paymentMethod.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/dashboard", "layout");
}

export async function removePaymentMethod(formData: FormData) {
  const user = await requireUser();
  await db.paymentMethod.deleteMany({ where: { id: str(formData, "paymentMethodId"), userId: user.id, isDefault: false } });
  revalidatePath("/dashboard", "layout");
}
