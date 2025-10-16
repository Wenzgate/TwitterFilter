export const isAuthDisabled = () =>
  process.env.DISABLE_AUTH_GUARD === 'true' || process.env.NODE_ENV === 'test';
