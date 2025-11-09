import { ensureSeedAdmin } from "@services/auth.service";

const seed = async () => {
  await ensureSeedAdmin();
};

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Seed completed");
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });

