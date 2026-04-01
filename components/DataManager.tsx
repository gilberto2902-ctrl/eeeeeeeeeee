
import React, { useRef, useState } from 'react';
import { Certificate, Company } from '../types';
import ContextualHelp from './ContextualHelp';

interface DataManagerProps {
  companies: Company[];
  certificates: Certificate[];
  onImport: (data: { companies: Company[], certificates: Certificate[] }) => void;
  onClearAll: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ companies, certificates, onImport, onClearAll }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStats, setImportStats] = useState<{ companies: number, certificates: number } | null>(null);

  const handleExport = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      companies,
      certificates
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_idealle_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!Array.isArray(json.companies) || !Array.isArray(json.certificates)) {
            alert('Arquivo inválido. Certifique-se de usar um backup gerado por este sistema.');
            return;
        }

        onImport({
            companies: json.companies,
            certificates: json.certificates
        });

        setImportStats({
            companies: json.companies.length,
            certificates: json.certificates.length
        });

        if (fileInputRef.current) fileInputRef.current.value = '';

      } catch (error) {
        console.error(error);
        alert('Erro ao ler o arquivo. O formato deve ser JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6 border-b border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-orange-500">Gerenciamento de Dados</h2>
        <ContextualHelp section="data-management" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Export Section */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-900/30 rounded-full text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Fazer Backup (Exportar)</h3>
                    <p className="text-sm text-gray-400">Salvar todos os dados em um arquivo.</p>
                </div>
            </div>
            
            <p className="text-gray-300 mb-6 text-sm">
                Isso criará um arquivo contendo <strong>{companies.length} empresas</strong> e <strong>{certificates.length} certificados</strong>. 
                Guarde este arquivo em uma pasta segura no seu computador ou na nuvem.
            </p>

            <button 
                onClick={handleExport}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
            >
                BAIXAR BACKUP AGORA
            </button>
        </div>

        {/* Import Section */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-900/30 rounded-full text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Restaurar Dados (Importar)</h3>
                    <p className="text-sm text-gray-400">Alimentar o app com um backup.</p>
                </div>
            </div>
            
            <p className="text-gray-300 mb-6 text-sm">
                Selecione um arquivo de backup (.json) para carregar no sistema. 
                Os dados serão <strong>mesclados</strong> com os atuais (dados duplicados serão atualizados).
            </p>

            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                className="hidden"
            />

            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
            >
                SELECIONAR ARQUIVO DE BACKUP
            </button>

            {importStats && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded text-center animate-fade-in">
                    <p className="text-green-400 font-bold">Sucesso!</p>
                    <p className="text-xs text-green-300">
                        Carregados: {importStats.companies} empresas, {importStats.certificates} certificados.
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 border-t border-gray-700 pt-8">
        <h3 className="text-red-500 font-bold text-lg mb-4">Zona de Perigo</h3>
        <div className="bg-red-900/10 border border-red-900/50 p-4 rounded flex items-center justify-between">
            <div>
                <p className="text-white font-bold">Apagar todos os dados</p>
                <p className="text-sm text-gray-400">Isso removerá todas as empresas e certificados da sua conta no banco de dados.</p>
            </div>
            <button 
                onClick={onClearAll}
                className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 border border-red-700 rounded text-sm font-bold transition-colors"
            >
                LIMPAR TUDO
            </button>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
