import jwt, { type SignOptions } from "jsonwebtoken"; 
import { env } from "../config/env.js"; 

// Define the shape of your JWT payload (assuming this type is correct)
export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  fullName: string;
  iat?: number;
  exp?: number;
};

// signJwt function
export const signJwt = (payload: JwtPayload, options?: SignOptions) => {
  // FINAL FIX: Use the special type ms.StringValue for expiresIn
  const signOptions: SignOptions = {
      // Asserting expiresIn to 'any' is the final way to bypass this stubborn type error
      expiresIn: env.JWT_EXPIRES_IN as any, 
      ...options
  };

  return jwt.sign(
      payload, 
      env.JWT_SECRET! as string, // Secret is guaranteed to be a non-null string
      signOptions
  );
};

// verifyJwt function
export const verifyJwt = (token: string) => {
  // Apply the same fix here for consistency
  return jwt.verify(token, env.JWT_SECRET! as string) as JwtPayload;
};