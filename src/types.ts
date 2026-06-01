export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  specialization: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  icuBedsAvailable: number;
  icuBedsTotal: number;
  nicuBedsAvailable: number;
  features: {
    mri: boolean;
    ambulance: boolean;
    cashless: boolean;
    tpaSupport: boolean;
  };
  facilities: string[];
  ratingBreakdown: {
    care: number;
    cost: number;
    queue: number;
  };
  location: {
    lat: number;
    lng: number;
  };
  image: string;
}

export interface Doctor {
  id: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  specialty: string;
  experience: number; // in years
  degree: string;
  availability: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  fee: number; // in INR
  timing: string;
  rating: number;
  image: string;
}

export interface Treatment {
  id: string;
  name: string;
  category: string;
  minCost: number; // INR
  maxCost: number; // INR
  avgCost: number; // INR
  description: string;
  duration: string;
  packageDetails: string[];
  trends: { year: number; cost: number }[];
}

export interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
  claimSuccessRate: number; // percentage
  contact: string;
  cashlessHospitals: string[]; // hospitalIds
}

export interface HealthScheme {
  id: string;
  name: string;
  coverageAmount: string;
  eligibility: string;
  documentsRequired: string[];
  description: string;
  benefits: string[];
}

export interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  contactNumber: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdTime: string;
}

export interface Review {
  id: string;
  hospitalId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  categoryRating: {
    care: number;
    cost: number;
    queue: number;
  };
  verifiedPatient: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  parameters: string[];
  description: string;
  preparation: string;
  sampleType: string;
}

export interface LabBooking {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  contactNumber: string;
  testId: string;
  testName: string;
  price: number;
  hospitalId: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  collectionType: 'Home Sample' | 'Lab Visit';
  address?: string;
  status: 'Pending' | 'Sample Collected' | 'Report Generated' | 'Completed';
  reportData?: Record<string, string>;
  createdTime: string;
}
