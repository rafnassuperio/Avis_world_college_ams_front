export interface PaymentHistoryItem {
  id: string;
  transactionRef: string;
  receiptNo: string;
  date: string;
  time: string;
  amount: number;
  currency: string;
  paymentMethod:
    | "Credit Card"
    | "Debit Card"
    | "Bank Transfer"
    | "PayNow"
    | "UPI"
    | "Demand Draft"
    | "Cash"
    | "NETS"
    | "Telegraphic Transfer"
    | "Cheque"
    | "Others"
    | string;
  cardType?: "Visa" | "MasterCard" | "Amex";
  cardNumberMasked?: string;
  status: "Successful" | "Pending" | "Refunded" | "Settled";
  collectedBy?: string;
  note?: string;
  repCommission?: number;
  agentCommission?: number;
  feeCategory?: "Course Fee" | "Application Fee" | "Other Payment" | string;
  itemName?: string;
}

export interface PaymentRecord {
  agentId?: string;
  repId?: string;
  adminCommission?: number;
  outstandingAmount?: number;
  applicationFees?: number;
  feeBreakdown?: Record<string, number>;
  otherPayments?: Array<{ _id: string; name: string; amount: number; status: string }>;
  installmentTracking?: Array<{ installmentNo: number; amount: number; paidAmount: number }>;
  id: string;
  no: string;
  date: string;
  collegeName?: string;
  student: {
    id: string;
    name: string;
    studentCode: string;
    email: string;
    avatar?: string;
    course: string;
    courseCode: string;
    finNumber?: string;
    nationality?: string;
    tenureDate?: string;
  };
  totalFee: number;
  amountToCollege: number;
  repCommission: number;
  agentCommission: number;
  currency: string;
  status: "Paid" | "Pending";
  cardStatus: "Settled" | "Pending" | "Reset" | "Processing";
  history: PaymentHistoryItem[];
  notes?: string;
}

export type PaymentPageView = "payments-table" | "payment-history";
