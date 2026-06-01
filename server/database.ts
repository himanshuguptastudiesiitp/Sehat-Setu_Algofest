import fs from 'fs';
import path from 'path';
import { Hospital, Doctor, Treatment, InsuranceProvider, HealthScheme, Appointment, Review, AuditLog, LabBooking } from '../src/types';

const STORE_PATH = path.join(process.cwd(), 'db-store.json');

interface Datastore {
  hospitals: Hospital[];
  doctors: Doctor[];
  treatments: Treatment[];
  insuranceProviders: InsuranceProvider[];
  schemes: HealthScheme[];
  appointments: Appointment[];
  reviews: Review[];
  auditLogs: AuditLog[];
  labBookings?: LabBooking[];
}

const seedHospitals: Hospital[] = [
  {
    id: "hosp_paras_patna",
    name: "Paras HMRI Hospital",
    address: "Raja Bazar, Bailey Road",
    city: "Patna",
    area: "Raja Bazar",
    specialization: ["Cardiology", "Oncology", "Orthopedics", "Neurology", "Pediatrics"],
    rating: 4.5,
    reviewsCount: 142,
    isVerified: true,
    icuBedsAvailable: 15,
    icuBedsTotal: 45,
    nicuBedsAvailable: 8,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["24x7 Emergency", "Critical Care ICU", "Advanced Trauma Center", "Dialysis Unit", "In-house Pharmacy", "Blood Bank"],
    ratingBreakdown: { care: 4.6, cost: 3.2, queue: 3.8 },
    location: { lat: 25.6119, lng: 85.0888 },
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_igims_patna",
    name: "IGIMS (Indira Gandhi Institute of Medical Sciences)",
    address: "Sheikhpura",
    city: "Patna",
    area: "Sheikhpura",
    specialization: ["Cardiology", "Nephrology", "Urology", "Gastroenterology", "Neurology"],
    rating: 4.1,
    reviewsCount: 320,
    isVerified: true,
    icuBedsAvailable: 8,
    icuBedsTotal: 30,
    nicuBedsAvailable: 4,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Government Subsidized Care", "Emergency Wing", "Super Specialty OPD", "Organ Transplant Wing", "Jan Aushadhi Kendra"],
    ratingBreakdown: { care: 4.2, cost: 4.8, queue: 1.8 },
    location: { lat: 25.6092, lng: 85.1011 },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_aiims_patna",
    name: "AIIMS Patna",
    address: "Phulwari Sharif",
    city: "Patna",
    area: "Phulwari Sharif",
    specialization: ["General Medicine", "Pediatrics", "Cardiology", "Orthopedics", "Oncology", "Neurology"],
    rating: 4.6,
    reviewsCount: 512,
    isVerified: true,
    icuBedsAvailable: 22,
    icuBedsTotal: 60,
    nicuBedsAvailable: 12,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: false },
    facilities: ["Apex Central Government Hospital", "Research Lab", "24x7 Trauma Recovery", "Jan Aushadhi Medicals", "Surgical Suites"],
    ratingBreakdown: { care: 4.8, cost: 4.9, queue: 2.1 },
    location: { lat: 25.5604, lng: 85.0747 },
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_ruban_patna",
    name: "Ruban Memorial Hospital",
    address: "19, Patliputra Colony",
    city: "Patna",
    area: "Patliputra Colony",
    specialization: ["Nephrology", "Urology", "Cardiology", "Gastroenterology"],
    rating: 4.3,
    reviewsCount: 98,
    isVerified: true,
    icuBedsAvailable: 11,
    icuBedsTotal: 25,
    nicuBedsAvailable: 6,
    features: { mri: false, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Specialty Kidney Center", "Modular Cardiac Labs", "Laparoscopic Units", "TPAs Empanelled"],
    ratingBreakdown: { care: 4.4, cost: 3.5, queue: 4.1 },
    location: { lat: 25.6288, lng: 85.1124 },
    image: "https://images.unsplash.com/photo-1502740479796-55979822a9f5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_pmch_patna",
    name: "PMCH (Patna Medical College and Hospital)",
    address: "Ashok Rajpath, Near Gandhi Maidan",
    city: "Patna",
    area: "Ashok Rajpath",
    specialization: ["General Medicine", "Traumatology", "Pediatrics", "Obstetrics & Gynecology"],
    rating: 3.7,
    reviewsCount: 410,
    isVerified: true,
    icuBedsAvailable: 5,
    icuBedsTotal: 40,
    nicuBedsAvailable: 5,
    features: { mri: true, ambulance: true, cashless: false, tpaSupport: false },
    facilities: ["Largest Historic Government Ward", "Free Generic Medicines", "24x7 Emergency Delivery", "Surgical High Dependency Unit"],
    ratingBreakdown: { care: 3.6, cost: 5.0, queue: 1.2 },
    location: { lat: 25.6208, lng: 85.1611 },
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_ford_patna",
    name: "Ford Hospital & Research Centre",
    address: "Khemnichak, New Bypass Road",
    city: "Patna",
    area: "Khemnichak",
    specialization: ["Orthopedics", "Pulmonology", "General Surgery", "Cardiology"],
    rating: 4.2,
    reviewsCount: 78,
    isVerified: true,
    icuBedsAvailable: 9,
    icuBedsTotal: 30,
    nicuBedsAvailable: 3,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Multi Specialty ICU", "Joint Replacement Wing", "Round-the-clock Trauma Care", "Deluxe Patient Suites"],
    ratingBreakdown: { care: 4.3, cost: 3.4, queue: 3.9 },
    location: { lat: 25.5788, lng: 85.1582 },
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_magadh_gaya",
    name: "Anugrah Narayan Magadh Medical College & Hospital",
    address: "Sherghati Road",
    city: "Gaya",
    area: "Gaya Bypass",
    specialization: ["General Medicine", "Pediatrics", "Obstetrics & Gynecology", "Orthopedics"],
    rating: 3.8,
    reviewsCount: 154,
    isVerified: true,
    icuBedsAvailable: 4,
    icuBedsTotal: 20,
    nicuBedsAvailable: 2,
    features: { mri: false, ambulance: true, cashless: true, tpaSupport: false },
    facilities: ["Government Subsidized Treatment", "Ayushman Bharat Desk", "Neonatal ICU", "General Outpatient Clinics"],
    ratingBreakdown: { care: 3.8, cost: 4.8, queue: 1.7 },
    location: { lat: 24.7871, lng: 84.9782 },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_gaya_giri",
    name: "Siddharth Giri Multispecialty Hospital",
    address: "Gautam Buddha Road, Swarajpuri",
    city: "Gaya",
    area: "Swarajpuri",
    specialization: ["Orthopedics", "Cardiology", "General Medicine"],
    rating: 4.4,
    reviewsCount: 65,
    isVerified: true,
    icuBedsAvailable: 8,
    icuBedsTotal: 25,
    nicuBedsAvailable: 4,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["24x7 Critical Care", "Fully Digitized Trauma Ward", "High-Precision MRI Lab", "Empanelled PMJAY Counter"],
    ratingBreakdown: { care: 4.3, cost: 3.8, queue: 4.0 },
    location: { lat: 24.7955, lng: 85.0022 },
    image: "https://images.unsplash.com/photo-1502740479796-55979822a9f5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_gaya_metro",
    name: "Metro Gaya Care Clinic & Trauma Centre",
    address: "AP Colony, Bypass Main Road",
    city: "Gaya",
    area: "AP Colony",
    specialization: ["Pediatrics", "General Medicine", "Neurology"],
    rating: 4.2,
    reviewsCount: 48,
    isVerified: true,
    icuBedsAvailable: 6,
    icuBedsTotal: 18,
    nicuBedsAvailable: 6,
    features: { mri: false, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Neonatal High Care Nursery", "Inhouse CT & Lab services", "Ambulatory Trauma Pods"],
    ratingBreakdown: { care: 4.5, cost: 3.5, queue: 3.7 },
    location: { lat: 24.7820, lng: 84.9911 },
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_rims_ranchi",
    name: "RIMS (Rajendra Institute of Medical Sciences)",
    address: "Bariatu",
    city: "Ranchi",
    area: "Bariatu",
    specialization: ["Neurology", "Cardiology", "Oncology", "Nephrology", "General Medicine"],
    rating: 4.0,
    reviewsCount: 389,
    isVerified: true,
    icuBedsAvailable: 15,
    icuBedsTotal: 50,
    nicuBedsAvailable: 10,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: false },
    facilities: ["State Apex Tertiary Center", "Subsidized Diagnostics", "Trauma and Poisoning Cell", "Ayushman Gold Desk", "Central Organ Registry"],
    ratingBreakdown: { care: 4.1, cost: 4.9, queue: 1.9 },
    location: { lat: 23.3892, lng: 85.3582 },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_medica_ranchi",
    name: "Bhagwan Mahavir Medica Superspecialty Hospital",
    address: "Near Booty More, Bariatu Road",
    city: "Ranchi",
    area: "Booty More",
    specialization: ["Cardiology", "Oncology", "Orthopedics", "Urology"],
    rating: 4.6,
    reviewsCount: 144,
    isVerified: true,
    icuBedsAvailable: 20,
    icuBedsTotal: 60,
    nicuBedsAvailable: 8,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Advanced Cath Lab & Organ Transplant", "TPA Cashless Support Suite", "Comprehensive Tumor Board", "Robotic Surgical Help"],
    ratingBreakdown: { care: 4.7, cost: 3.1, queue: 4.3 },
    location: { lat: 23.4011, lng: 85.3622 },
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_orchid_ranchi",
    name: "Orchid Medical Centre",
    address: "H.B. Road, Lalpur",
    city: "Ranchi",
    area: "Lalpur",
    specialization: ["Obstetrics & Gynecology", "Pediatrics", "General Medicine", "Neurology"],
    rating: 4.3,
    reviewsCount: 92,
    isVerified: true,
    icuBedsAvailable: 10,
    icuBedsTotal: 30,
    nicuBedsAvailable: 5,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Critical Women and Child Care Wards", "High-Speed Dual Slice MRI", "Advanced Joint & Bone Wing"],
    ratingBreakdown: { care: 4.4, cost: 3.4, queue: 4.0 },
    location: { lat: 23.3744, lng: 85.3341 },
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_sskm_kolkata",
    name: "IPGMER and SSKM Hospital",
    address: "244, AJC Bose Road, Bhowanipore",
    city: "Kolkata",
    area: "Bhowanipore",
    specialization: ["Cardiology", "Neurology", "Nephrology", "Oncology", "General Medicine"],
    rating: 4.2,
    reviewsCount: 520,
    isVerified: true,
    icuBedsAvailable: 25,
    icuBedsTotal: 80,
    nicuBedsAvailable: 15,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: false },
    facilities: ["National Super-Specialty Node", "Apex Trauma Wing", "Free Diagnostic Pipelines", "Critical Care Multi-Units", "Swasthya Sathi Help Desk"],
    ratingBreakdown: { care: 4.3, cost: 4.9, queue: 1.5 },
    location: { lat: 22.5401, lng: 88.3432 },
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_apollo_kolkata",
    name: "Apollo Multispeciality Hospitals",
    address: "58, Canal Circular Road, Kadapara",
    city: "Kolkata",
    area: "Salt Lake",
    specialization: ["Oncology", "Cardiology", "Neurology", "Orthopedics", "Urology"],
    rating: 4.7,
    reviewsCount: 310,
    isVerified: true,
    icuBedsAvailable: 35,
    icuBedsTotal: 100,
    nicuBedsAvailable: 12,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["JCI Accredited Smart Wards", "Robotic Radiation Oncology", "Level-1 Trauma & Burn Isolation Units", "24x7 Global Ambulance Air Rescue"],
    ratingBreakdown: { care: 4.8, cost: 2.6, queue: 4.4 },
    location: { lat: 22.5702, lng: 88.4044 },
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_amri_kolkata",
    name: "AMRI Hospitals",
    address: "KB-22, Sector-3, Salt Lake City",
    city: "Kolkata",
    area: "Salt Lake",
    specialization: ["General Medicine", "Pediatrics", "Obstetrics & Gynecology", "Nephrology"],
    rating: 4.4,
    reviewsCount: 175,
    isVerified: true,
    icuBedsAvailable: 15,
    icuBedsTotal: 45,
    nicuBedsAvailable: 10,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Premium Child ICU & SCBU Wards", "Modular Dialysis Chambers", "All Local TPA Panel Operations"],
    ratingBreakdown: { care: 4.5, cost: 3.2, queue: 4.1 },
    location: { lat: 22.5688, lng: 88.4112 },
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_dmch_darbhanga",
    name: "Darbhanga Medical College & Hospital (DMCH)",
    address: "Benta Road, Laheriasarai",
    city: "Darbhanga",
    area: "Laheriasarai",
    specialization: ["General Medicine", "Orthopedics", "Pediatrics", "Obstetrics & Gynecology"],
    rating: 3.7,
    reviewsCount: 228,
    isVerified: true,
    icuBedsAvailable: 5,
    icuBedsTotal: 25,
    nicuBedsAvailable: 4,
    features: { mri: false, ambulance: true, cashless: true, tpaSupport: false },
    facilities: ["Historic Subsidized Public Ward", "Primary PMJAY Integration", "Emergency Trauma Desks", "Free Core Generic Apothecary"],
    ratingBreakdown: { care: 3.6, cost: 4.8, queue: 1.4 },
    location: { lat: 26.1402, lng: 85.8921 },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_paras_darbhanga",
    name: "Paras Global Hospital",
    address: "VIP Road, opposite All India Radio",
    city: "Darbhanga",
    area: "VIP Road",
    specialization: ["Cardiology", "Nephrology", "General Surgery", "Urology"],
    rating: 4.4,
    reviewsCount: 74,
    isVerified: true,
    icuBedsAvailable: 8,
    icuBedsTotal: 22,
    nicuBedsAvailable: 4,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Specialist Dialysis Service Complex", "Modular Surgical Rooms", "Full Insurance Cashless Directives"],
    ratingBreakdown: { care: 4.5, cost: 3.5, queue: 4.0 },
    location: { lat: 26.1555, lng: 85.9012 },
    image: "https://images.unsplash.com/photo-1502740479796-55979822a9f5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_heritage_darbhanga",
    name: "Heritage Hospital & Research Centre",
    address: "Laheriasarai Old Bypass",
    city: "Darbhanga",
    area: "Laheriasarai",
    specialization: ["Pediatrics", "Orthopedics", "General Medicine"],
    rating: 4.1,
    reviewsCount: 39,
    isVerified: true,
    icuBedsAvailable: 4,
    icuBedsTotal: 15,
    nicuBedsAvailable: 3,
    features: { mri: false, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Intensive Pediatric Care Nursery", "Fully Digitalized Radiology", "Local Support TPA Coordination"],
    ratingBreakdown: { care: 4.2, cost: 3.7, queue: 3.9 },
    location: { lat: 26.1333, lng: 85.8855 },
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_skmch_muzaffarpur",
    name: "Sri Krishna Medical College & Hospital (SKMCH)",
    address: "Umanagar, SKMCH Road",
    city: "Muzaffarpur",
    area: "Umanagar",
    specialization: ["General Medicine", "Pediatrics", "Obstetrics & Gynecology", "Neurology"],
    rating: 3.9,
    reviewsCount: 265,
    isVerified: true,
    icuBedsAvailable: 8,
    icuBedsTotal: 30,
    nicuBedsAvailable: 8,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: false },
    facilities: ["Regional Government Referral Hub", "Subsidized MRI & CT Centers", "Comprehensive AES Pediatric Ward", "Ayushman Bharat Desk"],
    ratingBreakdown: { care: 4.0, cost: 4.9, queue: 1.6 },
    location: { lat: 26.1601, lng: 85.3982 },
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_pmch_muzaffarpur",
    name: "Prashant Memorial Charitable Hospital",
    address: "Juran Chapra, Road No 4",
    city: "Muzaffarpur",
    area: "Juran Chapra",
    specialization: ["Orthopedics", "Cardiology", "General Medicine"],
    rating: 4.3,
    reviewsCount: 88,
    isVerified: true,
    icuBedsAvailable: 10,
    icuBedsTotal: 28,
    nicuBedsAvailable: 4,
    features: { mri: true, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Modern Cardiac Cath Lab", "High-Grade Joint & Spine Suites", "TPA Cashless Desks", "Ambulatory Assist Services"],
    ratingBreakdown: { care: 4.4, cost: 3.4, queue: 4.1 },
    location: { lat: 26.1266, lng: 85.3855 },
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hosp_kidney_muzaffarpur",
    name: "Muzaffarpur Kidney & General Hospital",
    address: "Majhaulia Road, Juran Chapra",
    city: "Muzaffarpur",
    area: "Juran Chapra",
    specialization: ["Nephrology", "Urology", "General Medicine"],
    rating: 4.2,
    reviewsCount: 52,
    isVerified: true,
    icuBedsAvailable: 6,
    icuBedsTotal: 20,
    nicuBedsAvailable: 2,
    features: { mri: false, ambulance: true, cashless: true, tpaSupport: true },
    facilities: ["Specialist Dialysis Units", "Endourological Modular Cabinets", "Ayushman Cashless Operations"],
    ratingBreakdown: { care: 4.3, cost: 3.6, queue: 3.8 },
    location: { lat: 26.1211, lng: 85.3788 },
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
  }
];

