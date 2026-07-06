import type { User } from './user.types';
import type { PhysicalItem } from './cataloging.types';

export interface BookLoan {
  id: number;
  userId: number;
  physicalItemId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount: number;
  
  user?: User;
  item?: PhysicalItem;
}

export interface Fine {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  status: string;
}
