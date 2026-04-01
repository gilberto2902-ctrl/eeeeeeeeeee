
import React, { useState, useRef } from 'react';
import { Company } from '../types';
import ContextualHelp from './ContextualHelp';

interface CompanyManagerProps {
  companies: Company[];
  onSave: (company: Company) => void;
  onDelete: (id: string) => void;
}

const CompanyManager: React.FC<CompanyManagerProps> = ({ companies, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Company>({
    id: '', name: '', cnpj: '', address: '', phone: '', email: '', contact: '', notes: ''
  });

  const handleEdit = (company: Company) => {
    setFormData(company);
    setIsEditing(true);
  };

  const handleNew = () => {
    setFormData({ id: '', name: '', cnpj: '', address: '', phone: '', email: '', contact: '', notes: '' });
    setIsEditing(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return alert('Nome da empresa é obrigatório');
    onSave(formData);
    setIsEditing(false);
  };

  // --- Lógica de Processamento de Arquivo (OCR/PDF) ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    let extractedText = "";

    try {
        if (file.type === 'application/pdf') {
            extractedText = await extractTextFromPDF(file);
        } else if (file.type.startsWith('image/')) {
            extractedText = await extractTextFromImage(file);
        } else {
            alert('Formato não suportado. Use PDF ou Imagens (JPG/PNG).');
            setIsProcessingFile(false);
            return;
        }

        if (extractedText) {
            autoFillForm(extractedText);
            alert('Dados extraídos com sucesso! Verifique e corrija se necessário.');
        } else {
            alert('Não foi possível extrair texto legível deste documento.');
        }

    } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        alert('Erro ao processar o arquivo. Tente um arquivo mais nítido.');
    } finally {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    // @ts-ignore - Tesseract loaded via CDN
    if (!window.Tesseract) {
        throw new Error("Tesseract não carregado");
    }
    // @ts-ignore
    const result = await window.Tesseract.recognize(file, 'por', {
        logger: (m: any) => console.log(m)
    });
    return result.data.text;
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // @ts-ignore - pdfjsLib loaded via CDN
    const pdfjs = window.pdfjsLib;
    if (!pdfjs) throw new Error("PDF.js não carregado");

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    // Ler apenas as primeiras 2 páginas para performance (geralmente cabeçalho está lá)
    const maxPages = Math.min(pdf.numPages, 2); 

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n";
    }
    
    return fullText;
  };

  const autoFillForm = (text: string) => {
    const newData = { ...formData };
    
    // Limpar texto para facilitar regex (remover quebras de linha excessivas)
    const cleanText = text.replace(/\s+/g, ' ');

    // 1. Extrair CNPJ (Padrão XX.XXX.XXX/XXXX-XX)
    const cnpjMatch = cleanText.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
    if (cnpjMatch) newData.cnpj = cnpjMatch[0];

    // 2. Extrair Email
    const emailMatch = cleanText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
    if (emailMatch) newData.email = emailMatch[0].toLowerCase();

    // 3. Extrair Telefone (Padrões comuns: (XX) XXXX-XXXX ou XX XXXXX-XXXX)
    // Tenta encontrar algo que pareça telefone com DDD
    const phoneMatch = cleanText.match(/\(?\d{2}\)?\s?\d{4,5}[-\s]\d{4}/);
    if (phoneMatch) newData.phone = phoneMatch[0];

    // 4. Tentar extrair Nome/Razão Social
    // Procura por "Razão Social:" ou "Nome:" e pega o texto seguinte
    const nameLabelMatch = cleanText.match(/(?:raz[ãa]o social|nome empresarial|cliente)[:\s]+([^.,;]+)/i);
    if (nameLabelMatch && nameLabelMatch[1]) {
        newData.name = nameLabelMatch[1].trim().toUpperCase();
    } else if (!newData.name) {
        // Fallback: Se não achou label, tenta pegar linhas iniciais se for PDF de cartão CNPJ
        // Mas é arriscado. Vamos deixar o usuário preencher se não achar label explícito.
    }

    // 5. Tentar extrair Endereço (Procura por CEP ou Logradouro)
    const cepMatch = cleanText.match(/\d{5}-\d{3}/);
    if (cepMatch) {
        // Se achou CEP, tenta pegar o contexto ao redor
        const addressContext = cleanText.match(new RegExp(`([^.,;]*${cepMatch[0]}[^.,;]*)`, 'i'));
        if (addressContext) newData.address = addressContext[1].trim();
    } else {
         // Procura por "Endereço:" ou "Logradouro:"
         const addressLabelMatch = cleanText.match(/(?:endere[çc]o|logradouro)[:\s]+([^.,;]+)/i);
         if (addressLabelMatch) newData.address = addressLabelMatch[1].trim();
    }

    // Jogar o texto bruto nas observações para o usuário conferir o resto
    if (!newData.notes) {
        newData.notes = "Dados importados de documento."; 
    }

    setFormData(newData);
  };

  const inputClass = "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-1 focus:ring-orange-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="animate-fade-in">
        <div className="flex items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-2xl font-bold text-orange-500">Cadastro de Empresas</h2>
            <ContextualHelp section="companies" />
        </div>
        
        {!isEditing ? (
             <>
                <div className="mb-6">
                    <button onClick={handleNew} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold shadow transition">Nova Empresa</button>
                </div>
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-700 text-gray-300 border-b border-gray-600">
                                <th className="p-4 font-semibold">Nome</th>
                                <th className="p-4 font-semibold">CNPJ</th>
                                <th className="p-4 font-semibold">Contato</th>
                                <th className="p-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {companies.map(c => (
                                <tr key={c.id} className="hover:bg-gray-700/50">
                                    <td className="p-4 text-white font-medium">{c.name}</td>
                                    <td className="p-4 text-gray-300">{c.cnpj || '-'}</td>
                                    <td className="p-4 text-gray-300">{c.contact || '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(c)} className="text-blue-400 hover:text-blue-300">Editar</button>
                                        <button onClick={() => onDelete(c.id)} className="text-red-400 hover:text-red-300">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                            {companies.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma empresa cadastrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </>
        ) : (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{formData.id ? 'Editar Empresa' : 'Nova Empresa'}</h3>
                    
                    {/* Upload Section */}
                    <div className="flex items-center gap-2">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="application/pdf, image/png, image/jpeg, image/jpg"
                            onChange={handleFileUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessingFile}
                            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-colors ${
                                isProcessingFile 
                                ? 'bg-gray-600 text-gray-400 cursor-wait' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                        >
                            {isProcessingFile ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Lendo...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Auto-preencher (PDF/IMG)
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Nome *</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="Nome da Empresa" /></div>
                    <div><label className={labelClass}>CNPJ</label><input value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} className={inputClass} placeholder="00.000.000/0000-00" /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Endereço</label><input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} placeholder="Rua, Número, Bairro, Cidade - UF, CEP" /></div>
                    <div><label className={labelClass}>Telefone</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} placeholder="(00) 0000-0000" /></div>
                    <div><label className={labelClass}>Email</label><input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="email@empresa.com" /></div>
                    <div><label className={labelClass}>Contato</label><input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className={inputClass} placeholder="Nome do Responsável" /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Observações</label><textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className={inputClass} /></div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">Cancelar</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 font-bold">Salvar</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default CompanyManager;
