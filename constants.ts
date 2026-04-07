import { Certificate } from './types';

export const INITIAL_CERTIFICATE: Certificate = {
  id: '',
  createdAt: new Date().toISOString(),
  osNumber: '4452/2023',
  clientName: 'INDÚSTRIA DE PLÁSTICOS LTDA',
  calibrationDate: new Date().toISOString().split('T')[0],
  issuanceDate: new Date().toISOString().split('T')[0], // Default to today
  type: 'manometer',
  instrument: {
    model: 'WIKA / 232.50',
    serial: '99887766',
    type: 'MANÔMETRO ANALÓGICO',
    fluid: 'AR',
    range: '0 a 10 kgf/cm²',
    division: '0,1 kgf/cm²',
    class: 'A',
    openingPressure: '12,0 kgf/cm²',
    closingPressure: '11,5 kgf/cm²',
    adjustPressure: '12,0 kgf/cm²'
  },
  standard: {
    id: 'PAD-045',
    name: 'MANÔMETRO DIGITAL PADRÃO',
    type: 'DIGITAL',
    range: '0 a 100 bar',
    division: '0,01 bar',
    class: 'A1',
    origin: 'RBC - 12345',
    certificateNumber: '2404041502899',
    validityDate: '2025-05-28'
  },
  measurements: [
    { reference: '0,0', ascending1: '0,0', descending1: '0,0', ascending2: '0,0', descending2: '0,0' },
    { reference: '1,0', ascending1: '1,0', descending1: '1,0', ascending2: '1,0', descending2: '1,0' },
    { reference: '2,0', ascending1: '2,0', descending1: '2,0', ascending2: '2,0', descending2: '2,0' },
    { reference: '3,0', ascending1: '3,0', descending1: '3,0', ascending2: '3,0', descending2: '3,0' },
    { reference: '4,0', ascending1: '4,0', descending1: '4,0', ascending2: '4,0', descending2: '4,0' },
    { reference: '5,0', ascending1: '5,0', descending1: '5,0', ascending2: '5,0', descending2: '5,0' },
    { reference: '6,0', ascending1: '6,0', descending1: '6,0', ascending2: '6,0', descending2: '6,0' },
    { reference: '7,0', ascending1: '7,0', descending1: '7,0', ascending2: '7,0', descending2: '7,0' },
    { reference: '8,0', ascending1: '8,0', descending1: '8,0', ascending2: '8,0', descending2: '8,0' },
    { reference: '10,0', ascending1: '10,0', descending1: '10,0', ascending2: '10,0', descending2: '10,0' },
  ],
  results: {
    classIndex: 'A',
    repeatability: '0,05 %',
    hysteresis: '0,02 %',
    deviation: '0,00 %',
    uncertainty: '0,1 %',
    temperature: '22,5 °C',
    pressure: '1013 hPa',
    humidity: '55 %',
    observations: 'Instrumento aprovado conforme critérios estabelecidos.',
    procedure: 'PC-001/Rev.04',
    approvedBy: 'Eng. Carlos Silva - CREA 123456',
    authenticatedBy: 'Maria Oliveira - Qualidade'
  }
};