const seedDoctors: Doctor[] = [
  {
    id: "doc_1",
    hospitalId: "hosp_paras_patna",
    hospitalName: "Paras HMRI Hospital",
    name: "Dr. Arvind Kumar Sinha",
    specialty: "Cardiology",
    experience: 22,
    degree: "MD, DM (Cardiology) - AIIMS Delhi",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    fee: 800,
    timing: "10:00 AM - 02:00 PM",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_2",
    hospitalId: "hosp_paras_patna",
    hospitalName: "Paras HMRI Hospital",
    name: "Dr. Shobha Rani Lal",
    specialty: "Oncology",
    experience: 16,
    degree: "MBBS, DNB (Medical Oncology)",
    availability: ["Tue", "Thu", "Sat"],
    fee: 1000,
    timing: "11:00 AM - 04:00 PM",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_3",
    hospitalId: "hosp_igims_patna",
    hospitalName: "IGIMS (Indira Gandhi Institute of Medical Sciences)",
    name: "Dr. Rakesh Kumar Prasad",
    specialty: "Nephrology",
    experience: 18,
    degree: "MD, DM (Nephrology) - PMCH",
    availability: ["Mon", "Wed", "Fri"],
    fee: 150,
    timing: "09:00 AM - 01:00 PM",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_4",
    hospitalId: "hosp_aiims_patna",
    hospitalName: "AIIMS Patna",
    name: "Dr. Vineet Mohan",
    specialty: "Orthopedics",
    experience: 14,
    degree: "MS (Orthopedics) - JIPMER",
    availability: ["Mon", "Tue", "Thu", "Fri"],
    fee: 100,
    timing: "10:00 AM - 03:00 PM",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_5",
    hospitalId: "hosp_ruban_patna",
    hospitalName: "Ruban Memorial Hospital",
    name: "Dr. Kumar Satyajit",
    specialty: "Urology",
    experience: 20,
    degree: "MCh (Urology) - KEM Hospital Mumbai",
    availability: ["Tue", "Wed", "Fri", "Sat"],
    fee: 700,
    timing: "04:00 PM - 07:00 PM",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_magadh_gaya",
    hospitalId: "hosp_magadh_gaya",
    hospitalName: "Anugrah Narayan Magadh Medical College & Hospital",
    name: "Dr. Sudip Kumar Roy",
    specialty: "Pediatrics",
    experience: 16,
    degree: "MD (Pediatrics) - PMCH Patna",
    availability: ["Mon", "Wed", "Fri"],
    fee: 100,
    timing: "09:00 AM - 01:00 PM",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_gaya_giri",
    hospitalId: "hosp_gaya_giri",
    hospitalName: "Siddharth Giri Multispecialty Hospital",
    name: "Dr. Siddharth Giri",
    specialty: "Orthopedics",
    experience: 18,
    degree: "MS (Orthopedics), MCh Joint Replacement",
    availability: ["Mon", "Tue", "Thu", "Fri"],
    fee: 500,
    timing: "11:00 AM - 03:00 PM",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_gaya_metro",
    hospitalId: "hosp_gaya_metro",
    hospitalName: "Metro Gaya Care Clinic & Trauma Centre",
    name: "Dr. Priya Ranjan",
    specialty: "General Medicine",
    experience: 12,
    degree: "MD (General Medicine) - AIIMS Patna",
    availability: ["Tue", "Wed", "Fri", "Sat"],
    fee: 400,
    timing: "12:00 PM - 04:00 PM",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_rims_ranchi",
    hospitalId: "hosp_rims_ranchi",
    hospitalName: "RIMS (Rajendra Institute of Medical Sciences)",
    name: "Dr. Alok Nath Shahdeo",
    specialty: "Neurology",
    experience: 24,
    degree: "MD, DM (Neurology) - NIMHANS",
    availability: ["Mon", "Wed", "Fri"],
    fee: 150,
    timing: "09:00 AM - 01:00 PM",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_medica_ranchi",
    hospitalId: "hosp_medica_ranchi",
    hospitalName: "Bhagwan Mahavir Medica Superspecialty Hospital",
    name: "Dr. Sanjay Kumar",
    specialty: "Cardiology",
    experience: 20,
    degree: "MD, DM (Cardiology) - BHU",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    fee: 700,
    timing: "10:00 AM - 02:00 PM",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_orchid_ranchi",
    hospitalId: "hosp_orchid_ranchi",
    hospitalName: "Orchid Medical Centre",
    name: "Dr. Neha Sahay",
    specialty: "Obstetrics & Gynecology",
    experience: 15,
    degree: "MS, DNB (Obstetrics & Gynecology)",
    availability: ["Tue", "Thu", "Sat"],
    fee: 600,
    timing: "11:00 AM - 04:00 PM",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_sskm_kolkata",
    hospitalId: "hosp_sskm_kolkata",
    hospitalName: "IPGMER and SSKM Hospital",
    name: "Dr. Subhashish Banerjee",
    specialty: "Cardiology",
    experience: 26,
    degree: "MD, DM (Cardiology) - IPGMER Kolkata",
    availability: ["Mon", "Wed", "Fri"],
    fee: 200,
    timing: "10:00 AM - 02:00 PM",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_apollo_kolkata",
    hospitalId: "hosp_apollo_kolkata",
    hospitalName: "Apollo Multispeciality Hospitals",
    name: "Dr. Indranil Roy",
    specialty: "Oncology",
    experience: 19,
    degree: "MBBS, DNB (Medical Oncology) - Tata Memorial",
    availability: ["Mon", "Tue", "Thu", "Fri"],
    fee: 1000,
    timing: "09:00 AM - 03:00 PM",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_amri_kolkata",
    hospitalId: "hosp_amri_kolkata",
    hospitalName: "AMRI Hospitals",
    name: "Dr. Ananya Sen",
    specialty: "General Medicine",
    experience: 14,
    degree: "MD (General Medicine) - RG Kar Medical College",
    availability: ["Tue", "Thu", "Sat"],
    fee: 800,
    timing: "11:00 AM - 03:00 PM",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_dmch_darbhanga",
    hospitalId: "hosp_dmch_darbhanga",
    hospitalName: "Darbhanga Medical College & Hospital (DMCH)",
    name: "Dr. Brajesh Choudhary",
    specialty: "General Medicine",
    experience: 17,
    degree: "MD (Medicine) - DMCH Darbhanga",
    availability: ["Mon", "Tue", "Thu", "Fri"],
    fee: 100,
    timing: "09:30 AM - 01:30 PM",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_paras_darbhanga",
    hospitalId: "hosp_paras_darbhanga",
    hospitalName: "Paras Global Hospital",
    name: "Dr. Md. Khalid Alam",
    specialty: "Urology",
    experience: 12,
    degree: "MCh (Urology) - BHU",
    availability: ["Tue", "Thu", "Sat"],
    fee: 600,
    timing: "10:00 AM - 02:00 PM",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_heritage_darbhanga",
    hospitalId: "hosp_heritage_darbhanga",
    hospitalName: "Heritage Hospital & Research Centre",
    name: "Dr. Ritu Raj",
    specialty: "Pediatrics",
    experience: 10,
    degree: "DNB (Pediatrics) - Safdarjung Delhi",
    availability: ["Mon", "Wed", "Fri"],
    fee: 400,
    timing: "11:00 AM - 04:00 PM",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_skmch_muzaffarpur",
    hospitalId: "hosp_skmch_muzaffarpur",
    hospitalName: "Sri Krishna Medical College & Hospital (SKMCH)",
    name: "Dr. S. K. Shahi",
    specialty: "General Medicine",
    experience: 20,
    degree: "MD (Medicine) - PMCH",
    availability: ["Mon", "Wed", "Fri"],
    fee: 105,
    timing: "09:00 AM - 01:00 PM",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_pmch_muzaffarpur",
    hospitalId: "hosp_pmch_muzaffarpur",
    hospitalName: "Prashant Memorial Charitable Hospital",
    name: "Dr. Amitabh Kumar",
    specialty: "Orthopedics",
    experience: 15,
    degree: "MS (Orthopedics) - KGMC Lucknow",
    availability: ["Mon", "Tue", "Thu", "Fri"],
    fee: 500,
    timing: "11:00 AM - 03:00 PM",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "doc_kidney_muzaffarpur",
    hospitalId: "hosp_kidney_muzaffarpur",
    hospitalName: "Muzaffarpur Kidney & General Hospital",
    name: "Dr. Vibha Kumari",
    specialty: "Nephrology",
    experience: 13,
    degree: "MD, DM (Nephrology) - PMCH Patna",
    availability: ["Tue", "Thu", "Sat"],
    fee: 450,
    timing: "10:00 AM - 02:00 PM",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80"
  }
];

