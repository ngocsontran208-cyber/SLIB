export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'Student' | 'Librarian' | 'Admin';
  isActive: boolean;
  claims?: string[];
}

export interface MarcSubfield {
  code: string;
  value: string;
}

export interface MarcField {
  tag: string;
  indicator1: string;
  indicator2: string;
  value: string;
  subfields: MarcSubfield[];
}

export interface BibliographicRecord {
  id: number;
  leader: string;
  fields: MarcField[];
  createdAt: string;
}

export interface BookLoan {
  id: number;
  userId: number;
  physicalItemId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Borrowed' | 'Returned' | 'Overdue';
  fineAmount: number;
}
