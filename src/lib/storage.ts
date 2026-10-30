import "server-only";
import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

let bucket: Files | undefined;

// Neon Object Storage. Credentials come from the AWS_* vars that `neon env pull` writes.
// Created on first use so builds don't need storage credentials.
export function documentsBucket() {
  bucket ??= new Files({ adapter: neon({ bucket: "documents" }) });
  return bucket;
}

export function documentKey(companyId: string, fileName: string) {
  const safe = fileName.replace(/[^\w.\- ]+/g, "_").slice(-120);
  return `companies/${companyId}/${crypto.randomUUID()}-${safe}`;
}