const seedTreatments: Treatment[] = [
  {
    id: "treat_angioplasty",
    name: "Coronary Angioplasty (Heart Stent)",
    category: "Cardiology",
    minCost: 95000,
    maxCost: 260000,
    avgCost: 165000,
    description: "A minimally invasive procedure to widen clogged or narrowed coronary arteries to restore blood flow to the heart muscle using a medical stent.",
    duration: "2-3 Days Hospitalization",
    packageDetails: ["Custom stent fees", "OT & Anesthesia charges", "Post-op ICU Watch (24 Hrs)", "Surgeon and Assistant team charges", "Routine blood work & diagnostics"],
    trends: [
      { year: 2024, cost: 155000 },
      { year: 2025, cost: 160000 },
      { year: 2026, cost: 165000 }
    ]
  },
  {
    id: "treat_cataract",
    name: "Cataract Surgery (Laser Phacoemulsification)",
    category: "Ophthalmology",
    minCost: 15000,
    maxCost: 85000,
    avgCost: 35000,
    description: "Removal of the natural clouded lens of the eye and implantation of a premium artificial intraocular lens (IOL). Done as an outpatient day care procedure.",
    duration: "Day Care (No Overnight Stay)",
    packageDetails: ["Standard premium IOL lens", "Laser phaco execution", "Standard local anesthesia", "First eye drops recovery pack", "Two post-op routine checkups"],
    trends: [
      { year: 2024, cost: 32000 },
      { year: 2025, cost: 34000 },
      { year: 2026, cost: 35000 }
    ]
  },
  {
    id: "treat_joint_replacement",
    name: "Total Knee Replacement",
    category: "Orthopedics",
    minCost: 120000,
    maxCost: 320000,
    avgCost: 195000,
    description: "Surgical replacement of a severely diseased knee joint with high-grade metal/ceramic prosthetics to remove pain and restore natural movement.",
    duration: "4-5 Days Hospitalization",
    packageDetails: ["Prosthetic implant cost", "Joint fitting surgical system", "Physiotherapy support (5 days)", "Post-surgical pain controls", "Implant lifetime serial verification"],
    trends: [
      { year: 2024, cost: 180000 },
      { year: 2025, cost: 188000 },
      { year: 2026, cost: 195000 }
    ]
  },
  {
    id: "treat_cesarean",
    name: "Cesarean Section (C-Section Birth)",
    category: "Obstetrics",
    minCost: 25000,
    maxCost: 110000,
    avgCost: 45000,
    description: "Surgical delivery of a baby through an incision made in the mother's abdomen and uterus, including general safety care for newborn.",
    duration: "3-4 Days Hospitalization",
    packageDetails: ["Labor ward and OT charges", "Gynecologist, Pediatrician & Anesthetist fees", "Baby nursery monitoring (First 48 hr)", "Lactation consulting", "Post-delivery recovery medications"],
    trends: [
      { year: 2024, cost: 42000 },
      { year: 2025, cost: 44000 },
      { year: 2026, cost: 45000 }
    ]
  },
  {
    id: "treat_gallbladder",
    name: "Laparoscopic Gallbladder Removal (Cholecystectomy)",
    category: "General Surgery",
    minCost: 30000,
    maxCost: 120000,
    avgCost: 55000,
    description: "Removal of the gallbladder through several tiny incisions using a laparoscope. Advised for patients with painful, persistent gallstones.",
    duration: "1-2 Days Hospitalization",
    packageDetails: ["Laparoscopic imaging and camera usage", "Standard general anesthesia", "Disposable surgical kits", "Recovery ward bed charge", "Post-op nutrition guide"],
    trends: [
      { year: 2024, cost: 50000 },
      { year: 2025, cost: 52000 },
      { year: 2026, cost: 55000 }
    ]
  }
];

