export interface MedicalRecord {
  id: string;
  patientId: string;
  appointmentId: string;
  doctorId: string;
  date: Date;
  diagnosis: string;
  symptoms: string[];
  prescriptions: Prescription[];
  labTests?: LabTest[];
  vitals: VitalSigns;
  notes: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabTest {
  name: string;
  result?: string;
  status: 'pending' | 'completed' | 'cancelled';
  orderedDate: Date;
  completedDate?: Date;
}

export interface VitalSigns {
  bloodPressure?: string; // e.g., "120/80"
  heartRate?: number; // bpm
  temperature?: number; // Celsius
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  oxygenSaturation?: number; // percentage
}
