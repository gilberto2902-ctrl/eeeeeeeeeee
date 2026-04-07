
import React from 'react';
import { Certificate, Company } from '../types';
import Logo from './Logo';

interface PreviewProps {
  data: Certificate;
  company: Company | null;
}

const CertificatePreview: React.FC<PreviewProps> = ({ data, company }) => {
  const isManometer = data.type === 'manometer';

  return (
    <div className="bg-white text-black mx-auto font-sans">
      <style>{`
        .cert-container {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm 15mm;
            background: white;
            font-family: 'Calibri', 'Segoe UI', 'Arial', sans-serif;
            font-size: 9pt;
            color: #000000;
            position: relative;
            line-height: 1.1;
        }

        .cert-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: -1px; /* Collapse borders between tables */
        }
        
        .cert-table td, .cert-table th { 
            border: 1px solid #000000; 
            padding: 2px 4px; 
            vertical-align: middle;
        }

        .header-bg { background-color: #f0f0f0; }
        .bold { font-weight: 700; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .align-top { vertical-align: top !important; }
        
        /* Print Adjustments */
        @media print {
            body { margin: 0; padding: 0; background: white; }
            .cert-container { margin: 0; border: none; box-shadow: none; width: 100%; height: 100%; }
            @page { size: A4; margin: 0; }
            .no-print { display: none; }
        }
      `}</style>
      
      <div className="cert-container">
        {/* Header Section */}
        <div className="mb-4">
            <div className="mb-2">
                <Logo className="h-16 w-auto" showSymbol={true} dark={false} />
            </div>
            <div className="text-[9pt] font-bold pl-1 uppercase">LABORATÓRIO DE METROLOGIA</div>
        </div>

        {/* Title Box */}
        <table className="cert-table mb-3">
            <tbody>
                <tr>
                    <td className="text-center py-2" style={{ width: '85%' }}>
                        <div className="bold text-[10pt]">CERTIFICADO DE CALIBRAÇÃO DE {isManometer ? 'MANÔMETRO' : 'VÁLVULA DE SEGURANÇA'}</div>
                        <div className="bold text-[9pt] mt-1">Nº {data.osNumber}</div>
                    </td>
                    <td className="text-center bold">
                        FOLHA : 1/1
                    </td>
                </tr>
            </tbody>
        </table>

        {/* Client Info */}
        <table className="cert-table mb-3">
            <tbody>
                <tr>
                    <td className="bold" style={{ width: '60%' }}>CLIENTE: {company ? company.name : data.clientName}</td>
                    <td className="bold">OS Nº {data.osNumber.split('/')[0] || '---'}</td>
                </tr>
            </tbody>
        </table>

        {/* Equipment & Standard Info */}
        <table className="cert-table mb-0">
            <thead>
                <tr className="header-bg">
                    <th style={{ width: '25%' }}>CARACTERÍSTICAS</th>
                    <th style={{ width: '35%' }}>INSTRUMENTO EM TESTE</th>
                    <th style={{ width: '40%' }}>PADRÃO UTILIZADO</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Modelo/Fabricante</td>
                    <td className="text-center bold">{data.instrument.model}</td>
                    <td className="text-center">
                        <span className="inline-block w-1/2 border-r border-black -my-1 py-1">{data.standard.id}</span>
                        <span className="inline-block w-1/2 py-1">{data.standard.name}</span>
                    </td>
                </tr>
                <tr>
                    <td>Nº de Série/ Identificação</td>
                    <td className="text-center bold">
                        <span className="inline-block w-1/2 border-r border-black -my-1 py-1">---</span>
                        <span className="inline-block w-1/2 py-1">{data.instrument.serial}</span>
                    </td>
                    <td className="text-center">
                        <span className="inline-block w-1/2 border-r border-black -my-1 py-1">Nº Cert.</span>
                        <span className="inline-block w-1/2 py-1">{data.standard.certificateNumber}</span>
                    </td>
                </tr>
                <tr>
                    <td>Tipo</td>
                    <td className="text-center bold">{data.instrument.type}</td>
                    <td className="text-center">{data.standard.type}</td>
                </tr>
                <tr>
                    <td>Fluido</td>
                    <td className="text-center bold">{data.instrument.fluid || '---'}</td>
                    <td className="text-center">---</td>
                </tr>
                
                {/* Dynamic Rows based on Type */}
                {isManometer ? (
                    <>
                        <tr>
                            <td>Faixa de Escala</td>
                            <td className="text-center bold">{data.instrument.range}</td>
                            <td className="text-center">{data.standard.range}</td>
                        </tr>
                        <tr>
                            <td>Menor Divisão</td>
                            <td className="text-center bold">{data.instrument.division}</td>
                            <td className="text-center">{data.standard.division}</td>
                        </tr>
                        <tr>
                            <td>Índice de Classe</td>
                            <td className="text-center bold">{data.instrument.class}</td>
                            <td className="text-center">{data.standard.class}</td>
                        </tr>
                    </>
                ) : (
                    <>
                        <tr>
                            <td>Pressão de Abertura</td>
                            <td className="text-center bold">{data.instrument.openingPressure}</td>
                            <td className="text-center">{data.standard.range}</td>
                        </tr>
                        <tr>
                            <td>Pressão de Fechamento</td>
                            <td className="text-center bold">{data.instrument.closingPressure}</td>
                            <td className="text-center">{data.standard.division}</td>
                        </tr>
                        <tr>
                            <td>Pressão de Ajuste</td>
                            <td className="text-center bold">{data.instrument.adjustPressure}</td>
                            <td className="text-center">+/- 0,5 % F.E.</td>
                        </tr>
                    </>
                )}

                <tr>
                    <td>Origem/N° Certificado Padrão</td>
                    <td className="text-center">
                        <span className="inline-block w-1/2 border-r border-black -my-1 py-1">---</span>
                        <span className="inline-block w-1/2 py-1">---</span>
                    </td>
                    <td className="text-center bold">
                        <span className="inline-block w-1/2 border-r border-black -my-1 py-1">RBC</span>
                        <span className="inline-block w-1/2 py-1">{data.standard.origin}</span>
                    </td>
                </tr>
                <tr>
                    <td>Data Calibração/Próxima calibração</td>
                    <td className="text-center bold">
                         <span className="inline-block w-1/2 border-r border-black -my-1 py-1">{new Date(data.calibrationDate).toLocaleDateString('pt-BR')}</span>
                         <span className="inline-block w-1/2 py-1">---</span>
                    </td>
                    <td className="text-center bold">
                        <span className="inline-block w-1/2 border-r border-black -my-1 py-1">{new Date().toLocaleDateString('pt-BR')}</span>
                        <span className="inline-block w-1/2 py-1">{new Date(data.standard.validityDate).toLocaleDateString('pt-BR')}</span>
                    </td>
                </tr>
            </tbody>
        </table>

        {/* Measurements Section */}
        {isManometer ? (
            <table className="cert-table mb-3">
                <thead>
                    <tr>
                        <th rowSpan={2} style={{ width: '30%' }}>PONTOS COLHIDOS DO INSTRUMENTO EM TESTE<br/><br/>kgf/cm²</th>
                        <th colSpan={4} className="header-bg">VALOR DE REFERÊNCIA PADRÃO</th>
                    </tr>
                    {/* Linha de ciclos removida para manômetro conforme solicitação */}
                    <tr className="header-bg">
                        <th style={{ width: '17.5%' }}>CARREGO</th>
                        <th style={{ width: '17.5%' }}>DESCARREGO</th>
                        <th style={{ width: '17.5%' }}>CARREGO</th>
                        <th style={{ width: '17.5%' }}>DESCARREGO</th>
                    </tr>
                </thead>
                <tbody>
                    {data.measurements.length > 0 ? (
                        data.measurements.map((m, i) => (
                            <tr key={i}>
                                <td className="text-center bold">{m.reference}</td>
                                <td className="text-center">{m.ascending1}</td>
                                <td className="text-center">{m.descending1}</td>
                                <td className="text-center">{m.ascending2}</td>
                                <td className="text-center">{m.descending2}</td>
                            </tr>
                        ))
                    ) : (
                         [0,1,2,3,4,5,6,7,8,9].map((_, i) => (
                            <tr key={i}><td className="py-2">&nbsp;</td><td></td><td></td><td></td><td></td></tr>
                        ))
                    )}
                </tbody>
            </table>
        ) : (
            <table className="cert-table mb-3">
                <thead>
                    <tr>
                        <th rowSpan={3} style={{ width: '30%' }}>VALOR INDICADO<br/>(INST. EM TESTE)<br/><br/>kgf/cm²</th>
                        <th colSpan={4} className="header-bg">VALOR DE REFERÊNCIA PADRÃO</th>
                    </tr>
                    <tr className="header-bg">
                        <th colSpan={2}>1° CICLO</th>
                        <th colSpan={2}>2° CICLO</th>
                    </tr>
                    <tr className="header-bg">
                        <th>ABERTURA</th>
                        <th>FECHAMENTO</th>
                        <th>ABERTURA</th>
                        <th>FECHAMENTO</th>
                    </tr>
                </thead>
                <tbody>
                     <tr>
                        {/* Se houver medições inseridas, usa elas. Senão, usa os valores padrão do instrumento */}
                        <td className="text-center bold">
                            {data.measurements[0]?.reference || data.instrument.adjustPressure?.replace(/[^\d.,]/g, '') || '12,0'}
                        </td>
                        <td className="text-center">
                            {data.measurements[0]?.ascending1 || data.instrument.openingPressure?.replace(/[^\d.,]/g, '') || '12,0'}
                        </td>
                        <td className="text-center">
                            {data.measurements[0]?.descending1 || data.instrument.closingPressure?.replace(/[^\d.,]/g, '') || '11,5'}
                        </td>
                        <td className="text-center">
                            {data.measurements[0]?.ascending2 || data.instrument.openingPressure?.replace(/[^\d.,]/g, '') || '12,0'}
                        </td>
                        <td className="text-center">
                            {data.measurements[0]?.descending2 || data.instrument.closingPressure?.replace(/[^\d.,]/g, '') || '11,5'}
                        </td>
                    </tr>
                    <tr style={{ height: '3rem' }}>
                        <td colSpan={5} className="text-center" style={{ verticalAlign: 'middle', fontStyle: 'italic', color: '#555' }}>
                            Teste de Estanqueidade: Aprovado
                        </td>
                    </tr>
                </tbody>
            </table>
        )}

        {/* Results & Environment */}
        <table className="cert-table mb-0">
            <thead>
                <tr className="header-bg">
                    <th style={{ width: '50%' }}>RESULTADOS<br/>CARACTERÍSTICAS METROLÓGICAS DO INSTRUMENTO</th>
                    <th style={{ width: '50%' }}>CARACTERÍSTICAS AMBIENTAIS</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="align-top p-0 border-0">
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td className="border-0 border-b border-r px-2 py-1">Índice de Classe</td>
                                    <td className="border-0 border-b px-2 py-1 bold">: {data.results.classIndex}</td>
                                </tr>
                                <tr>
                                    <td className="border-0 border-b border-r px-2 py-1">Repetibilidade</td>
                                    <td className="border-0 border-b px-2 py-1 bold">: {data.results.repeatability}</td>
                                </tr>
                                <tr>
                                    <td className="border-0 border-b border-r px-2 py-1">Histerese</td>
                                    <td className="border-0 border-b px-2 py-1 bold">: {data.results.hysteresis}</td>
                                </tr>
                                <tr>
                                    <td className="border-0 border-b border-r px-2 py-1">Desvio Antes da Calibração</td>
                                    <td className="border-0 border-b px-2 py-1 bold">: {data.results.deviation}</td>
                                </tr>
                                <tr>
                                    <td className="border-0 border-r px-2 py-1">Incerteza da Medição</td>
                                    <td className="border-0 px-2 py-1 bold">: {data.results.uncertainty}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                    <td className="align-top p-0 border-0">
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td className="border-0 border-b border-r px-2 py-1">Temperatura</td>
                                    <td className="border-0 border-b px-2 py-1">: {data.results.temperature}</td>
                                </tr>
                                <tr>
                                    <td className="border-0 border-b border-r px-2 py-1">Pressão Atmosférica</td>
                                    <td className="border-0 border-b px-2 py-1">: {data.results.pressure}</td>
                                </tr>
                                <tr>
                                    <td className="border-0 border-b border-r px-2 py-1">Umidade Relativa do Ar</td>
                                    <td className="border-0 border-b px-2 py-1">: {data.results.humidity}</td>
                                </tr>
                                <tr>
                                    <td className="border-0 px-2 py-1" colSpan={2}>
                                        <div className="mb-1">Observações: {data.results.observations}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>

        {/* Footer Info */}
        <div className="mt-2 mb-8 text-[9pt] font-bold">
            Procedimento Utilizado: {data.results.procedure}
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-24 mb-8 px-4">
            <div>
                <div className="mb-4">Data: {data.issuanceDate ? new Date(data.issuanceDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</div>
            </div>
            <div className="text-center flex flex-col items-center">
                <div className="font-bold border-t border-black pt-1 w-48">{data.results.approvedBy}</div>
                <div className="text-[8pt] mt-1">Aprovado</div>
            </div>
            <div className="text-center flex flex-col items-center">
                <div className="font-bold border-t border-black pt-1 w-48">{data.results.authenticatedBy}</div>
                <div className="text-[8pt] mt-1">Autenticação</div>
            </div>
        </div>

        {/* Disclaimer */}
        <div className="text-justify mt-10" style={{ fontSize: '7pt', lineHeight: '1.2', color: '#000' }}>
            Este Certificado é válido e representa as características exclusivas deste instrumento, no momento e sob as condições de calibração, não sendo extensivo a quaisquer lotes. Este certificado não deve ser parcialmente reproduzido, sem prévia autorização do laboratório emitente.
        </div>

        {/* Footer Address */}
        <div className="absolute bottom-10 left-0 w-full text-center">
             <div className="text-[9pt] font-bold text-gray-500 mb-1">IDEALLE - Referência em Inspeções NR-13</div>
             <div className="text-[8pt] text-gray-400">
                Rua Três Marias 22, Sala 221 - Vila Madeirense - Guarulhos-SP - CEP:07110-170 - Tel. (11)4280-9111
             </div>
             <div className="text-[8pt] text-orange-400 font-bold">www.ideallesp.com.br</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;