const seedInsuranceProviders: InsuranceProvider[] = [
  {
    id: "ins_star_health",
    name: "Star Health & Allied Insurance",
    logo: "⭐",
    claimSuccessRate: 98.2,
    contact: "1800-425-2255",
    cashlessHospitals: ["hosp_paras_patna", "hosp_ruban_patna", "hosp_ford_patna", "hosp_igims_patna"]
  },
  {
    id: "ins_hdfc_ergo",
    name: "HDFC ERGO General Insurance",
    logo: "🛡️",
    claimSuccessRate: 97.4,
    contact: "1800-2700-700",
    cashlessHospitals: ["hosp_paras_patna", "hosp_ruban_patna", "hosp_ford_patna"]
  },
  {
    id: "ins_niva_bupa",
    name: "Niva Bupa Health Insurance",
    logo: "❤️",
    claimSuccessRate: 96.8,
    contact: "1860-500-8888",
    cashlessHospitals: ["hosp_paras_patna", "hosp_ruban_patna", "hosp_igims_patna"]
  }
];

const seedSchemes: HealthScheme[] = [
  {
    id: "scheme_ayushman",
    name: "Ayushman Bharat PM-JAY",
    coverageAmount: "₹5 Lakhs / Family / Year",
    eligibility: "Identified low-income families under SECC 2011 database, Ration card holders",
    documentsRequired: ["Aadhaar Card", "Ration Card (NFSA)", "Active PM-JAY Letter", "Family Identification Card"],
    description: "National Health Protection Scheme that covers secondary and tertiary hospitalization care fully cashless across empanelled government and private clinics in India.",
    benefits: ["Fully cashless medicine & diagnostic costs", "Surgical care coverage for 1393+ procedural setups", "Post-hospitalization care up to 15 days", "No limit on family size or age constraints"]
  },
  {
    id: "scheme_bihar_chief_minister",
    name: "Bihar Mukhyamantri Chikitsa Sahayata",
    coverageAmount: "Up to ₹2.5 Lakhs",
    eligibility: "Permanent residents of Bihar with annual family income below ₹2.5 Lakhs",
    documentsRequired: ["Resident and Income Certificate (CO verified)", "Medical Superintendent referral letter from PMCH/IGIMS", "Aadhaar Card", "Estimated surgery cost slip"],
    description: "State-funded assistance scheme to help marginal families undergoing super-specialty surgeries (like open heart, kidney failure, cancer treatments).",
    benefits: ["Direct central payment release to the medical institute", "Subsidized heavy procedural chemotherapy costs", "Emergency life support assistance grants"]
  }
];

