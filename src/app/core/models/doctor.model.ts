export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phone: string;
  licenseNumber: string;
  education: Education[];
  experienceYears: number;
  consultationFee: number;
  availableSlots: TimeSlot[];
  rating: number;
  reviewsCount: number;
  joinedDate: Date;
  bio?: string;
  avatar?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface TimeSlot {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
