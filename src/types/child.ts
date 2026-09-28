/**
 * NMO | نمو — Child Growth Application
 * Child & Measurement Domain Models
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { FullGrowthAssessmentResult, MeasurementPosition, Sex } from './growth.ts';

export interface ChildProfile {
  id: string;
  name: string;
  sex: Sex;
  dateOfBirth: string; // ISO YYYY-MM-DD
  avatarColor: string;
}

export interface MeasurementEntry {
  id: string;
  childId: string;
  date: string; // ISO YYYY-MM-DD
  weightKg: number;
  heightCm: number;
  headCircumferenceCm?: number;
  position: MeasurementPosition;
  note?: string;
  assessment?: FullGrowthAssessmentResult;
  createdAt: string;
}

export interface DoctorConsultation {
  id: string;
  childId: string;
  childName: string;
  question: string;
  sentAt: string; // ISO date
  status: 'waiting' | 'replied';
  reply?: string;
  repliedAt?: string;
  doctorName?: string;
  hasAttachment?: boolean;
  structuredContext?: string;
}
