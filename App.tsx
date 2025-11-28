
import React, { useState, useEffect, useRef } from 'react';
import { CompanyData, ClientData, ProductItem, QuoteData, SavedQuote } from './types';
import { generateId, formatDate, formatCurrency } from './utils';
import { db } from './services/db'; // Importando o banco de dados
import { Input } from './components/Input';
import { Button } from './components/Button';
import { QuoteTemplate } from './components/QuoteTemplate';
import { 
  Building2, 
  User, 
  ShoppingCart, 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Share2, 
  Download, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  ImagePlus,
  X,
  Package,
  Save,
  Search,
  DollarSign,
  LogOut,
  Lock,
  AlertTriangle,
  LayoutDashboard,
  History,
  Settings,
  ArrowLeft,
  CheckSquare,
  Square,
  KeyRound,
  CalendarClock,
  ShieldCheck
} from 'lucide-react';

// --- CONSTANTS & DEFAULTS ---

const DEFAULT_COMPANY_TEMPLATE: CompanyData = {
  name: "SUA EMPRESA AQUI",
  cnpj: "00.000.000/0001-00",
  address: "Endereço da Empresa",
  city: "Sua Cidade",
  uf: "UF",
  phone: "(00) 00000-0000"
};

const INITIAL_CLIENT: ClientData = {
  name: "", address: "", neighborhood: "", city: "", state: "", 
  zip: "", phone: "", mobile: "", email: "", cpfCnpj: "", rgIe: ""
};

enum Step {
  COMPANY = 1,
  CLIENT = 2,
  ITEMS = 3,
  PREVIEW = 4
}

type AppView = 'access_check' | 'dashboard' | 'create_quote' | 'history' | 'settings';
type AccessStatus = 'valid' | 'expired' | 'none';

// --- SUB-COMPONENTS ---

