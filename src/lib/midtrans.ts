import { resolveMidtransServerMode } from "@/lib/midtrans-config";

interface MidtransCustomer {
  fullName: string;
  email: string;
  city?: string;
  zipCode?: string;
}

interface MidtransCallbacks {
  finish?: string;
  pending?: string;
  error?: string;
}

export interface MidtransChargePayload {
  orderId: string;
  grossAmount: number;
  customer: MidtransCustomer;
  callbacks?: MidtransCallbacks;
  enabledPayments?: string[];
}

interface MidtransTransactionResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransTransactionStatusResponse {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
  status_message?: string;
  payment_type?: string;
  transaction_time?: string;
  settlement_time?: string;
}

interface SnapInstance {
  createTransaction: (payload: unknown) => Promise<MidtransTransactionResponse>;
}

interface SnapConstructor {
  new (config: {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }): SnapInstance;
}

interface MidtransModule {
  Snap: SnapConstructor;
}

export function hasMidtransServerConfig() {
  return Boolean(
    process.env.MIDTRANS_SERVER_KEY &&
      process.env.MIDTRANS_MERCHANT_ID &&
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  );
}

function getMidtransApiBaseUrl(isProduction: boolean) {
  return isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
}

export async function createMidtransTransaction(payload: MidtransChargePayload) {
  const midtransClientModule = (await import("midtrans-client")) as unknown as MidtransModule & {
    default?: MidtransModule;
  };
  const MidtransClient: MidtransModule = midtransClientModule.default ?? midtransClientModule;
  const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string;
  const isProduction = resolveMidtransServerMode(serverKey, process.env.MIDTRANS_IS_PRODUCTION);

  const snap = new MidtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });

  const transactionPayload: Record<string, unknown> = {
    transaction_details: {
      order_id: payload.orderId,
      gross_amount: payload.grossAmount,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: payload.customer.fullName.split(" ")[0],
      last_name: payload.customer.fullName.split(" ").slice(1).join(" ") || "",
      email: payload.customer.email,
      billing_address: {
        city: payload.customer.city ?? "",
        postal_code: payload.customer.zipCode ?? "",
      },
      shipping_address: {
        city: payload.customer.city ?? "",
        postal_code: payload.customer.zipCode ?? "",
      },
    },
  };

  if (payload.callbacks) {
    transactionPayload.callbacks = payload.callbacks;
  }
  if (payload.enabledPayments && payload.enabledPayments.length > 0) {
    transactionPayload.enabled_payments = payload.enabledPayments;
  }

  const response = (await snap.createTransaction(transactionPayload)) as MidtransTransactionResponse;

  return {
    token: response.token,
    redirectUrl: response.redirect_url,
  };
}

export async function fetchMidtransTransactionStatus(orderId: string) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is missing");
  }

  const isProduction = resolveMidtransServerMode(serverKey, process.env.MIDTRANS_IS_PRODUCTION);
  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
  const response = await fetch(
    `${getMidtransApiBaseUrl(isProduction)}/v2/${encodeURIComponent(orderId)}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as MidtransTransactionStatusResponse | null;
  if (!response.ok || !payload) {
    throw new Error(`Midtrans status lookup failed (${response.status})`);
  }

  return payload;
}

export function mapMidtransStatus(
  transactionStatus?: string | null,
  fraudStatus?: string | null,
) {
  const normalizedTransactionStatus = transactionStatus?.toLowerCase();
  const normalizedFraudStatus = fraudStatus?.toLowerCase();

  if (!normalizedTransactionStatus) return "pending";
  if (normalizedTransactionStatus === "capture") {
    return normalizedFraudStatus === "challenge" ? "pending" : "paid";
  }
  if (normalizedTransactionStatus === "settlement") return "paid";
  if (normalizedTransactionStatus === "pending") return "pending";
  if (
    normalizedTransactionStatus === "deny" ||
    normalizedTransactionStatus === "expire" ||
    normalizedTransactionStatus === "cancel"
  ) {
    return "canceled";
  }
  return "pending";
}