const seedReviews: Review[] = [
  {
    id: "rev_1",
    hospitalId: "hosp_paras_patna",
    userName: "Manoj Kumar Yadav (Patna)",
    rating: 4.6,
    comment: "Extremely quick care in emergency card wing. My uncle got admitted for angioplasty. Star Health cashless was coordinated within 3 hours. Standard costs are slightly high, but critical doctor response is top class.",
    date: "2026-04-12",
    categoryRating: { care: 5, cost: 3, queue: 4 },
    verifiedPatient: true
  },
  {
    id: "rev_2",
    hospitalId: "hosp_igims_patna",
    userName: "Sudha Devi (Gaya)",
    rating: 4.2,
    comment: "Great treatment for kidney stone issues. Cost of medicines and testing was extremely low because of Government support scheme. OPD lines are very long though; we stood for 2.5 hours.",
    date: "2026-05-01",
    categoryRating: { care: 4, cost: 5, queue: 2 },
    verifiedPatient: true
  },
  {
    id: "rev_3",
    hospitalId: "hosp_aiims_patna",
    userName: "Vikash Kumar (Muzaffarpur)",
    rating: 4.8,
    comment: "Simply the best orthopedics treatment in Eastern India. Highly qualified AIIMS doctors and very clean campus. They took care of Ayushman card help-desk support beautifully.",
    date: "2026-05-18",
    categoryRating: { care: 5, cost: 5, queue: 3 },
    verifiedPatient: true
  },
  {
    id: "rev_4",
    hospitalId: "hosp_pmch_patna",
    userName: "Ramesh Mahto (Patna)",
    rating: 3.5,
    comment: "Emergency traumatology department did a lifesaving fracture surgery at zero cost. Doctors are incredibly expert, but ward cleanliness needs big improvement and lines are huge.",
    date: "2026-05-24",
    categoryRating: { care: 4, cost: 5, queue: 1 },
    verifiedPatient: true
  }
];

