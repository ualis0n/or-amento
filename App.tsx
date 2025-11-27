import React, { useState, useEffect, useRef } from 'react';
import { CompanyData, ClientData, ProductItem, QuoteData } from './types';
import { generateId, formatDate, formatCurrency } from './utils';
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
  AlertTriangle
} from 'lucide-react';

// Default Company Data Template
const DEFAULT_COMPANY_TEMPLATE: CompanyData = {
  name: "SUA EMPRESA AQUI",
  cnpj: "00.000.000/0001-00",
  address: "Endereço da Empresa",
  city: "Sua Cidade",
  uf: "UF",
  phone: "(00) 00000-0000"
};

// Initial States
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

// --- CATALOG MODAL COMPONENT ---
interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: ProductItem[];
  onDelete: (id: string) => void;
  onSelect: (item: ProductItem) => void;
  onUpdate: (item: ProductItem) => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, catalog, onDelete, onSelect, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProductItem>>({});

  if (!isOpen) return null;

  const startEdit = (e: React.MouseEvent, item: ProductItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditForm(item);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editForm.description && editForm.unitPrice) {
      onUpdate(editForm as ProductItem);
      setEditingId(null);
    }
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            <Package className="mr-2" size={20}/> Catálogo de Produtos
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {catalog.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 opacity-20" />
              <p>Nenhum produto salvo.</p>
              <p className="text-xs mt-2">Salve itens novos marcando a opção "Salvar no Catálogo" ao adicionar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Clique em um item para preencher o formulário:</p>
              {catalog.map(item => (
                <div key={item.id} className="border rounded p-3 flex flex-col gap-2 hover:bg-blue-50 transition-colors group">
                  
                  {editingId === item.id ? (
                    // Modo Edição
                    <div className="flex flex-col gap-2 bg-white p-2 rounded shadow-inner" onClick={e => e.stopPropagation()}>
                       <input 
                         className="border p-1 text-sm rounded" 
                         value={editForm.description} 
                         onChange={e => setEditForm({...editForm, description: e.target.value})}
                         placeholder="Descrição"
                       />
                       <div className="flex gap-2">
                         <input 
                           className="border p-1 text-sm rounded w-1/3" 
                           value={editForm.code} 
                           onChange={e => setEditForm({...editForm, code: e.target.value})}
                           placeholder="Cód"
                         />
                         <input 
                           className="border p-1 text-sm rounded w-1/3" 
                           type="number"
                           value={editForm.unitPrice} 
                           onChange={e => setEditForm({...editForm, unitPrice: Number(e.target.value)})}
                           placeholder="Preço"
                         />
                       </div>
                       <div className="flex justify-end gap-2 mt-1">
                          <button onClick={cancelEdit} className="text-xs text-gray-500 px-2 py-1">Cancelar</button>
                          <button onClick={saveEdit} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Salvar</button>
                       </div>
                    </div>
                  ) : (
                    // Modo Visualização
                    <div className="flex justify-between items-center w-full">
                        <div className="flex-1 cursor-pointer" onClick={() => { onSelect(item); onClose(); }}>
                          <p className="font-bold text-sm text-brand-blue">{item.description}</p>
                          <p className="text-xs text-gray-500">
                            Cód: {item.code || '-'} | {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => startEdit(e, item)}
                            className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-100 rounded-full"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <Button onClick={onClose} variant="secondary" fullWidth className="py-2">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- AUTH COMPONENT ---
interface AuthScreenProps {
  onLogin: (email: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  
  // Lista fictícia de usuários autorizados (persistida no localStorage para simular backend)
  // No primeiro uso, não haverá ninguém.
  const [accessKey, setAccessKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // CHAVE MESTRA DO SISTEMA (SIMULANDO SAAS)
  const SYSTEM_ACCESS_KEY = "admin123"; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes('@')) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Verificar se usuário já está autorizado
    const authorizedUsers = JSON.parse(localStorage.getItem('saas_authorized_users') || '[]');
    
    if (authorizedUsers.includes(cleanEmail)) {
      // Login direto
      onLogin(cleanEmail);
    } else {
      // Novo usuário: Pede chave de acesso
      if (!showKeyInput) {
        setShowKeyInput(true);
        setError("E-mail não cadastrado. Insira a Chave de Acesso do Sistema para liberar.");
        return;
      }

      // Validar chave
      if (accessKey === SYSTEM_ACCESS_KEY) {
        // Autorizar e Logar
        const newAuthList = [...authorizedUsers, cleanEmail];
        localStorage.setItem('saas_authorized_users', JSON.stringify(newAuthList));
        onLogin(cleanEmail);
      } else {
        setError("Chave de acesso incorreta.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-brand-blue" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Orçamentos WA</h1>
          <p className="text-gray-500 text-sm mt-2">Acesso ao Sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seu E-mail</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); setShowKeyInput(false); }}
            />
          </div>

          {showKeyInput && (
             <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chave de Acesso (Primeiro Acesso)</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                placeholder="Senha do Admin"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded">{error}</p>}

          <Button type="submit" fullWidth>
            {showKeyInput ? "Autorizar e Entrar" : "Continuar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Seus dados são privados e isolados neste dispositivo.</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // App State
  const [step, setStep] = useState<Step>(Step.COMPANY);
  const [company, setCompany] = useState<CompanyData>(DEFAULT_COMPANY_TEMPLATE);
  const [client, setClient] = useState<ClientData>(INITIAL_CLIENT);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [observations, setObservations] = useState<string>("");
  const [quoteNumber] = useState<string>(Math.floor(1000 + Math.random() * 9000).toString());
  const [createdBy, setCreatedBy] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Catalog State
  const [catalog, setCatalog] = useState<ProductItem[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [saveToCatalog, setSaveToCatalog] = useState(false);

  // Image Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Item Form State
  const [currentItem, setCurrentItem] = useState<Partial<ProductItem>>({
    code: "", description: "", quantity: 1, unitPrice: 0
  });
  const [isEditingItem, setIsEditingItem] = useState<string | null>(null);

  // --- AUTH EFFECTS ---
  useEffect(() => {
    // Check if user is already logged in (session persistence)
    const savedUser = localStorage.getItem('saas_current_user');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // --- DATA LOADING EFFECTS ---
  // Triggered whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    // Load Company Data for this user
    const savedCompany = localStorage.getItem(`saas_${currentUser}_company`);
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    } else {
      setCompany(DEFAULT_COMPANY_TEMPLATE); // Reset to default for new user
    }

    // Load Catalog for this user
    const savedCatalog = localStorage.getItem(`saas_${currentUser}_catalog`);
    if (savedCatalog) {
      setCatalog(JSON.parse(savedCatalog));
    } else {
      setCatalog([]); // Reset catalog for new user
    }

    // Load Created By Name (optional preference)
    const savedCreatedBy = localStorage.getItem(`saas_${currentUser}_createdby`);
    if (savedCreatedBy) setCreatedBy(savedCreatedBy);

    // Reset Quote Flow
    setStep(Step.COMPANY);
    setClient(INITIAL_CLIENT);
    setItems([]);
    setDiscount(0);
    setObservations("");

  }, [currentUser]);

  // --- DATA PERSISTENCE EFFECTS ---
  
  // Persist company
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`saas_${currentUser}_company`, JSON.stringify(company));
    }
  }, [company, currentUser]);

  // Persist createdBy
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`saas_${currentUser}_createdby`, createdBy);
    }
  }, [createdBy, currentUser]);

  // Helper to persist catalog
  const updateCatalog = (newCatalog: ProductItem[]) => {
    setCatalog(newCatalog);
    if (currentUser) {
      localStorage.setItem(`saas_${currentUser}_catalog`, JSON.stringify(newCatalog));
    }
  };

  const handleLogin = (email: string) => {
    localStorage.setItem('saas_current_user', email);
    setCurrentUser(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('saas_current_user');
    setCurrentUser(null);
  };

  const showValidationAlert = (msg: string) => {
    setValidationError(msg);
    // Auto-hide after 3.5 seconds
    setTimeout(() => {
      setValidationError(null);
    }, 3500);
  };

  const handleNext = () => {
    // Validação Cliente
    if (step === Step.CLIENT) {
      if (!client.name || !client.name.trim()) {
        showValidationAlert("Campo Obrigatório: Preencha o NOME DO CLIENTE.");
        return;
      }
      if (!client.mobile || !client.mobile.trim()) {
        showValidationAlert("Campo Obrigatório: Preencha o TELEFONE ou CELULAR.");
        return;
      }
    }

    // Validação Itens
    if (step === Step.ITEMS) {
      if (items.length === 0) {
        showValidationAlert("Orçamento Vazio: Adicione pelo menos um item.");
        return;
      }
    }

    if (step < Step.PREVIEW) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > Step.COMPANY) setStep(step - 1);
  };
  
  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        alert("A imagem é muito grande. Por favor escolha uma menor que 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany({ ...company, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCompany({ ...company, logo: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // CEP Handler
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value;
    setClient({ ...client, zip: newCep });

    // Remove caracteres não numéricos
    const cleanCep = newCep.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setClient(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            zip: newCep // Mantém o valor digitado
          }));
        } else {
          // CEP não encontrado (mas formato válido)
          console.warn("CEP não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // --- ITEM LOGIC ---

  // Auto-fill by Code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setCurrentItem(prev => ({ ...prev, code }));

    if (code) {
      const found = catalog.find(i => i.code === code);
      if (found) {
        setCurrentItem(prev => ({
          ...prev,
          code, // keep current input
          description: found.description,
          unitPrice: found.unitPrice
        }));
      }
    }
  };

  // Auto-fill by Description
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const desc = e.target.value;
    setCurrentItem(prev => ({ ...prev, description: desc }));

    // Check for exact match in catalog to autofill price/code
    const found = catalog.find(i => i.description.toLowerCase() === desc.toLowerCase());
    if (found) {
        setCurrentItem(prev => ({
            ...prev,
            description: desc, // keep current input
            code: found.code,
            unitPrice: found.unitPrice
        }));
    }
  };

  const addItem = () => {
    if (!currentItem.description || !currentItem.unitPrice) return;
    
    // Logic to add to items list
    if (isEditingItem) {
      setItems(items.map(i => i.id === isEditingItem ? { ...i, ...currentItem as ProductItem } : i));
      setIsEditingItem(null);
    } else {
      setItems([...items, { ...currentItem, id: generateId() } as ProductItem]);
    }

    // Logic to save to catalog if checkbox is checked
    if (saveToCatalog && !isEditingItem) {
      // Check if already exists to avoid duplicates (simple check by description)
      const exists = catalog.some(c => c.description.toLowerCase() === currentItem.description?.toLowerCase());
      if (!exists) {
        const newItemForCatalog = { ...currentItem, id: generateId() } as ProductItem;
        updateCatalog([...catalog, newItemForCatalog]);
      }
    }
    
    setCurrentItem({ code: "", description: "", quantity: 1, unitPrice: 0 });
    setSaveToCatalog(false); // Reset checkbox
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const editItem = (item: ProductItem) => {
    setCurrentItem(item);
    setIsEditingItem(item.id);
  };

  // Catalog Handlers
  const deleteFromCatalog = (id: string) => {
    const newCatalog = catalog.filter(item => item.id !== id);
    updateCatalog(newCatalog);
  };

  const updateCatalogItem = (updatedItem: ProductItem) => {
    const newCatalog = catalog.map(item => item.id === updatedItem.id ? updatedItem : item);
    updateCatalog(newCatalog);
  };

  const selectFromCatalog = (item: ProductItem) => {
    setCurrentItem({
      code: item.code,
      description: item.description,
      unitPrice: item.unitPrice,
      quantity: 1
    });
  };

  // PDF Configuration Options
  const getPdfOptions = () => {
    const safeClientName = (client.name || 'Cliente').replace(/[^a-z0-9]/gi, '_').substring(0, 15);
    const filename = `Orcamento_${quoteNumber}_${safeClientName}.pdf`;
    
    return {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        logging: false 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
  };

  const handleSavePDF = async () => {
    setIsGenerating(true);
    const element = document.getElementById('quote-content');
    const opt = getPdfOptions();

    // @ts-ignore
    if (window.html2pdf) {
      try {
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("Erro ao gerar PDF", error);
        alert("Erro ao gerar o PDF. Tente novamente.");
      }
    } else {
      window.print(); 
    }
    setIsGenerating(false);
  };

  const handleWhatsApp = async () => {
    setIsGenerating(true);
    const statusText = document.getElementById('wa-btn-text');
    if(statusText) statusText.innerText = "Gerando PDF...";

    const element = document.getElementById('quote-content');
    const opt = getPdfOptions();
    
    try {
      // @ts-ignore
      if (!window.html2pdf) {
        throw new Error("Biblioteca PDF não carregada");
      }

      // 1. Gerar PDF Blob
      // @ts-ignore
      const worker = window.html2pdf().set(opt).from(element).toPdf();
      const pdfBlob = await worker.output('blob');
      const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

      // Dados para compartilhamento
      const shareData = {
        files: [file],
        title: `Orçamento ${quoteNumber}`,
        text: `Orçamento para ${client.name}`
      };

      // 2. Tentar API Nativa (Mobile)
      // Verifica se o navegador suporta compartilhamento de arquivos
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          if(statusText) statusText.innerText = "Abrindo WhatsApp...";
          await navigator.share(shareData);
          setIsGenerating(false);
          if(statusText) statusText.innerText = "Enviar via WhatsApp";
          return; // Sucesso
        } catch (shareError) {
          if ((shareError as Error).name !== 'AbortError') {
             console.warn("Falha no share nativo, tentando fallback...", shareError);
          } else {
             // Usuário cancelou
             setIsGenerating(false);
             if(statusText) statusText.innerText = "Enviar via WhatsApp";
             return; 
          }
        }
      }

      // 3. Fallback (Desktop ou Android antigo)
      // Baixa o arquivo e abre o link
      if(statusText) statusText.innerText = "Baixando...";
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = opt.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      const msg = `Olá! Segue o orçamento Nº ${quoteNumber} em anexo.`;
      const waLink = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      
      // Pequeno delay para garantir que o download iniciou
      setTimeout(() => {
         window.open(waLink, '_blank');
         alert("⚠️ MODO DE COMPATIBILIDADE\n\n1. O PDF foi salvo no seu dispositivo.\n2. O WhatsApp foi aberto.\n3. Anexe o arquivo PDF manualmente na conversa.");
      }, 800);

    } catch (error) {
      console.error("Erro fatal:", error);
      alert("Não foi possível gerar o arquivo para envio. Tente a opção 'Baixar PDF'.");
    } finally {
      setIsGenerating(false);
      if(statusText) statusText.innerText = "Enviar via WhatsApp";
    }
  };

  // Compile final data
  const quoteData: QuoteData = {
    number: quoteNumber,
    date: formatDate(new Date()),
    createdBy,
    company,
    client,
    items,
    observations,
    discount // Added to quote data
  };

  // --- Render Steps ---

  const renderCompanyStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-brand-blue flex items-center mb-4">
        <Building2 className="mr-2" /> Dados da Empresa
      </h2>
      
      {/* Upload de Logo */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
        <span className="block text-sm font-medium text-gray-700 mb-2">Logo da Empresa (Opcional)</span>
        <div className="flex items-center gap-4">
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoUpload}
           />
           
           {company.logo ? (
             <div className="relative">
                <img src={company.logo} alt="Logo" className="w-20 h-20 object-contain border rounded bg-gray-50" />
                <button 
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
             </div>
           ) : (
             <div className="w-20 h-20 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <ImagePlus size={24} />
             </div>
           )}

           <Button 
             variant="secondary" 
             className="text-sm py-2"
             onClick={() => fileInputRef.current?.click()}
           >
             {company.logo ? "Trocar Imagem" : "Enviar Logo"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome da Empresa" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
        <Input label="CNPJ" value={company.cnpj} onChange={e => setCompany({...company, cnpj: e.target.value})} />
        <Input label="Telefone" value={company.phone} onChange={e => setCompany({...company, phone: e.target.value})} />
        <Input label="Cidade" value={company.city} onChange={e => setCompany({...company, city: e.target.value})} />
        <Input label="UF" value={company.uf} onChange={e => setCompany({...company, uf: e.target.value})} />
        <Input label="Endereço" className="md:col-span-2" value={company.address} onChange={e => setCompany({...company, address: e.target.value})} />
        <Input label="Criado por (Seu Nome)" className="md:col-span-2" value={createdBy} onChange={e => setCreatedBy(e.target.value)} />
      </div>
    </div>
  );

  const renderClientStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-brand-blue flex items-center mb-4">
        <User className="mr-2" /> Dados do Cliente
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome Completo *" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
        <Input label="Telefone/Celular *" value={client.mobile} onChange={e => setClient({...client, mobile: e.target.value})} />
        <Input label="CPF/CNPJ" value={client.cpfCnpj} onChange={e => setClient({...client, cpfCnpj: e.target.value})} />
        <Input label="Email" type="email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} />
        
        {/* CEP com Busca Automática */}
        <div className="relative">
           <Input 
             label="CEP" 
             value={client.zip} 
             onChange={handleCepChange} 
             placeholder="00000-000"
             maxLength={9}
           />
           {isLoadingCep && (
             <div className="absolute right-3 top-8 text-brand-blue">
               <Loader2 className="animate-spin" size={18} />
             </div>
           )}
        </div>

        <Input label="Cidade" value={client.city} onChange={e => setClient({...client, city: e.target.value})} />
        <Input label="Endereço" className="md:col-span-2" value={client.address} onChange={e => setClient({...client, address: e.target.value})} />
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <Input label="Bairro" value={client.neighborhood} onChange={e => setClient({...client, neighborhood: e.target.value})} />
            <Input label="Estado" value={client.state} onChange={e => setClient({...client, state: e.target.value})} />
        </div>
      </div>
    </div>
  );

  const renderItemsStep = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-blue flex items-center">
          <ShoppingCart className="mr-2" /> Produtos
        </h2>
      </div>

      {/* Button to open catalog */}
      <Button 
        variant="secondary" 
        onClick={() => setIsCatalogOpen(true)}
        className="w-full py-3 mb-2 border-2 border-dashed border-blue-200 bg-blue-50 text-brand-blue hover:bg-blue-100"
        icon={<Search size={20} />}
      >
        Buscar Item Salvo
      </Button>

      {/* Datalist for autocomplete */}
      <datalist id="catalog-list">
        {catalog.map(item => (
          <option key={item.id} value={item.description} />
        ))}
      </datalist>
      
      {/* Form Card */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            {isEditingItem ? "Editar Item" : "Novo Item"}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
          <Input 
            label="Código" 
            className="col-span-1 md:col-span-1" 
            value={currentItem.code} 
            onChange={handleCodeChange}
            placeholder="Cod..." 
          />
          <Input 
            label="Descrição *" 
            className="col-span-2 md:col-span-3" 
            value={currentItem.description} 
            onChange={handleDescriptionChange}
            list="catalog-list" // Connects to datalist
            placeholder="Digite para buscar..."
          />
          <Input 
            label="Qtd" 
            type="number" 
            className="col-span-1 md:col-span-1" 
            value={currentItem.quantity} 
            onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} 
          />
          <Input 
            label="Valor Unit." 
            type="number" 
            step="0.01" 
            className="col-span-2 md:col-span-1" 
            // Se for 0, mostra vazio para não ter que apagar o zero
            value={currentItem.unitPrice === 0 ? '' : currentItem.unitPrice} 
            onChange={e => setCurrentItem({...currentItem, unitPrice: Number(e.target.value)})} 
          />
        </div>
        
        {/* Checkbox Save to Catalog */}
        {!isEditingItem && (
          <div className="flex items-center mb-3">
             <input 
               id="save-catalog"
               type="checkbox" 
               className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
               checked={saveToCatalog}
               onChange={(e) => setSaveToCatalog(e.target.checked)}
             />
             <label htmlFor="save-catalog" className="ml-2 text-sm text-gray-600 flex items-center cursor-pointer">
                <Save size={14} className="mr-1"/> Salvar este item no meu catálogo
             </label>
          </div>
        )}

        <div className="flex justify-end gap-2">
             {isEditingItem && (
                 <Button variant="secondary" onClick={() => { setIsEditingItem(null); setCurrentItem({ code: "", description: "", quantity: 1, unitPrice: 0 }); }}>
                    Cancelar
                 </Button>
             )}
             <Button onClick={addItem} disabled={!currentItem.description || !currentItem.unitPrice}>
                {isEditingItem ? <><Edit2 size={16} className="mr-2"/> Atualizar</> : <><Plus size={16} className="mr-2"/> Adicionar</>}
             </Button>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        <h3 className="font-bold text-gray-700 mb-2">Itens Adicionados ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">Nenhum item adicionado ainda.</p>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="bg-white p-3 rounded shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{item.description}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x R$ {item.unitPrice.toFixed(2)} = <span className="text-brand-blue font-bold">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editItem(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount Input */}
      {items.length > 0 && (
         <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-green-100">
            <div className="flex items-center gap-2 mb-2 text-green-700 font-bold">
               <DollarSign size={20} />
               Desconto no Total
            </div>
            <Input 
              label="Valor do Desconto (R$)" 
              type="number"
              step="0.01"
              value={discount === 0 ? '' : discount} 
              onChange={e => setDiscount(Number(e.target.value))}
              placeholder="0,00"
            />
         </div>
      )}

      <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
          <textarea 
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-brand-blue focus:border-brand-blue"
            placeholder="Ex: Validade do orçamento 15 dias, pagamento 50% entrada..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
      </div>
    </div>
  );

  // --- Main Render Logic ---

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (step === Step.PREVIEW) {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col items-center">
        {/* Mobile Toolbar */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-3 flex justify-between items-center no-print">
            <button onClick={() => setStep(Step.ITEMS)} className="text-gray-600 flex items-center font-medium">
                <ChevronLeft size={20} /> Editar
            </button>
            <span className="font-bold text-gray-800">Prévia do Orçamento</span>
            <div className="w-16"></div>
        </div>

        {/* Preview Area */}
        <div className="mt-16 mb-32 w-full flex justify-center p-4 overflow-auto">
            {/* Wrapper visual da folha A4 */}
            <div className="bg-white shadow-2xl print:shadow-none" style={{ width: '210mm' }}>
                <div id="quote-content">
                  <QuoteTemplate data={quoteData} />
                </div>
            </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg no-print">
            <div className="flex flex-col gap-3 max-w-lg mx-auto">
              <Button variant="success" onClick={handleWhatsApp} disabled={isGenerating} fullWidth>
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Share2 className="mr-2" size={20} />}
                  <span id="wa-btn-text">{isGenerating ? "Processando..." : "Enviar via WhatsApp"}</span>
              </Button>
              <Button variant="primary" onClick={handleSavePDF} disabled={isGenerating} fullWidth className="bg-gray-800 hover:bg-gray-900">
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" size={20} />}
                  {isGenerating ? "Gerando..." : "Baixar PDF"}
              </Button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Nota: O envio direto funciona melhor em celulares Android/iOS.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Validation Alert Toast */}
      {validationError && (
        <div className="fixed top-16 left-0 right-0 mx-auto w-full max-w-md px-4 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-xl flex items-center justify-center">
            <AlertTriangle className="mr-2" size={24} />
            <span className="font-bold text-sm">{validationError}</span>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      <CatalogModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        catalog={catalog}
        onDelete={deleteFromCatalog}
        onSelect={selectFromCatalog}
        onUpdate={updateCatalogItem}
      />

      {/* Header */}
      <header className="bg-brand-blue text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
           <h1 className="text-lg font-bold flex items-center">
             <FileText className="mr-2" /> Orçamentos WA
           </h1>
           <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-800 px-2 py-1 rounded hidden md:inline-block">{currentUser}</span>
              <button onClick={handleLogout} className="text-xs flex items-center bg-blue-900 hover:bg-blue-950 px-2 py-1 rounded transition-colors">
                <LogOut size={14} className="mr-1"/> Sair
              </button>
           </div>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mt-4 px-4 max-w-md mx-auto text-xs opacity-90">
            <div className={`flex flex-col items-center ${step >= Step.COMPANY ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= Step.COMPANY ? 'bg-white text-brand-blue font-bold' : 'border border-blue-300'}`}>1</div>
                Empresa
            </div>
            <div className="h-[1px] bg-blue-400 flex-1 mx-2"></div>
            <div className={`flex flex-col items-center ${step >= Step.CLIENT ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= Step.CLIENT ? 'bg-white text-brand-blue font-bold' : 'border border-blue-300'}`}>2</div>
                Cliente
            </div>
            <div className="h-[1px] bg-blue-400 flex-1 mx-2"></div>
            <div className={`flex flex-col items-center ${step >= Step.ITEMS ? 'text-white' : 'text-blue-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= Step.ITEMS ? 'bg-white text-brand-blue font-bold' : 'border border-blue-300'}`}>3</div>
                Itens
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
        {step === Step.COMPANY && renderCompanyStep()}
        {step === Step.CLIENT && renderClientStep()}
        {step === Step.ITEMS && renderItemsStep()}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between max-w-2xl mx-auto w-full z-10">
        <Button 
            variant="secondary" 
            onClick={handleBack} 
            disabled={step === Step.COMPANY}
            className={step === Step.COMPANY ? 'invisible' : ''}
        >
            <ChevronLeft className="mr-1" size={20}/> Voltar
        </Button>
        
        <Button onClick={handleNext}>
            {step === Step.ITEMS ? "Gerar Orçamento" : "Próximo"} <ChevronRight className="ml-1" size={20}/>
        </Button>
      </footer>
    </div>
  );
}