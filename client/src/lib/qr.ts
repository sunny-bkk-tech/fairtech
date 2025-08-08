export interface QRPaymentData {
  vendorId: string;
  amount: string;
  currency: string;
  description?: string;
}

export function generateQRPaymentData(data: QRPaymentData): string {
  return JSON.stringify(data);
}

export function parseQRPaymentData(qrData: string): QRPaymentData | null {
  try {
    const data = JSON.parse(qrData);
    if (data.vendorId && data.amount && data.currency) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
