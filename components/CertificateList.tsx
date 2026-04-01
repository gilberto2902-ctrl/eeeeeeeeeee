
import React, { useState } from 'react';
import { Certificate } from '../types';
import ContextualHelp from './ContextualHelp';

interface CertificateListProps {
  certificates: Certificate[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const CertificateList: React.FC<CertificateListProps> = ({ certificates, onView, onEdit, onDelete, onDuplicate }) => {
  const [search, setSearch] = useState('');

  const filtered = certificates.filter(c => 
     c.osNumber.toLowerCase().includes(search.toLowerCase()) ||
     c.tag?.toLowerCase().includes(search.toLowerCase()) ||
     c.instrument.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
        <div className="flex items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-2xl font-bold text-orange-500">Certificados Salvos</h2>
            <ContextualHelp section="list" />
        </div>
        
        <div className="mb-6">
            <input 
                placeholder="Buscar por OS, Tag ou Modelo..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:ring-1 focus:ring-orange-500 outline-none"
            />
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-700 text-gray-300 border-b border-gray-600">
                        <th className="p-4 font-semibold">TAG</th>
                        <th className="p-4 font-semibold">Equipamento</th>
                        <th className="p-4 font-semibold">Tipo</th>
                        <th className="p-4 font-semibold">Data Calibração</th>
                        <th className="p-4 font-semibold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {filtered.length > 0 ? (
                        filtered.map(cert => (
                            <tr key={cert.id} className="hover:bg-gray-700/50">
                                <td className="p-4 text-white font-medium">{cert.tag || '-'}</td>
                                <td className="p-4 text-gray-300">{cert.instrument.model}</td>
                                <td className="p-4 text-gray-300">{cert.type === 'manometer' ? 'Manômetro' : 'Válvula'}</td>
                                <td className="p-4 text-gray-300">{new Date(cert.calibrationDate).toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => onView(cert.id)} className="text-blue-400 hover:text-blue-300" title="Ver">Ver</button>
                                    <button onClick={() => onEdit(cert.id)} className="text-yellow-400 hover:text-yellow-300" title="Editar">Editar</button>
                                    <button onClick={() => onDuplicate(cert.id)} className="text-purple-400 hover:text-purple-300" title="Duplicar">Duplicar</button>
                                    <button onClick={() => onDelete(cert.id)} className="text-red-400 hover:text-red-300" title="Excluir">Excluir</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum certificado encontrado.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default CertificateList;