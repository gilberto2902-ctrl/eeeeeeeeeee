import React, { useState, useEffect } from 'react';
import { Certificate, Company } from './types';
import { INITIAL_CERTIFICATE } from './constants';
import Logo from './components/Logo';
import Dashboard from './components/Dashboard';
import CertificateForm from './components/CertificateForm';
import CompanyManager from './components/CompanyManager';
import CertificateList from './components/CertificateList';
import OSList from './components/OSList';
import CertificatePreview from './components/CertificatePreview';
import NetworkBackground from './components/NetworkBackground';
import Login from './components/Login';
import DataManager from './components/DataManager';
import UserGuide from './components/UserGuide';
import ContextualHelp from './components/ContextualHelp';
import { auth, db, onAuthStateChanged, logout, collection, query, where, onSnapshot, doc, setDoc, deleteDoc, updateDoc, OperationType, handleFirestoreError, User } from './firebase';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // --- State Management ---
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'new-certificate' | 'list' | 'companies' | 'os-folders' | 'data-management' | 'user-guide'>('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // Selection State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [filterOS, setFilterOS] = useState<string>(''); // Global OS Filter
  
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [currentCertificate, setCurrentCertificate] = useState<Certificate>(INITIAL_CERTIFICATE);
  
  // UI State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // --- Effects (Firebase) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setCertificates([]);
      return;
    }

    // Load Companies
    const qCompanies = query(collection(db, 'companies'), where('userId', '==', user.uid));
    const unsubCompanies = onSnapshot(qCompanies, (snapshot) => {
      const comps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Company));
      setCompanies(comps);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'companies'));

    // Load Certificates
    const qCertificates = query(collection(db, 'certificates'), where('userId', '==', user.uid));
    const unsubCertificates = onSnapshot(qCertificates, (snapshot) => {
      const certs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Certificate));
      setCertificates(certs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'certificates'));

    return () => {
      unsubCompanies();
      unsubCertificates();
    };
  }, [user]);

  useEffect(() => {
    setSelectedYear(new Date().getFullYear().toString());
  }, []);

  // --- Auth Handlers ---
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('dashboard');
      setSelectedCompanyId('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // --- Data Handlers ---

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCompanyId(id);
    const company = companies.find(c => c.id === id);
    if (company) {
        setCurrentCertificate(prev => ({ ...prev, clientName: company.name, companyId: id }));
    } else {
        setCurrentCertificate(prev => ({ ...prev, clientName: '', companyId: '' }));
    }
  };

  const saveCertificate = async () => {
    if (!selectedCompanyId) {
        alert('Selecione uma empresa primeiro.');
        return;
    }
    
    if (!user) return;

    const certId = editingCertificateId || doc(collection(db, 'certificates')).id;
    const newCert = {
        ...currentCertificate,
        id: certId,
        createdAt: editingCertificateId ? currentCertificate.createdAt : new Date().toISOString(),
        companyId: selectedCompanyId,
        userId: user.uid
    };

    try {
      await setDoc(doc(db, 'certificates', certId), newCert);
      alert(editingCertificateId ? 'Certificado atualizado!' : 'Certificado salvo!');
      
      setEditingCertificateId(null);
      setCurrentCertificate({ ...INITIAL_CERTIFICATE, clientName: companies.find(c => c.id === selectedCompanyId)?.name || '' });
      setCurrentPage('list');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'certificates');
    }
  };

  const handleEditCertificate = (id: string) => {
      const cert = certificates.find(c => c.id === id);
      if (cert) {
          setCurrentCertificate(cert);
          setEditingCertificateId(id);
          setSelectedCompanyId(cert.companyId || '');
          setCurrentPage('new-certificate');
      }
  };

  const handleDuplicateCertificate = async (id: string) => {
      const original = certificates.find(c => c.id === id);
      if (!original || !user) return;

      if (confirm('Deseja duplicar este certificado?')) {
          const newId = doc(collection(db, 'certificates')).id;
          const newCert: Certificate = {
              ...original,
              id: newId,
              createdAt: new Date().toISOString(),
              calibrationDate: new Date().toISOString().split('T')[0],
              osNumber: original.osNumber, 
              userId: user.uid
          };

          try {
            await setDoc(doc(db, 'certificates', newId), newCert);
            setCurrentCertificate(newCert);
            setEditingCertificateId(newCert.id);
            if (newCert.companyId) setSelectedCompanyId(newCert.companyId);
            setCurrentPage('new-certificate');
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'certificates');
          }
      }
  };

  const handleDeleteCertificate = async (id: string) => {
      if (confirm('Tem certeza que deseja excluir este certificado permanentemente?')) {
          try {
            await deleteDoc(doc(db, 'certificates', id));
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, 'certificates');
          }
      }
  };

  const handleViewCertificate = (id: string) => {
      const cert = certificates.find(c => c.id === id);
      if (cert) {
          setCurrentCertificate(cert);
          setShowPreviewModal(true);
      }
  };

  const handleDownloadPDF = () => {
    setIsExportingPDF(true);
    const element = document.querySelector('.cert-container');
    if (!element) return;

    const opt = {
        margin: 0,
        filename: `CERT_${currentCertificate.osNumber.replace(/\//g, '-')}_${currentCertificate.tag || 'S-TAG'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().from(element).set(opt).save().then(() => {
        setIsExportingPDF(false);
    });
  };

  const saveCompany = async (company: Company) => {
     if (!user) return;
     const companyId = company.id || doc(collection(db, 'companies')).id;
     const compWithUser = { ...company, id: companyId, userId: user.uid };
     try {
       await setDoc(doc(db, 'companies', companyId), compWithUser);
     } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, 'companies');
     }
  };

  const deleteCompany = async (id: string) => {
      if (confirm('Excluir empresa? Isso não apaga os certificados salvos.')) {
          try {
            await deleteDoc(doc(db, 'companies', id));
            if (selectedCompanyId === id) setSelectedCompanyId('');
          } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, 'companies');
          }
      }
  };

  const handleImportData = async (data: { companies: Company[], certificates: Certificate[] }) => {
      if (!user) return;

      try {
        // Import Companies
        const companyPromises = data.companies.map(comp => 
          setDoc(doc(db, 'companies', comp.id), { ...comp, userId: user.uid })
        );
        
        // Import Certificates
        const certificatePromises = data.certificates.map(cert => 
          setDoc(doc(db, 'certificates', cert.id), { ...cert, userId: user.uid })
        );

        await Promise.all([...companyPromises, ...certificatePromises]);
        alert('Dados importados com sucesso para o banco de dados!');
      } catch (error) {
        console.error('Import error:', error);
        alert('Erro ao importar dados. Verifique sua conexão.');
      }
  };

  const handleClearAllData = async () => {
      if (confirm('ATENÇÃO: Isso apagará TODOS os seus dados do BANCO DE DADOS. Tem certeza?')) {
          if(confirm('Confirmação final: Todos os dados serão perdidos permanentemente. Deseja continuar?')) {
              try {
                const companyDeletions = companies.map(c => deleteDoc(doc(db, 'companies', c.id)));
                const certificateDeletions = certificates.map(c => deleteDoc(doc(db, 'certificates', c.id)));
                
                await Promise.all([...companyDeletions, ...certificateDeletions]);
                
                setSelectedCompanyId('');
                alert('Sistema resetado no banco de dados.');
              } catch (error) {
                console.error('Clear data error:', error);
                alert('Erro ao apagar dados.');
              }
          }
      }
  };

  const filteredCertificates = certificates.filter(c => {
    const matchesCompany = selectedCompanyId ? c.companyId === selectedCompanyId : false;
    const certYear = new Date(c.calibrationDate).getFullYear().toString();
    const matchesYear = selectedYear ? certYear === selectedYear : true;
    const matchesOS = filterOS ? c.osNumber.toLowerCase().includes(filterOS.toLowerCase()) : true;
    
    return matchesCompany && matchesYear && matchesOS;
  });

  const activeCompany = companies.find(c => c.id === selectedCompanyId);
  const years = Array.from({length: 6}, (_, i) => (new Date().getFullYear() + 1 - i).toString());

  if (isLoadingAuth) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;
  
  if (!user) {
      return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col md:flex-row h-screen overflow-hidden relative">
      <NetworkBackground />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900/90 backdrop-blur-md border-r border-gray-800 flex-shrink-0 flex flex-col print:hidden shadow-xl z-20">
        <div className="p-6 border-b border-gray-800">
            <Logo className="h-10 text-orange-500" dark={true} />
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarItem label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
            <SidebarItem label="Novo Certificado" active={currentPage === 'new-certificate'} onClick={() => { setEditingCertificateId(null); setCurrentPage('new-certificate'); }} />
            <SidebarItem label="Ordens de Serviço" active={currentPage === 'os-folders'} onClick={() => setCurrentPage('os-folders')} />
            <SidebarItem label="Certificados Salvos" active={currentPage === 'list'} onClick={() => setCurrentPage('list')} />
            <SidebarItem label="Empresas" active={currentPage === 'companies'} onClick={() => setCurrentPage('companies')} />
            <div className="pt-2 border-t border-gray-800/50 mt-2">
                <SidebarItem label="Guia de Uso" active={currentPage === 'user-guide'} onClick={() => setCurrentPage('user-guide')} />
                <SidebarItem label="Backup & Dados" active={currentPage === 'data-management'} onClick={() => setCurrentPage('data-management')} />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800 space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Empresa Ativa</label>
                    <select 
                        value={selectedCompanyId} 
                        onChange={handleCompanyChange}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                    >
                        <option value="">Selecione...</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Ano de Referência</label>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                    >
                        <option value="">Todos</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Filtrar OS (Global)</label>
                    <input 
                        value={filterOS} 
                        onChange={(e) => setFilterOS(e.target.value)}
                        placeholder="Digite o Nº da OS..."
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                </div>

                {activeCompany && (
                    <div className="p-3 bg-gray-800/80 rounded text-xs text-gray-400 border border-gray-700">
                        <p className="font-bold text-white mb-1">{activeCompany.name}</p>
                        <p>{activeCompany.cnpj}</p>
                        <p>{activeCompany.phone}</p>
                    </div>
                )}
            </div>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
             <div className="flex items-center gap-2 mb-4 px-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Sincronizado com Nuvem</span>
             </div>
             <div className="px-2 mb-4">
                 <p className="text-xs text-gray-500 truncate">{user?.email}</p>
             </div>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 border border-red-900 rounded hover:bg-red-900/50 transition-colors text-sm font-bold"
             >
                SAIR DO SISTEMA
             </button>
        </div>
        
        <div className="p-4 text-xs text-center text-gray-600">
            &copy; 2025 Idealle System
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-transparent print:bg-white z-10">
        <header className="md:hidden bg-gray-800 p-4 flex justify-between items-center print:hidden">
             <span className="font-bold">Idealle System</span>
             <button className="text-gray-400">Menu</button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0">
             {currentPage === 'dashboard' && (
                 selectedCompanyId ? (
                    <Dashboard 
                        certificates={filteredCertificates} 
                        onViewCertificate={handleViewCertificate}
                        onEditCertificate={handleEditCertificate}
                        onDeleteCertificate={handleDeleteCertificate}
                        onDuplicateCertificate={handleDuplicateCertificate}
                    />
                 ) : <EmptyState msg="Selecione uma empresa para ver o dashboard." />
             )}

             {currentPage === 'new-certificate' && (
                 selectedCompanyId ? (
                     <div className="animate-fade-in max-w-4xl mx-auto">
                         <div className="flex items-center mb-6 border-b border-gray-700 pb-2">
                            <h2 className="text-2xl font-bold text-orange-500">
                                {editingCertificateId ? 'Editar Certificado' : 'Novo Certificado'}
                            </h2>
                            <ContextualHelp section="new-certificate" />
                         </div>
                        <CertificateForm 
                            data={currentCertificate} 
                            onChange={setCurrentCertificate} 
                            onSave={saveCertificate}
                            onPreview={() => setShowPreviewModal(true)}
                        />
                     </div>
                 ) : <EmptyState msg="Selecione uma empresa para criar um certificado." />
             )}

             {currentPage === 'os-folders' && (
                 selectedCompanyId ? (
                     <OSList 
                        certificates={filteredCertificates}
                        onView={handleViewCertificate}
                        onEdit={handleEditCertificate}
                        onDelete={handleDeleteCertificate}
                        onDuplicate={handleDuplicateCertificate}
                     />
                 ) : <EmptyState msg="Selecione uma empresa para ver as Ordens de Serviço." />
             )}

             {currentPage === 'list' && (
                 selectedCompanyId ? (
                    <CertificateList 
                        certificates={filteredCertificates}
                        onView={handleViewCertificate}
                        onEdit={handleEditCertificate}
                        onDelete={handleDeleteCertificate}
                        onDuplicate={handleDuplicateCertificate}
                    />
                 ) : <EmptyState msg="Selecione uma empresa para ver os certificados." />
             )}

             {currentPage === 'companies' && (
                 <CompanyManager 
                    companies={companies}
                    onSave={saveCompany}
                    onDelete={deleteCompany}
                 />
             )}

             {currentPage === 'data-management' && (
                 <DataManager 
                    companies={companies}
                    certificates={certificates}
                    onImport={handleImportData}
                    onClearAll={handleClearAllData}
                 />
             )}

             {currentPage === 'user-guide' && (
                 <UserGuide />
             )}
        </div>
      </main>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:p-0">
            <div className="relative bg-white w-full max-w-[230mm] h-[90vh] overflow-auto rounded shadow-2xl print:w-full print:h-auto print:shadow-none print:rounded-none">
                <div className="sticky top-0 right-0 p-4 flex justify-end items-center gap-2 bg-gray-100 border-b print:hidden z-50">
                    <button 
                        onClick={handleDownloadPDF} 
                        disabled={isExportingPDF}
                        className="px-4 py-2 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-500 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isExportingPDF ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gerando PDF...
                            </>
                        ) : 'Baixar PDF'}
                    </button>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-500">Imprimir</button>
                    <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded font-bold text-sm hover:bg-gray-500">Fechar</button>
                </div>
                <div className="p-8 print:p-0 flex justify-center bg-gray-500 print:bg-white">
                    <CertificatePreview data={currentCertificate} company={activeCompany || null} />
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

const SidebarItem: React.FC<{ label: string; active?: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${active ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
        {label}
    </button>
);

const EmptyState: React.FC<{ msg: string }> = ({ msg }) => (
    <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-fade-in bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-700 m-4">
        <div className="text-6xl mb-4 opacity-50 grayscale">🏢</div>
        <p className="text-xl font-medium">{msg}</p>
    </div>
);

export default App;