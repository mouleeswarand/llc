import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Live queries (Mail inbox). List every origin the browser app runs on.
  preview: {
    realtime: {
      allowedOrigins: [
        "http://localhost:3000",
        "https://llc-ashy.vercel.app",
        "https://taglion.com",
        "https://www.taglion.com",
      ],
    },
  },
  // Managed Better Auth: customer sign-up / sign-in.
  auth: true,
  // AI Gateway (company-name suggestions in the wizard) needs a paid Neon plan.
  // Uncomment after upgrading; the app hides the feature until NEON_AI_GATEWAY_TOKEN exists.
  // aiGateway: true,
  functions: {
    // Daily compliance sweep: flags annual reports that are past due.
    compliance: { name: "Compliance sweep", source: "./functions/compliance.ts" },
  },
  triggers: {
    "daily-compliance": {
      type: "schedule",
      function: "compliance",
      cron: "0 6 * * *",
      functionPath: "/cron",
    },
  },
  buckets: {
    // Company documents (articles, EIN letters, uploads). Private: served via presigned URLs.
    documents: { access: "private" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
