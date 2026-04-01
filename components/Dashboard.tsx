
import React from 'react';
import { Certificate } from '../types';
import ContextualHelp from './ContextualHelp';

interface DashboardProps {
  certificates: Certificate[];
  onViewCertificate: (id: string) => void;
  onEditCertificate: (id: string) => void;
  onDeleteCertificate: (id: string) => void;
  onDuplicateCertificate: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ certificates, onViewCertificate, onEditCertificate, onDeleteCertificate, onDuplicateCertificate }) => {
  const totalCertificates = certificates.length;
  const manometerCount = certificates.filter(c => c.type === 'manometer').length;
  const valveCount = certificates.filter(c => c.type === 'safety_valve').length;
  
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);
  
  const upcomingCalibrations = certificates.filter(c => {
      if (!c.nextCalibration) return false;
      const nextDate = new Date(c.nextCalibration);
      return nextDate >= today && nextDate <= nextMonth;
  }).length;

  const recentCertificates = [...certificates]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);

  return (
    <div className="animate-fade-in">
        <div className="flex items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-2xl font-bold text-orange-500">Dashboard</h2>
            <ContextualHelp section="dashboard" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-orange-500 transform transition hover:-translate-y-1">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Total Certificados</h3>
                <p className="text-3xl font-bold text-white mt-2">{totalCertificates}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500 transform transition hover:-translate-y-1">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Manômetros</h3>
                <p className="text-3xl font-bold text-white mt-2">{manometerCount}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500 transform transition hover:-translate-y-1">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Válvulas</h3>
                <p className="text-3xl font-bold text-white mt-2">{valveCount}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-red-500 transform transition hover:-translate-y-1">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Próx. Calibrações</h3>
                <p className="text-3xl font-bold text-white mt-2">{upcomingCalibrations}</p>
            </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">Certificados Recentes</h3>
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-700 text-gray-300 border-b border-gray-600">
                        <th className="p-4 font-semibold">Nº OS</th>
                        <th className="p-4 font-semibold">TAG</th>
                        <th className="p-4 font-semibold">Tipo</th>
                        <th className="p-4 font-semibold">Data</th>
                        <th className="p-4 font-semibold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {recentCertificates.length > 0 ? (
                        recentCertificates.map(cert => (
                            <tr key={cert.id} className="hover:bg-gray-700/50 transition">
                                <td className="p-4 text-white">{cert.osNumber}</td>
                                <td className="p-4 text-gray-300">{cert.tag || '-'}</td>
                                <td className="p-4 text-gray-300">{cert.type === 'manometer' ? 'Manômetro' : 'Válvula'}</td>
                                <td className="p-4 text-gray-300">{new Date(cert.calibrationDate).toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => onViewCertificate(cert.id)} className="text-blue-400 hover:text-blue-300" title="Ver">Ver</button>
                                    <button onClick={() => onEditCertificate(cert.id)} className="text-yellow-400 hover:text-yellow-300" title="Editar">Editar</button>
                                    <button onClick={() => onDuplicateCertificate(cert.id)} className="text-purple-400 hover:text-purple-300" title="Duplicar">Duplicar</button>
                                    <button onClick={() => onDeleteCertificate(cert.id)} className="text-red-400 hover:text-red-300" title="Excluir">Excluir</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500 italic">Nenhum certificado recente encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Dashboard;