import { PrismaClient } from "@prisma/client";
import { SERVICES } from "../src/lib/catalog";

const db = new PrismaClient();

async function main() {
  for (const [i, s] of SERVICES.entries()) {
    await db.service.upsert({
      where: { code: s.code },
      update: { name: s.name, category: s.category, priceCents: s.priceCents, sortOrder: i },
      create: { ...s, sortOrder: i },
    });
  }

  // Accounts live in Neon Auth, so demo data is attached to a user who has already signed up
  // (and logged in once, which creates their profile row): SEED_USER_EMAIL=you@example.com npm run db:seed
  const email = process.env.SEED_USER_EMAIL?.toLowerCase();
  if (!email) {
    console.log("Seeded services. Set SEED_USER_EMAIL to also add a demo company to an existing account.");
    return;
  }
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`No profile for ${email} yet — sign up and log in once, then re-run the seed.`);
    return;
  }

  if (await db.company.count({ where: { ownerId: user.id } })) {
    console.log("Demo data already present.");
    return;
  }

  const card = await db.paymentMethod.create({
    data: { userId: user.id, brand: "Mastercard", last4: "4444", expMonth: 4, expYear: 2030, isDefault: true },
  });
  await db.paymentMethod.create({
    data: { userId: user.id, brand: "Visa", last4: "4242", expMonth: 12, expYear: 2027 },
  });

  const year = new Date().getFullYear();
  await db.company.create({
    data: {
      name: "Acme Ventures LLC",
      entityType: "LLC",
      state: "WY",
      status: "GOOD_STANDING",
      filingId: "2021-000123456",
      ein: "00-0000000",
      formationDate: new Date("2021-05-06"),
      renewalDate: new Date(`${year + 1}-05-01`),
      principalAddress: "123 Example St, Suite 100, Sheridan, WY 82801",
      mailingAddress: "123 Example St, Suite 100, Sheridan, WY 82801",
      packageCode: "virtual-office",
      ownerId: user.id,
      members: {
        create: [
          { name: user.name, email: user.email, roles: ["Member", "Manager"], ownershipPct: 100, isResponsibleParty: true },
        ],
      },
      documents: {
        create: [
          { name: "Articles of Organization.pdf", createdAt: new Date("2021-05-06") },
          { name: "EIN Confirmation Letter.pdf", createdAt: new Date("2021-05-20") },
          { name: "Operating Agreement.docx", fileType: "DOCX", signatureRequired: true },
          { name: "Certificate of Good Standing.pdf" },
        ],
      },
      mailItems: {
        create: [
          { reference: "100001", itemType: "General Mail", sender: "IRS", status: "SCANNED" },
          { reference: "100002", itemType: "Bank Statement", sender: "Example Bank", status: "DISCARDED" },
          { reference: "100003", itemType: "Payment Request", sender: "Vendor Inc", status: "RECEIVED" },
        ],
      },
      orders: {
        create: [
          { orderNumber: "1700000001", description: "Virtual Office + Bundle formation", amountCents: 28100, status: "PAID", paymentMethodId: card.id, createdAt: new Date("2021-05-06") },
          { orderNumber: "1700000002", description: "Monthly subscription", amountCents: 4999, status: "FAILED", paymentMethodId: card.id },
        ],
      },
      subscription: {
        create: { planName: "Virtual Office + Bundle", monthlyCents: 4999, nextPaymentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20) },
      },
      annualReports: {
        create: [
          { year: year - 1, dueDate: new Date(`${year - 1}-05-01`), feeCents: 6000, status: "FILED", filedAt: new Date(`${year - 1}-04-10`) },
          { year, dueDate: new Date(`${year + 1}-05-01`), feeCents: 6000, status: "UPCOMING" },
        ],
      },
    },
  });

  console.log(`Seeded a demo company for ${email}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
