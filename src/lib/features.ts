/**
 * Feature flags, read from NEXT_PUBLIC_FEATURE_* environment variables so they work
 * in server and client code. They are inlined at build time: change the variable
 * in Vercel and redeploy to switch a feature on.
 */
export const features = {
  plans: process.env.NEXT_PUBLIC_FEATURE_PLANS === 'true',
} as const;