const seedAppointments: Appointment[] = [];
const seedAuditLogs: AuditLog[] = [
  {
    id: "audit_1",
    timestamp: "2026-05-31T10:00:00Z",
    action: "SYSTEM_INITIALIZATION",
    user: "Admin System",
    details: "Sehat Setu database seeded with 7 Hospitals, 5 Doctors, and common Surgical Treatment averages."
  }
];

// Read & write management
export function getDatastore(): Datastore {
  if (!fs.existsSync(STORE_PATH)) {
    const freshDb: Datastore = {
      hospitals: seedHospitals,
      doctors: seedDoctors,
      treatments: seedTreatments,
      insuranceProviders: seedInsuranceProviders,
      schemes: seedSchemes,
      appointments: seedAppointments,
      reviews: seedReviews,
      auditLogs: seedAuditLogs
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(freshDb, null, 2));
    return freshDb;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Datastore;
    
    // Core database merge safeguard: Inject any newly introduced seed hospitals and doctors 
    // dynamically into db-store.json so existing reviews and dynamic states are fully kept intact.
    let modified = false;
    if (!parsed.hospitals) parsed.hospitals = [];
    if (!parsed.doctors) parsed.doctors = [];
    if (!parsed.labBookings) {
      parsed.labBookings = [];
      modified = true;
    }
    
    for (const h of seedHospitals) {
      if (!parsed.hospitals.some(item => item.id === h.id)) {
        parsed.hospitals.push(h);
        modified = true;
      }
    }
    
    for (const d of seedDoctors) {
      if (!parsed.doctors.some(item => item.id === d.id)) {
        parsed.doctors.push(d);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(parsed, null, 2));
    }
    
    return parsed;
  } catch (e) {
    // Failover
    return {
      hospitals: seedHospitals,
      doctors: seedDoctors,
      treatments: seedTreatments,
      insuranceProviders: seedInsuranceProviders,
      schemes: seedSchemes,
      appointments: seedAppointments,
      reviews: seedReviews,
      auditLogs: seedAuditLogs,
      labBookings: []
    };
  }
}

export function writeDatastore(data: Datastore) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

// Transaction operations
export function createAudit(action: string, user: string, details: string) {
  const db = getDatastore();
  const log: AuditLog = {
    id: "audit_" + Date.now(),
    timestamp: new Date().toISOString(),
    action,
    user,
    details
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 100) {
    db.auditLogs = db.auditLogs.slice(0, 100);
  }
  writeDatastore(db);
}
