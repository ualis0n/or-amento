import React from 'react';
import { QuoteData } from '../types';
import { formatCurrency } from '../utils';

interface QuoteTemplateProps {
  data: QuoteData;
}

export const QuoteTemplate: React.FC<QuoteTemplateProps> = ({ data }) => {
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discount = data.discount || 0;
  const total = subtotal - discount;

  return (
    <div className="a4-page text-black" style={{ color: 'black' }}>
      
      {/* Cabeçalho Principal */}
      <div className="flex justify-between items-start border-b-2 border-brand-blue pb-6 mb-6">
        <div className="flex items-start gap-4">
           {/* Logo: Mostra imagem se tiver, ou placeholder se não tiver */}
           {data.company.logo ? (
             <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src={data.company.logo} 
                  alt="Logo" 
                  className="max-w-full max-h-full object-contain"
                />
             </div>
           ) : (
             <div className="w-20 h-20 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-gray-400">
                <span className="text-xs font-bold">LOGO</span>
             </div>
           )}

           <div>
             <h1 className="text-2xl font-bold text-brand-blue uppercase tracking-tight leading-none mb-1">{data.company.name}</h1>
             <div className="text-xs text-gray-600 space-y-0.5">
               <p className="font-bold">CNPJ: {data.company.cnpj}</p>
               <p>{data.company.address}</p>
               <p>{data.company.city} - {data.company.uf}</p>
               <p>{data.company.phone}</p>
             </div>
           </div>
        </div>
        
        <div className="text-right">
          <div className="bg-brand-blue text-white px-4 py-2 rounded-l-lg mb-2 inline-block">
             <span className="text-xl font-bold tracking-widest">ORÇAMENTO</span>
          </div>
          <div className="text-sm space-y-1">
             <p><span className="font-bold text-gray-600">Nº:</span> {data.number}</p>
             <p><span className="font-bold text-gray-600">Data:</span> {data.date}</p>
          </div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-6">
        <div className="bg-brand-blue text-white px-3 py-1.5 font-bold text-sm uppercase mb-0 border-l-4 border-blue-900 flex justify-between items-center">
          <span>Dados do Cliente</span>
        </div>
        <div className="border border-gray-300 border-t-0 p-4 bg-gray-50 text-xs">
           <div className="grid grid-cols-12 gap-y-2 gap-x-4">
              <div className="col-span-8 border-b border-gray-200 pb-1">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">Nome / Razão Social</span>
                 <span className="text-sm">{data.client.name}</span>
              </div>
              <div className="col-span-4 border-b border-gray-200 pb-1">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">CPF / CNPJ</span>
                 <span className="text-sm">{data.client.cpfCnpj || '-'}</span>
              </div>

              <div className="col-span-6 border-b border-gray-200 pb-1">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">Endereço</span>
                 <span>{data.client.address}</span>
              </div>
              <div className="col-span-3 border-b border-gray-200 pb-1">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">Bairro</span>
                 <span>{data.client.neighborhood}</span>
              </div>
              <div className="col-span-3 border-b border-gray-200 pb-1">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">Cidade/UF</span>
                 <span>{data.client.city} - {data.client.state}</span>
              </div>

              <div className="col-span-4">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">Telefone/Celular</span>
                 <span>{data.client.mobile} / {data.client.phone}</span>
              </div>
              <div className="col-span-5">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">Email</span>
                 <span>{data.client.email || '-'}</span>
              </div>
               <div className="col-span-3">
                 <span className="font-bold text-gray-500 uppercase text-[10px] block">CEP</span>
                 <span>{data.client.zip || '-'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="mb-6 flex-grow">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-brand-blue text-white">
              <th className="py-2 px-2 text-center border-r border-blue-400 w-16">CÓD.</th>
              <th className="py-2 px-3 text-left border-r border-blue-400">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
              <th className="py-2 px-2 text-center border-r border-blue-400 w-16">QTD</th>
              <th className="py-2 px-2 text-right border-r border-blue-400 w-28">V. UNIT</th>
              <th className="py-2 px-2 text-right w-28">TOTAL</th>
            </tr>
          </thead>
          <tbody className="border border-gray-300 border-t-0">
            {data.items.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Nenhum item adicionado ao orçamento.</td></tr>
            ) : (
              data.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-center border-r border-gray-200 text-gray-600">{item.code || index + 1}</td>
                  <td className="py-2 px-3 border-r border-gray-200 font-medium">{item.description}</td>
                  <td className="py-2 px-2 text-center border-r border-gray-200">{item.quantity}</td>
                  <td className="py-2 px-2 text-right border-r border-gray-200">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 px-2 text-right font-bold text-gray-800">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Totalizador */}
        <div className="flex flex-col items-end mt-0">
            {discount > 0 && (
              <div className="w-64 px-3 py-1 flex justify-between items-center text-gray-600 border-x border-gray-300 bg-gray-50">
                  <span className="text-xs uppercase font-bold">Subtotal</span>
                  <span className="text-sm">{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="w-64 px-3 py-1 flex justify-between items-center text-red-600 border-x border-gray-300 bg-gray-50">
                  <span className="text-xs uppercase font-bold">Desconto</span>
                  <span className="text-sm">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="bg-brand-blue text-white w-64 p-3 flex justify-between items-center rounded-b-lg shadow-sm">
                <span className="font-bold text-sm uppercase">Total Geral</span>
                <span className="font-bold text-xl">{formatCurrency(total)}</span>
            </div>
        </div>
      </div>

      {/* Observações e Rodapé */}
      <div className="mt-auto">
        <div className="border border-gray-300 rounded mb-8 bg-white">
            <div className="bg-gray-100 px-3 py-1 border-b border-gray-200">
                <span className="font-bold text-xs uppercase text-gray-600">Observações</span>
            </div>
            <div className="p-3 min-h-[80px] text-xs leading-relaxed whitespace-pre-wrap">
                {data.observations || "Orçamento válido por 15 dias."}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mt-16 text-center">
            <div>
                <div className="border-b border-black mb-2"></div>
                <p className="font-bold text-xs uppercase">{data.company.name}</p>
                <p className="text-[10px] text-gray-500">Responsável: {data.createdBy}</p>
            </div>
            <div>
                <div className="border-b border-black mb-2"></div>
                <p className="font-bold text-xs uppercase">{data.client.name}</p>
                <p className="text-[10px] text-gray-500">Cliente</p>
            </div>
        </div>
        
        <div className="mt-12 text-center text-[10px] text-gray-400 border-t border-gray-200 pt-2">
            <p>Este documento não possui valor fiscal.</p>
        </div>
      </div>
    </div>
  );
};