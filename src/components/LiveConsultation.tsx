import React, { useState, useEffect, useRef } from 'react';
import { Hospital, Doctor } from '../types';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  User, 
  CheckCircle2, 
  Heart, 
  Clipboard, 
  Play, 
  Check, 
  FileText, 
  Search, 
  Users, 
  Printer, 
  Award, 
  Stethoscope,
  Volume2,
  Calendar,
  Layers,
  Sparkle
} from 'lucide-react';

interface LiveConsultationProps {
  selectedCity?: string;
  hospitals?: Hospital[];
}

interface Message {
  sender: 'doctor' | 'patient';
  text: string;
  time: string;
}

export default function LiveConsultation({ selectedCity = 'Patna', hospitals = [] }: LiveConsultationProps) {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [onlineDoctors, setOnlineDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  
  // Active Consultation State
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
  const [consultationState, setConsultationState] = useState<'lobby' | 'onboarding' | 'connecting' | 'active' | 'completed'>('lobby');
  
  // Onboarding details
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [primaryComplaint, setPrimaryComplaint] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Call connection details
  const [connectionStep, setConnectionStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [simulatedPulse, setSimulatedPulse] = useState(72);
  const [doctorIsTyping, setDoctorIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentInputMessage, setCurrentInputMessage] = useState('');

  // E-Prescription state
  const [generatedRx, setGeneratedRx] = useState<any>(null);
  const [isRxSaved, setIsRxSaved] = useState(false);
  const [copiedRxMessage, setCopiedRxMessage] = useState(false);

  // References for video & timer
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Specialty arrays for options
  const specialtiesList = [
    "General Medicine", "Cardiology", "Neurology", "Pediatrics", "Obstetrics & Gynecology", "Oncology", "Orthopedics"
  ];

  // Fetch doctors and configure them as online
  useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then((data: Doctor[]) => {
        setAllDoctors(data);
      })
      .catch(err => console.error("Error fetching doctors for live consult:", err));
  }, []);

  // Filter doctors that belong to the selected city hospitals and mark pseudo-online
  useEffect(() => {
    if (allDoctors.length === 0) return;

    // Filter by city hospitals (if hospitals available)
    let cityHospIds = new Set(hospitals.filter(h => h.city.toLowerCase() === selectedCity.toLowerCase()).map(h => h.id));
    
    // Fallback if no hospitals match
    if (cityHospIds.size === 0) {
      cityHospIds = new Set(hospitals.slice(0, 5).map(h => h.id));
    }

    let filtered = allDoctors.filter(doc => cityHospIds.size === 0 || cityHospIds.has(doc.hospitalId));
    
    // Incase still empty, take some default doctors
    if (filtered.length === 0) {
      filtered = allDoctors.slice(0, 15);
    }

    // Assign online status (all doctors in this live consult tab can be consultable)
    // Add custom status and rating adjustments for live feel
    const formatted = filtered.map((doc, index) => {
      // Deterministic online statuses to feel realistic but stable
      return {
        ...doc,
        isOnline: true,
        consultCount: (doc.experience * 11) + (index % 7) * 4
      };
    });

    setOnlineDoctors(formatted);
  }, [allDoctors, hospitals, selectedCity]);

  // Connect Local Patient Camera if available
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera permissions not granted or camera not accessible in this context. Using custom placeholder canvas stream instead.", err);
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  // Connection orchestration
  useEffect(() => {
    if (consultationState !== 'connecting') return;

    const steps = [
      "Configuring WebRTC secure audio-visual tunnels...",
      "Resolving clinical node for " + (activeDoctor?.name || 'Specialist') + "...",
      "Testing local peer connection quality & bandwidth...",
      "Ringing specialist consult chamber...",
      "Secure end-to-end encrypted link active."
    ];

    setConnectionStep(0);
    const interval = setInterval(() => {
      setConnectionStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setConsultationState('active');
          startLiveCall();
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [consultationState]);

  // Handle call timer and vitals oscillations
  useEffect(() => {
    if (consultationState === 'active') {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
        setSimulatedPulse(p => {
          // Oscilate between 70 and 85
          const delta = Math.random() > 0.5 ? 1 : -1;
          const newVal = p + delta;
          return newVal > 85 ? 82 : newVal < 70 ? 73 : newVal;
        });
      }, 1000);

      // Trigger patient camera request
      startCamera();
    } else {
      clearInterval(callTimerRef.current);
      stopCamera();
    }

    return () => {
      clearInterval(callTimerRef.current);
      stopCamera();
    };
  }, [consultationState]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, doctorIsTyping]);

  // Initiate call dialogue
  const startLiveCall = () => {
    if (!activeDoctor) return;

    // Specialty based dialogue greetings
    const specialtyGreetings: Record<string, string> = {
      "Cardiology": `Pranam ${patientName || "Ji"}. Main Dr. ${activeDoctor.name.replace("Dr. ", "")} hoon, Sehat Setu Cardiology Cell se. Maine aapka complaint ("${primaryComplaint || "Chest pressure symptoms"}") dekha hai. Krupya batayein, kya aapko left-side me koi heavy pain, breathlessness, ya heavy sweat aa raha hai? Hamara system aapke active vitals receive kar raha hai.`,
      "Pediatrics": `Namaskar! Mein Dr. ${activeDoctor.name.replace("Dr. ", "")} hoon child care division se. Bachhe ki tabiyat kabse kharab hai? Kya unhe fever, diarrhea ya khansi me se kuch ho raha hai? Unka hydration level aur activity kaisi hai abhi?`,
      "Neurology": `Pranam. Neurology consult desk me aapka swagat hai. Main Dr. ${activeDoctor.name.replace("Dr. ", "")} hoon. Jo weakness ya migraine headaches aapne mention kiye hain, kya unse dizziness ya visual blurriness bhi ho rahi hai?`,
      "Obstetrics & Gynecology": `Hello, I'm Dr. ${activeDoctor.name.replace("Dr. ", "")}. This is a private consultation room. Let's discuss your symptoms regarding "${primaryComplaint || "General wellness review"}". How long have you had this concern?`,
      "Orthopedics": `Namaskar, joint & trauma management se mein Dr. ${activeDoctor.name.replace("Dr. ", "")}. Fracture suspection ya lumbar pain jo aapne share kiya hai, uski wajah se kya walking or lifting me immediate constraints hain?`,
      "Oncology": `Hello, I am Dr. ${activeDoctor.name.replace("Dr. ", "")}. I am reviewing your concerns. Please mention if this is a primary screening discussion, or if you already have diagnostic pathology reports with you?`,
      "General Medicine": `Pranam! Main Dr. ${activeDoctor.name.replace("Dr. ", "")} hoon. Aapke primary complaint ("${primaryComplaint || "Weakness/Fever symptoms"}") ke baare mein thoda details dein. Kyonki telemedicine consult hai, krupya fever ka exact temperature aur cold issues ke duration ke baare mein batayein.`
    };

    const initialGreet = specialtyGreetings[activeDoctor.specialty] || 
      `Pranam! Main Dr. ${activeDoctor.name.replace("Dr. ", "")} Sehat Setu clinical line se. Aapke bataye gaye symptoms ("${primaryComplaint || "General health review"}") ke baare mein thoda details batayein. Main sun rahi hoon.`;

    setChatMessages([
      {
        sender: 'doctor',
        text: initialGreet,
        time: getFormattedTime()
      }
    ]);
  };

  const getFormattedTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Patient Submits a Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInputMessage.trim() || !activeDoctor) return;

    const userMsg = currentInputMessage.trim();
    const currentMessages = [...chatMessages, {
      sender: 'patient' as const,
      text: userMsg,
      time: getFormattedTime()
    }];

    setChatMessages(currentMessages);
    setCurrentInputMessage('');
    setDoctorIsTyping(true);

    // Simulate doctor responding contextually
    setTimeout(() => {
      const docResponse = generateDoctorContextualResponse(userMsg, activeDoctor.specialty);
      setChatMessages(prev => [...prev, {
        sender: 'doctor' as const,
        text: docResponse,
        time: getFormattedTime()
      }]);
      setDoctorIsTyping(false);
    }, 1800);
  };

  // Mock Specialty Responses based on keyword triggers
  const generateDoctorContextualResponse = (input: string, specialty: string): string => {
    const text = input.toLowerCase();

    // Default responses based on specialty categories
    if (specialty === "Cardiology") {
      if (text.includes("chest") || text.includes("pain") || text.includes("pressure") || text.includes("dard")) {
        return "I understand. Severe chest pain radiating further requires instant diagnostic ECG. I am prescribing an immediate Tablet Sorbitrate 5mg (sublingual) in case blood pressure spikes, and suggesting a lipid profile. Please proceed to the nearest verified trauma center if breathing worsens.";
      }
      if (text.includes("bp") || text.includes("blood pressure") || text.includes("high") || text.includes("tension")) {
        return "High blood pressure can trigger cardiac strain. Please sit down, keep yourself calm, and drink warm water. I will add Tablet Amlong 5mg once daily to your routine. Avoid salty diet elements entirely.";
      }
      return "Got it. I am recording these parameters. I recommend taking regular ambulatory blood pressure readings twice daily. Let me prepare a telemetry Rx prescription for you containing daily cardioprotective guidelines.";
    }

    if (specialty === "Pediatrics") {
      if (text.includes("fever") || text.includes("bukhar") || text.includes("warm") || text.includes("temp")) {
        return "Fever is an immune response. If temperature exceeds 100°F, give Crocin Pediatric Syrup (Paracetamol 120mg/5ml), dosage is 5ml every 6 hours as needed. Wash foreheads with wet sponge. Do not use very cold water.";
      }
      if (text.includes("diarrhea") || text.includes("vomit") || text.includes("pachis") || text.includes("pait")) {
        return "Dehydration is the biggest concern. Dissolve 1 sachet of WHO-formulated ORS in 1 Liter clean drinking water and feed them small sips throughout the day. Continue light breastfeeds or standard milk but strictly avoid oily/solid meals.";
      }
      return "Okay. I'm adding safe, weight-graded pediatric drops (Vitamin D3 and baby multivitamins) to keep their metabolic immunity active. I will compile this in the digital prescription slip shortly.";
    }

    if (specialty === "General Medicine") {
      if (text.includes("fever") || text.includes("bukhar") || text.includes("headache") || text.includes("dard")) {
        return "Understood. For general fever & body ache symptoms, we can initiate Tablet Paracetamol 650mg thrice daily after meals for 3 days. Please measure temperature every 6 hours and log them. Let me know if you also suffer from throat congestion?";
      }
      if (text.includes("cough") || text.includes("khansi") || text.includes("cold") || text.includes("sardi")) {
        return "For respiratory cold & wet cough, use Tablet Levocetirizine 5mg (once daily at night) and steam inhalation with Vicks twice daily. Maintain warm saline gargles. I'm noting this in the treatment sheet.";
      }
      return "Accha, got it. It seems to be a viral malaise. Keep highly hydrated with herbal kadhas, plenty of soup fluids, and take sufficient rest. I will write a broad-spectrum supportive prescription to get you back on track.";
    }

    // Generic follow up
    return `Alright. I have reviewed your feedback. To support your query, I will prescribe safe clinical guidelines for "${primaryComplaint || "this concern"}", which includes a standard therapeutic multi-vitamin schedule, diagnostic recommendations, and a quick reference chart. Generating your Sehat Tele-Consult prescription draft now.`;
  };

  // Launch Onboarding
  const handleOpenOnboarding = (doctor: Doctor) => {
    setActiveDoctor(doctor);
    setPatientName('');
    setPatientAge('');
    setPrimaryComplaint('');
    setContactPhone('');
    setConsultationState('onboarding');
  };

  // Submit Details and Connect
  const handleSubmitOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientAge || !contactPhone) {
      alert("Please fill your name, age, and telephone number to acquire the clinical slot.");
      return;
    }
    setConsultationState('connecting');
  };

  // Conclude Call and write E-Prescription
  const handleConcludeCall = async () => {
    if (!activeDoctor) return;

    // Build prescription payload
    const specialtyMeds: Record<string, any[]> = {
      "Cardiology": [
        { name: "Tab. Amlong 5mg", dosage: "1-0-0 (Morning after food)", duration: "30 Days", purpose: "Hypertension / BP management" },
        { name: "Tab. Atorva 10mg", dosage: "0-0-1 (Night post food)", duration: "30 Days", purpose: "Cholesterol & cardiac protection" },
        { name: "Tab. Sorbitrate 5mg", dosage: "S.O.S (Sublingual under intense pain)", duration: "10 Days", purpose: "Vasodilator" }
      ],
      "Pediatrics": [
        { name: "Syr. Crocin Pediatric (120mg/5ml)", dosage: "5ml (thrice daily if fever > 99.8 F)", duration: "3 Days", purpose: "Antipyretic / Pain fever relief" },
        { name: "Syr. Vizylac (Probiotics)", dosage: "2.5ml (twice daily)", duration: "5 Days", purpose: "Restore gut microflora" },
        { name: "Sachet Electral ORS", dosage: "1 packet in 1L water (sip continuously)", duration: "As needed", purpose: "Avoid clinical dehydration" }
      ],
      "Neurology": [
        { name: "Tab. Vasograin", dosage: "1 tablet S.O.S at onset of severe migraine", duration: "10 Days", purpose: "Anti-migraine action" },
        { name: "Tab. Neurobion Forte", dosage: "0-1-0 (Noon time after meals)", duration: "30 Days", purpose: "Nerve health & B-Complex booster" }
      ],
      "General Medicine": [
        { name: "Tab. Paracetamol 650mg (Dolo)", dosage: "1-0-1 (Thrice daily under fever)", duration: "3 Days", purpose: "Antipyretic" },
        { name: "Tab. Montek-LC", dosage: "0-0-1 (Night time post meals)", duration: "5 Days", purpose: "Allergy, sneezing & rhinitis control" },
        { name: "Syr. Grilinctus Cough Syrup", dosage: "10ml (thrice daily with warm water)", duration: "5 Days", purpose: "Soothe bronchial airway passages" }
      ]
    };

    const defaultMeds = [
      { name: "Tab. Limcee 500mg (Vitamin C)", dosage: "1-0-0 (Chewable post breakfast)", duration: "15 Days", purpose: "Immunity and tissues recovery booster" },
      { name: "Tab. Zincovit (Multivitamin)", dosage: "0-0-1 (Night time post food)", duration: "15 Days", purpose: "Antioxidant & metabolic support" }
    ];

    const drugs = specialtyMeds[activeDoctor.specialty] || defaultMeds;
    const diagnosis = activeDoctor.specialty === "Cardiology" ? "Hypertension / Coronary suspect with chest discomfort triggers" :
                    activeDoctor.specialty === "Pediatrics" ? "Acute Pediatric Gastro-enteritis symptoms / Viral pyrexia suspect" :
                    activeDoctor.specialty === "Neurology" ? "Vascular headache / Neuropathic localized migraine" :
                    "Acute Upper Respiratory Tract Congestion & Secondary viral malaise";

    const rxSlip = {
      rxId: "RX-" + Date.now().toString().slice(6),
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      doctorName: activeDoctor.name,
      doctorSpecialty: activeDoctor.specialty,
      doctorHospital: activeDoctor.hospitalName,
      doctorQualifications: activeDoctor.degree + " • MCI Reg No: " + Math.floor(10000 + Math.random() * 90000) + "/BR",
      patientName: patientName,
      patientAge: patientAge,
      patientGender: patientGender,
      patientContact: contactPhone,
      diagnosis: diagnosis,
      medications: drugs,
      advice: "Drink plenty of boiled warm fluids. Monitor core temperature and blood pressure regularly. Avoid oil and heavy salt items for up to 5 days. For any clinical deterioration, head straight to nearby empanelled emergency unit."
    };

    setGeneratedRx(rxSlip);
    setIsRxSaved(false);
    setConsultationState('completed');
  };

  // Save consultation to backend database permanently
  const saveRxToDatabase = async () => {
    if (!generatedRx || !activeDoctor) return;

    try {
      // POST as a completed telehealth transaction to Sehat Setu core registry
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: generatedRx.patientName,
          patientAge: Number(generatedRx.patientAge),
          patientGender: generatedRx.patientGender,
          contactNumber: generatedRx.patientContact,
          hospitalId: activeDoctor.hospitalId,
          hospitalName: activeDoctor.hospitalName,
          doctorId: activeDoctor.id,
          doctorName: activeDoctor.name,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Completed',
          notes: `[TELE-CONSULT SLIP ${generatedRx.rxId}] Selected Diagnosis: ${generatedRx.diagnosis}. Prescribed: ${generatedRx.medications.map((m: any) => m.name).join(", ")}. Advice: ${generatedRx.advice}`
        })
      });

      if (response.ok) {
        setIsRxSaved(true);
        // Fire administrative audit trail for medical safety compliance
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospitalId: activeDoctor.hospitalId,
            userName: `Dhanvantari Tele-Consult Desk: ${generatedRx.patientName}`,
            comment: `[VIRTUAL OUT-PATIENT SERVICE completed via video peer cell under prescription ${generatedRx.rxId} with Specialist Dr. ${activeDoctor.name}]`,
            rating: 5,
            care: 5,
            cost: 5,
            queue: 5
          })
        });
      }
    } catch (err) {
      console.error("Failed to commit telehealth records:", err);
    }
  };

  // Filter list of specialists currently available
  const filteredSpecialists = onlineDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = () => {
    if (!generatedRx) return;
    const textOutput = `
=== SEHAT SETU TELEHEALTH Prescriber Slip ===
Rx ID: ${generatedRx.rxId} | Date: ${generatedRx.date}
Clinician: ${generatedRx.doctorName} (${generatedRx.doctorSpecialty})
Association: ${generatedRx.doctorHospital}
Qualifications: ${generatedRx.doctorQualifications}

Patient Name: ${generatedRx.patientName} | Age: ${generatedRx.patientAge} | Gender: ${generatedRx.patientGender}
Clinical Diagnosis: ${generatedRx.diagnosis}

PRESCRIPTION LIST:
${generatedRx.medications.map((m: any, idx: number) => `${idx + 1}. ${m.name} -- ${m.dosage} -- for ${m.duration} (Usage: ${m.purpose})`).join("\n")}

SUPPORTIVE ADVICE:
${generatedRx.advice}
===========================================
`;
    navigator.clipboard.writeText(textOutput);
    setCopiedRxMessage(true);
    setTimeout(() => setCopiedRxMessage(false), 2000);
  };

  return (
    <div className="space-y-6" id="specialist-live-consult-widget">
      
      {/* 24x7 Triage Header Banner */}
      <div className="bg-gradient-to-r from-emerald-850 to-[#0F9D58] border border-[#0F9D58]/15 rounded-[20px] p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-3xs">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-white/10 text-yellow-350 rounded-2xl flex items-center justify-center shrink-0 shadow-xs animate-pulse">
            <Video className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] bg-emerald-500/30 text-emerald-100 font-extrabold uppercase tracking-wide border border-emerald-500/25">
              <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" /> Live Clinicians Connected
            </span>
            <h2 className="text-xl font-sans font-black tracking-tight leading-none text-white">
              Instant Specialist Consult Video Desk
            </h2>
            <p className="text-xs text-white/95 max-w-2xl font-serif leading-relaxed">
              Facing localized medical issues? Complete a secure virtual out-patient consultation room, connect securely with top doctors of {selectedCity}, chat via clinical pipelines, and generate instant validated E-Prescriptions with digitized diagnostic references.
            </p>
          </div>
        </div>
        <div className="bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl text-center self-stretch md:self-auto flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase text-emerald-200 tracking-wider">Triage Waiting Rate</span>
          <span className="text-lg font-mono font-black text-yellow-300">Under 4 Mins</span>
        </div>
      </div>

      {/* LOBBY VIEW - Search and list Active Teleconsultants */}
      {consultationState === 'lobby' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Filtering desk */}
          <div className="bg-white border border-[#dadce0] p-4 rounded-[16px] shadow-3xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Quick search input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search online cardiovascular surgeons, pediatricians, general doctors, orthopedics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#dadce0] hover:border-gray-400 focus:border-[#0F9D58] focus:bg-white focus:outline-hidden text-xs pl-10 pr-4 py-3 rounded-xl transition-all font-semibold"
              />
            </div>

            {/* Selector specialty filter */}
            <div className="flex bg-[#F1F3F4] border border-[#dadce0] p-1 rounded-xl shrink-0 gap-1 overflow-x-auto w-full md:w-auto">
              <button
                onClick={() => setSelectedSpecialty('all')}
                className={`flex-1 md:flex-none px-3.5 py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedSpecialty === 'all' ? "bg-gray-850 text-white shadow-xs" : "text-gray-650 hover:text-gray-900"
                }`}
              >
                All Specialists
              </button>
              {specialtiesList.map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3.5 py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedSpecialty === spec ? "bg-[#0F9D58] text-white shadow-xs" : "text-gray-650 hover:text-gray-900"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Clinicians roster grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSpecialists.length === 0 ? (
              <div className="col-span-full bg-white border border-[#dadce0] rounded-24 p-12 text-center text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-800">No active teleconsultants registered online right now.</p>
                <p className="text-xs text-gray-400 mt-1">Please try modifying filters or toggle city search networks.</p>
              </div>
            ) : (
              filteredSpecialists.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-white border border-[#dadce0] hover:border-[#0F9D58]/35 rounded-[18px] p-4.5 shadow-3xs hover:shadow-2xs transition-all duration-200 flex flex-col justify-between gap-4 group"
                >
                  <div className="flex gap-4">
                    <div className="relative shrink-0 self-start">
                      <img 
                        src={doc.image} 
                        alt={doc.name} 
                        className="w-16 h-16 rounded-2xl object-cover border border-emerald-100 shadow-3xs"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#0F9D58] rounded-full border-2 border-white animate-pulse" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] bg-emerald-50 text-[#0F9D58] font-black uppercase tracking-wider px-2 py-0.5 border border-emerald-100 rounded-sm">
                          {doc.specialty}
                        </span>
                        <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                          ★ {doc.rating}
                        </span>
                      </div>

                      <h3 className="font-sans font-black text-gray-900 text-sm truncate leading-none pt-0.5 group-hover:text-[#0F9D58] transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] font-bold text-gray-550 truncate">
                        {doc.degree}
                      </p>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pt-0.5">
                        {doc.experience}+ Yers Experience
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-150 space-y-2.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-gray-400 uppercase tracking-wider text-[9px] font-bold block">Hospital Node</span>
                        <span className="text-gray-700 font-bold max-w-[160px] truncate block">{doc.hospitalName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 uppercase tracking-wider text-[9px] font-bold block">Cons. Fee</span>
                        <span className="text-[#0F9D58] font-black text-xs">₹{doc.fee} <span className="text-[9px] text-gray-400">(Nishulk PMJAY Card)</span></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenOnboarding(doc)}
                      className="w-full bg-[#0F9D58] hover:bg-[#0b8043] font-black text-white py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5 animate-bounce" />
                      Consult Specialist Live
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* STEP 1: ONBOARDING CLINICAL INTAKE DETAILS */}
      {consultationState === 'onboarding' && activeDoctor && (
        <div className="max-w-xl mx-auto bg-white border border-[#dadce0] rounded-34 p-6 sm:p-8 shadow-3xs animate-fade-in space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-[#0F9D58] rounded-2xl flex items-center justify-center mx-auto shadow-3xs">
              <Clipboard className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-black text-gray-900 text-base uppercase tracking-wider">Clinical Intake Protocol</h3>
            <p className="text-xs text-gray-500">
              Provide the outpatient vital details to establish the secure regulatory clinical case sheet under the Bihar Telehealth Act.
            </p>
          </div>

          {/* Quick Doctor Summary indicator */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 flex items-center gap-3.5">
            <img src={activeDoctor.image} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 border border-emerald-100" />
            <div>
              <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded-sm inline-block">{activeDoctor.specialty}</span>
              <h4 className="font-sans font-black text-xs text-gray-900 mt-0.5">{activeDoctor.name}</h4>
              <p className="text-[10px] text-gray-500 font-medium">Outpatient Video Portal Node: {activeDoctor.hospitalName}</p>
            </div>
          </div>

          <form onSubmit={handleSubmitOnboarding} className="space-y-4 text-xs text-gray-700">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PATIENT FULL NAME</label>
              <input 
                type="text" 
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Chandra Mishra"
                className="w-full bg-gray-50 border border-gray-250 p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white text-xs font-semibold text-gray-750"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PATIENT AGE</label>
                <input 
                  type="number" 
                  required
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-gray-50 border border-gray-250 p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white text-xs font-semibold text-gray-750"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">GENDER</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full bg-gray-50 border border-[#dadce0] p-3 rounded-xl cursor-pointer text-xs font-semibold text-gray-750"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">CONTACT PHONE NUMBER (OTP VERIFIED LINKED)</label>
              <input 
                type="tel" 
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 98350XXXXX"
                className="w-full bg-gray-50 border border-gray-250 p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white text-xs font-semibold text-gray-750"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PRIMARY COMPLAINT & SYMPTOM DETAILS</label>
              <textarea 
                required
                rows={3}
                value={primaryComplaint}
                onChange={(e) => setPrimaryComplaint(e.target.value)}
                placeholder="e.g. Sudden headache, elevated anxiety, joint mobility constraints since 2 days, etc."
                className="w-full bg-gray-50 border border-gray-250 p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white text-xs font-medium text-gray-750"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setConsultationState('lobby')}
                className="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-extrabold uppercase py-3 border border-gray-250 rounded-xl transition-colors cursor-pointer"
              >
                Abandone
              </button>
              <button 
                type="submit"
                className="flex-1 bg-[#0F9D58] hover:bg-[#0b8043] text-white font-extrabold uppercase py-3 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Launch Consult Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: HANDSHAKE & TELEMETRY DIALING STATE */}
      {consultationState === 'connecting' && activeDoctor && (
        <div className="max-w-md mx-auto bg-white border border-[#dadce0] rounded-34 p-8 text-center space-y-6 shadow-3xs animate-fade-in">
          
          {/* Dialing Pulse Graphic */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Pulsing visual circles */}
            <span className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/10 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-emerald-500/20 border border-emerald-500/20 animate-pulse" />
            <div className="relative w-16 h-16 bg-[#0F9D58] text-white rounded-3xl flex items-center justify-center shadow-md">
              <Activity className="w-8 h-8 animate-bounce text-yellow-300" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-sans font-black text-gray-900 text-base uppercase tracking-wider">Establishing Encrypted Link</h3>
            <p className="text-xs text-[#0F9D58] font-bold uppercase tracking-widest">dialing Dr. {activeDoctor.name.replace("Dr. ", "")}</p>
          </div>

          {/* Incremental visual progress indicator */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 text-left min-h-[90px] flex items-center">
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#0F9D58] mt-1.5 shrink-0 animate-ping" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Clinical Sync Pipeline</span>
                <p className="text-xs text-gray-700 font-bold leading-relaxed">
                  {connectionStep === 0 && "Configuring WebRTC secure audio-visual tunnels..."}
                  {connectionStep === 1 && "Resolving clinical node for " + activeDoctor.name + "..."}
                  {connectionStep === 2 && "Testing local peer connection quality & bandwidth..."}
                  {connectionStep === 3 && "Ringing specialist consult chamber..."}
                  {connectionStep === 4 && "Encryption handshake successful. Commencing consult."}
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Sehat Setu Telemetry Network ID: SECURE-RTC-{Date.now().toString().slice(6)}
          </div>
        </div>
      )}

      {/* STEP 3: ACTIVE VIDEO CALL CONSULTATION CONSOLE */}
      {consultationState === 'active' && activeDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in" id="consultation-active-layout">
          
          {/* Main Peer Stream Frame Left Side (Col 8) */}
          <div className="lg:col-span-8 flex flex-col bg-slate-950 rounded-[28px] overflow-hidden border-2 border-slate-900 relative shadow-2xl min-h-[480px]">
             
             {/* Vitals telemetry and header indicators on top */}
             <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-[#0F9D58] animate-ping" />
                 <div>
                   <span className="text-[11px] font-black text-white block">Dr. {activeDoctor.name}</span>
                   <span className="text-[9px] text-[#0F9D58] uppercase font-bold block leading-none">{activeDoctor.specialty} • Tele-Presence</span>
                 </div>
               </div>

               <div className="flex items-center gap-3 text-xs font-bold font-mono text-white">
                 <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                   <Clock className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                   <span>{formatDuration(callDuration)}</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-rose-400">
                   <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                   <span>{simulatedPulse} bpm</span>
                 </div>
               </div>
             </div>

             {/* Peer Specialist Main Video Screen container */}
             <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-950 p-6">
                
                {/* Simulated specialist feed */}
                <div className="text-center space-y-4 relative z-10">
                  <div className="relative max-w-max mx-auto">
                    <img 
                      src={activeDoctor.image} 
                      alt="" 
                      className={`w-36 h-36 rounded-full object-cover border-4 border-emerald-500/50 shadow-md ${
                        isVideoOff ? '' : 'scale-105 duration-500'
                      }`} 
                    />
                    <span className="absolute bottom-2 right-2 p-2 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold border-2 border-slate-950">
                      LIVE
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-slate-250 font-black text-sm uppercase tracking-wider">{activeDoctor.name}</h4>
                    <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">{activeDoctor.hospitalName}</p>
                  </div>

                  {/* Pulsing Visualizer wave bars based on speaking state */}
                  <div className="flex items-center justify-center gap-1 h-8">
                    {[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3].map((val, idx) => (
                      <span 
                        key={idx} 
                        className="w-1 bg-[#0F9D58] rounded-full transition-all duration-300"
                        style={{ 
                          height: doctorIsTyping ? `${4 + Math.random() * 4}px` : `${6 + Math.sin(callDuration + idx) * 16}px`,
                          opacity: isMuted ? 0.2 : 1
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Patient Camera feedback bubble floating in bottom right */}
                <div className="absolute bottom-20 right-4 w-32 h-44 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl z-10 flex flex-col justify-between">
                  {isVideoOff ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-550 space-y-1 p-2">
                      <VideoOff className="w-6 h-6 text-slate-600" />
                      <span className="text-[9px] uppercase tracking-wider font-extrabold">Feed Off</span>
                    </div>
                  ) : (
                    <div className="relative flex-1 bg-black">
                      <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      {/* Heartbeat feedback canvas if no cam output */}
                      {!localStreamRef.current && (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-[10px] space-y-1.5 p-3">
                          <Heart className="w-6 h-6 text-emerald-500 animate-pulse" />
                          <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-center leading-tight">Patient Video Secure</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="bg-slate-950 text-slate-400 font-mono text-[8.5px] p-1.5 border-t border-slate-800 truncate text-center uppercase tracking-widest font-bold">
                    {patientName || "Bystander"}
                  </div>
                </div>

                {/* Subtitles transcription on bottom overlay */}
                <div className="absolute bottom-18 left-4 right-4 z-15 bg-slate-900/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-800 max-w-xl mx-auto">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Volume2 className="w-3.5 h-3.5 text-[#0F9D58]" />
                    <span className="text-[9px] uppercase text-emerald-400 font-extrabold tracking-widest">Speech transcription (Hindi/English)</span>
                  </div>
                  <p className="text-xs text-slate-100 font-medium italic select-all leading-relaxed">
                    {doctorIsTyping ? (
                      <span className="animate-pulse">Dr. {activeDoctor.name.replace("Dr. ", "")} is preparing diagnostic guidelines...</span>
                    ) : (
                      chatMessages.filter(m => m.sender === 'doctor').slice(-1)[0]?.text || "Link established. Discussing primary healthcare complaints."
                    )}
                  </p>
                </div>

             </div>

             {/* Call Control deck floating at absolute bottom */}
             <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between gap-4 z-20">
               <div className="flex gap-2">
                 <button
                   onClick={() => setIsMuted(!isMuted)}
                   className={`p-3 rounded-xl cursor-pointer border transition-colors ${
                     isMuted 
                       ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30' 
                       : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                   }`}
                   title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                 >
                   {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                 </button>
                 <button
                   onClick={() => setIsVideoOff(!isVideoOff)}
                   className={`p-3 rounded-xl cursor-pointer border transition-colors ${
                     isVideoOff 
                       ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30' 
                       : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                   }`}
                   title={isVideoOff ? 'Enable Video Feed' : 'Disable Video Feed'}
                 >
                   {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                 </button>
               </div>

               <div className="max-w-xs text-slate-500 font-mono text-[9px] uppercase tracking-widest hidden md:block">
                 Peer pipeline: 48kbps opus • full encryption sha-256
               </div>

               <button
                 onClick={handleConcludeCall}
                 className="bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase px-6 py-2.5 rounded-xl text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
               >
                 <PhoneOff className="w-4 h-4" />
                 Conclude Call & Write Rx
               </button>
             </div>

          </div>

          {/* Text Chat side panel Right Side (Col 4) */}
          <div className="lg:col-span-4 bg-white border border-[#dadce0] rounded-[28px] overflow-hidden flex flex-col shadow-3xs min-h-[480px]">
             
             {/* Pane header */}
             <div className="bg-slate-50 border-b border-gray-150 p-4 shrink-0 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Stethoscope className="w-4 h-4 text-[#0F9D58]" />
                 <span className="text-[11px] uppercase tracking-widest font-black text-gray-900 font-sans">Specialist Chat Log</span>
               </div>
               <span className="bg-emerald-50 text-[#0F9D58] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                 Interactive
               </span>
             </div>

             {/* Message Scroller */}
             <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${msg.sender === 'patient' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-wide block mb-0.5">
                      {msg.sender === 'patient' ? 'You' : `Dr. ${activeDoctor.name.replace("Dr. ", "")}`} • {msg.time}
                    </span>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold transition-all ${
                      msg.sender === 'patient' 
                        ? 'bg-slate-800 text-white rounded-br-none shadow-3xs' 
                        : 'bg-white border text-gray-800 rounded-bl-none shadow-3xs border-gray-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {doctorIsTyping && (
                  <div className="mr-auto max-w-[85%] flex items-center gap-1.5 bg-white border border-gray-150 rounded-2xl p-3 shadow-3xs text-[10px] text-gray-500 font-medium">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                    <span>Doctor Rajesh writing...</span>
                  </div>
                )}
                
                <div ref={chatEndRef} />
             </div>

             {/* Input writer */}
             <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-150 shrink-0 bg-white flex gap-2">
               <input 
                 type="text"
                 value={currentInputMessage}
                 onChange={(e) => setCurrentInputMessage(e.target.value)}
                 placeholder="Type symptom details or reply..."
                 className="flex-1 bg-gray-50 border border-gray-250 rounded-xl px-3 text-xs focus:outline-hidden focus:border-[#0F9D58] focus:bg-white text-gray-800 font-semibold"
               />
               <button 
                 type="submit"
                 disabled={!currentInputMessage.trim()}
                 className="bg-slate-800 hover:bg-slate-900 disabled:bg-gray-200 text-white font-extrabold px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
               >
                 Send
               </button>
             </form>

          </div>

        </div>
      )}

      {/* STEP 4: SEHAT NETWORK TELEHEALTH OFFICIAL E-PRESCRIPTION VIEW */}
      {consultationState === 'completed' && generatedRx && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" id="completed-completed-pane">
          
          <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-[24px] text-center space-y-3.5">
            <div className="w-10 h-10 bg-[#0F9D58] text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sans font-black text-gray-900 text-sm uppercase tracking-wider">Tele-Consultation Completed Successfully!</h3>
              <p className="text-xs text-gray-650 leading-relaxed max-w-lg mx-auto font-medium">
                Your virtual out-patient session with <strong>{generatedRx.doctorName}</strong> was logged under secure Telehealth registration guidelines. The certified medical prescription is drafts below.
              </p>
            </div>
          </div>

          {/* PRESCRIPTION MEMO BLOCK */}
          <div className="bg-white border border-[#dadce0] rounded-34 p-6 sm:p-8 shadow-md space-y-6 font-sans relative overflow-hidden" id="prescription-digital-sheet">
             
             {/* Seal backdrop watermark decoration */}
             <div className="absolute top-24 right-10 text-emerald-500/5 rotate-12 shrink-0 pointer-events-none hidden sm:block">
               <Award className="w-72 h-72" />
             </div>

             {/* Header Letterhead section */}
             <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-200">
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <div className="w-7 h-7 bg-[#0F9D58] rounded-lg flex items-center justify-center">
                     <Stethoscope className="text-white w-4.5 h-4.5" />
                   </div>
                   <span className="font-sans font-black text-sm text-gray-900 tracking-tight flex items-center gap-1">
                     SEHAT SETU <span className="text-[#0F9D58] text-xs font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-md">telehealth</span>
                   </span>
                 </div>
                 <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Bihar Clinical Wellness Group (Digital Outpatient Desk)</p>
                 <span className="text-[10px] block font-mono text-gray-400">{generatedRx.doctorQualifications}</span>
               </div>

               <div className="text-right space-y-1">
                 <h4 className="font-mono font-black text-gray-900 text-[11px] bg-gray-100 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                   SLIP ID: {generatedRx.rxId}
                 </h4>
                 <div className="text-[10.5px] text-gray-750 font-bold flex items-center gap-1 justify-end">
                   <Calendar className="w-3.5 h-3.5 text-gray-400" />
                   <span>Date: {generatedRx.date}</span>
                 </div>
                 <p className="text-[10px] text-gray-400 font-extrabold uppercase">{generatedRx.doctorHospital}</p>
               </div>
             </div>

             {/* Patient & Diagnosis details layout split */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-150 rounded-2xl text-[11.5px] text-gray-700">
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <User className="w-3.5 h-3.5 text-gray-400" />
                   <span className="font-semibold text-gray-400 uppercase text-[9.5px] tracking-widest">PATIENT DETAILS:</span>
                 </div>
                 <div className="space-y-1 font-bold text-gray-800">
                   <p className="text-sm font-sans font-black text-gray-900">{generatedRx.patientName}</p>
                   <p className="text-xs text-gray-550 mt-0.5">
                     Age / Gender: {generatedRx.patientAge} Years / {generatedRx.patientGender}
                   </p>
                   <p className="text-[10.5px] text-gray-500 font-mono">Mobile: +91 {generatedRx.patientContact}</p>
                 </div>
               </div>

               <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4">
                 <div className="flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5 text-gray-400" />
                   <span className="font-semibold text-gray-400 uppercase text-[9.5px] tracking-widest">PROVISIONAL DIAGNOSIS:</span>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[11.5px] font-black text-[#0F9D58] leading-tight">
                     {generatedRx.diagnosis}
                   </p>
                   <p className="text-[10px] text-gray-500 font-medium">
                     Primary outflow complaint: "{primaryComplaint || "General malaise"}"
                   </p>
                 </div>
               </div>
             </div>

             {/* Core Rx Drugs medications Table */}
             <div className="space-y-3">
               <div className="flex items-center gap-1.5 pb-1 border-b border-gray-100">
                 <span className="text-[12px] font-black font-serif text-[#0F9D58] italic mr-1">Rₓ</span>
                 <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 pt-0.5">Clinical Prescription Treatments</span>
               </div>

               <div className="overflow-x-auto text-[11.5px]">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-gray-200 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                       <th className="py-2">Medication Form / Composition Strength</th>
                       <th className="py-2 text-center">Dosage Frequency</th>
                       <th className="py-2 text-center">Duration</th>
                       <th className="py-2 text-right">Primary Indication</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                     {generatedRx.medications.map((med: any, idx: number) => (
                       <tr key={idx}>
                         <td className="py-3 pr-2 font-black text-gray-950">{med.name}</td>
                         <td className="py-3 text-center text-gray-700 font-mono text-[10.5px]">{med.dosage}</td>
                         <td className="py-3 text-center">{med.duration}</td>
                         <td className="py-3 text-right text-gray-550 text-[10.5px]">{med.purpose}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>

             {/* Supportive Clinical directions */}
             <div className="bg-slate-50 p-4 border rounded-2xl border-gray-150 space-y-1.5">
               <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0F9D58] flex items-center gap-1">
                 <CheckCircle2 className="w-3 h-3" /> CLINICIAN DIRECTIVE & FOLLOW-UP ADVICE:
               </span>
               <p className="text-xs text-gray-650 leading-relaxed font-semibold">
                 {generatedRx.advice}
               </p>
             </div>

             {/* Regulatory seal compliance with simulated signature line */}
             <div className="flex justify-between items-end gap-6 pt-6 border-t border-gray-200">
               <div>
                  <span className="text-[9px] text-[#0F9D58] bg-emerald-50 border border-emerald-100 rounded-sm font-black uppercase px-2 py-0.5 inline-block tracking-wider">
                    sehat setu clinically verified
                  </span>
                  <p className="text-[9px] text-gray-400 font-semibold max-w-sm mt-1 mb-0.5">
                    This document is digitally validated under Section 5(1) of the Telemedicine Practice Guidelines, India. Valid prescription is copyable.
                  </p>
               </div>

               <div className="text-right shrink-0">
                 {/* Simulated custom signature font path */}
                 <div className="font-serif italic text-emerald-700 text-lg font-bold pr-2 translate-y-2">
                   Dr. {generatedRx.doctorName.replace("Dr. ", "")}
                 </div>
                 <div className="w-36 h-0.5 bg-gray-300 mt-2 ml-auto" />
                 <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide block pt-1">Medical Specialist Signature</span>
               </div>
             </div>

          </div>

          {/* Action Bar controls */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
             <button
               onClick={saveRxToDatabase}
               disabled={isRxSaved}
               className={`flex-1 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 ${
                 isRxSaved 
                   ? 'bg-emerald-100 text-[#0F9D58] border border-emerald-250 cursor-default' 
                   : 'bg-[#0F9D58] hover:bg-[#0b8043] text-white hover:text-emerald-50'
               }`}
             >
               {isRxSaved ? (
                 <>
                   <Check className="w-4 h-4 animate-bounce" />
                   Consultation Logged & Locked in Database
                 </>
               ) : (
                 <>
                   <Clipboard className="w-4 h-4" />
                   Save Record and Log Appointment completed
                 </>
               )}
             </button>

             <button
               onClick={handleCopyToClipboard}
               className="bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
             >
               {copiedRxMessage ? (
                 <>
                   <Check className="w-4 h-4 text-emerald-400" />
                   Prescription Copied!
                 </>
               ) : (
                 <>
                   <FileText className="w-4 h-4" />
                   Copy Raw Slip Data
                 </>
               )}
             </button>

             <button
               onClick={() => {
                 setActiveDoctor(null);
                 setConsultationState('lobby');
                 setIsRxSaved(false);
               }}
               className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors cursor-pointer shrink-0"
             >
               Return to Lobby
             </button>
          </div>

        </div>
      )}

    </div>
  );
}