// 1. Catalog Modal (Gerenciamento de Produtos)
interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSelect?: (item: ProductItem) => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, email, onSelect }) => {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProductItem>>({});

  useEffect(() => {
    if (isOpen) {
      setItems(db.getCatalog(email));
    }
  }, [isOpen, email]);

  const handleDelete = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    db.saveCatalog(email, newItems);
  };

  const handleUpdate = () => {
    if (editingId && editForm.description && editForm.unitPrice) {
      const newItems = items.map(i => i.id === editingId ? { ...i, ...editForm } as ProductItem : i);
      setItems(newItems);
      db.saveCatalog(email, newItems);
      setEditingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            <Package className="mr-2" size={20}/> Catálogo de Produtos
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 opacity-20" />
              <p>Nenhum produto salvo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="bg-white border rounded p-3 shadow-sm">
                  {editingId === item.id ? (
                    <div className="flex flex-col gap-2">
                       <input className="border p-1 text-sm rounded" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Descrição" />
                       <div className="flex gap-2">
                         <input className="border p-1 text-sm rounded w-1/3" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} placeholder="Cód" />
                         <input className="border p-1 text-sm rounded w-1/3" type="number" value={editForm.unitPrice} onChange={e => setEditForm({...editForm, unitPrice: Number(e.target.value)})} placeholder="Preço" />
                       </div>
                       <div className="flex justify-end gap-2 mt-1">
                          <button onClick={() => setEditingId(null)} className="text-xs text-gray-500">Cancelar</button>
                          <button onClick={handleUpdate} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Salvar</button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                        <div className="flex-1 cursor-pointer" onClick={() => { if(onSelect) { onSelect(item); onClose(); } }}>
                          <p className="font-bold text-sm text-brand-blue">{item.description}</p>
                          <p className="text-xs text-gray-500">Cód: {item.code || '-'} | {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-white rounded-b-lg">
          <Button onClick={onClose} variant="secondary" fullWidth>Fechar</Button>
        </div>
      </div>
    </div>
  );
};

// 2. Access Code Screen (Tela de Código)
interface AccessCodeScreenProps {
  onSuccess: () => void;
  isExpiredMode?: boolean;
}

const AccessCodeScreen: React.FC<AccessCodeScreenProps> = ({ onSuccess, isExpiredMode = false }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError("Digite um código."); return; }
    
    const result = db.activateCode(code);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isExpiredMode ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-brand-blue'}`}>
          {isExpiredMode ? <Lock size={40} /> : <KeyRound size={40} />}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isExpiredMode ? "Acesso Expirado" : "Código de Liberação"}
        </h1>
        
        <p className="text-gray-600 mb-6 text-sm">
          {isExpiredMode 
            ? "O seu período de 30 dias encerrou. Insira um novo código para renovar o acesso." 
            : "Insira seu código de acesso para liberar o aplicativo por 30 dias."}
        </p>
        
        <form onSubmit={handleActivation} className="space-y-4">
          <div className="text-left">
             <Input 
                label="Código de Acesso" 
                value={code} 
                onChange={e => {setCode(e.target.value.toUpperCase()); setError("");}} 
                placeholder="EX: ABC1234"
                className="text-center tracking-widest font-bold text-xl uppercase"
                maxLength={10}
              />
          </div>
          
          {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded">{error}</p>}
          
          <Button type="submit" fullWidth className={isExpiredMode ? "bg-red-600 hover:bg-red-700" : ""}>
            {isExpiredMode ? "Renovar Acesso" : "Ativar Acesso"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-gray-400">
           Suporte: (00) 0000-0000
        </p>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<string>(db.getCurrentUserId());
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('none');
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [view, setView] = useState<AppView>('access_check');
  
  // Create Quote State
  const [step, setStep] = useState<Step>(Step.COMPANY);
  const [company, setCompany] = useState<CompanyData>(DEFAULT_COMPANY_TEMPLATE);
  const [client, setClient] = useState<ClientData>(INITIAL_CLIENT);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [observations, setObservations] = useState<string>("");
  const [quoteNumber, setQuoteNumber] = useState<string>("");
  const [createdBy, setCreatedBy] = useState<string>("");
  
  // UI State
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);
  
  // History State
  const [historyList, setHistoryList] = useState<SavedQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);

  // Catalog State for autocomplete
  const [catalogList, setCatalogList] = useState<ProductItem[]>([]);

  // 1. Verificação Inicial de Acesso
  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = () => {
    const { status, daysLeft } = db.checkAccessStatus();
    setAccessStatus(status);
    if (status === 'valid') {
      setDaysLeft(daysLeft || 0);
      setView('dashboard');
    } else {
      setView('access_check'); // Vai cair na tela de input ou expirado
    }
  };

  // Load User Data & Auto Save Company
  useEffect(() => {
    if (accessStatus === 'valid') {
      // First load
      if (company === DEFAULT_COMPANY_TEMPLATE) {
          const savedCompany = db.getCompany(currentUser);
          if (savedCompany) setCompany(savedCompany);
      } else {
          // Auto save on change
          db.saveCompany(currentUser, company);
      }
      setCatalogList(db.getCatalog(currentUser));
    }
  }, [accessStatus, view, company, currentUser]); 

  const startNewQuote = () => {
    setClient(INITIAL_CLIENT);
    setItems([]);
    setDiscount(0);
    setObservations("");
    setQuoteNumber(Math.floor(1000 + Math.random() * 9000).toString());
    setStep(Step.COMPANY);
    setSelectedQuote(null);
    setView('create_quote');
  };

  const showAlert = (msg: string) => {
    setValidationAlert(msg);
    setTimeout(() => setValidationAlert(null), 3000);
  };

  // --- WIZARD LOGIC ---

  const handleNextStep = () => {
    if (step === Step.CLIENT) {
      if (!client.name.trim() || !client.mobile.trim()) {
        showAlert("Preencha Nome e Telefone do Cliente");
        return;
      }
    }
    if (step === Step.ITEMS) {
      if (items.length === 0) {
        showAlert("Adicione pelo menos um item");
        return;
      }
    }

    // Se estiver indo para a prévia (passo 4)
    if (step === Step.ITEMS) {
        // SALVAR DADOS DA EMPRESA (Garantia extra)
        if (currentUser) db.saveCompany(currentUser, company);
        
        // SALVAR ORÇAMENTO NO HISTÓRICO AUTOMATICAMENTE
        if (currentUser && !selectedQuote) { 
            const quoteToSave: QuoteData = {
                number: quoteNumber,
                date: formatDate(new Date()),
                createdBy,
                company,
                client,
                items,
                observations,
                discount
            };
            db.addQuote(currentUser, quoteToSave);
            showAlert("Orçamento Salvo com Sucesso!");
        }
    }

    setStep(step + 1);
  };

  // --- RENDER VIEWS ---

  // 1. DASHBOARD VIEW
  const renderDashboard = () => (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
       <div className="mb-8 flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Olá, Usuário</h2>
            <p className="text-gray-500">ID: {currentUser}</p>
         </div>
         <div className={`text-xs px-3 py-1 rounded-full flex items-center font-bold ${daysLeft < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <CalendarClock size={14} className="mr-1"/> {daysLeft} dias restantes
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={startNewQuote} className="bg-brand-blue text-white p-6 rounded-xl shadow-lg hover:bg-blue-900 transition flex items-center justify-between group">
             <div>
                <Plus size={32} className="mb-2" />
                <h3 className="text-xl font-bold">Novo Orçamento</h3>
                <p className="text-blue-200 text-sm">Criar proposta comercial</p>
             </div>
             <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button onClick={() => { setHistoryList(db.getQuotes(currentUser!)); setView('history'); }} className="bg-white text-gray-800 p-6 rounded-xl shadow border border-gray-200 hover:bg-gray-50 transition flex items-center justify-between group">
             <div>
                <History size={32} className="mb-2 text-brand-blue" />
                <h3 className="text-xl font-bold">Meus Orçamentos</h3>
                <p className="text-gray-500 text-sm">Ver histórico salvo</p>
             </div>
             <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
       </div>
       
       <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => setIsCatalogOpen(true)} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 hover:bg-gray-50">
             <div className="bg-green-100 p-3 rounded-full text-green-700"><Package size={24} /></div>
             <div className="text-left">
                <h4 className="font-bold">Catálogo de Produtos</h4>
                <p className="text-xs text-gray-500">Gerenciar itens salvos</p>
             </div>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => {
                const data = db.exportData(currentUser!);
                const blob = new Blob([data], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_${formatDate(new Date())}.json`;
                a.click();
            }} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center hover:bg-gray-50 text-center">
              <Save size={24} className="text-orange-600 mb-2"/>
              <p className="text-xs font-bold text-gray-600">Baixar Backup</p>
            </button>
            <div className="relative bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center hover:bg-gray-50 text-center">
              <Download size={24} className="text-blue-600 mb-2"/>
              <p className="text-xs font-bold text-gray-600">Restaurar</p>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".json" onChange={async (e) => {
                 const file = e.target.files?.[0];
                 if(file) {
                    const text = await file.text();
                    if(db.importData(currentUser!, text)) {
                        alert("Dados restaurados com sucesso! A página será recarregada.");
                        window.location.reload();
                    } else {
                        alert("Arquivo inválido.");
                    }
                 }
              }}/>
            </div>
          </div>
       </div>
    </div>
  );

  // 2. HISTORY VIEW
  const renderHistory = () => (
    <div className="p-4 max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
       <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('dashboard')}><ArrowLeft size={24}/></button>
          <h2 className="text-xl font-bold">Histórico de Orçamentos</h2>
       </div>

       <div className="space-y-3 flex-1 overflow-auto pb-20">
          {historyList.length === 0 ? (
             <div className="text-center py-10 text-gray-400">Nenhum orçamento salvo.</div>
          ) : (
             historyList.map(quote => (
                <div key={quote.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-lg text-brand-blue">#{quote.number}</span>
                         <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{quote.date}</span>
                      </div>
                      <p className="font-medium">{quote.client.name}</p>
                      <p className="text-sm text-gray-500">{quote.items.length} itens • Total: <span className="font-bold text-gray-800">{formatCurrency(quote.totalValue)}</span></p>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="secondary" className="flex-1 md:flex-none text-xs" onClick={() => {
                          setCompany(quote.company);
                          setClient(quote.client);
                          setItems(quote.items);
                          setDiscount(quote.discount || 0);
                          setObservations(quote.observations);
                          setQuoteNumber(quote.number);
                          setSelectedQuote(quote);
                          setStep(Step.PREVIEW);
                          setView('create_quote');
                      }}>
                         <FileText size={16} className="mr-1"/> Abrir PDF
                      </Button>
                      <button onClick={() => {
                          if(confirm("Excluir este orçamento?")) {
                              db.deleteQuote(currentUser!, quote.id);
                              setHistoryList(db.getQuotes(currentUser!));
                          }
                      }} className="bg-red-50 text-red-500 p-3 rounded hover:bg-red-100">
                          <Trash2 size={16} />
                      </button>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );

  // 3. WIZARD VIEW (Integrated Logic)
  const renderWizard = () => {
    if (step === Step.PREVIEW) {
      const quoteData = selectedQuote || {
        number: quoteNumber,
        date: formatDate(new Date()),
        createdBy,
        company,
        client,
        items,
        observations,
        discount
      };
      
      return (
        <div className="min-h-screen bg-gray-200 flex flex-col items-center pt-16 pb-32">
           <div className="fixed top-0 left-0 right-0 bg-white shadow z-50 p-3 flex items-center justify-between no-print">
              <button onClick={() => setView('dashboard')} className="flex items-center text-brand-blue font-bold">
                 <ArrowLeft size={20} className="mr-1"/> Voltar ao Início
              </button>
              <span className="font-bold text-gray-700">Visualização</span>
              <div className="w-20"></div>
           </div>
           
           {/* Container Responsivo com Zoom para Mobile */}
           <div className="w-full overflow-hidden flex justify-center my-4">
               <div className="origin-top transform scale-[0.42] sm:scale-75 md:scale-100 transition-transform duration-200 bg-white shadow-2xl print:shadow-none print:transform-none" style={{ width: '210mm', minHeight: '297mm' }}>
                 <div id="quote-content" className="h-full">
                   <QuoteTemplate data={quoteData} />
                 </div>
               </div>
           </div>

           <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 justify-center shadow-2xl z-50 no-print">
               <PDFActionButtons quoteNumber={quoteData.number} clientName={quoteData.client.name} />
           </div>
        </div>
      );
    }
    
    return (
      <div className="pb-24 pt-4">
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-sm mb-4">
            <WizardSteps currentStep={step} />
        </div>
        
        <div className="max-w-2xl mx-auto p-4">
           {step === Step.COMPANY && <CompanyStep company={company} setCompany={setCompany} createdBy={createdBy} setCreatedBy={setCreatedBy} />}
           {step === Step.CLIENT && <ClientStep client={client} setClient={setClient} />}
           {step === Step.ITEMS && <ItemsStep 
               items={items} setItems={setItems} 
               discount={discount} setDiscount={setDiscount}
               observations={observations} setObservations={setObservations}
               currentUser={currentUser!}
               setIsCatalogOpen={setIsCatalogOpen}
               catalogList={catalogList}
               setCatalogList={setCatalogList}
           />}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between max-w-2xl mx-auto w-full z-10">
           <Button variant="secondary" onClick={() => step === Step.COMPANY ? setView('dashboard') : setStep(step - 1)}>
             <ChevronLeft className="mr-1"/> Voltar
           </Button>
           <Button onClick={handleNextStep}>
             {step === Step.ITEMS ? "Finalizar e Salvar" : "Próximo"} <ChevronRight className="ml-1"/>
           </Button>
        </div>
      </div>
    );
  };

  // --- COMPONENTES AUXILIARES DO WIZARD ---
  
  const PDFActionButtons = ({quoteNumber, clientName}: {quoteNumber: string, clientName: string}) => {
      const [loading, setLoading] = useState(false);
      
      const getPdfOptions = () => ({
        margin: 0,
        filename: `Orcamento_${quoteNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });

      const handleShare = async () => {
         setLoading(true);
         const element = document.getElementById('quote-content');
         const opt = getPdfOptions();
         try {
             // @ts-ignore
             const worker = window.html2pdf().set(opt).from(element).toPdf();
             const blob = await worker.output('blob');
             const file = new File([blob], opt.filename, { type: 'application/pdf' });
             if (navigator.canShare && navigator.canShare({ files: [file] })) {
                 await navigator.share({ files: [file], title: "Orçamento", text: `Orçamento para ${clientName}` });
             } else {
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = opt.filename;
                 document.body.appendChild(a);
                 a.click();
                 alert("PDF Baixado. Compartilhe manualmente pelo WhatsApp.");
             }
         } catch(e) { alert("Erro ao gerar PDF"); }
         setLoading(false);
      };

      const handleDownload = async () => {
          setLoading(true);
          const element = document.getElementById('quote-content');
          // @ts-ignore
          await window.html2pdf().set(getPdfOptions()).from(element).save();
          setLoading(false);
      };

      return (
          <>
             <Button variant="success" onClick={handleShare} disabled={loading} className="w-full md:w-auto">
                {loading ? <Loader2 className="animate-spin"/> : <Share2 className="mr-2"/>} WhatsApp
             </Button>
             <Button variant="primary" onClick={handleDownload} disabled={loading} className="w-full md:w-auto bg-gray-800">
                <Download className="mr-2"/> Baixar PDF
             </Button>
          </>
      )
  };

  // --- RENDERIZAÇÃO PRINCIPAL (CONDICIONAL) ---

  // 1. Se não tiver acesso ou expirado
  if (accessStatus === 'none' || accessStatus === 'expired') {
    return <AccessCodeScreen isExpiredMode={accessStatus === 'expired'} onSuccess={checkAccess} />;
  }

  // 2. App Principal
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar Global */}
      {view !== 'create_quote' && (
          <header className="bg-brand-blue text-white p-4 shadow-md sticky top-0 z-20">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
               <h1 className="font-bold flex items-center gap-2"><LayoutDashboard/> Orçamentos WA</h1>
               <div className="flex items-center gap-2">
                 <ShieldCheck size={18} className="text-green-400"/>
                 <span className="text-xs text-blue-200">Acesso Seguro</span>
               </div>
            </div>
          </header>
      )}

      {/* Validation Toast */}
      {validationAlert && (
        <div className="fixed top-20 left-0 right-0 mx-auto w-full max-w-sm px-4 z-[60] animate-bounce">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-xl flex items-center justify-center gap-2">
            <AlertTriangle size={20} />
            <span className="font-bold text-sm">{validationAlert}</span>
          </div>
        </div>
      )}

      <CatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} email={currentUser} onSelect={() => {}} />

      <main className="flex-1 w-full">
         {view === 'dashboard' && renderDashboard()}
         {view === 'history' && renderHistory()}
         {view === 'create_quote' && renderWizard()}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS FOR WIZARD STEPS ---

const WizardSteps = ({currentStep}: {currentStep: number}) => (
    <div className="flex justify-between items-center text-xs text-gray-500">
        <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-brand-blue font-bold' : ''}`}>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 ${currentStep >= 1 ? 'border-brand-blue bg-blue-50' : 'border-gray-200'}`}>1</div>
           Empresa
        </div>
        <div className="h-[2px] bg-gray-200 flex-1 mx-2"></div>
        <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-brand-blue font-bold' : ''}`}>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 ${currentStep >= 2 ? 'border-brand-blue bg-blue-50' : 'border-gray-200'}`}>2</div>
           Cliente
        </div>
        <div className="h-[2px] bg-gray-200 flex-1 mx-2"></div>
        <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-brand-blue font-bold' : ''}`}>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 ${currentStep >= 3 ? 'border-brand-blue bg-blue-50' : 'border-gray-200'}`}>3</div>
           Itens
        </div>
    </div>
);

const CompanyStep = ({company, setCompany, createdBy, setCreatedBy}: any) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const handleLogo = (e: any) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                   // Compress Image Logic would go here in utils but keeping simple
                   // Simulating compression by drawing to canvas
                   const canvas = document.createElement('canvas');
                   const MAX_WIDTH = 300;
                   const scaleSize = MAX_WIDTH / img.width;
                   canvas.width = MAX_WIDTH;
                   canvas.height = img.height * scaleSize;
                   const ctx = canvas.getContext('2d');
                   ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                   const compressed = canvas.toDataURL('image/jpeg', 0.7);
                   setCompany({...company, logo: compressed});
                }
            };
            reader.readAsDataURL(file);
        }
    }
    return (
        <div className="space-y-4 animate-fade-in">
           <h2 className="text-xl font-bold text-brand-blue flex gap-2"><Building2/> Dados da Empresa</h2>
           
           <div className="bg-gray-50 p-4 rounded border flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  {company.logo ? (
                      <div className="relative">
                          <img src={company.logo} className="w-16 h-16 object-contain bg-white rounded border"/>
                          <button onClick={() => setCompany({...company, logo: undefined})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                      </div>
                  ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400"><ImagePlus/></div>
                  )}
                  <div>
                      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleLogo}/>
                      <Button variant="secondary" onClick={() => fileRef.current?.click()} className="text-xs py-2">Alterar Logo</Button>
                  </div>
              </div>
              <div className="flex flex-col items-center text-green-600">
                  <CheckSquare size={20}/>
                  <span className="text-[10px] font-bold">Salvo</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Nome da Empresa" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
               <Input label="CNPJ" value={company.cnpj} onChange={e => setCompany({...company, cnpj: e.target.value})} />
               <Input label="Telefone" value={company.phone} onChange={e => setCompany({...company, phone: e.target.value})} />
               <Input label="Cidade" value={company.city} onChange={e => setCompany({...company, city: e.target.value})} />
               <Input label="UF" value={company.uf} onChange={e => setCompany({...company, uf: e.target.value})} />
               <Input label="Seu Nome (Responsável)" className="md:col-span-2" value={createdBy} onChange={e => setCreatedBy(e.target.value)} />
               <Input label="Endereço Completo" className="md:col-span-2" value={company.address} onChange={e => setCompany({...company, address: e.target.value})} />
           </div>
        </div>
    )
}

const ClientStep = ({client, setClient}: any) => {
    const [loadingCep, setLoadingCep] = useState(false);
    const handleCep = async (e: any) => {
        const val = e.target.value;
        setClient({...client, zip: val});
        if(val.replace(/\D/g, '').length === 8) {
            setLoadingCep(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                const data = await res.json();
                if(!data.erro) setClient(prev => ({...prev, address: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf, zip: val}));
            } catch(e) {}
            setLoadingCep(false);
        }
    }
    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-brand-blue flex gap-2"><User/> Dados do Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Nome Completo *" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
               <Input label="Telefone/Zap *" value={client.mobile} onChange={e => setClient({...client, mobile: e.target.value})} />
               <div className="relative">
                   <Input label="CEP" value={client.zip} onChange={handleCep} maxLength={9} />
                   {loadingCep && <Loader2 className="absolute right-3 top-9 animate-spin text-blue-500" size={16}/>}
               </div>
               <Input label="CPF/CNPJ" value={client.cpfCnpj} onChange={e => setClient({...client, cpfCnpj: e.target.value})} />
               <Input label="Endereço" className="md:col-span-2" value={client.address} onChange={e => setClient({...client, address: e.target.value})} />
               <Input label="Bairro" value={client.neighborhood} onChange={e => setClient({...client, neighborhood: e.target.value})} />
               <Input label="Cidade/UF" value={`${client.city} ${client.state}`} onChange={e => setClient({...client, city: e.target.value})} />
            </div>
        </div>
    )
}

const ItemsStep = ({items, setItems, discount, setDiscount, observations, setObservations, currentUser, setIsCatalogOpen, catalogList, setCatalogList}: any) => {
    const [form, setForm] = useState<Partial<ProductItem>>({quantity: 1, unitPrice: 0, description: '', code: ''});
    const [saveToCatalog, setSaveToCatalog] = useState(false);
    
    // Auto complete handler
    const handleDesc = (e: any) => {
        const val = e.target.value;
        setForm(prev => ({...prev, description: val}));
        const found = catalogList.find((c: ProductItem) => c.description.toLowerCase() === val.toLowerCase());
        if(found) setForm(prev => ({...prev, unitPrice: found.unitPrice, code: found.code}));
    }

    const addItem = () => {
        if(!form.description || !form.unitPrice) return;
        const newItem = {...form, id: Math.random().toString()} as ProductItem;
        setItems([...items, newItem]);
        
        // Save to Catalog Logic
        if (saveToCatalog) {
            const currentCatalog = db.getCatalog(currentUser);
            // Check if item exists (by code or exact description)
            const existingIndex = currentCatalog.findIndex(i => 
                (newItem.code && i.code === newItem.code && i.code !== '') || 
                i.description.toLowerCase() === newItem.description.toLowerCase()
            );

            let newCatalog;
            if (existingIndex >= 0) {
                // Update existing
                newCatalog = [...currentCatalog];
                newCatalog[existingIndex] = { ...newCatalog[existingIndex], unitPrice: newItem.unitPrice, code: newItem.code || newCatalog[existingIndex].code };
            } else {
                // Add new
                newCatalog = [...currentCatalog, newItem];
            }
            
            db.saveCatalog(currentUser, newCatalog);
            setCatalogList(newCatalog); // Update local state for autocomplete
        }

        setForm({quantity: 1, unitPrice: 0, description: '', code: ''});
        setSaveToCatalog(false);
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-brand-blue flex gap-2"><ShoppingCart/> Itens e Valores</h2>
            
            <Button variant="secondary" onClick={() => setIsCatalogOpen(true)} className="w-full bg-blue-50 border-dashed border-2 border-blue-200 text-blue-700">
                <Search size={16} className="mr-2"/> Abrir Catálogo Salvo
            </Button>
            
            <datalist id="catalog-suggestions">
                {catalogList.map((c: ProductItem) => <option key={c.id} value={c.description}/>)}
            </datalist>

            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-4">
                {/* Linha 1: Descrição (Full Width para facilitar digitação) */}
                <div className="w-full">
                    <Input 
                        label="Descrição do Produto / Serviço" 
                        list="catalog-suggestions" 
                        value={form.description} 
                        onChange={handleDesc} 
                        placeholder="Ex: Instalação de Ar Condicionado"
                        className="h-14 text-lg" 
                    />
                </div>

                <div className="flex gap-3">
                    {/* Linha 2: Código, Qtd e Preço organizados para toque */}
                    <div className="w-1/4">
                        <Input 
                            label="Cód." 
                            value={form.code} 
                            onChange={e => setForm({...form, code: e.target.value})}
                            placeholder="001"
                            className="text-center h-14 text-lg"
                        />
                    </div>
                    
                    <div className="w-1/4">
                        <Input 
                            type="number" 
                            inputMode="numeric"
                            label="Qtd." 
                            value={form.quantity} 
                            onChange={e => setForm({...form, quantity: Number(e.target.value)})}
                            className="text-center h-14 text-lg"
                        />
                    </div>

                    <div className="w-1/2">
                        <Input 
                            type="number" 
                            inputMode="decimal"
                            label="Valor Unit. (R$)" 
                            value={form.unitPrice || ''} 
                            onChange={e => setForm({...form, unitPrice: Number(e.target.value)})}
                            placeholder="0,00"
                            className="h-14 text-lg font-bold text-gray-800"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-2 py-2 bg-gray-50 p-2 rounded cursor-pointer" onClick={() => setSaveToCatalog(!saveToCatalog)}>
                    {saveToCatalog ? <CheckSquare className="text-brand-blue" size={24}/> : <Square className="text-gray-400" size={24}/>}
                    <span className="text-sm text-gray-700">Salvar item no catálogo</span>
                </div>

                <div>
                    <Button fullWidth onClick={addItem} disabled={!form.description} className="h-14 text-lg shadow-md">
                        <Plus className="mr-2" /> Adicionar Item
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {items.length > 0 && <h3 className="font-bold text-gray-600 text-sm uppercase mt-4">Itens Adicionados ({items.length})</h3>}
                {items.map((item: ProductItem) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex-1">
                            <p className="font-bold text-gray-800">{item.description}</p>
                            <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                <span className="bg-gray-100 px-2 rounded">Qtd: {item.quantity}</span>
                                <span>x {formatCurrency(item.unitPrice)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-lg text-brand-blue">{formatCurrency(item.quantity * item.unitPrice)}</span>
                            <button onClick={() => setItems(items.filter((i: any) => i.id !== item.id))} className="text-red-500 text-xs flex items-center bg-red-50 px-2 py-1 rounded hover:bg-red-100">
                                <Trash2 size={12} className="mr-1"/> Remover
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="pt-6 border-t mt-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <Input label="Desconto no Total (R$)" type="number" inputMode="decimal" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="bg-white h-14 text-lg"/>
                </div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Observações do Orçamento</label>
                <textarea 
                    className="w-full border p-3 rounded-lg h-24 focus:ring-2 focus:ring-brand-blue outline-none text-lg" 
                    placeholder="Ex: Validade da proposta, condições de pagamento..."
                    value={observations} 
                    onChange={e => setObservations(e.target.value)}
                ></textarea>
            </div>
        </div>
    )
}
