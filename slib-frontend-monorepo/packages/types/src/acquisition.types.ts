export interface Vendor {
  id: number;
  name: string;
  code: string;
  email?: string;
  contactPerson?: string;
  isActive: boolean;
}

export interface Fund {
  id: number;
  name: string;
  code: string;
  totalBudget: number;
  committedAmount: number;
  spentAmount: number;
  availableBalance: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendorId: number;
  orderType: string;
  status: string;
  createdAt: string;
  createdBy?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  vendorId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentDate?: string;
}
