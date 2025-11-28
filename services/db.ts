
import { ProductItem, QuoteData, SavedQuote, CompanyData, UserAccount } from '../types';

// Gerencia o prefixo baseado no usuário. Como mudamos para código, usaremos um identificador único do dispositivo.
const DEFAULT_USER = "device_owner_v1"; 
const ACCESS_KEY = "app_access_control_v1";

// --- 5. LISTA DE CÓDIGOS VÁLIDOS (Hardcoded) ---
// Adicione ou remova códigos aqui
const VALID_CODES = [
  "ABC1234", 
  "VIP2024", 
  "LIB30DIAS", 
  "PRO-XY99", 
  "TESTE10"
];

const getKey = (email: string, key: string) => `saas_${email}_${key}`;

export const db = {
  // --- SISTEMA DE CÓDIGO DE LIBERAÇÃO ---

  // Retorna o status atual do acesso
  checkAccessStatus: (): { status: 'valid' | 'expired' | 'none', daysLeft?: number } => {
    const dataStr = localStorage.getItem(ACCESS_KEY);
    if (!dataStr) return { status: 'none' };

    const data = JSON.parse(dataStr);
    const now = new Date();
    const expirationDate = new Date(data.expirationDate);

    if (now > expirationDate) {
      return { status: 'expired' };
    }

    // Calcula dias restantes
    const diffTime = Math.abs(expirationDate.getTime() - now.getTime());
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { status: 'valid', daysLeft };
  },

  // Tenta ativar um novo código
  activateCode: (code: string): { success: boolean, message: string } => {
    const cleanCode = code.trim().toUpperCase();

    if (!VALID_CODES.includes(cleanCode)) {
      return { success: false, message: "Código inválido ou inexistente." };
    }

    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 30); // 30 Dias de validade

    const accessData = {
      code: cleanCode,
      activationDate: now.toISOString(),
      expirationDate: expirationDate.toISOString(),
      isActive: true
    };

    localStorage.setItem(ACCESS_KEY, JSON.stringify(accessData));
    return { success: true, message: "Acesso liberado por 30 dias!" };
  },

  // Retorna o ID do usuário padrão para salvar os dados (Orçamentos/Empresa)
  getCurrentUserId: () => DEFAULT_USER,


  // --- MÉTODOS DE DADOS (Mantidos para funcionalidade do app) ---

  // --- PRODUTOS (CATÁLOGO) ---
  getCatalog: (email: string): ProductItem[] => {
    const data = localStorage.getItem(getKey(email, 'catalog'));
    return data ? JSON.parse(data) : [];
  },

  saveCatalog: (email: string, items: ProductItem[]) => {
    localStorage.setItem(getKey(email, 'catalog'), JSON.stringify(items));
  },

  // --- ORÇAMENTOS (HISTÓRICO) ---
  getQuotes: (email: string): SavedQuote[] => {
    const data = localStorage.getItem(getKey(email, 'quotes'));
    return data ? JSON.parse(data) : [];
  },

  addQuote: (email: string, quote: QuoteData) => {
    const quotes = db.getQuotes(email);
    
    // Calcula total para facilitar listagem
    const subtotal = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const total = subtotal - (quote.discount || 0);

    const newSavedQuote: SavedQuote = {
      ...quote,
      id: Math.random().toString(36).substr(2, 9),
      savedAt: Date.now(),
      totalValue: total
    };

    // Adiciona no início da lista (mais recente primeiro)
    const updatedQuotes = [newSavedQuote, ...quotes];
    localStorage.setItem(getKey(email, 'quotes'), JSON.stringify(updatedQuotes));
    return newSavedQuote;
  },

  deleteQuote: (email: string, quoteId: string) => {
    const quotes = db.getQuotes(email);
    const updated = quotes.filter(q => q.id !== quoteId);
    localStorage.setItem(getKey(email, 'quotes'), JSON.stringify(updated));
  },

  // --- DADOS DA EMPRESA ---
  getCompany: (email: string): CompanyData | null => {
    const data = localStorage.getItem(getKey(email, 'company'));
    return data ? JSON.parse(data) : null;
  },

  saveCompany: (email: string, data: CompanyData) => {
    localStorage.setItem(getKey(email, 'company'), JSON.stringify(data));
  },

  // --- BACKUP GERAL ---
  exportData: (email: string): string => {
    const data = {
      company: db.getCompany(email),
      catalog: db.getCatalog(email),
      quotes: db.getQuotes(email),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data);
  },

  importData: (email: string, jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.company) db.saveCompany(email, data.company);
      if (data.catalog) db.saveCatalog(email, data.catalog);
      if (data.quotes) localStorage.setItem(getKey(email, 'quotes'), JSON.stringify(data.quotes));
      return true;
    } catch (e) {
      console.error("Erro ao importar backup", e);
      return false;
    }
  }
};
