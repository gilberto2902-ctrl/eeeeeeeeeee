
import React, { useState } from 'react';
import { Certificate } from '../types';
import ContextualHelp from './ContextualHelp';

interface OSListProps {
  certificates: Certificate[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const OSList: React.FC<OSListProps> = ({ certificates, onView, onEdit, onDelete, onDuplicate }) => {
  const [selectedOS, setSelectedOS] = useState<string | null>(null);

  // --- Lógica de Visualização Detalhada (Tabela de uma OS) ---
  if (selectedOS) {
    // Filtra certificados apenas da OS selecionada
    // Nota: Se houver OS com mesmo número em anos diferentes, isso mostraria ambas. 
    // Como a visualização principal agora separa por ano, o usuário sabe em qual clicou.
    const certsInOS = certificates.filter(c => c.osNumber.trim() === selectedOS);
    
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-2">
            <button 
                onClick={() => setSelectedOS(null)}
                className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Voltar
            </button>
            <h2 className="text-2xl font-bold text-orange-500">OS: {selectedOS}</h2>
            <span className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-300">{certsInOS.length} itens</span>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-700 text-gray-300 border-b border-gray-600">
                        <th className="p-4 font-semibold">TAG</th>
                        <th className="p-4 font-semibold">Equipamento</th>
                        <th className="p-4 font-semibold">Tipo</th>
                        <th className="p-4 font-semibold">Data</th>
                        <th className="p-4 font-semibold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {certsInOS.map(cert => (
                        <tr key={cert.id} className="hover:bg-gray-700/50 transition">
                            <td className="p-4 text-white font-medium">{cert.tag || '-'}</td>
                            <td className="p-4 text-gray-300">{cert.instrument.model}</td>
                            <td className="p-4 text-gray-300 text-sm">{cert.type === 'manometer' ? 'Manômetro' : 'Válvula'}</td>
                            <td className="p-4 text-gray-300 text-sm">{new Date(cert.calibrationDate).toLocaleDateString('pt-BR')}</td>
                            <td className="p-4 text-right space-x-2">
                                <button onClick={() => onView(cert.id)} className="text-blue-400 hover:text-blue-300 text-sm font-bold">Ver</button>
                                <button onClick={() => onEdit(cert.id)} className="text-yellow-400 hover:text-yellow-300 text-sm font-bold">Editar</button>
                                <button onClick={() => onDuplicate(cert.id)} className="text-purple-400 hover:text-purple-300 text-sm font-bold">Duplicar</button>
                                <button onClick={() => onDelete(cert.id)} className="text-red-400 hover:text-red-300 text-sm font-bold">Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    );
  }

  // --- Lógica de Agrupamento por Ano > OS ---

  // 1. Agrupar certificados por Ano
  const certsByYear = certificates.reduce((acc, cert) => {
    const year = new Date(cert.calibrationDate).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(cert);
    return acc;
  }, {} as Record<string, Certificate[]>);

  // 2. Ordenar Anos (Decrescente)
  const sortedYears = Object.keys(certsByYear).sort((a, b) => Number(b) - Number(a));

  // Função auxiliar para agrupar OS dentro de uma lista de certificados (um ano específico)
  const getOSGroupsForYear = (yearCerts: Certificate[]) => {
    const groups = yearCerts.reduce((acc, cert) => {
      const os = cert.osNumber.trim();
      if (!acc[os]) acc[os] = [];
      acc[os].push(cert);
      return acc;
    }, {} as Record<string, Certificate[]>);

    // Ordenar OS Crescente
    return Object.keys(groups).sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    }).map(os => ({
        osNumber: os,
        certificates: groups[os]
    }));
  };

  // Renderizar a Grade de Pastas de OS por Ano
  return (
    <div className="animate-fade-in">
        <div className="flex items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-2xl font-bold text-orange-500">Ordens de Serviço</h2>
            <ContextualHelp section="os-folders" />
        </div>
        
        {sortedYears.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-700">
                <p className="text-xl">Nenhuma OS encontrada.</p>
            </div>
        ) : (
            <div className="space-y-10">
                {sortedYears.map(year => {
                    const osGroups = getOSGroupsForYear(certsByYear[year]);
                    
                    return (
                        <div key={year} className="animate-fade-in">
                            <h3 className="text-xl font-bold text-gray-400 flex items-center gap-2 mb-4">
                                <span className="text-orange-500 opacity-80">📅</span> 
                                {year}
                                <span className="text-xs font-normal bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                                    {osGroups.length} Ordens
                                </span>
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {osGroups.map(({ osNumber, certificates: osCerts }) => {
                                    const count = osCerts.length;
                                    const hasManometer = osCerts.some(c => c.type === 'manometer');
                                    const hasValve = osCerts.some(c => c.type === 'safety_valve');
                                    
                                    return (
                                        <button 
                                            key={`${year}-${osNumber}`}
                                            onClick={() => setSelectedOS(osNumber)}
                                            className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
                                        >
                                            {/* Folder Icon Decoration */}
                                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>

                                            <div className="relative z-10">
                                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">OS Nº</div>
                                                <div className="text-lg font-bold text-white mb-3 truncate">{osNumber}</div>
                                                
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="bg-gray-700 px-2 py-1 rounded text-gray-300 font-medium group-hover:bg-gray-600">
                                                        {count} {count === 1 ? 'Item' : 'Itens'}
                                                    </span>
                                                    
                                                    <div className="flex gap-1">
                                                        {hasManometer && <span className="w-2 h-2 rounded-full bg-blue-500" title="Contém Manômetros"></span>}
                                                        {hasValve && <span className="w-2 h-2 rounded-full bg-green-500" title="Contém Válvulas"></span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="w-full h-px bg-gray-800 mt-8"></div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default OSList;
