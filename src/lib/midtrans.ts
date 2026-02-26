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

export function mapMidtransStatus(
  transactionStatus?: string | null,
  fraudStatus?: string | null,
) {
  if (!transactionStatus) return "pending";
  if (transactionStatus === "capture") {
    return fraudStatus === "challenge" ? "pending" : "paid";
  }
  if (transactionStatus === "settlement") return "paid";
  if (transactionStatus === "pending") return "pending";
  if (transactionStatus === "deny" || transactionStatus === "expire" || transactionStatus === "cancel") {
    return "canceled";
  }
  return "pending";
}
