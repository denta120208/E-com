declare module "midtrans-client" {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  interface SnapTransactionRequest {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    credit_card?: {
      secure?: boolean;
    };
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      billing_address?: {
        city?: string;
        postal_code?: string;
      };
      shipping_address?: {
        city?: string;
        postal_code?: string;
      };
    };
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(payload: SnapTransactionRequest): Promise<SnapTransactionResponse>;
  }

  const MidtransClient: {
    Snap: typeof Snap;
  };

  export default MidtransClient;
}
