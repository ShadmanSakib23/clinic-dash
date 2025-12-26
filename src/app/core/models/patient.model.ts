export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  phone: string;
  address: Address;
  emergencyContact: EmergencyContact;
  bloodType?: BloodType;
  allergies: string[];
  chronicConditions: string[];
  insuranceInfo?: InsuranceInfo;
  registeredDate: Date;
  lastVisit?: Date;
}

export type Gender = 'male' | 'female' | 'other';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  expiryDate: Date;
}
