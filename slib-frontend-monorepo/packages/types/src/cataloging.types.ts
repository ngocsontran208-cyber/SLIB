export interface Catalog {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  publishYear?: number;
  category?: string;
  type: string;
}

export interface MarcSubfield {
  code: string;
  value: string;
}

export interface MarcField {
  tag: string;
  indicator1?: string;
  indicator2?: string;
  subfields: MarcSubfield[];
}

export interface BibliographicRecord {
  id: number;
  templateId: number;
  title: string;
  author?: string;
  fields: MarcField[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface PhysicalItem {
  id: number;
  bibliographicRecordId: number;
  barcode: string;
  status: string;
}
