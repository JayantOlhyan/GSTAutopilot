// PAYMENT INTEGRATION PLACEHOLDER

export interface PaymentOrder {
  orderId: string;
  amountInPaise: number;
}

export async function createOrder(amountInPaise: number): Promise<PaymentOrder> {
  throw new Error("NotImplementedError");
}

export async function verifyPayment(orderId: string, signature: string): Promise<boolean> {
  throw new Error("NotImplementedError");
}
