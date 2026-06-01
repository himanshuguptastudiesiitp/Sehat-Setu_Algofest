import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Activity, 
  FileText, 
  Sparkles, 
  Clock, 
  Calendar, 
  Send, 
  User, 
  Home, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  UserCheck, 
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Brain
} from 'lucide-react';
import { Hospital, LabTest, LabBooking } from '../types';

export default function HealthCheckLab() {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [subTab, setSubTab] = useState<'packages' | 'orders' | 'ai-advisor'>('packages');

  // Booking states
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-06-01');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('08:00 AM - 10:00 AM');
  const [collectionType, setCollectionType] = useState<'Home Sample' | 'Lab Visit'>('Home Sample');
  const [collectionAddress, setCollectionAddress] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Chat/AI Analyst states
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    {
      role: 'assistant',
      content: `Pranam! Main Sehat Setu Swasthya Report AI Analysis Agent hoon. 🩺\n\nAap apna koi bhi clinical medical test report yahan copy-paste kar sakte hain, ya niche kisi active lab report ke biomarkers load karke report ka sateek nidaan, aahar aur vihar suggestions le sakte hain.\n\n*Aap sample reports bhi click karke load kar sakte hain!*`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customReportText, setCustomReportText] = useState('');
  const [selectedReportIdForAi, setSelectedReportIdForAi] = useState('');

  // Initial loading
  useEffect(() => {
    fetch('/api/lab-tests')
      .then(res => res.json())
      .then(data => setLabTests(data))
      .catch(err => console.error("Error loading lab tests", err));

    fetch('/api/lab-bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error("Error loading lab bookings", err));

    fetch('/api/hospitals')
      .then(res => res.json())
      .then(data => {
        setHospitals(data);
        if (data.length > 0) {
          setSelectedHospitalId(data[0].id);
        }
      })
      .catch(err => console.error("Error loading hospitals", err));
  }, []);

  const refreshBookings = () => {
    fetch('/api/lab-bookings')
      .then(res => res.json())
      .then(data => setBookings(data));
  };

  const handleBookTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    if (!patientName.trim() || !contactNumber.trim()) {
      alert('Krupya patient ka naam aur telephone number bharein.');
      return;
    }

    setIsBookingSubmitting(true);
    setBookingSuccess(null);

    const hospitalObj = hospitals.find(h => h.id === selectedHospitalId);

    try {
      const response = await fetch('/api/lab-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientAge: Number(patientAge) || 30,
          patientGender,
          contactNumber,
          testId: selectedTest.id,
          testName: selectedTest.name,
          price: selectedTest.price,
          hospitalId: selectedHospitalId,
          hospitalName: hospitalObj ? hospitalObj.name : "Associated Partner Laboratory",
          date: bookingDate,
          timeSlot: bookingTimeSlot,
          collectionType,
          address: collectionType === 'Home Sample' ? collectionAddress : '',
          status: 'Pending'
        })
      });

      if (response.ok) {
        setBookingSuccess(`Pranam! ${selectedTest.name} ka appointment saphalta-purvak schedule ho gaya hai. SMS and slot configuration confirm kar di gayi hai.`);
        setPatientName('');
        setPatientAge('');
        setContactNumber('');
        setCollectionAddress('');
        setSelectedTest(null);
        refreshBookings();
        
        // Auto navigate to orders
        setTimeout(() => {
          setSubTab('orders');
          setBookingSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const simulateStep = async (bookingId: string, targetStatus: 'Sample Collected' | 'Report Generated' | 'Completed') => {
    try {
      const response = await fetch(`/api/lab-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      if (response.ok) {
        refreshBookings();
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleSendQueryToAi = async (textToSend?: string, attachedData?: Record<string, string>, title?: string) => {
    const queryText = textToSend || userInput;
    if (!queryText.trim() && !attachedData) return;

    // Append to messages
    const newMessages = [...chatMessages];
    if (queryText.trim()) {
      newMessages.push({ role: 'user', content: title ? `[${title}]\n${queryText}` : queryText });
      setUserInput('');
    } else {
      newMessages.push({ role: 'user', content: `[Loaded Biomarkers Analysis]: Analyzing ${title || "Report"}` });
    }
    setChatMessages(newMessages);
    setIsAnalyzing(true);

    try {
      const activeBooking = bookings.find(b => b.id === selectedReportIdForAi);
      const patientInfo = activeBooking ? {
        name: activeBooking.patientName,
        age: activeBooking.patientAge,
        gender: activeBooking.patientGender
      } : undefined;

      const response = await fetch('/api/gemini/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText: queryText,
          reportData: attachedData,
          patientInfo: patientInfo
        })
      });

      if (response.ok) {
        const result = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: result.text }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Krupya khed hai. Main sateek clinical diagnostic results analyze nahi kar paya. Krupya dobara koshish karein.' 
        }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'System communication latency high hai. Krupya verification step complete karein.' 
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleReport = (type: string) => {
    let mockData: Record<string, string> = {};
    let testTitle = "";

    if (type === "diabetes") {
      testTitle = "Sample Diabetes Report";
      mockData = {
        "Glucose Fasting (Blood Sugar)": "146 mg/dL (High)",
        "HbA1c (Glycated Haemoglobin)": "7.4% (Elevated Type-2 diabetes range)",
        "Average Blood Glucose": "166 mg/dL"
      };
    } else if (type === "lipid") {
      testTitle = "Sample Lipid Profile Report";
      mockData = {
        "Total Cholesterol": "248 mg/dL (Elevated)",
        "HDL (Good Cholesterol)": "35 mg/dL (Low)",
        "LDL (Bad Cholesterol)": "165 mg/dL (High Risk)",
        "Triglycerides": "210 mg/dL (Elevated)"
      };
    } else {
      testTitle = "Sample CBC Report";
      mockData = {
        "Haemoglobin": "10.2 g/dL (Low, Indicates Anaemia)",
        "White Blood Cell (WBC)": "11,200/cu mm (Slightly High)",
        "Platelet Count": "2,30,000 /cu mm (Normal)"
      };
    }

    handleSendQueryToAi(undefined, mockData, testTitle);
  };

  const handleLoadUserBookingReport = (booking: LabBooking) => {
    if (!booking.reportData) return;
    setSelectedReportIdForAi(booking.id);
    handleSendQueryToAi(
      `Analyzing My Clinical Lab Report (${booking.testName}) dated ${booking.date}.`,
      booking.reportData,
      `${booking.patientName}'s ${booking.testName}`
    );
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* visual banner match bento header */}
        <div className="bg-white border border-[#dadce0] rounded-[16px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-3xs relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full inline-block mb-1.5">
              🔬 Diagnostics & Preventative Labs
            </span>
            <h1 className="text-2xl sm:text-3xl font-sans font-black text-gray-900 tracking-tight leading-tight">
              Swasthya Checkup & Clinical Report <span className="text-[#0F9D58]">Sehat</span> <span className="text-[#EA580C]">Setu</span> <span className="text-gray-900">AI Desk</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-xl font-semibold">
              Sanstha accredited diagnostic slots can now be booked from home in Gaya, Ranchi, and Patna. Access diagnostic lab transcripts instantly and have Dhanvantari AI parse reports in minutes.
            </p>
          </div>
          
          <div className="flex gap-2 relative z-10 flex-wrap shrink-0">
            <button 
              onClick={() => setSubTab('packages')}
              className={`text-xs font-bold px-4 py-3 rounded-xl cursor-pointer transition-all ${
                subTab === 'packages' ? 'bg-[#0F9D58] text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              📋 Package Catalog
            </button>
            <button 
              onClick={() => setSubTab('orders')}
              className={`text-xs font-bold px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                subTab === 'orders' ? 'bg-[#EA580C] text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              🧪 My Reports {bookings.length > 0 && <span className="bg-white text-[#EA580C] rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">{bookings.length}</span>}
            </button>
            <button 
              onClick={() => setSubTab('ai-advisor')}
              className={`text-xs font-bold px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                subTab === 'ai-advisor' ? 'bg-[#0F9D58] text-white shadow-xs hover:bg-[#0b8043]' : 'bg-gray-100 hover:bg-gray-250 text-gray-600'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-yellow-300" />
              🧠 Dhanvantari Reports AI Advisor
            </button>
          </div>
        </div>

        {/* SUBTAB 1: PACKAGES & BOOKINGS */}
        {subTab === 'packages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Catalog Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* Home Sample Collection Core Process Info Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-orange-50 border border-orange-100 rounded-2xl p-4 shadow-3xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                    <span className="p-1 bg-[#FFF3EE] rounded-lg">🏡</span>
                    <span>Direct Home Diagnostic Sample Collection Available</span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900">Har Ghar Tak Sehat, Free Sample Collection Route!</h3>
                  <p className="text-[11px] text-gray-550 leading-relaxed font-semibold max-w-xl">
                    Humare certified expert phlebotomist providers Patna, Ranchi aur Gaya me sterile safety protocols ke sath aapke purn thikane (Home/Office) se blood/urine diagnostic samples bilkul muft (FREE) collect karenge.
                  </p>
                </div>
                <div className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl shrink-0 self-stretch flex flex-col justify-center text-center">
                  <span>✨ Sterile Standards</span>
                  <span className="text-gray-400 font-bold text-[9px]">Cold-Chain Protected</span>
                </div>
              </div>

              {/* Step indicator */}
              <div className="bg-white border border-[#dadce0] rounded-2xl p-4 shadow-3xs">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#EA580C] bg-[#FFF3EE] px-2 py-0.5 rounded-md inline-block mb-2">
                  🏡 Step-By-Step Home Sample Collection Process
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100 flex flex-col justify-between">
                    <span className="w-5 h-5 bg-[#0F9D58] text-white font-extrabold text-[10px] rounded-full flex items-center justify-center mx-auto mb-1">1</span>
                    <h4 className="text-[10px] font-black text-gray-900 leading-none">Select Profile</h4>
                    <p className="text-[9px] text-gray-400 font-bold mt-1">Pick health check package catalog</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100 flex flex-col justify-between">
                    <span className="w-5 h-5 bg-[#EA580C] text-white font-extrabold text-[10px] rounded-full flex items-center justify-center mx-auto mb-1">2</span>
                    <h4 className="text-[10px] font-black text-gray-900 leading-none">Pata & Booking</h4>
                    <p className="text-[9px] text-gray-400 font-bold mt-1">Set preferred slot & home address</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100 flex flex-col justify-between">
                    <span className="w-5 h-5 bg-blue-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center mx-auto mb-1">3</span>
                    <h4 className="text-[10px] font-black text-gray-900 leading-none">Sterile Collection</h4>
                    <p className="text-[9px] text-gray-400 font-bold mt-1">Phlebotomist visits home with cold box</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100 flex flex-col justify-between">
                    <span className="w-5 h-5 bg-amber-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center mx-auto mb-1">4</span>
                    <h4 className="text-[10px] font-black text-gray-900 leading-none">Dhanvantari AI</h4>
                    <p className="text-[9px] text-gray-400 font-bold mt-1">Get certified report analyzed instantly</p>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-sans font-bold text-gray-900 tracking-tight flex items-center gap-2 pt-2">
                <FlaskConical className="w-5 h-5 text-[#0F9D58]" /> Available Clinical Health Checks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {labTests.map(test => (
                  <div 
                    key={test.id} 
                    className={`bg-white border rounded-2xl p-5 shadow-3xs transition-all duration-350 hover:shadow-2xs flex flex-col justify-between ${
                      selectedTest?.id === test.id ? 'border-[#0F9D58] ring-2 ring-emerald-50' : 'border-[#dadce0]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">
                            {test.category}
                          </span>
                          <span className="text-[9px] font-extrabold text-[#EA580C] bg-[#FFF3EE] border border-[#FFD9C6] px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                            🏡 Home Sample Free
                          </span>
                        </div>
                        <span className="text-[14px] font-black text-[#0F9D58]">
                          ₹{test.price}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-gray-900 leading-snug">
                        {test.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                        {test.description}
                      </p>
                      
                      {/* Parameters bullet */}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-2">
                        Included Parameters ({test.parameters.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {test.parameters.map((p, idx) => (
                          <span key={idx} className="bg-gray-50 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded-md border border-[#eee]">
                            {p}
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded-lg gap-1 border border-amber-100 flex items-start mt-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Prep: {test.preparation}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedTest(test);
                        setBookingSuccess(null);
                        const formElem = document.getElementById('booking-form-anchor');
                        if (formElem) {
                          formElem.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`w-full mt-4 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer ${
                        selectedTest?.id === test.id 
                          ? 'bg-[#0F9D58] text-white' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-[#0F9D58]'
                      }`}
                    >
                      {selectedTest?.id === test.id ? '✓ Selected package' : '📅 Book Test Slot'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Form Card */}
            <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-3xs hover:shadow-2xs transition-all flex flex-col justify-between" id="booking-form-anchor">
              <div>
                <h2 className="text-md font-sans font-black text-gray-950 tracking-tight flex items-center gap-2 mb-4 border-b pb-3 border-[#eee]">
                  <Calendar className="w-4.5 h-4.5 text-[#0F9D58]" /> Partner Clinic Slot Booking
                </h2>

                {bookingSuccess && (
                  <div className="bg-emerald-50 text-[#0f9d58] border border-emerald-100 p-4 rounded-xl text-xs font-bold leading-relaxed mb-4 flex items-start gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 animate-bounce" />
                    <span>{bookingSuccess}</span>
                  </div>
                )}

                {selectedTest ? (
                  <div className="mb-4 bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl">
                    <span className="text-[9px] font-extrabold text-[#0F9D58] uppercase">Selected Diagnostics</span>
                    <h4 className="text-xs font-black text-gray-900">{selectedTest.name}</h4>
                    <div className="flex justify-between text-[11px] font-bold text-gray-600 mt-1">
                      <span>Total Invoice Amt:</span>
                      <span className="text-gray-900 text-xs">₹{selectedTest.price}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 bg-gray-50 border border-[#e5e7eb] p-4 text-center rounded-xl text-xs text-gray-500 font-bold">
                    Krupya select an active clinical package on the left to activate registration booking form.
                  </div>
                )}

                <form onSubmit={handleBookTestSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Patient Name (Mata/Pita ya Swaam)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        disabled={!selectedTest}
                        placeholder="e.g. Ramesh Prasad" 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full bg-gray-50 border border-[#dadce0] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden text-gray-800 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Patient Age</label>
                      <input 
                        type="number" 
                        required
                        disabled={!selectedTest}
                        placeholder="e.g. 45" 
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        className="w-full bg-gray-50 border border-[#dadce0] rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden text-gray-800 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Gender</label>
                      <select 
                        disabled={!selectedTest}
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full bg-gray-50 border border-[#dadce0] rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden text-gray-800 disabled:opacity-50"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Contact WhatsApp/Mobile</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input 
                        type="tel" 
                        required
                        disabled={!selectedTest}
                        placeholder="e.g. 9876543210" 
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full bg-[#fcfcfc] border border-[#dadce0] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden text-gray-800 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Partner Laboratory / Hospital Location</label>
                    <select 
                      disabled={!selectedTest}
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full bg-gray-50 border border-[#dadce0] rounded-xl p-2 text-xs font-semibold focus:outline-hidden text-gray-850 disabled:opacity-50"
                    >
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Appointment Date</label>
                      <input 
                        type="date"
                        required 
                        disabled={!selectedTest}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-gray-50 border border-[#dadce0] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden text-gray-800 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Preferred Time Window</label>
                      <select 
                        disabled={!selectedTest}
                        value={bookingTimeSlot}
                        onChange={(e) => setBookingTimeSlot(e.target.value)}
                        className="w-full bg-gray-50 border border-[#dadce0] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden text-gray-800 disabled:opacity-50"
                      >
                        <option value="08:00 AM - 10:00 AM">Morning Early (Fasting)</option>
                        <option value="10:00 AM - 12:00 PM">Late Morning</option>
                        <option value="12:00 PM - 02:00 PM">Afternoon</option>
                        <option value="04:00 PM - 06:00 PM">Evening Routine</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-[#EA580C] uppercase block mb-1.5 flex items-center gap-1">
                      <span>🏡 Collection Preference (Home Sample Free & Highly Recommended!)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button 
                        type="button"
                        disabled={!selectedTest}
                        onClick={() => setCollectionType('Lab Visit')}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          collectionType === 'Lab Visit' ? 'bg-[#e6f4ea] text-[#0f9d58] border-[#0f9d58] shadow-3xs' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        🏢 Center Visit
                      </button>
                      <button 
                        type="button"
                        disabled={!selectedTest}
                        onClick={() => setCollectionType('Home Sample')}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          collectionType === 'Home Sample' ? 'bg-[#FFF3EE] text-[#EA580C] border-[#EA580C] shadow-3xs' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        <Home className="w-4 h-4 text-[#EA580C]" /> 🏡 Home Sample (Free)
                      </button>
                    </div>

                    {collectionType === 'Home Sample' && (
                      <div className="mt-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-3 rounded-xl text-[10.5px] leading-relaxed text-orange-950 font-semibold animate-fade-in">
                        <span className="font-extrabold text-[#EA580C] block mb-0.5">🏡 Sehat Setu Home Collection Standards:</span>
                        Sanstha certified expert phlebotomist will visit your home. Liquid samples are preserved in temperature-controlled sealed boxes to maintain perfect biomedical integrity.
                      </div>
                    )}
                  </div>

                  {collectionType === 'Home Sample' && (
                    <div className="animate-fade-in">
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase block mb-1">Sample Collection Address (Purna Pata)</label>
                      <textarea
                        required
                        disabled={!selectedTest}
                        rows={2}
                        placeholder="Biomedical sample collector technician ke liye sateek ghar ka pata bharein."
                        value={collectionAddress}
                        onChange={(e) => setCollectionAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-[#dadce0] rounded-xl p-2 text-xs font-semibold focus:bg-white focus:outline-hidden text-gray-800"
                      />
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={!selectedTest || isBookingSubmitting}
                    className="w-full bg-[#0F9D58] hover:bg-[#0b8043] text-white cursor-pointer font-bold py-3 text-xs rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 uppercase mt-4"
                  >
                    {isBookingSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Order Booking'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: MY REPORTS & CLINICAL BIO-TELEMETRY */}
        {subTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-[#eee]">
              <h2 className="text-lg font-sans font-black text-gray-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5.5 h-5.5 text-[#0F9D58]" /> Diagnostic Lab Transcripts & Orders
              </h2>
              <button 
                onClick={refreshBookings}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 border p-2 rounded-xl bg-white cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-3xs">
                <FlaskConical className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-md font-bold text-gray-900">Koi lab orders scheduled nahi hain</h3>
                <p className="text-xs text-gray-500 font-medium">
                  Aapne abhi tak koi diagnostic profile scheduled nahi kiya hai. Apn swasthya checkup book karne ke liye catalog open karein!
                </p>
                <button 
                  onClick={() => setSubTab('packages')}
                  className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-3xs transition-all"
                >
                  Browse Lab Packages
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Bookings Tracker List */}
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div 
                      key={booking.id}
                      className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 border-[#eee] mb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-mono font-bold block">ID: {booking.id}</span>
                          <h4 className="text-sm font-black text-gray-950 leading-tight">{booking.testName}</h4>
                          <span className="text-xs text-[#0F9D58] font-bold">Amt: ₹{booking.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                            booking.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            booking.status === 'Sample Collected' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                            booking.status === 'Report Generated' ? 'bg-indigo-50 text-indigo-600 border border-indigo-150 animate-pulse' :
                            'bg-emerald-50 text-[#0F9D58] border border-emerald-150'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Details specs */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-500 mb-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider block text-gray-400">Patient info</span>
                          <span className="text-gray-900 font-bold">{booking.patientName} ({booking.patientAge} Y/O, {booking.patientGender})</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider block text-gray-400">Slot Scheduled & Mode</span>
                          <span className="text-gray-900 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {booking.date} • {booking.timeSlot}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" /> {booking.collectionType}
                            {booking.address && " (Home Address Filled)"}
                          </span>
                        </div>
                      </div>

                      {/* Technician Actions & Simulation Steps */}
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">🔬 Tech Administration Panel</span>
                          <p className="text-[10px] text-gray-500 font-semibold leading-normal">
                            Sample processing laboratory diagnostics simulator workflow state:
                          </p>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          {booking.status === 'Pending' && (
                            <button 
                              onClick={() => simulateStep(booking.id, 'Sample Collected')}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer transition-all flex shadow-3xs"
                            >
                              Collect Sample
                            </button>
                          )}
                          {booking.status === 'Sample Collected' && (
                            <button 
                              onClick={() => simulateStep(booking.id, 'Report Generated')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer transition-all flex shadow-3xs animate-pulse"
                            >
                              Generate Bio-Report
                            </button>
                          )}
                          {booking.status === 'Report Generated' && (
                            <button 
                              onClick={() => simulateStep(booking.id, 'Completed')}
                              className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer transition-all flex shadow-3xs"
                            >
                              Finalize & Complete
                            </button>
                          )}
                          {booking.status === 'Completed' && (
                            <span className="text-xs text-[#0f9d58] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Lab Certified Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display biomarkers parameters if report is generated or complete */}
                      {(booking.status === 'Report Generated' || booking.status === 'Completed') && booking.reportData && (
                        <div className="mt-4 border-t pt-4 border-dashed border-[#ddd] space-y-3">
                          <div className="flex justify-between items-center">
                            <h5 className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-indigo-600" /> Extracted Laboratory Biomarkers
                            </h5>
                            
                            <button 
                              onClick={() => {
                                setSubTab('ai-advisor');
                                handleLoadUserBookingReport(booking);
                              }}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[10px] border border-amber-200 px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" /> Run Sehat AI Diagnostics
                            </button>
                          </div>

                          <div className="bg-[#fcfdff] border border-indigo-50 rounded-xl overflow-hidden text-[11px]">
                            <table className="w-full text-left">
                              <thead className="bg-[#f0f4f9] text-gray-600 font-bold">
                                <tr>
                                  <th className="p-2.5">Biochemical Test Marker</th>
                                  <th className="p-2.5 text-right">Extracted Measured Level</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#eee] text-gray-700 font-bold">
                                {Object.entries(booking.reportData).map(([key, value]) => {
                                  const strVal = String(value || '');
                                  const isHigh = strVal.toLowerCase().includes('high') || strVal.toLowerCase().includes('elevated');
                                  const isLow = strVal.toLowerCase().includes('low');
                                  return (
                                    <tr key={key} className={isHigh ? 'bg-red-50/50' : isLow ? 'bg-indigo-50/30' : ''}>
                                      <td className="p-2.5 font-medium">{key}</td>
                                      <td className={`p-2.5 text-right ${isHigh ? 'text-red-600 font-black' : isLow ? 'text-indigo-600 font-black' : 'text-gray-900'}`}>
                                        {strVal}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Right banner diagnostics panel guidelines info */}
                <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-3xs space-y-5">
                  <h3 className="text-sm font-sans font-black text-gray-950 flex items-center gap-2 border-b pb-3 border-[#eee]">
                    <ShieldCheckIcon className="w-5 h-5 text-[#0F9D58]" /> Diagnostics Sehat Directives
                  </h3>
                  <div className="flex gap-3 items-start text-xs font-semibold text-gray-650 leading-relaxed">
                    <span className="bg-emerald-50 text-[#0F9D58] w-6.5 h-6.5 shrink-0 rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                      <h4 className="text-gray-900 font-black">Home Sample Collection</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Technicians follow sterile protocol under Sehat Swasthya directives, ensuring transport in specialized temperature controlled thermal containers.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start text-xs font-semibold text-gray-650 leading-relaxed">
                    <span className="bg-emerald-50 text-[#0F9D58] w-6.5 h-6.5 shrink-0 rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <h4 className="text-gray-900 font-black">NABL Certified Associated Labs</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Our diagnostic reports are checked and verified by accredited practitioners of Bihar's prominent regional institutes (IGIMS/AIIMS/Paras-HMRI complexes).</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start text-xs font-semibold text-gray-650 leading-relaxed">
                    <span className="bg-emerald-50 text-[#0F9D58] w-6.5 h-6.5 shrink-0 rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <h4 className="text-gray-900 font-black">AI Diagnosis Integration</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Instantly analyze your biomarkers with Dhanvantari AI Advisor to understand normal limits, diet restrictions, and appropriate consultant referrals. Never substitute professional consultations.</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4.5 space-y-2.5">
                    <h4 className="text-xs text-indigo-950 font-black flex items-center gap-1">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-600 shrink-0" /> Sehat AI Diagnostic Analysis Sandbox
                    </h4>
                    <p className="text-[11px] text-indigo-800 leading-normal font-semibold">
                      Pranam! Agar aapne clinical diagnostics test book kiya hai aur simulated report ready hai, to aap directly "Run Sehat AI Diagnostics" click karke report ka detailed assessment le sakte hain.
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSubTab('ai-advisor');
                          loadSampleReport('diabetes');
                        }}
                        className="bg-indigo-600 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg hover:bg-[#07562c] shadow-xs cursor-pointer"
                      >
                        Load Fasting Diabetes Sample
                      </button>
                      <button 
                        onClick={() => {
                          setSubTab('ai-advisor');
                          loadSampleReport('lipid');
                        }}
                        className="bg-indigo-600 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg hover:bg-[#07562c] shadow-xs cursor-pointer"
                      >
                        Load Cardiorespiratory Lipid Sample
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: AI DIAGNOSTICS CHATBOT AGENT */}
        {subTab === 'ai-advisor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Control Column: Report Loader & Raw text parser */}
            <div className="space-y-4">
              <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-3xs space-y-4">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700 bg-amber-50 p-1 px-2.5 rounded-md border border-amber-100 inline-block">
                  ⚙️ Diagnostics Dashboard Control
                </span>
                <h3 className="text-md font-sans font-black text-gray-900 tracking-tight">
                  Auto-Fill Report Analyser Node
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                  Apne schedule kiye huye tests ya template diagnostic biomakers ko AI context memory block me fill karein:
                </p>

                {/* Submited bookings list report selector */}
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Select from Your Completed Test Reports</label>
                  {bookings.filter(b => b.status === 'Report Generated' || b.status === 'Completed').length === 0 ? (
                    <div className="text-[11px] bg-gray-50 border p-2.5 text-center text-gray-400 font-semibold rounded-lg">
                      Sabhi bookings pending hain. Live "My Reports" tab me testing simulate karein report parameters create karne ke liye.
                    </div>
                  ) : (
                    <select
                      value={selectedReportIdForAi}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedReportIdForAi(val);
                        const matched = bookings.find(b => b.id === val);
                        if (matched) {
                          handleLoadUserBookingReport(matched);
                        }
                      }}
                      className="w-full bg-[#fdfdfd] border border-gray-250 cursor-pointer text-xs p-2.5 rounded-xl font-semibold text-gray-800"
                    >
                      <option value="">-- Choose generated report --</option>
                      {bookings.filter(b => b.status === 'Report Generated' || b.status === 'Completed').map(b => (
                        <option key={b.id} value={b.id}>{b.patientName} - {b.testName} ({b.date})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="relative flex items-center my-3.5">
                  <div className="border-t border-[#eee] flex-grow"></div>
                  <span className="mx-2.5 text-[9px] text-gray-400 font-bold uppercase shrink-0">ya custom test report write-up</span>
                  <div className="border-t border-[#eee] flex-grow"></div>
                </div>

                {/* Paste custom clipboard transcript */}
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Paste your offline Clinical Report values</label>
                  <textarea
                    rows={4}
                    value={customReportText}
                    onChange={(e) => setCustomReportText(e.target.value)}
                    placeholder="Haemoglobin: 10.5 gm/dl&#10;Total Cholesterol: 242 mg/dl&#10;Blood Sugar fasting: 154 mg/dl"
                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-hidden text-gray-800 focus:border-[#0F9D58]"
                  />
                  <button 
                    onClick={() => {
                      if (!customReportText.trim()) {
                        alert("Krupya pahle custom report text box me test values copy-paste karein.");
                        return;
                      }
                      handleSendQueryToAi(customReportText, undefined, "Custom Pasted Diagnostics");
                      setCustomReportText('');
                    }}
                    className="w-full mt-2 cursor-pointer bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs"
                  >
                    🚀 Parse Custom Report with AI
                  </button>
                </div>

                <div className="border-t pt-4 border-dashed border-[#ddd]">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Interactive Mock Sandbox Templates:</span>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => loadSampleReport('diabetes')}
                      className="bg-emerald-50 hover:bg-emerald-100 text-[#0F9D58] font-black text-left text-[10px] p-2.5 rounded-xl border border-emerald-150 transition-all flex justify-between cursor-pointer"
                    >
                      <span>📊 Diabetes Profile (Fasting HbA1c High)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => loadSampleReport('lipid')}
                      className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-black text-left text-[10px] p-2.5 rounded-xl border border-cyan-150 transition-all flex justify-between cursor-pointer"
                    >
                      <span>🫀 Lipid Profile (Total Cholesterol High)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => loadSampleReport('cbc')}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-left text-[10px] p-2.5 rounded-xl border border-indigo-150 transition-all flex justify-between cursor-pointer"
                    >
                      <span>🩸 Cell Hemography (Low Haemoglobin)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Advisor Chat Panel */}
            <div className="lg:col-span-2 bg-white border border-[#dadce0] rounded-2xl p-6 shadow-3xs flex flex-col justify-between min-h-[550px] relative">
              
              {/* Header inside chat */}
              <div className="flex items-center justify-between border-b pb-3.5 border-[#eee] mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#e6f4ea] text-[#0f9d58] p-2 rounded-xl">
                    <Brain className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-sans font-black text-gray-900 leading-tight">Dhanvantari AI Clinical Diagnostician</h3>
                    <span className="text-[10px] text-gray-405 font-semibold flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 bg-[#0F9D58] rounded-full animate-ping"></span>
                      Accredited Biomedical Intelligence wing active (Gemini-3.5)
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setChatMessages([
                      {
                        role: 'assistant',
                        content: `Pranam! Main Sehat Setu Swasthya Report AI Analysis Agent hoon. 🩺\n\nAap apna koi bhi clinical medical test report yahan copy-paste kar sakte hain, ya niche kisi active lab report ke biomarkers load karke report ka sateek nidaan, aahar aur vihar suggestions le sakte hain.\n\n*Aap sample reports bhi click karke load kar sakte hain!*`
                      }
                    ]);
                    setSelectedReportIdForAi('');
                  }}
                  className="text-[10px] font-extrabold font-mono text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-lg cursor-pointer"
                >
                  CLEAR HISTORY
                </button>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] mb-4 pr-1 scrollbar-styled">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed font-semibold transition-all ${
                      msg.role === 'user'
                        ? 'bg-[#0F9D58] text-white rounded-br-none font-bold'
                        : 'bg-gray-50 text-gray-850 border border-[#dadce0] rounded-bl-none text-[11px] whitespace-pre-line'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isAnalyzing && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-gray-50 border border-[#dadce0] rounded-2xl rounded-bl-none p-4 max-w-[85%] text-xs text-[#0F9D58] font-bold flex items-center gap-2">
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                      <span>Dhanvantari Ji clinical biomarkers analyze kar rahe hain... krupya pratiksha karein.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input row */}
              <div className="border-t pt-4 border-[#eee]">
                <div className="flex gap-2 text-xs font-bold">
                  <input 
                    type="text" 
                    value={userInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendQueryToAi();
                      }
                    }}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Biomarker parameters (e.g. HbA1c 7.5) ke diet suggestions ke baare me puchiye..."
                    className="flex-1 bg-[#f8f9fa] border border-[#dadce0] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-hidden text-gray-850 focus:bg-white focus:border-[#0F9D58]"
                  />
                  <button 
                    onClick={() => handleSendQueryToAi()}
                    disabled={isAnalyzing || !userInput.trim()}
                    className="bg-[#0F9D58] hover:bg-[#0b8043] font-bold text-white px-5 rounded-xl transition-all cursor-pointer shadow-3xs disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
                  >
                    <Send className="w-4 h-4" /> Send Help
                  </button>
                </div>
                <span className="text-[9px] text-[#db3232] font-semibold mt-2.5 block text-center leading-normal">
                  *Chikitskiya Nidaan Disclaimer: Sehat Setu AI professional diagnostics, dosage ya medicine prescription ka vikalp nahi hai. Krupya doctor se consult karein.*
                </span>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Inline minimalist icon replacements
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      className={props.className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
