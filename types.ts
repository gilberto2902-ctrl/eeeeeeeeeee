
export type CertificateType = 'manometer' | 'safety_valve';

export interface Measurement {
  reference: string;
  ascending1?: string; // Made optional to support simple arrays if needed, but keeping structure
  descending1?: string;
  ascending2?: string;
  descending2?: string;
  // Support for flattened structure if needed by form
  ascending?: string;
  descending?: string;
  error?: string;
  corrected?: string;
}

export interface Instrument {
  model: string;
  serial: string;
  type: string;
  fluid?: string;
  // Specific to Manometer
  range?: string;
  division?: string;
  class?: string;
  // Specific to Valve
  openingPressure?: string;
  closingPressure?: string;
  adjustPressure?: string;
}

export interface Standard {
  id: string;
  name: string;
  type: string;
  range: string;
  division: string;
  class: string;
  origin: string;
  certificateNumber: string;
  validityDate: string;
}

export interface Results {
  classIndex: string;
  repeatability: string;
  hysteresis: string;
  deviation: string;
  uncertainty: string;
  temperature: string;
  pressure: string;
  humidity: string;
  observations: string;
  procedure: string;
  approvedBy: string;
  authenticatedBy: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  contact?: string;
  notes?: string;
  userId?: string;
}

export interface Certificate {
  id: string;
  osNumber: string;
  clientName: string;
  companyId?: string; // Link to company
  tag?: string;
  calibrationDate: string;
  issuanceDate?: string; // Date when the report was issued/signed
  nextCalibration?: string;
  createdAt: string;
  type: CertificateType;
  instrument: Instrument;
  standard: Standard;
  measurements: Measurement[];
  results: Results;
  userId?: string;
}
