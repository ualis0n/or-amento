import { ProductItem, QuoteData, SavedQuote, CompanyData } from '../types';

// Gerencia o prefixo baseado no usuário logado para isolar dados (SaaS)
const getKey = (email: string, key: string) => `saas_${email}_${key}`;

export const db = {
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