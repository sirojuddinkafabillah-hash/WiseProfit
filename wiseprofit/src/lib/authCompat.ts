// Compatibility types for the old MFA screen while authentication is migrated to Supabase.
// The legacy MFA screen is kept only as a compatibility shim; Supabase Auth is used for login.
export const auth = {};
export class RecaptchaVerifier {
  constructor(..._args: any[]) {}
  clear() {}
}
export interface MultiFactorInfo { uid: string; factorId: string; phoneNumber?: string; }
export interface MultiFactorResolver { hints: MultiFactorInfo[]; }
export const PhoneMultiFactorGenerator = { FACTOR_ID: 'phone' };
export const TotpMultiFactorGenerator = { FACTOR_ID: 'totp' };
export function getMultiFactorResolver(_auth: unknown, _error: unknown): never {
  throw new Error('MFA lama tidak didukung pada WiseProfit. Gunakan pengaturan MFA Supabase.');
}
