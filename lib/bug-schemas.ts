import { z } from "zod";

const SeveritySchema = z.enum(["critical", "high", "medium", "low"]);
const StatusSchema = z.enum(["new", "in_progress", "resolved", "verified", "closed"]);

const AttachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  size: z.number().int().min(0),
  url: z.string().min(1),
});

export const CreateBugSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  stepsToReproduce: z.string().optional().default(""),
  expectedResult: z.string().optional().default(""),
  actualResult: z.string().optional().default(""),
  severity: SeveritySchema.default("medium"),
  status: StatusSchema.optional(),
  environment: z.string().optional(),
  version: z.string().optional(),
  locationRoute: z.string().optional(),
  appName: z.string().optional(),
  attachments: z.array(AttachmentSchema).optional().default([]),
});

export const UpdateBugSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  severity: SeveritySchema.optional(),
  status: StatusSchema.optional(),
  environment: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  locationRoute: z.string().nullable().optional(),
  appName: z.string().nullable().optional(),
  resolvedBy: z.string().nullable().optional(),
  resolvedByEmail: z.string().email().nullable().optional(),
  resolvedAt: z.string().nullable().optional(),
  resolvingDescription: z.string().nullable().optional(),
  verifiedAt: z.string().nullable().optional(),
  verifiedBy: z.string().nullable().optional(),
  verifiedByEmail: z.string().email().nullable().optional(),
  verifierRemarks: z.string().nullable().optional(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const AddBugCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment body is required"),
});

