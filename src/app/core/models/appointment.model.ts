export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes?: string;
  symptoms?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no-show';

export type AppointmentType = 
  | 'consultation' 
  | 'follow-up' 
  | 'emergency' 
  | 'routine-checkup' 
  | 'vaccination';

export interface AppointmentWithDetails extends Appointment {
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
}
