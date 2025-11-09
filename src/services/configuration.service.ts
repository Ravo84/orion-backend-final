import { prisma } from "../lib/prisma.js";
import type { UpsertConfigurationSchema } from "../validators/configuration.validator.js";

export const listConfigurations = async () => {
  return prisma.configuration.findMany({ orderBy: { key: "asc" } });
};

export const upsertConfiguration = async (input: UpsertConfigurationSchema) => {
  return prisma.configuration.upsert({
    where: { key: input.key },
    create: {
      key: input.key,
      value: typeof input.value === "string" ? input.value : JSON.stringify(input.value),
      scope: input.scope ?? "global"
    },
    update: {
      value: typeof input.value === "string" ? input.value : JSON.stringify(input.value),
      scope: input.scope ?? "global"
    }
  });
};

export const deleteConfiguration = async (key: string) => {
  await prisma.configuration.delete({ where: { key } });
};

