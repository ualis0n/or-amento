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