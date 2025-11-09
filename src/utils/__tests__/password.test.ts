import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@utils/password";

describe("password utils", () => {
  it("hashes and validates passwords", async () => {
    const secret = "S3cureP@ssw0rd";
    const hash = await hashPassword(secret);

    expect(hash).not.toEqual(secret);
    expect(hash.length).toBeGreaterThan(secret.length);
    expect(await verifyPassword(secret, hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

