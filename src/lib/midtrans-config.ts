const SANDBOX_CLIENT_KEY_PREFIX = "SB-Mid-client-";
const PRODUCTION_CLIENT_KEY_PREFIX = "Mid-client-";
const SANDBOX_SERVER_KEY_PREFIX = "SB-Mid-server-";
const PRODUCTION_SERVER_KEY_PREFIX = "Mid-server-";

export const MIDTRANS_LAST_PAYMENT_STORAGE_KEY = "midtrans:last-payment";

function parseBooleanFlag(value?: string) {
  return value?.trim().toLowerCase() === "true";
}

function resolveModeFromKey(
  key: string | undefined,
  sandboxPrefix: string,
  productionPrefix: string,
): boolean | null {
  if (!key) return null;
  if (key.startsWith(sandboxPrefix)) return false;
  if (key.startsWith(productionPrefix)) return true;
  return null;
}

export function resolveMidtransServerMode(serverKey?: string, envFlag?: string) {
  const modeFromKey = resolveModeFromKey(
    serverKey,
    SANDBOX_SERVER_KEY_PREFIX,
    PRODUCTION_SERVER_KEY_PREFIX,
  );

  return modeFromKey ?? parseBooleanFlag(envFlag);
}

export function resolveMidtransClientMode(clientKey?: string, envFlag?: string) {
  const modeFromKey = resolveModeFromKey(
    clientKey,
    SANDBOX_CLIENT_KEY_PREFIX,
    PRODUCTION_CLIENT_KEY_PREFIX,
  );

  return modeFromKey ?? parseBooleanFlag(envFlag);
}

export function getMidtransSnapScriptUrl(isProduction: boolean) {
  return isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}
