import bcrypt from "bcrypt";

/**
 * Hash a value using bcrypt. Salt rounds are read from environment or default to 10.
 */
export const hashValue = async (
  value: string,
  saltRounds?: number,
): Promise<string> => {
  const rounds = saltRounds ?? Number(process.env.BCRYPT_SALT ?? 10);
  if (Number.isNaN(rounds) || rounds <= 0)
    throw new Error("Invalid bcrypt salt rounds");
  return await bcrypt.hash(value, rounds);
};

/**
 * Compare a plain value against a hashed value. Returns false if hashedValue is undefined.
 */
export const compareValue = async (
  value: string,
  hashedValue?: string,
): Promise<boolean> => {
  if (!hashedValue) return false;
  return bcrypt.compare(value, hashedValue);
};
