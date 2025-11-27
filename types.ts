export interface CompanyData {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  uf: string;
  phone: string;
  logo?: string;
}

export interface ClientData {
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  mobile: string;
  email: string;
  cpfCnpj: string;
  rgIe: string;
}

export interface ProductItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteData {
  number: string;
  date: string;
  createdBy: string;
  company: CompanyData;
  client: ClientData;
  items: ProductItem[];
  observations: string;
  discount?: number;
}

// Nova interface para o Histórico
export interface SavedQuote extends QuoteData {
  id: string; // ID único do registro no banco
  savedAt: number; // Timestamp de quando foi salvo
  totalValue: number;
}