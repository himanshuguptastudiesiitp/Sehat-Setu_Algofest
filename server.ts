import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { getDatastore, writeDatastore, createAudit } from "./server/database.js";
import { Hospital, Doctor, Appointment, Review, Treatment } from "./src/types";

// Prevent slow DNS resolution in Node container
dns.setDefaultResultOrder && dns.setDefaultResultOrder("ipv4first");

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Chat features will fallback to offline rule-based response mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Ensure database is initialized
getDatastore();

// ==========================================
// API ROUTES
// ==========================================

// 1. HOSPITAL DISCOVERY ENDPOINTS
app.get("/api/hospitals", (req, res) => {
  const db = getDatastore();
  const { city, search, specialty, cashless, hasAmbulance, hasMri } = req.query;
  
  let results = [...db.hospitals];

  if (city) {
    results = results.filter(h => h.city.toLowerCase() === (city as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(h => 
      h.name.toLowerCase().includes(q) || 
      h.address.toLowerCase().includes(q) ||
      h.area.toLowerCase().includes(q)
    );
  }

  if (specialty) {
    const spec = (specialty as string).toLowerCase();
    results = results.filter(h => 
      h.specialization.some(s => s.toLowerCase() === spec)
    );
  }

  if (cashless === "true") {
    results = results.filter(h => h.features.cashless);
  }

  if (hasAmbulance === "true") {
    results = results.filter(h => h.features.ambulance);
  }

  if (hasMri === "true") {
    results = results.filter(h => h.features.mri);
  }

  res.json(results);
});

app.post("/api/hospitals", (req, res) => {
  const db = getDatastore();
  const newHospital: Hospital = {
    id: "hosp_" + Date.now(),
    name: req.body.name || "Untitled Hospital",
    address: req.body.address || "",
    city: req.body.city || "Patna",
    area: req.body.area || "",
    specialization: req.body.specialization || [],
    rating: Number(req.body.rating) || 5.0,
    reviewsCount: 0,
    isVerified: true,
    icuBedsAvailable: Number(req.body.icuBedsAvailable) || 0,
    icuBedsTotal: Number(req.body.icuBedsTotal) || 10,
    nicuBedsAvailable: Number(req.body.nicuBedsAvailable) || 0,
    features: {
      mri: !!req.body.mri,
      ambulance: !!req.body.ambulance,
      cashless: !!req.body.cashless,
      tpaSupport: !!req.body.tpaSupport
    },
    facilities: req.body.facilities || ["General Ward", "OPD Services"],
    ratingBreakdown: { care: 5, cost: 5, queue: 5 },
    location: req.body.location || { lat: 25.6, lng: 85.1 },
    image: req.body.image || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
  };

  db.hospitals.push(newHospital);
  writeDatastore(db);
  createAudit("CREATE_HOSPITAL", "Admin Dashboard", `Added Hospital: ${newHospital.name} in ${newHospital.city}`);
  res.status(201).json(newHospital);
});

app.put("/api/hospitals/:id", (req, res) => {
  const db = getDatastore();
  const idx = db.hospitals.findIndex(h => h.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Hospital not found" });
  }

  const existing = db.hospitals[idx];
  const updated: Hospital = {
    ...existing,
    name: req.body.name ?? existing.name,
    address: req.body.address ?? existing.address,
    city: req.body.city ?? existing.city,
    area: req.body.area ?? existing.area,
    specialization: req.body.specialization ?? existing.specialization,
    icuBedsAvailable: req.body.icuBedsAvailable !== undefined ? Number(req.body.icuBedsAvailable) : existing.icuBedsAvailable,
    icuBedsTotal: req.body.icuBedsTotal !== undefined ? Number(req.body.icuBedsTotal) : existing.icuBedsTotal,
    nicuBedsAvailable: req.body.nicuBedsAvailable !== undefined ? Number(req.body.nicuBedsAvailable) : existing.nicuBedsAvailable,
    features: {
      mri: req.body.mri !== undefined ? !!req.body.mri : existing.features.mri,
      ambulance: req.body.ambulance !== undefined ? !!req.body.ambulance : existing.features.ambulance,
      cashless: req.body.cashless !== undefined ? !!req.body.cashless : existing.features.cashless,
      tpaSupport: req.body.tpaSupport !== undefined ? !!req.body.tpaSupport : existing.features.tpaSupport
    },
    facilities: req.body.facilities ?? existing.facilities,
    image: req.body.image ?? existing.image
  };

  db.hospitals[idx] = updated;
  writeDatastore(db);
  createAudit("UPDATE_HOSPITAL", "Admin Dashboard", `Updated Hospital beds & details: ${updated.name}`);
  res.json(updated);
});

app.delete("/api/hospitals/:id", (req, res) => {
  const db = getDatastore();
  const index = db.hospitals.findIndex(h => h.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Hospital not found" });
  }
  const deleted = db.hospitals.splice(index, 1);
  writeDatastore(db);
  createAudit("DELETE_HOSPITAL", "Admin Dashboard", `Removed Hospital: ${deleted[0].name}`);
  res.json({ success: true, deleted: deleted[0].name });
});


// 2. DOCTOR PLATFORM ENDPOINTS
app.get("/api/doctors", (req, res) => {
  const db = getDatastore();
  const { hospitalId, specialty } = req.query;

  let results = [...db.doctors];
  if (hospitalId) {
    results = results.filter(d => d.hospitalId === hospitalId);
  }
  if (specialty) {
    const s = (specialty as string).toLowerCase();
    results = results.filter(d => d.specialty.toLowerCase() === s);
  }
  res.json(results);
});

app.post("/api/doctors", (req, res) => {
  const db = getDatastore();
  const hospital = db.hospitals.find(h => h.id === req.body.hospitalId);
  const newDoctor: Doctor = {
    id: "doc_" + Date.now(),
    hospitalId: req.body.hospitalId || "hosp_paras_patna",
    hospitalName: hospital ? hospital.name : "Sehat Associated Hospital",
    name: req.body.name || "Dr. Guest Specialist",
    specialty: req.body.specialty || "General Medicine",
    experience: Number(req.body.experience) || 5,
    degree: req.body.degree || "MBBS",
    availability: req.body.availability || ["Mon", "Wed", "Fri"],
    fee: Number(req.body.fee) || 200,
    timing: req.body.timing || "09:00 AM - 01:00 PM",
    rating: 4.5,
    image: req.body.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80"
  };

  db.doctors.push(newDoctor);
  writeDatastore(db);
  createAudit("CREATE_DOCTOR", "Admin Dashboard", `Added specialist: ${newDoctor.name} (${newDoctor.specialty})`);
  res.status(201).json(newDoctor);
});

app.put("/api/doctors/:id", (req, res) => {
  const db = getDatastore();
  const idx = db.doctors.findIndex(d => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  const existing = db.doctors[idx];
  db.doctors[idx] = {
    ...existing,
    name: req.body.name ?? existing.name,
    specialty: req.body.specialty ?? existing.specialty,
    experience: req.body.experience !== undefined ? Number(req.body.experience) : existing.experience,
    degree: req.body.degree ?? existing.degree,
    timing: req.body.timing ?? existing.timing,
    fee: req.body.fee !== undefined ? Number(req.body.fee) : existing.fee
  };
  writeDatastore(db);
  res.json(db.doctors[idx]);
});

app.delete("/api/doctors/:id", (req, res) => {
  const db = getDatastore();
  const index = db.doctors.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  const docObj = db.doctors.splice(index, 1);
  writeDatastore(db);
  createAudit("DELETE_DOCTOR", "Admin Dashboard", `Removed Doctor: ${docObj[0].name}`);
  res.json({ success: true, deleted: docObj[0].name });
});


// 3. TREATMENT COST INTELLIGENCE ENDPOINTS
app.get("/api/treatments", (req, res) => {
  const db = getDatastore();
  res.json(db.treatments);
});

// 4. INSURANCE & GOVERNMENT SCHEME DIRECTORIES
app.get("/api/insurance", (req, res) => {
  const db = getDatastore();
  res.json(db.insuranceProviders);
});

app.get("/api/schemes", (req, res) => {
  const db = getDatastore();
  res.json(db.schemes);
});


// 5. APPOINTMENT SCHEDULER
app.get("/api/appointments", (req, res) => {
  const db = getDatastore();
  res.json(db.appointments);
});

app.post("/api/appointments", (req, res) => {
  const db = getDatastore();
  const newAppointment: Appointment = {
    id: "appt_" + Date.now(),
    patientName: req.body.patientName || "Anonymous Patient",
    patientAge: Number(req.body.patientAge) || 30,
    patientGender: req.body.patientGender || "Male",
    contactNumber: req.body.contactNumber || "9999999999",
    hospitalId: req.body.hospitalId || "hosp_paras_patna",
    hospitalName: req.body.hospitalName || "Associated Clinic",
    doctorId: req.body.doctorId || "doc_1",
    doctorName: req.body.doctorName || "Primary Specialist",
    date: req.body.date || "2026-06-01",
    time: req.body.time || "10:30 AM",
    status: req.body.status || "Pending",
    notes: req.body.notes || "",
    createdTime: new Date().toISOString()
  };

  db.appointments.unshift(newAppointment);
  writeDatastore(db);
  createAudit("BOOK_APPOINTMENT", "Patient UI Portal", `Booked appointment for ${newAppointment.patientName} with ${newAppointment.doctorName}`);
  res.status(201).json(newAppointment);
});

app.put("/api/appointments/:id", (req, res) => {
  const db = getDatastore();
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  db.appointments[idx].status = req.body.status || db.appointments[idx].status;
  writeDatastore(db);
  createAudit("UPDATE_APPOINTMENT", "Admin Dashboard", `Status updated to ${req.body.status} for ${db.appointments[idx].patientName}`);
  res.json(db.appointments[idx]);
});


// 6. PATIENT VERIFIED REVIEWS & RATINGS RECALCULATION
app.get("/api/reviews", (req, res) => {
  const db = getDatastore();
  const { hospitalId } = req.query;
  if (hospitalId) {
    const list = db.reviews.filter(r => r.hospitalId === hospitalId);
    return res.json(list);
  }
  res.json(db.reviews);
});

app.post("/api/reviews", (req, res) => {
  const db = getDatastore();
  const hospId = req.body.hospitalId;
  const ratingVal = Number(req.body.rating) || 4;
  
  const newReview: Review = {
    id: "rev_" + Date.now(),
    hospitalId: hospId,
    userName: req.body.userName || "Verified Patient",
    rating: ratingVal,
    comment: req.body.comment || "Satisfactory consultation.",
    date: new Date().toISOString().split('T')[0],
    categoryRating: {
      care: Number(req.body.care) || ratingVal,
      cost: Number(req.body.cost) || ratingVal,
      queue: Number(req.body.queue) || ratingVal
    },
    verifiedPatient: true
  };

  db.reviews.unshift(newReview);

  // Recalculate average rating list of the hospital
  const hospIndex = db.hospitals.findIndex(h => h.id === hospId);
  if (hospIndex !== -1) {
    const matchedReviews = db.reviews.filter(r => r.hospitalId === hospId);
    const sum = matchedReviews.reduce((acc, current) => acc + current.rating, 0);
    const avg = Number((sum / matchedReviews.length).toFixed(1));

    // Category recalculations
    const careSum = matchedReviews.reduce((acc, curr) => acc + curr.categoryRating.care, 0);
    const costSum = matchedReviews.reduce((acc, curr) => acc + curr.categoryRating.cost, 0);
    const qSum = matchedReviews.reduce((acc, curr) => acc + curr.categoryRating.queue, 0);

    db.hospitals[hospIndex].rating = avg;
    db.hospitals[hospIndex].reviewsCount = matchedReviews.length;
    db.hospitals[hospIndex].ratingBreakdown = {
      care: Number((careSum / matchedReviews.length).toFixed(1)),
      cost: Number((costSum / matchedReviews.length).toFixed(1)),
      queue: Number((qSum / matchedReviews.length).toFixed(1))
    };
  }

  writeDatastore(db);
  createAudit("POST_REVIEW", "Patient UI Portal", `New patient review submitted for hospital ${hospId}`);
  res.status(201).json(newReview);
});


// 7. SYSTEM AUDIT TRAILS
app.get("/api/audit-logs", (req, res) => {
  const db = getDatastore();
  res.json(db.auditLogs);
});


// 8. PERFORMANCE & QUEUE METRICS ANALYTICS
app.get("/api/analytics", (req, res) => {
  const db = getDatastore();
  const totalHosp = db.hospitals.length;
  const totalDocs = db.doctors.length;
  const totalBeds = db.hospitals.reduce((acc, h) => acc + h.icuBedsTotal, 0);
  const bedsAvail = db.hospitals.reduce((acc, h) => acc + h.icuBedsAvailable, 0);
  
  // Calculate city breakdowns
  const cityCount: Record<string, number> = {};
  db.hospitals.forEach(h => {
    cityCount[h.city] = (cityCount[h.city] || 0) + 1;
  });

  // Category average treatments
  const surgeryCounts = db.treatments.map(t => ({
    name: t.name,
    minCost: t.minCost,
    maxCost: t.maxCost,
    avg: t.avgCost
  }));

  res.json({
    totalHospitals: totalHosp,
    totalDoctors: totalDocs,
    totalICUBeds: totalBeds,
    availableICUBeds: bedsAvail,
    cityBreakdowns: Object.entries(cityCount).map(([name, count]) => ({ name, count })),
    surgicallist: surgeryCounts
  });
});


// ==========================================
// 8.5 LAB CLINICAL TEST & HEALTH CHECKUP DIRECTORIES
// ==========================================
const seedLabTests = [
  {
    id: "test_full_body",
    name: "Full Body Swasthya Checkup",
    category: "Full Body Profile",
    price: 1499,
    parameters: ["Complete Blood Count (CBC)", "Lipid Profile", "Liver Function (LFT)", "Kidney Function (KFT)", "Glucose Fasting", "Thyroid Profile (TSH)"],
    description: "Complete premium health screening checking all key organ functions and metabolic status.",
    preparation: "Minimum 10-12 hours fasting required. Water is allowed.",
    sampleType: "Blood & Urine"
  },
  {
    id: "test_blood_sugar",
    name: "Comprehensive Diabetes Evaluation (Fasting + HbA1c)",
    category: "Diabetes",
    price: 399,
    parameters: ["Blood Glucose Fasting", "HbA1c (Glycated Haemoglobin)", "Average Blood Glucose"],
    description: "Evaluate your blood sugar control over the past 3 months as well as current fasting sugar.",
    preparation: "Minimum 8-10 hours fasting required.",
    sampleType: "Blood"
  },
  {
    id: "test_lipid_profile",
    name: "Lipid Profile (Cardiac Risk Screen)",
    category: "Cardiovascular",
    price: 499,
    parameters: ["Total Cholesterol", "HDL Cholesterol", "LDL Cholesterol", "Triglycerides", "VLDL Cholesterol", "T.C / HDL Ratio"],
    description: "Assess cholesterol levels to evaluate heart and artery lining health status.",
    preparation: "10-12 hours fasting required.",
    sampleType: "Blood"
  },
  {
    id: "test_kft",
    name: "Kidney Function Test (KFT / Renal)",
    category: "Renal Panel",
    price: 550,
    parameters: ["Urea", "Creatinine", "Uric Acid", "BUN (Blood Urea Nitrogen)", "Electrolytes (Sodium, Potassium, Chloride)"],
    description: "Examine kidney waste filtering capability and electrolyte balances in blood.",
    preparation: "No special preparation required.",
    sampleType: "Blood"
  },
  {
    id: "test_lft",
    name: "Liver Function Test (LFT)",
    category: "Hepatic Panel",
    price: 590,
    parameters: ["SGOT / AST", "SGPT / ALT", "Bilirubin Total & Direct", "Alkaline Phosphatase", "Total Protein", "Albumin / Globulin Ratio"],
    description: "Screen for liver inflammation, cellular damage, bile duct health, and enzyme markers.",
    preparation: "No special preparation required.",
    sampleType: "Blood"
  },
  {
    id: "test_cbc",
    name: "Complete Blood Count (CBC / Hemogram)",
    category: "Hematology",
    price: 299,
    parameters: ["Haemoglobin", "WBC Total Count", "RBC Count", "Platelet Count", "Differential Count (Lymphocytes, etc.)", "PCV / MCV"],
    description: "General screen for anemia, infections, platelet deficiencies, and immune cell levels.",
    preparation: "No special preparation required.",
    sampleType: "Blood"
  },
  {
    id: "test_thyroid",
    name: "Thyroid Profile (T3, T4, TSH)",
    category: "Endocrine",
    price: 349,
    parameters: ["Triiodothyronine (T3)", "Thyroxine (T4)", "Thyroid Stimulating Hormone (TSH)"],
    description: "Determine thyroid hormonal levels to screen for hypo/hyperthyroidism.",
    preparation: "Fasting recommended but not mandatory.",
    sampleType: "Blood"
  }
];

app.get("/api/lab-tests", (req, res) => {
  res.json(seedLabTests);
});

app.get("/api/lab-bookings", (req, res) => {
  const db = getDatastore();
  res.json(db.labBookings || []);
});

app.post("/api/lab-bookings", (req, res) => {
  const db = getDatastore();
  const testObj = seedLabTests.find(t => t.id === req.body.testId);
  const newBooking = {
    id: "lab_" + Date.now(),
    patientName: req.body.patientName || "Anonymous Patient",
    patientAge: Number(req.body.patientAge) || 30,
    patientGender: req.body.patientGender || "Male",
    contactNumber: req.body.contactNumber || "9999999999",
    testId: req.body.testId || "test_cbc",
    testName: testObj ? testObj.name : "Routine Checkup",
    price: testObj ? testObj.price : 299,
    hospitalId: req.body.hospitalId || "hosp_paras_patna",
    hospitalName: req.body.hospitalName || "Associated Partner Laboratory",
    date: req.body.date || new Date().toISOString().split('T')[0],
    timeSlot: req.body.timeSlot || "10:00 AM - 12:00 PM",
    collectionType: req.body.collectionType || "Lab Visit",
    address: req.body.address || "",
    status: req.body.status || "Pending",
    reportData: req.body.reportData,
    createdTime: new Date().toISOString()
  };

  if (!db.labBookings) db.labBookings = [];
  db.labBookings.unshift(newBooking);
  writeDatastore(db);
  createAudit("BOOK_LAB_TEST", "Patient UI Portal", `Booked Clinical Lab Check: ${newBooking.testName} for ${newBooking.patientName}`);
  res.status(201).json(newBooking);
});

app.put("/api/lab-bookings/:id", (req, res) => {
  const db = getDatastore();
  const idx = (db.labBookings || []).findIndex(b => b.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Lab booking not found" });
  }

  const current = db.labBookings![idx];
  const nextStatus = req.body.status || current.status;
  current.status = nextStatus;

  // Automatically attach mock biological lab report values on 'Report Generated' is simulated
  if (nextStatus === "Report Generated" || nextStatus === "Completed") {
    if (!current.reportData) {
      if (current.testId === "test_blood_sugar") {
        current.reportData = {
          "Blood Sugar Fasting (Glucose)": "145 mg/dL (High - Normal is 70-100 mg/dL)",
          "HbA1c (Glycated Haemoglobin)": "7.3% (Indicates Type-2 Diabetes - Normal is < 5.7%)",
          "Estimated Avg Glucose (eAG)": "163 mg/dL (Elevated)"
        };
      } else if (current.testId === "test_lipid_profile") {
        current.reportData = {
          "Total Cholesterol": "248 mg/dL (High - Normal is < 200 mg/dL)",
          "HDL (Good Cholesterol)": "36 mg/dL (Low - Normal is > 40 mg/dL)",
          "LDL (Bad Cholesterol)": "162 mg/dL (High Risk - Normal is < 100 mg/dL)",
          "Triglycerides": "195 mg/dL (Elevated - Normal is < 150 mg/dL)"
        };
      } else if (current.testId === "test_cbc") {
        current.reportData = {
          "Haemoglobin": "10.4 g/dL (Low - Anaemic Trend - Normal is 12-16 g/dL)",
          "White Blood Cell (WBC)": "11,800/cu mm (Elevated - Suggests minor active infection - Normal is 4k-11k)",
          "Platelet Count": "2,45,000/cu mm (Normal - Range is 1.5L-4.5L)",
          "RBC Count": "3.9 million/cu mm (Slightly low - Normal is 4.2-5.5 million)"
        };
      } else if (current.testId === "test_kft") {
        current.reportData = {
          "Blood Urea": "46 mg/dL (Elevated - Normal is 15-40 mg/dL)",
          "Serum Creatinine": "1.45 mg/dL (High - Normal is 0.7-1.3 mg/dL)",
          "Uric Acid": "7.9 mg/dL (Slightly elevated - Normal is 3.5-7.2 mg/dL)",
          "Sodium": "138 mEq/L (Normal)"
        };
      } else if (current.testId === "test_lft") {
        current.reportData = {
          "SGOT (AST)": "58 U/L (Elevated - Normal is 5-40 U/L)",
          "SGPT (ALT)": "65 U/L (High - Indicates liver cell stress - Normal is 5-45 U/L)",
          "Bilirubin Total": "1.4 mg/dL (Slightly high - Normal is 0.3-1.2 mg/dL)",
          "Alkaline Phosphatase": "115 U/L (Normal)"
        };
      } else if (current.testId === "test_thyroid") {
        current.reportData = {
          "T3 (Total)": "1.1 ng/mL (Normal)",
          "T4 (Total)": "5.2 mcg/dL (Normal)",
          "TSH (Thyroid Stimulating Hormone)": "6.8 uIU/mL (High - Indicative of borderline Hypothyroidism - Normal is 0.5-4.5)"
        };
      } else {
        // Full body checkup or generic fallback
        current.reportData = {
          "Haemoglobin": "11.2 g/dL (Mildly low)",
          "Blood Fasting Glucose": "132 mg/dL (Elevated)",
          "Total Cholesterol": "230 mg/dL (High)",
          "Serum Creatinine": "1.1 mg/dL (Normal)",
          "SGPT (ALT)": "52 U/L (Slightly High)"
        };
      }
    }
  }

  writeDatastore(db);
  createAudit("UPDATE_LAB_TEST", "Admin Dashboard", `Lab Booking Status updated to ${nextStatus} for ${current.patientName}`);
  res.json(current);
});

// CLINICAL REPORT AI ANALYSIS AGENT ENDPOINT
app.post("/api/gemini/analyze-report", async (req, res) => {
  const { reportText, reportData, patientInfo } = req.body;
  if (!reportText && !reportData) {
    return res.status(400).json({ error: "No report content or data supplied for AI Analysis." });
  }

  let dataPrompt = "";
  if (reportData) {
    dataPrompt = "\n-- EXTRACTED BIOMARKERS DATA --\n" + Object.entries(reportData).map(([k, v]) => `${k}: ${v}`).join("\n");
  }
  if (reportText) {
    dataPrompt += "\n-- REPORT RAW TRANSCRIPT / FIELD TEXT --\n" + reportText;
  }

  const patientPrompt = patientInfo 
    ? `Patient Info: Name: ${patientInfo.name || "N/A"}, Age: ${patientInfo.age || "N/A"}, Gender: ${patientInfo.gender || "N/A"}.`
    : "Patient Info: Gender: N/A, Age: N/A.";

  const systemInstruction = `You are "Super-AI Dhanvantari Ji's Clinical Diagnostic Intelligence Wing" on the "Sehat Setu" portal.
  Your main goals are:
  1. Analyze clinical laboratory tests/report parameters (like CBC, Lipid, Diabetes, Urine, KFT, LFT, etc.) submitted by the patient, and explain them in clear, helpful, empathetic layman's terms.
  2. Maintain a highly supportive, Hinglish/English style. Use helpful, encouraging local style. Start with warm regional greetings like "Pranam" or "Namaste".
  3. Clearly separate:
     - "Key Observations (Mukhya Chinh)" - list biomarkers and flag if they are elevated, depressed, or normal. Give a precise explanation.
     - "Assessment & Meaning (Iska Kya Matlab Hai)" - what do these values generally suggest. Explain gently.
     - "Lifestyle & Diet Recommendations (Aahar aur Vihar)" - daily improvements, herbs, foods to avoid/include, exercise or hydration.
     - "Next Steps (Agla Kadam)" - recommended specialist consultation types if appropriate (e.g., Cardiologist for high lipid, Endocrinologist for high blood sugar).
  4. CRITICAL: You must ALWAYS include a prominent medical disclaimer stating: "Chikitskiya Nidaan Disclaimer: Main ek AI assistant hoon. Main professional medical diagnosis ya prescription ka vikalp nahi hoon. Krupya qualified doctor se sateek salah lein."
  5. Never diagnose deadly emergencies with absolute certainty; always guide them to consult a certified physician. Use rich formatting with bullet points and bold headers.`;

  const client = getAiClient();

  if (!client) {
    const fallbackText = generateOfflineReportAnalysis(reportText, reportData, patientInfo);
    return res.json({ text: fallbackText });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Please analyze the following laboratory test parameters for our patient.
      
      ${patientPrompt}
      ${dataPrompt}
      
      Give a comprehensive but simple breakdown that assists the patient in understanding their biomarkers while encouraging them. Use friendly Hinglish/English.`,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    const outputText = response.text || "Pranam. Aapka report read kar liya hai, lekin clear values read nahi kar paya. Krupya parameters enter karein.";
    res.json({ text: outputText });

  } catch (error: any) {
    console.error("Gemini report analysis error:", error);
    res.status(500).json({ error: "Gemini server response error. Fallback active." });
  }
});

function generateOfflineReportAnalysis(reportText: string, reportData: Record<string, string>, patientInfo: any): string {
  const name = patientInfo?.name || "Verified Patient";
  const dis = "*(Chikitskiya Nidaan Disclaimer: Main ek AI assistant hoon. Main professional medical diagnosis ya prescription ka vikalp nahi hoon. Krupya qualified doctor se sateek salah lein.)*";
  
  let header = `Pranam ${name}! Sehat Setu Offline Report Analyzer ne aapke report ka preliminary analysis kiya hai.\n\n`;
  
  let observationsArray: string[] = [];
  let recommendationsArray: string[] = [];
  let referralType = "General Medicine";

  const allText = ((reportText || "") + " " + JSON.stringify(reportData || "")).toLowerCase();

  if (allText.includes("glucose") || allText.includes("sugar") || allText.includes("hba1c") || allText.includes("diabetes")) {
    observationsArray.push("- **Blood Glucose / HbA1c Levels**: Elevated sugar detected. Normal is <100 mg/dL fasting, and HbA1c <5.7%. Values suggest glucose tolerance or hyperglycemia.");
    recommendationsArray.push("- Low carb and zero-refined sugar diet.\n- Daily 30 mins aerobic walking.\n- Monitor fasting glucose weekly.");
    referralType = "General Endocrinologist / Diabetologist";
  }

  if (allText.includes("lipid") || allText.includes("cholesterol") || allText.includes("triglycerides") || allText.includes("ldl")) {
    observationsArray.push("- **Lipid Profile Indicators**: Total Cholesterol and LDL (bad cholesterol) appear elevated. Normal LDL should be <100 mg/dL. Elevated lipid profile levels are a cardiac warning.");
    recommendationsArray.push("- Reduce saturated fats (fried food, butter, red meat).\n- Increase soluble fiber intake (oats, pulses, green leafy vegetables).\n- Introduce omega-3 rich food or flaxseeds.");
    referralType = "Cardiologist / General Medicine Specialist";
  }

  if (allText.includes("haemoglobin") || allText.includes("hemoglobin") || allText.includes("cbc") || allText.includes("rbc") || allText.includes("platelet")) {
    observationsArray.push("- **Hematology (Haemoglobin/CBC)**: Low Haemoglobin detected (anemic trend). Normal is 12-15 g/dL for females and 13-17 g/dL for males.");
    recommendationsArray.push("- Incorporate iron-rich diets (spinach, beetroot, pomegranate, dates, apples).\n- Take Vitamin C with iron source to increase iron absorption.\n- Limit tea/coffee immediately after meals.");
    referralType = "Hematologist / General Physician";
  }

  if (allText.includes("creatinine") || allText.includes("urea") || allText.includes("kft") || allText.includes("kidney")) {
    observationsArray.push("- **Renal Function (KFT/Kidney)**: Key waste filtration parameters (Creatinine/Urea) analyzed. Values should be within normal ranges (Creatinine ~0.6-1.2 mg/dL).");
    recommendationsArray.push("- Stay well-hydrated (8-10 glasses of water daily).\n- Limit sodium (common salt) and high-protein intake unless advised.\n- Avoid double self-prescribed NSAIDs/painkillers.");
    referralType = "Nephrologist";
  }

  if (allText.includes("sgpt") || allText.includes("sgot") || allText.includes("bilirubin") || allText.includes("lft") || allText.includes("liver")) {
    observationsArray.push("- **Liver Function Enzymes (LFT)**: Liver enzymes like SGOT/SGPT or Bilirubin indicated. Elevated levels show liver cell stress.");
    recommendationsArray.push("- Zero alcohol consumption.\n- Limit spicy, deep-fried food.\n- Include organic turmeric, garlic, and fresh citrus fruits.");
    referralType = "Gastroenterologist / Hepatologist";
  }

  if (observationsArray.length === 0) {
    observationsArray.push("- **General Biomarkers Profile**: Detected parameters fall mostly in acceptable standard baseline ranges, or custom test report needs further review.");
    recommendationsArray.push("- Continue standard healthy diet and hydration.\n- Annual preventative screening recommended.");
    referralType = "General Physician";
  }

  return `${header}### 📑 Mukhya Chinh (Observations):
${observationsArray.join("\n")}

### 🥗 Iska Kya Matlab Hai (Assessment):
- Upar diye gaye biomarkers thode badhe huye ya balanced level me lagte hain. Isko deep control me rakhna heart, kidney aur liver ki deergayu ke liye jaruri hai.

### 🥗 Aahar aur Vihar (Lifestyle & Diet):
${recommendationsArray.join("\n")}

### 🏥 Agla Kadam (Recommended Specialist Desk):
- Hum upar diye gaye clinical markers ke basis par aapko ek **${referralType}** se online ya nearest hospital me samay par consult karne ki salah de rahe hain.

---
${dis}`;
}


// 9. SUPER-AI DHANVANTARI JI (GEMINI API WITH SMART MEDICAL CONTEXT STRAP)
app.post("/api/gemini/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid format. 'messages' array expected." });
  }

  const userQuery = messages[messages.length - 1]?.content || "";

  // 1. GATHER DOCKING KNOWLEDGE FROM CORE JSON AT runtime (RAG)
  const db = getDatastore();
  
  // Compile highly structured markdown synopsis of the current verified hospital database and insurance
  const hospitalMapContext = db.hospitals.map(h => 
    `- Hospital: ${h.name}, Address: ${h.address}, City ${h.city}. Specialty: ${h.specialization.join(", ")}. Rating: ${h.rating}/5. ICU Available: ${h.icuBedsAvailable}/${h.icuBedsTotal}. Cashless: ${h.features.cashless ? "Yes" : "No"}, TPA Supported: ${h.features.tpaSupport ? "Yes" : "No"}.`
  ).join("\n");

  const treatmentContext = db.treatments.map(t => 
    `- Treatment: ${t.name}, Avg Cost: INR ${t.avgCost} (Range: INR ${t.minCost} - ${t.maxCost}), Hospitalization Stay: ${t.duration}.`
  ).join("\n");

  const schemeContext = db.schemes.map(s =>
    `- scheme: ${s.name}, Coverage: ${s.coverageAmount}, Eligibility: ${s.eligibility}. benefits: ${s.benefits.join(", ")}.`
  ).join("\n");

  // Format system instructions
  const systemInstruction = `You are "Dhanvantari Ji", India's most trusted, highly advanced, compassionate AI Healthcare Assistant and transparency guide on the "Sehat Setu" portal.
  
  Your primary domain has been expanded to solve ANY health care, wellness, clinical explanation, first-aid, or healthcare service navigation queries. You must follow these direct guidelines to provide highly detailed, professional, yet compassionate advice:

  1. HEALTHCARE & WELLNESS INQUIRIES:
     - Address queries on symptoms (e.g., cough, fever, digestive trouble, chronic fatigue, headaches), lifestyle modifications, and chronic disease management (Hypertension, Diabetes, Thyroid, joint paint, high cholesterol).
     - Provide highly detailed insights explaining the physiological/biological aspects of their query in simple, comforting language. Explain how the body processes work.
     - Suggest safe Home Remedies (Gharelu Nuskhe like turmeric milk/haldi-doodh for immunity, ginger-honey for sore throat, cumin-fennel water for digestion) and yoga or lifestyle recommendations (Aahar aur Vihar).

  2. CLINICAL DIAGNOSTICS & BIOMARKERS:
     - Solve inquiries regarding laboratory tests (CBC, Lipid Profile, Liver LFT, Kidney KFT, HbA1c, Thyroid panels).
     - Explain normal ranges, what high or low biomarkers represent biochemically, and guide patients on test preparation (like 8-12 hours fasting requirement).

  3. LOCAL HEALTHCARE SERVICES NAVIGATION (BIHAR / PATNA / GAYA / REGIONAL):
     - Check the user's condition and proactively suggest corresponding empanelled hospital partners from the Sehat Setu directory below.
     - For example, direct cardiac symptoms to specialized heart hospitals (like IGIMS, Patna Medical College PMCH, AIIMS Patna, Paras HMRI, or Magadh Medical), or orthopedic pain to ortho specialized empanelled clinics. Mention address and real-time live ICU bed availability when recommending.

  4. SURGERY COSTS & YOJANAS TRANSPARENCY:
     - Provide transparent pricing ranges for surgery procedures (e.g. Cataract, Heart bypass, Hernia, Appendectomy, Cholecystectomy) based on the standard treatment cost list.
     - Walk patients through Swasthya Yojana benefits (like Ayushman Bharat PM-JAY, Bihar Mukhyamantri Relief Cell) and document pre-requisites (NFSA Ration card, Aadhaar card, Biometric checks).

  5. MEDICINE SAFETY & FIRST AID:
     - You can explain how generic molecules work, basic physiological interactions, or standard first-aid actions (burns, wound sanitizing, NPO pre-surgery, recovery position and CPR guidelines).
     - CRITICAL SAFETY COMPLIANCE: Do not prescribe specific medicinal doses or confirm a final disease diagnosis. Encourage the user to utilize the Live Consultation panel on Sehat Setu to speak to a verified physician.
     - ALWAY inclusion: If the query suggests active medical diagnosis or prescription, write a clear, highly visible disclaimer stating: "Disclaimer: Main koi chikitskiya nidaan ya medical prescription nahi de sakti. Krupya doctor se paramarsh lein."

   Start with warm regional greetings like "Pranam" or "Namaste". Write in a highly helpful, engaging Hinglish/English style (regional style) to remain highly accessible.

  Use ONLY the following real-time portal database for hospital options, disease pricing and schemes when referring to Sehat Setu provider services:
  
  --- CURRENT VERIFIED HOSPITALS & BEDS ---
  ${hospitalMapContext}
  
  --- SURGERY TREATMENT STANDARD COSTS ---
  ${treatmentContext}
  
  --- GOVERNMENT HEALTH SCHEMES ---
  ${schemeContext}
  
  When answering, cite specific real costs and available ICU beds of our listings. Ensure you remain objective, factual, and extremely patient-friendly. Use formatted markdown with clear headings, bullet points, and highlight cards where relevant.`;

  const client = getAiClient();

  if (!client) {
    // Offline Rule Engine fallback if API key is not yet set
    const fallbackMessage = generateDhanvantariFallback(userQuery, db);
    return res.json({ text: fallbackMessage });
  }

  try {
    // Transform chat messages into format acceptable for @google/genai
    // We are translating user chat history to standard contents format.
    // Each can be a string prompt or structured content.
    const contentsPayload = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const outputText = response.text || "Pranam. Krupya main aapki kya seva kar sakti hoon?";
    res.json({ text: outputText });

  } catch (error: any) {
    console.error("Gemini assistant error:", error);
    res.status(500).json({ error: "Gemini server response error. Please verify your billing/secrets config." });
  }
});

// COMPASSIONATE OFFLINE RULE ENGINE FALLBACK (SO THE CHAT NEVER CRASHES OR FAILS)
function generateDhanvantariFallback(query: string, db: any): string {
  const q = query.toLowerCase();
  
  const disclaimer = "\n\n*(Chikitskiya Nidaan Disclaimer: Main ek AI assistant hoon. Main prescription ya sateek nidaan nahi kar sakti. Krupya doctor se paramarsh lein.)*";

  // Detailed symptoms - Fever / Cold / Cough
  if (q.includes("fever") || q.includes("bukhar") || q.includes("cough") || q.includes("sardi") || q.includes("cold") || q.includes("throat") || q.includes("gala")) {
    return `Pranam! Sardi, khansi aur bukhar (Fever & Cold) hone par body infection se lath rahi hoti hai. Aap in safe home remedies ka upyog kar sakte hain:
    
1. **Gharelu Nuskha (Home Remedy)**: 
   - Gala theek karne ke liye gunghune paani me thoda sa Sendha namak dalkar din me 3 baar gharara (saline gargles) karein.
   - Thoda adrak (ginger), tulsi ke patte, aur kali mirch (black pepper) ko paani me ubal kar katha banayein, thoda shahad (honey) milakar piyein.
2. **Aahar aur Vihar (Diet & Rest)**: Gunghuna paani piyein, thandi cheezein (ice cream, soft drinks) bilkul na lein aur body ko poora aaram (adequate rest) dein.
3. **Medical Guidelines**: Bukhar ko regular check karein. Agar temperature 101°F ya usse jyada hai block, to cold sponge karein. 

*Ayushman Support*: Sehat Setu par empanelled hospitals jaise **PMCH** aur **AIIMS Patna** me OPD desks available hain.
${disclaimer}`;
  }

  // Detailed symptoms - Diabetes / Sugar
  if (q.includes("sugar") || q.includes("diabetes") || q.includes("hba1c") || q.includes("madhumeh")) {
    return `Pranam! Diabetes (Sugar) ki samasya ko lifestyle badalkar control kiya ja sakta hai.
    
1. **Clinical Explanation**: Fasting Blood Sugar level 70-100 mg/dL normal mana jata hai. 126 mg/dL se upar diabetes represent karta hai. HbA1c test pichle 3 mahine ka average batata hai (Normal is <5.7%).
2. **Safe Lifestyle Tips (Aahar-Vihar)**:
   - High carbohydrate and sugar intake jaise cold-drinks, sweets, maida, white rice ko control karein.
   - Jamun ke beej ka powder, Karela juice, aur Methi seeds (soaked overnight) blood glucose normalize karne me help karte hain.
   - Daily subah 30-40 minute tez chalne (brisk walk) ki aadat dalein.
3. **Lab Support**: Aap hamare "Dhanvantari Reports AI Desk" se discharge summary aur diagnostic tests scan karke detailed monitoring kar sakte hain.

*Hospital Reference*: Diabetes treatment ke liye hamare Patna standard list me **IGIMS Patna** aur **Paras HMRI** super-specialist consultations pradaan karte hain.
${disclaimer}`;
  }

  // Detailed symptoms - Blood Pressure / BP / Hypertension
  if (q.includes("bp") || q.includes("blood pressure") || q.includes("hypertension") || q.includes("tension")) {
    return `Pranam! Blood Pressure (BP) ko normalize rakhna heart kidney and brain safety ke liye behad jaruri hai.
    
1. **Understanding Ranges**: Standard normal BP 120/80 mmHg hota hai. Agar BP lagatar 140/90 mmHg se zyada rehta hai to ise hypertension kehte hain.
2. **Safe Solutions (Home Care & Diet)**:
   - **Namak Kam Karein**: Khaane me namak (sodium) ki matra turant kam karein. Ek din me 1 chota chammach se zyada namak na lein.
   - **Herbal support**: Dhaniya churna ya Arjun chaal ka katha cardiovascular strength ke liye labhdayak hai. Learn deep breathing / Anulom Vilom yoga.
   - **Stress Management**: Sound sleep (7-8 hours) must hai. Alchol aur Smoking se poori tarah bachein.

*Emergency Desk*: Extreme high BP ke karan agar chest pain ya dizziness ho, to turant Sehat Setu Emergency directory se **Ambulance (102)** ya cardiac partners ko contact karein.
${disclaimer}`;
  }

  // Detailed symptoms - Digestion / Gas / Stomach ache / Indigestion / Acidity
  if (q.includes("gas") || q.includes("acidity") || q.includes("stomach") || q.includes("digestion") || q.includes("pait") || q.includes("kabz") || q.includes("constipation")) {
    return `Pranam! Pait ki samasya (Digestion & Acidity) poor dietary patterns ya water levels ki kami se hoti hai.
    
1. **Safe Remedies (Gharelu Nuskhe)**:
   - Acidity hone par ek glass thanda doodh (cold milk) piyein ya saunf (fennel) chabayyein.
   - Pet me gas ya bloating hone par thoda heeng (asafoetida) gunghune paani me milakar piyein ya nabhi par lagayein.
   - Cumin (Jeera) aur Coriander (Dhaniya) ka pani pait ko thandak deta hai.
2. **Dietary Changes**: Heavy, deep-fried, aur spicy food se parhez karein. Fiber-rich rich fruits (Papaya, Apple) shamil karein. Dinbhar kam se kam 3-4 liters paani zaroor piyein.
3. **Clinical Check**: Agar pait me unbearable pain ho, to self-prescribe karne se bachein.

*Referral Desk*: Hamare portal standard database me Gastroenterologist services available hain. Aap **Magadh Memorial** ya diagnostic clinics par physical booking check kar sakte hain.
${disclaimer}`;
  }

  // First Aid instructions
  if (q.includes("first aid") || q.includes("chot") || q.includes("accident") || q.includes("burn") || q.includes("bite") || q.includes("wound") || q.includes("cpr")) {
    return `Pranam! Emergency and First Aid situation me in baaton ka dhyan rakhein (while professional care arrives):

1. **Severe Bleeding (Khoon behna)**: Wound par turant ek saaf cloth se direct and steady pressure apply karein. Limb ko elevated position me rakhein.
2. **Minor Burns (Jal jana)**: Jale huye hissey par lagatar 10-15 minute tak behne wala thanda paani dalein. Ice cream ya heavy oils/butter turant na lagayein, issey infection badh sakta hai.
3. **Heat stroke**: Patient ko chhav (shade) aur hawadaar jagah par letayein. Body ko thande geele kapde se thanda karein aur hydrated rakhein.
4. **General guideline**: Hamare *Emergency Directory* tab par click karke direct state-level helpline numbers par call karein.

*Note*: Fast actions save lives! Sabhi local empanelled ambulance details Sehat Setu directory me live available hain.
${disclaimer}`;
  }

  // Basic search defaults for bed, cost, schemes
  if (q.includes("icu") || q.includes("bed") || q.includes("available")) {
    const list = db.hospitals.map((h: any) => `- **${h.name}** (${h.area}): ${h.icuBedsAvailable} ICU beds free out of ${h.icuBedsTotal}`).join("\n");
    return `Pranam! Hume AAPKE region mein up-to-date beds ki suchi mili hai:\n\n${list}\n\nAgar emergency hai to krupya seede hospital ke continuous helpline number par call karein.${disclaimer}`;
  }

  if (q.includes("cost") || q.includes("kharch") || q.includes("price") || q.includes("surgery") || q.includes("operation")) {
    const list = db.treatments.map((t: any) => `- **${t.name}**: Average Cost ₹${t.avgCost.toLocaleString('en-IN')} (Sarkari range starts from ₹${t.minCost.toLocaleString('en-IN')} to Private range up to ₹${t.maxCost.toLocaleString('en-IN')})`).join("\n");
    return `Pranam! Sehat Setu par hum transparent surgery pricing promote karte hain. Bihar ke top super-specialty network areawise average:\n\n${list}\n\nAyushman Bharat (PM-JAY) ke tehat inme se kai operations bilkul muft (Sarkari package under PM-JAY) ho sakte hain!${disclaimer}`;
  }

  if (q.includes("ayushman") || q.includes("yojana") || q.includes("scheme") || q.includes("sarkari")) {
    const list = db.schemes.map((s: any) => `- **${s.name}**: Covers up to ${s.coverageAmount}. Eligibility: ${s.eligibility}`).join("\n");
    return `Pranam! Sarkari Swasthya Yojanao ki jankari yahan hai:\n\n${list}\n\nAapko apply karne ke liye Aadhaar Card aur Ration card ki sateek aavashyakta hogi. Hamara empanelled hospital desk isme nishulk sahayata pradaan karega.`;
  }

  return `Pranam! Main Dhanvantari Ji hoon—aapki Sehat Setu Swasthya aur Healthcare Assistance guide.

Main aapko kisi bhi swasthya chinta (health symptoms/lifestyle), home remedies (gharelu nuskhe), lab biomarkers (reports analysis), hospital directory (beds availability) aur sarkari swasthya yojanao (Schemes like Ayushman Bharat) par sateek jankari de sakti hoon.

**Aap mujhse ye pucch sakte hain:**
1. **Symptoms & Remedies**: *"Mujhe pichle do din se khansi aur bukhar hai, kya karoon?"* ya *"BP aur Sugar normal karne ka tarika"*
2. **Clinical Details**: *"HbA1c test kya hota hai?"* ya *"Pregnancy me kya diet lene chahiye?"*
3. **Emergency & Services**: *"Patna ya Gaya me ICU beds kahan available hain?"* ya *"Surgical cost and yojana limits kya hain?"*

*Krupya puchiye, aapki kya seva karoon?* 
*(Note: Main prescription aur actual doses ka nirdharan nahi karti. Emergency me doctor clinic zaroor consult karein)*`;
}


// ==========================================
// VITE DEV / PRODUCTION MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with HMR off/watch settings...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production assets from ./dist...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`  SEHAT SETU - FULL STACK PORTAL CONNECTED SUCCESS`);
    console.log(`  Local Endpoint: http://localhost:${PORT}`);
    console.log(`  Development Preview is live on port ${PORT}`);
    console.log(`====================================================`);
  });
}

startServer();
