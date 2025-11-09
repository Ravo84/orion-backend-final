import { z } from "zod";

export const upsertConfigurationSchema = z.object({
  key: z.string().min(3),
  value: z.any(),
  scope: z.string().optional()
});

export type UpsertConfigurationSchema = z.infer<typeof upsertConfigurationSchema>;

