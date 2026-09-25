import type { EmailAttachment } from "@/lib/email";
import { isPreviewMode } from "@/lib/site-mode";

export type SubmissionType = "contact" | "application" | "registration" | "bid";

/** A validated submission, ready to persist. */
export type SubmissionRecord = {
  type: SubmissionType;
  /** Validated form fields (zod output). */
  data: Record<string, unknown>;
  /** Uploaded files, already validated. */
  attachments: EmailAttachment[];
  submittedAt: Date;
};

export type RecordSubmission = (record: SubmissionRecord) => Promise<void>;

/**
 * BACKEND ATTACHMENT POINT: persist submissions (database, CMS, ATS).
 *
 * Every form handler calls this once per valid submission, before notification emails go out.
 * It is a no-op today because submissions are delivered by email only. SUMMIT-237 replaces the
 * body with a real store (and uploads attachments to file storage); see docs/BACKEND.md.
 */
export const recordSubmission: RecordSubmission = async (record) => {
  if (isPreviewMode()) {
    console.info(`[submission:preview] ${record.type} accepted (not stored)`, {
      fields: Object.keys(record.data),
      attachments: record.attachments.map((a) => a.filename),
    });
  }
};
