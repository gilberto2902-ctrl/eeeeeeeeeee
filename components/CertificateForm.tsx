import React, { useState } from 'react';
import { Certificate, Measurement } from '../types';

interface CertificateFormProps {
  data: Certificate;
  onChange: (data: Certificate) => void;
  onSave: () => void;
  onPreview: () => void;
}

type Tab = 'client-info' | 'instrument-info' | 'standard-info' | 'measurements' | 'results';

const CertificateForm: React.FC<CertificateFormProps> = ({ data, onChange, onSave, onPreview }) => {
  const [activeTab, setActiveTab] = useState<Tab>('client-info');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const updateField = (section: keyof Certificate, field: string, value: any) => {
    const updatedData = {
      ...data,
      [section]: typeof data[section] === 'object' && data[section] !== null && !Array.isArray(data[section])
        ? { ...(data[section] as any), [field]: value }
        : value
    };
    
    // If instrument class changes, update the results classIndex
    if (section === 'instrument' && field === 'class') {
        updatedData.results.classIndex = value;
    }
    
    // Recalculate results if instrument or standard info changes
    if (section === 'instrument' || section === 'standard') {
        updatedData.results = calculateResults(updatedData.measurements, updatedData.instrument, updatedData.standard);
    }
    
    onChange(updatedData);
  };

  const parseNumber = (val: string | undefined): number => {
    if (!val) return 0;
    return parseFloat(val.replace(',', '.'));
  };

  const formatNumber = (val: number): string => {
    return val.toFixed(2).replace('.', ',');
  };

  const calculateResults = (measurements: Measurement[], instrument: any, standard: any) => {
    if (data.type !== 'manometer' || measurements.length === 0) return data.results;

    let maxRepeatability = 0;
    let maxHysteresis = 0;
    let maxDeviation = 0;

    measurements.forEach(m => {
      const ref = parseNumber(m.reference);
      const a1 = parseNumber(m.ascending1);
      const d1 = parseNumber(m.descending1);
      const a2 = parseNumber(m.ascending2);
      const d2 = parseNumber(m.descending2);

      // Repeatability: Max diff between cycles
      const repA = Math.abs(a1 - a2);
      const repD = Math.abs(d1 - d2);
      maxRepeatability = Math.max(maxRepeatability, repA, repD);

      // Hysteresis: Max diff between ascending and descending
      const hyst1 = Math.abs(a1 - d1);
      const hyst2 = Math.abs(a2 - d2);
      maxHysteresis = Math.max(maxHysteresis, hyst1, hyst2);

      // Deviation: Max diff from reference
      const avg = (a1 + d1 + a2 + d2) / 4;
      const dev = Math.abs(avg - ref);
      maxDeviation = Math.max(maxDeviation, dev);
    });

    // Uncertainty calculation (Simplified RSS including standard)
    const stdDiv = parseNumber(standard.division);
    const iutDiv = parseNumber(instrument.division);
    
    // Factors for uncertainty: Standard resolution, IUT resolution, Repeatability, Hysteresis
    const uStd = stdDiv / Math.sqrt(3);
    const uIut = iutDiv / Math.sqrt(3);
    const uRep = maxRepeatability / Math.sqrt(3);
    const uHyst = maxHysteresis / Math.sqrt(3);
    
    const combinedU = Math.sqrt(
      Math.pow(uStd, 2) + 
      Math.pow(uIut, 2) + 
      Math.pow(uRep, 2) + 
      Math.pow(uHyst, 2)
    );
    
    const expandedU = combinedU * 2; // k=2

    return {
      ...data.results,
      classIndex: data.results.classIndex || instrument.class || 'A',
      repeatability: formatNumber(maxRepeatability) + ' %',
      hysteresis: formatNumber(maxHysteresis) + ' %',
      deviation: formatNumber(maxDeviation) + ' %',
      uncertainty: formatNumber(expandedU) + ' %',
    };
  };

  const handleInstrumentTypeChange = (type: 'manometer' | 'safety_valve') => {
    let newMeasurements = [...data.measurements];
    if (type === 'safety_valve' && newMeasurements.length === 0) {
        newMeasurements = [{ 
            reference: data.instrument.adjustPressure || '0,0', 
            ascending1: data.instrument.openingPressure || '0,0', 
            descending1: data.instrument.closingPressure || '0,0', 
            ascending2: data.instrument.openingPressure || '0,0', 
            descending2: data.instrument.closingPressure || '0,0' 
        }];
    }
    const newResults = calculateResults(newMeasurements, data.instrument, data.standard);
    onChange({ ...data, type, measurements: newMeasurements, results: newResults });
  };

  const handleMeasurementChange = (index: number, field: keyof Measurement, value: string) => {
    const newMeasurements = [...data.measurements];
    if (!newMeasurements[index]) {
        newMeasurements[index] = { reference: '', ascending1: '', descending1: '', ascending2: '', descending2: '' };
    }
    newMeasurements[index] = { ...newMeasurements[index], [field]: value };
    
    const newResults = calculateResults(newMeasurements, data.instrument, data.standard);
    onChange({ ...data, measurements: newMeasurements, results: newResults });
  };

  const addMeasurement = () => {
    const newMeasurement: Measurement = { 
        reference: '0,0', 
        ascending1: '0,0', 
        descending1: '0,0', 
        ascending2: '0,0', 
        descending2: '0,0' 
    };
    const newMeasurements = [...data.measurements, newMeasurement];
    const newResults = calculateResults(newMeasurements, data.instrument, data.standard);
    onChange({ ...data, measurements: newMeasurements, results: newResults });
  };

  const removeMeasurement = (index: number) => {
      const newMeasurements = data.measurements.filter((_, i) => i !== index);
      const newResults = calculateResults(newMeasurements, data.instrument, data.standard);
      onChange({ ...data, measurements: newMeasurements, results: newResults });
  };

  const generateDocx = async () => {
    setIsGenerating(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert("Documento DOCX gerado com sucesso! (Simulação)");
    } catch (error) {
        console.error(error);
        alert("Erro ao gerar DOCX.");
    } finally {
        setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
        // We trigger the preview first to ensure the DOM is ready if App.tsx handles it
        // But here we can use a more direct approach by triggering onPreview
        onPreview();
        // A small delay to let the modal mount
        setTimeout(() => {
            const element = document.querySelector('.cert-container');
            if (!element) {
                alert("Abra a visualização primeiro ou tente novamente.");
                setIsGeneratingPDF(false);
                return;
            }

            const opt = {
                margin: 0,
                filename: `CERT_${data.osNumber.replace(/\//g, '-')}_${data.tag || 'S-TAG'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // @ts-ignore
            window.html2pdf().from(element).set(opt).save().then(() => {
                setIsGeneratingPDF(false);
            });
        }, 500);
    } catch (error) {
        console.error(error);
        alert("Erro ao gerar PDF.");
        setIsGeneratingPDF(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'client-info', label: 'Informações do Cliente' },
    { id: 'instrument-info', label: 'Instrumento' },
    { id: 'standard-info', label: 'Padrão' },
    { id: 'measurements', label: 'Medições' },
    { id: 'results', label: 'Resultados & Emissão' },
  ];

  const inputClass = "w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";
  const groupClass = "mb-4";

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      
      {/* Type Selector */}
      <div className="flex mb-6 border border-gray-600 rounded overflow-hidden">
        <button
          onClick={() => handleInstrumentTypeChange('manometer')}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${data.type === 'manometer' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
          Manômetro
        </button>
        <button
          onClick={() => handleInstrumentTypeChange('safety_valve')}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${data.type === 'safety_valve' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
          Válvula de Segurança
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-600 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-700 text-orange-500 border-t border-x border-gray-600'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'client-info' && (
          <div className="animate-fade-in">
            <div className={groupClass}>
              <label className={labelClass}>Cliente</label>
              <input value={data.clientName} onChange={(e) => onChange({ ...data, clientName: e.target.value })} className={inputClass} readOnly />
              <p className="text-xs text-gray-500 mt-1">* Preenchido automaticamente ao selecionar a empresa</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={groupClass}>
                <label className={labelClass}>OS Nº</label>
                <input value={data.osNumber} onChange={(e) => onChange({ ...data, osNumber: e.target.value })} className={inputClass} placeholder="Ex: ID-0191/2025-001" />
                </div>
                <div className={groupClass}>
                <label className={labelClass}>TAG</label>
                <input value={data.tag || ''} onChange={(e) => onChange({ ...data, tag: e.target.value })} className={inputClass} placeholder="Ex: PI-0047" />
                </div>
            </div>
          </div>
        )}

        {activeTab === 'instrument-info' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className={groupClass}>
                <label className={labelClass}>Modelo/Fabricante</label>
                <input value={data.instrument.model} onChange={(e) => updateField('instrument', 'model', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Nº de Série</label>
                <input value={data.instrument.serial} onChange={(e) => updateField('instrument', 'serial', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Tipo</label>
                <select 
                  value={data.instrument.type} 
                  onChange={(e) => updateField('instrument', 'type', e.target.value)} 
                  className={inputClass}
                >
                  <option value="">Selecione...</option>
                  <option value="ANALÓGICO">ANALÓGICO</option>
                  <option value="DIGITAL">DIGITAL</option>
                </select>
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Fluido</label>
                <select 
                  value={data.instrument.fluid || ''} 
                  onChange={(e) => updateField('instrument', 'fluid', e.target.value)} 
                  className={inputClass}
                >
                  <option value="">Selecione...</option>
                  <option value="ÓLEO">ÓLEO</option>
                  <option value="ÁGUA">ÁGUA</option>
                  <option value="AR">AR</option>
                  <option value="VAPOR">VAPOR</option>
                </select>
              </div>
              
              {data.type === 'manometer' ? (
                <>
                  <div className={groupClass}>
                    <label className={labelClass}>Faixa de Escala</label>
                    <input value={data.instrument.range} onChange={(e) => updateField('instrument', 'range', e.target.value)} className={inputClass} />
                  </div>
                  <div className={groupClass}>
                    <label className={labelClass}>Menor Divisão</label>
                    <input value={data.instrument.division} onChange={(e) => updateField('instrument', 'division', e.target.value)} className={inputClass} />
                  </div>
                  <div className={groupClass}>
                    <label className={labelClass}>Índice de Classe</label>
                    <input value={data.instrument.class} onChange={(e) => updateField('instrument', 'class', e.target.value)} className={inputClass} />
                  </div>
                </>
              ) : (
                 <>
                  <div className={groupClass}>
                    <label className={labelClass}>Pressão Abertura</label>
                    <input value={data.instrument.openingPressure} onChange={(e) => updateField('instrument', 'openingPressure', e.target.value)} className={inputClass} />
                  </div>
                  <div className={groupClass}>
                    <label className={labelClass}>Pressão Fechamento</label>
                    <input value={data.instrument.closingPressure} onChange={(e) => updateField('instrument', 'closingPressure', e.target.value)} className={inputClass} />
                  </div>
                  <div className={groupClass}>
                    <label className={labelClass}>Pressão Ajuste</label>
                    <input value={data.instrument.adjustPressure} onChange={(e) => updateField('instrument', 'adjustPressure', e.target.value)} className={inputClass} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'standard-info' && (
          <div className="animate-fade-in">
             <div className="grid grid-cols-2 gap-4">
              <div className={groupClass}>
                <label className={labelClass}>Padrão</label>
                <input value={data.standard.name} onChange={(e) => updateField('standard', 'name', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>ID (N/C)</label>
                <input value={data.standard.id} onChange={(e) => updateField('standard', 'id', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Tipo</label>
                <select 
                  value={data.standard.type} 
                  onChange={(e) => updateField('standard', 'type', e.target.value)} 
                  className={inputClass}
                >
                  <option value="">Selecione...</option>
                  <option value="ANALÓGICO">ANALÓGICO</option>
                  <option value="DIGITAL">DIGITAL</option>
                </select>
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Faixa</label>
                <input value={data.standard.range} onChange={(e) => updateField('standard', 'range', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Divisão</label>
                <input value={data.standard.division} onChange={(e) => updateField('standard', 'division', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Classe</label>
                <input value={data.standard.class} onChange={(e) => updateField('standard', 'class', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Origem / Certificado</label>
                <input value={data.standard.origin} onChange={(e) => updateField('standard', 'origin', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Validade</label>
                <input type="date" value={data.standard.validityDate} onChange={(e) => updateField('standard', 'validityDate', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Data Calibração (Instrumento)</label>
                <input type="date" value={data.calibrationDate} onChange={(e) => onChange({ ...data, calibrationDate: e.target.value })} className={inputClass} />
              </div>
               <div className={groupClass}>
                <label className={labelClass}>Próxima Calibração</label>
                <input type="date" value={data.nextCalibration || ''} onChange={(e) => onChange({ ...data, nextCalibration: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'measurements' && (
          <div className="animate-fade-in">
             {data.type === 'manometer' ? (
                 <>
                    <div className="grid grid-cols-6 gap-2 mb-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <div>Referência</div>
                        <div>Carrego</div>
                        <div>Descarrego</div>
                        <div>Carrego</div>
                        <div>Descarrego</div>
                        <div>Ação</div>
                    </div>
                    {data.measurements.map((m, i) => (
                        <div key={i} className="grid grid-cols-6 gap-2 mb-2">
                             <input value={m.reference} onChange={(e) => handleMeasurementChange(i, 'reference', e.target.value)} className={`${inputClass} text-center px-1 font-bold text-yellow-500`} placeholder="Ref" />
                             <input value={m.ascending1} onChange={(e) => handleMeasurementChange(i, 'ascending1', e.target.value)} className={`${inputClass} text-center px-1`} placeholder="Asc 1" />
                             <input value={m.descending1} onChange={(e) => handleMeasurementChange(i, 'descending1', e.target.value)} className={`${inputClass} text-center px-1`} placeholder="Desc 1" />
                             <input value={m.ascending2} onChange={(e) => handleMeasurementChange(i, 'ascending2', e.target.value)} className={`${inputClass} text-center px-1`} placeholder="Asc 2" />
                             <input value={m.descending2} onChange={(e) => handleMeasurementChange(i, 'descending2', e.target.value)} className={`${inputClass} text-center px-1`} placeholder="Desc 2" />
                             <button onClick={() => removeMeasurement(i)} className="text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors">✕</button>
                        </div>
                    ))}
                    <button onClick={addMeasurement} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 w-full md:w-auto transition-colors">Adicionar Ponto de Medição</button>
                 </>
             ) : (
                 <div className="bg-gray-700/30 p-4 rounded border border-gray-600">
                    <h4 className="text-orange-500 font-bold mb-4">Medições da Válvula de Segurança</h4>
                    <div className="grid grid-cols-1 gap-6">
                        <div className={groupClass}>
                             <label className={labelClass}>Pressão de Ajuste (Referência)</label>
                             <input 
                                value={data.measurements[0]?.reference || data.instrument.adjustPressure || ''} 
                                onChange={(e) => handleMeasurementChange(0, 'reference', e.target.value)} 
                                className={`${inputClass} font-bold text-yellow-500`} 
                             />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-3 rounded border border-gray-600">
                                <h5 className="text-gray-300 font-bold mb-3 text-center border-b border-gray-700 pb-1">1º CICLO</h5>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400">Pressão Abertura</label>
                                        <input 
                                            value={data.measurements[0]?.ascending1 || ''} 
                                            onChange={(e) => handleMeasurementChange(0, 'ascending1', e.target.value)} 
                                            className={inputClass} 
                                            placeholder="Ex: 12,0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Pressão Fechamento</label>
                                        <input 
                                            value={data.measurements[0]?.descending1 || ''} 
                                            onChange={(e) => handleMeasurementChange(0, 'descending1', e.target.value)} 
                                            className={inputClass} 
                                            placeholder="Ex: 11,5"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 p-3 rounded border border-gray-600">
                                <h5 className="text-gray-300 font-bold mb-3 text-center border-b border-gray-700 pb-1">2º CICLO</h5>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400">Pressão Abertura</label>
                                        <input 
                                            value={data.measurements[0]?.ascending2 || ''} 
                                            onChange={(e) => handleMeasurementChange(0, 'ascending2', e.target.value)} 
                                            className={inputClass} 
                                            placeholder="Ex: 12,0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Pressão Fechamento</label>
                                        <input 
                                            value={data.measurements[0]?.descending2 || ''} 
                                            onChange={(e) => handleMeasurementChange(0, 'descending2', e.target.value)} 
                                            className={inputClass} 
                                            placeholder="Ex: 11,5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="animate-fade-in">
            <h3 className="text-orange-500 font-bold mb-3 border-b border-gray-700 pb-2">Características Metrológicas</h3>
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className={groupClass}>
                <label className={labelClass}>Índice de Classe</label>
                <input value={data.results.classIndex} onChange={(e) => updateField('results', 'classIndex', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Repetibilidade</label>
                <input value={data.results.repeatability} onChange={(e) => updateField('results', 'repeatability', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Histerese</label>
                <input value={data.results.hysteresis} onChange={(e) => updateField('results', 'hysteresis', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Desvio Antes da Calibração</label>
                <input value={data.results.deviation} onChange={(e) => updateField('results', 'deviation', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Incerteza</label>
                <input value={data.results.uncertainty} onChange={(e) => updateField('results', 'uncertainty', e.target.value)} className={inputClass} />
              </div>
             </div>

             <h3 className="text-orange-500 font-bold mb-3 border-b border-gray-700 pb-2">Ambiental & Aprovação</h3>
             <div className="grid grid-cols-3 gap-4">
               <div className={groupClass}>
                <label className={labelClass}>Temp</label>
                <input value={data.results.temperature} onChange={(e) => updateField('results', 'temperature', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Pressão</label>
                <input value={data.results.pressure} onChange={(e) => updateField('results', 'pressure', e.target.value)} className={inputClass} />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Umidade</label>
                <input value={data.results.humidity} onChange={(e) => updateField('results', 'humidity', e.target.value)} className={inputClass} />
              </div>
             </div>
             <div className={groupClass}>
                <label className={labelClass}>Observações</label>
                <textarea rows={3} value={data.results.observations} onChange={(e) => updateField('results', 'observations', e.target.value)} className={inputClass} />
             </div>
             <div className={groupClass}>
                <label className={labelClass}>Procedimento</label>
                <input value={data.results.procedure} onChange={(e) => updateField('results', 'procedure', e.target.value)} className={inputClass} />
             </div>
             
             <h3 className="text-orange-500 font-bold mb-3 border-b border-gray-700 pb-2 mt-4">Dados do Relatório</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div className={groupClass}>
                    <label className={labelClass}>Aprovado Por</label>
                    <input value={data.results.approvedBy} onChange={(e) => updateField('results', 'approvedBy', e.target.value)} className={inputClass} />
                </div>
                <div className={groupClass}>
                    <label className={labelClass}>Autenticado Por</label>
                    <input value={data.results.authenticatedBy} onChange={(e) => updateField('results', 'authenticatedBy', e.target.value)} className={inputClass} />
                </div>
                 <div className={`${groupClass} col-span-2 md:col-span-1`}>
                    <label className={labelClass}>Data de Emissão do Relatório</label>
                    <input 
                      type="date" 
                      value={data.issuanceDate || ''} 
                      onChange={(e) => onChange({ ...data, issuanceDate: e.target.value })} 
                      className={`${inputClass} border-orange-500/50`} 
                    />
                    <p className="text-xs text-gray-500 mt-1">* Data que aparecerá ao lado das assinaturas</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="mt-8 pt-4 border-t border-gray-700 flex flex-wrap justify-end gap-3">
         <button onClick={generateDocx} disabled={isGenerating} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors disabled:opacity-50">
            {isGenerating ? 'Gerando...' : 'DOCX'}
         </button>
         <button onClick={generatePDF} disabled={isGeneratingPDF} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
            {isGeneratingPDF ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gerando...
                </>
            ) : 'Gerar PDF'}
         </button>
         <button onClick={onPreview} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold transition-colors">
            Visualizar
         </button>
         <button onClick={onSave} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold transition-colors">
            Salvar
         </button>
      </div>

    </div>
  );
};

export default CertificateForm;