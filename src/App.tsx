import React, { useState, useEffect } from 'react';
import { Hospital, Review } from './types';
import HospitalCard from './components/HospitalCard';
import HospitalCompare from './components/HospitalCompare';
import DhanvantariChat from './components/DhanvantariChat';
import CostEstimator from './components/CostEstimator';
import AppointmentBooker from './components/AppointmentBooker';
import GovernmentSchemes from './components/GovernmentSchemes';
import AdminDashboard from './components/AdminDashboard';
import EmergencyDirectory from './components/EmergencyDirectory';
import LiveConsultation from './components/LiveConsultation';
import HealthCheckLab from './components/HealthCheckLab';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/react';

const brandLogo = new URL('./assets/images/sehat_setu_logo_1780285261649.png', import.meta.url).href;

import { 
  Heart, 
  Search, 
  MapPin, 
  GitCompare, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  CheckCircle,
  HelpCircle,
  Award,
  SlidersHorizontal,
  X,
  Stethoscope,
  Activity,
  UserCheck,
  ShieldAlert,
  Video,
  FlaskConical
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'directory' | 'emergencies' | 'live-consult' | 'costs' | 'schemes' | 'admin' | 'health-check'
  const [activeTab, setActiveTab] = useState<'directory' | 'emergencies' | 'live-consult' | 'costs' | 'schemes' | 'admin' | 'health-check'>('directory');

  // Directory variables
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Patna');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  
  // Custom filter toggles
  const [cashlessOnly, setCashlessOnly] = useState(false);
  const [ambulanceOnly, setAmbulanceOnly] = useState(false);
  const [mriOnly, setMriOnly] = useState(false);

  // Compare listings
  const [comparingHospitals, setComparingHospitals] = useState<Hospital[]>([]);

  // Telemedicine appointment booking coordinator
  const [preselectedHospital, setPreselectedHospital] = useState<Hospital | null>(null);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | null>(null);
  const [bookingModalActive, setBookingModalActive] = useState(false);

  // Review & feedback modal
  const [reviewHospital, setReviewHospital] = useState<Hospital | null>(null);
  const [patientReviewerName, setPatientReviewerName] = useState('');
  const [patientComment, setPatientComment] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [careRate, setCareRate] = useState(5);
  const [costRate, setCostRate] = useState(4);
  const [queueRate, setQueueRate] = useState(4);

  // Dhanvantari AI Conversational FAB drawer
  const [showAiChat, setShowAiChat] = useState(false);

  const citiesList = ["Patna", "Gaya", "Muzaffarpur", "Darbhanga", "Ranchi", "Kolkata"];
  const specialtiesList = [
    "Cardiology", "Oncology", "Orthopedics", "Neurology", "Pediatrics", "Nephrology", "Urology", "General Medicine"
  ];

  useEffect(() => {
    loadHospitals();
  }, [selectedCity, searchQuery, specialtyFilter, cashlessOnly, ambulanceOnly, mriOnly]);

  const loadHospitals = () => {
    let url = `/api/hospitals?city=${selectedCity}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    if (specialtyFilter) url += `&specialty=${encodeURIComponent(specialtyFilter)}`;
    if (cashlessOnly) url += `&cashless=true`;
    if (ambulanceOnly) url += `&hasAmbulance=true`;
    if (mriOnly) url += `&hasMri=true`;

    fetch(url)
      .then(res => res.json())
      .then(data => setHospitals(data))
      .catch(err => console.error("Error loading hospitals:", err));
  };

  const handleToggleCompare = (hospital: Hospital) => {
    const isAlreadyComparing = comparingHospitals.some(h => h.id === hospital.id);
    if (isAlreadyComparing) {
      setComparingHospitals(comparingHospitals.filter(h => h.id !== hospital.id));
    } else {
      if (comparingHospitals.length >= 3) {
        alert("Aap ek baar me keval 3 hospitals compare kar sakte hain.");
        return;
      }
      setComparingHospitals([...comparingHospitals, hospital]);
    }
  };

  const handleOpenBooking = (hospital: Hospital, doctorId?: string) => {
    setPreselectedHospital(hospital);
    if (doctorId) {
      setPreselectedDoctorId(doctorId);
    } else {
      setPreselectedDoctorId(null);
    }
    setBookingModalActive(true);
    
    // Smooth scroll down to the OPD scheduler panel
    const el = document.getElementById('opd-booking-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenReview = (hospital: Hospital) => {
    setReviewHospital(hospital);
    setPatientReviewerName('');
    setPatientComment('');
    setRatingVal(5);
    setCareRate(5);
    setCostRate(4);
    setQueueRate(4);
  };

  const submitPatientReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewHospital) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: reviewHospital.id,
          userName: patientReviewerName || "Verified Patient",
          comment: patientComment,
          rating: ratingVal,
          care: careRate,
          cost: costRate,
          queue: queueRate
        })
      });

      if (response.ok) {
        setReviewHospital(null);
        loadHospitals(); // reload updated ratings
        alert('Pranam! Aapka input saphalta purvak submit ho gaya hai. Transparency score and rating update kar di gayi hai.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#F1F3F4] min-h-screen text-gray-800 flex flex-col font-sans antialiased selection:bg-[#0F9D58] selection:text-white" id="main-frame-root">
      {/* Prime Header element */}
      <header className="bg-white border-b border-[#dadce0] sticky top-0 z-40 transition-all shadow-3xs" id="top-navigator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo Brand Brandings */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-gray-200 shrink-0">
              <img 
                src={brandLogo} 
                alt="Sehat Setu Logo" 
                className="w-full h-full object-contain p-0.5" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-sans font-black text-xl text-gray-900 tracking-tight">SEHAT <span className="text-[#EA580C]">SETU</span></span>
                <span className="bg-[#4285F4]/10 text-[#4285F4] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm tracking-wide">Patna Grid</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">"Sehat Ka Setu, Har Ghar Tak"</p>
            </div>
          </div>

          {/* Regional Multi-City Anchor selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> State Network:
            </span>
            <div className="flex bg-[#F1F3F4] border border-[#dadce0] p-1 rounded-xl">
              {citiesList.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setComparingHospitals([]); // reset on city flip
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedCity === city 
                      ? "bg-[#0F9D58] text-white shadow-3xs" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Clerk Authentication Buttons */}
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-bold text-[#0F9D58] border border-[#0F9D58] rounded-lg hover:bg-[#0F9D58]/10 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-bold text-white bg-[#0F9D58] rounded-lg hover:bg-[#0F9D58]/90 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">My Account</span>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Container Core layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* Core Quick Navigation Tabs */}
        <div className="flex bg-[#e8f0fe]/40 border border-[#dadce0] p-1.5 rounded-[16px] justify-start gap-1 pb-1 flex-wrap text-xs font-bold max-w-max">
          <button 
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'directory' 
                ? 'bg-[#0F9D58] text-white shadow-3xs' 
                : 'bg-transparent hover:bg-white text-gray-600'
            }`}
          >
            <Activity className="w-4 h-4" />
            Hospital Directory & Bed Live
          </button>

          <button 
            onClick={() => setActiveTab('emergencies')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'emergencies' 
                ? 'bg-[#EA4335] text-white shadow-3xs' 
                : 'bg-red-50 hover:bg-red-100/80 text-[#EA4335] border border-red-200/50'
            }`}
          >
            <ShieldAlert className="w-4.5 h-4.5 text-inherit shrink-0 animate-pulse" />
            24x7 Emergency Help
          </button>

          <button 
            onClick={() => setActiveTab('live-consult')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'live-consult' 
                ? 'bg-[#0F9D58] text-white shadow-3xs' 
                : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-[#0F9D58] border border-emerald-200/50'
            }`}
          >
            <span className="w-2 h-2 bg-[#0F9D58] rounded-full animate-ping shrink-0" />
            <Video className="w-4 h-4 text-inherit shrink-0" />
            Live Consult Specialist
          </button>

          <button 
            onClick={() => setActiveTab('health-check')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'health-check' 
                ? 'bg-[#0F9D58] text-white shadow-3xs' 
                : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-[#0F9D58] border border-emerald-200/50'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-inherit shrink-0" />
            Health Check & AI Reports
          </button>
          
          <button 
            onClick={() => setActiveTab('costs')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'costs' 
                ? 'bg-[#0F9D58] text-white shadow-3xs' 
                : 'bg-transparent hover:bg-white text-gray-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Surgery Pricing Intelligence
          </button>

          <button 
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'schemes' 
                ? 'bg-[#0F9D58] text-white shadow-3xs' 
                : 'bg-transparent hover:bg-white text-gray-600'
            }`}
          >
            <Award className="w-4 h-4" />
            Govt Welfare Schemes
          </button>

          <button 
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'admin' 
                ? 'bg-[#0F9D58] text-white shadow-3xs' 
                : 'bg-transparent hover:bg-white text-gray-600'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Clinical Controls (Admin)
          </button>
        </div>

        {/* TAB 1: HOSPITAL DIRECTORY & SEARCH EXPLORER */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fade-in" id="directory-panel">
            
            {/* Visual Hero Search banner setup styled as featured Bento Grid card */}
            <div className="bg-white border border-[#dadce0] rounded-[16px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-3xs hover:shadow-2xs transition-all duration-300">
              <div className="space-y-1.5 relative z-10">
                <span className="bento-pill mb-2">★ Transparency Registry</span>
                <h1 className="text-2xl sm:text-3xl font-sans font-black text-gray-900 tracking-tight leading-tight">
                  Transparent Healthcare Near <span className="text-[#0F9D58]">{selectedCity}</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">Verify standard surgery outlays, track ICU bed counts live, and consult Dhanvantari Ji anytime.</p>
              </div>

              {/* Direct integration keys */}
              <div className="flex gap-2 relative z-10 flex-wrap">
                <button 
                  onClick={() => setShowAiChat(true)}
                  className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:translate-y-[-1px]"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Ask Dhanvantari Ji (Super AI)
                </button>
                <button 
                  onClick={() => setActiveTab('emergencies')}
                  className="bg-[#EA4335] hover:bg-[#c5221f] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:translate-y-[-1px]"
                >
                  <ShieldAlert className="w-4.5 h-4.5 text-white shrink-0 animate-bounce" />
                  SOS Emergency Directory (24x7 Ambulance & Aid)
                </button>
                <button 
                  onClick={() => setActiveTab('live-consult')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:translate-y-[-1px]"
                >
                  <Video className="w-4 h-4 text-emerald-200" />
                  Live Specialist Consult (24x7)
                </button>
              </div>
            </div>

            {/* Direct Filters Toolbar styled as clean Bento companion */}
            <div className="bg-white border border-[#dadce0] p-4 rounded-[16px] shadow-3xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Primary Search bar input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={`Search brand names in ${selectedCity}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] hover:border-gray-400 focus:border-[#0F9D58] focus:bg-white focus:outline-hidden text-xs pl-10 pr-4 py-3 rounded-xl transition-all font-semibold text-gray-850"
                />
              </div>

              {/* Specialty filter select */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#dadce0] cursor-pointer text-xs font-semibold p-2.5 rounded-xl text-gray-700 hover:border-gray-400 focus:outline-hidden"
                  id="specialty-dropdown"
                >
                  <option value="">All Medical Specialties</option>
                  {specialtiesList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* Checklist boolean options toggles */}
                <div className="flex gap-2 flex-wrap text-[11px] font-bold">
                  <button 
                    onClick={() => setCashlessOnly(!cashlessOnly)}
                    className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      cashlessOnly ? "bg-[#e6f4ea] text-[#0f9d58] border-[#0F9D58] shadow-3xs" : "bg-gray-50 text-gray-500 border-gray-250 hover:bg-gray-100"
                    }`}
                  >
                    Cashless Only
                  </button>
                  <button 
                    onClick={() => setAmbulanceOnly(!ambulanceOnly)}
                    className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      ambulanceOnly ? "bg-[#e6f4ea] text-[#0f9d58] border-[#0F9D58] shadow-3xs" : "bg-gray-50 text-gray-500 border-gray-250 hover:bg-gray-100"
                    }`}
                  >
                    24x7 Ambulance
                  </button>
                  <button 
                    onClick={() => setMriOnly(!mriOnly)}
                    className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      mriOnly ? "bg-[#e6f4ea] text-[#0f9d58] border-[#0F9D58] shadow-3xs" : "bg-gray-50 text-gray-500 border-gray-250 hover:bg-gray-100"
                    }`}
                  >
                    Advanced MRI
                  </button>
                </div>
              </div>
            </div>

            {/* Side comparison bar if selected */}
            {comparingHospitals.length > 0 && (
              <HospitalCompare 
                comparingHospitals={comparingHospitals}
                onRemove={(id) => setComparingHospitals(comparingHospitals.filter(h => h.id !== id))}
                onBook={handleOpenBooking}
                onClearAll={() => setComparingHospitals([])}
              />
            )}

            {/* Grid Layout of Hospitals Cards */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Verified Super Specialty Centers in {selectedCity} ({hospitals.length})
                </h3>
              </div>

              {hospitals.length === 0 ? (
                <div className="bg-white border border-gray-150 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                  <HelpCircle className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No Hospitals match your search filter keys in {selectedCity}.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSpecialtyFilter('');
                      setCashlessOnly(false);
                      setAmbulanceOnly(false);
                      setMriOnly(false);
                    }}
                    className="text-xs font-bold text-[#0F9D58] underline mt-2"
                  >
                    Reset Filter specifications
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hospitals.map(hospital => (
                    <HospitalCard 
                      key={hospital.id}
                      hospital={hospital}
                      onBook={handleOpenBooking}
                      onCompare={handleToggleCompare}
                      onReview={handleOpenReview}
                      isComparing={comparingHospitals.some(h => h.id === hospital.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Direct Booking Desk section */}
            <div className="border-t border-gray-200 pt-8" id="opd-booking-panel">
              <AppointmentBooker 
                preselectedHospital={preselectedHospital}
                preselectedDoctorId={preselectedDoctorId}
                onBookingCompleted={() => {
                  setPreselectedHospital(null);
                  setPreselectedDoctorId(null);
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 1.5: EMERGENCY AID & HELPLINE DIRECTORY */}
        {activeTab === 'emergencies' && (
          <div className="animate-fade-in space-y-6">
            <EmergencyDirectory />
          </div>
        )}

        {/* TAB 1.7: LIVE TELECONSULTATION SUITE */}
        {activeTab === 'live-consult' && (
          <div className="animate-fade-in space-y-6">
            <LiveConsultation selectedCity={selectedCity} hospitals={hospitals} />
          </div>
        )}

        {/* TAB 1.8: CLINICAL LABS & REPORT ANALYSIS PORTAL */}
        {activeTab === 'health-check' && (
          <div className="animate-fade-in space-y-6">
            <HealthCheckLab />
          </div>
        )}

        {/* TAB 2: SURGICAL PRICING INTELLIGENCE */}
        {activeTab === 'costs' && (
          <div className="animate-fade-in space-y-6">
            <CostEstimator />
          </div>
        )}

        {/* TAB 3: GOVERNMENT SCHEMES WELFARE WELFARE */}
        {activeTab === 'schemes' && (
          <div className="animate-fade-in space-y-6">
            <GovernmentSchemes />
          </div>
        )}

        {/* TAB 4: CLINICAL CONTROLS / ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in space-y-6">
            <AdminDashboard />
          </div>
        )}

      </main>

      {/* FLOAT CONVERSATIONAL SUPER-AI PORTAL (Dhanvantari FAB Panel) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showAiChat ? (
          <button 
            id="fab-dhanvantari"
            onClick={() => setShowAiChat(true)}
            className="w-14 h-14 bg-gradient-to-tr from-[#0F9D58] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 group relative"
          >
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-10 right-0 bg-gray-900 border border-gray-700 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-sm tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Dhanvantari Ji Active
            </span>
          </button>
        ) : (
          <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md animate-slide-up shadow-2xl rounded-3xl overflow-hidden">
            <DhanvantariChat onClose={() => setShowAiChat(false)} />
          </div>
        )}
      </div>

      {/* MODAL WINDOW DIALOG: Post patient feedback verification */}
      {reviewHospital && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] bg-emerald-50 text-[#0F9D58] border border-emerald-100 font-extrabold uppercase px-2 py-0.5 rounded-sm block max-w-max">verified feedback</span>
                <h3 className="font-sans font-bold text-gray-900 text-base mt-1">Review {reviewHospital.name}</h3>
                <p className="text-[11px] text-gray-500">Provide transparent ratings across core categories to help other patients make informed choices.</p>
              </div>
              <button 
                onClick={() => setReviewHospital(null)}
                className="p-1 hover:bg-gray-150 rounded-full cursor-pointer border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitPatientReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Name (With Town/City)</label>
                <input 
                  type="text"
                  required
                  value={patientReviewerName}
                  onChange={(e) => setPatientReviewerName(e.target.value)}
                  placeholder="e.g. Satish Prasad (Kankerbagh)"
                  className="w-full bg-gray-50 border border-gray-250 p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white text-xs font-semibold text-gray-700"
                />
              </div>

              {/* Custom metric scores sliders */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Care Quality Treatment</span>
                    <span className="text-[#0F9D58]">{careRate} / 5</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" value={careRate} 
                    onChange={(e) => setCareRate(Number(e.target.value))}
                    className="w-full accent-[#0F9D58] h-1" 
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Cost Reasonableness Score</span>
                    <span className="text-[#0F9D58]">{costRate} / 5</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" value={costRate} 
                    onChange={(e) => setCostRate(Number(e.target.value))}
                    className="w-full accent-[#0F9D58] h-1" 
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>OPD Service / Wait time Queue</span>
                    <span className="text-[#0F9D58]">{queueRate} / 5</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" value={queueRate} 
                    onChange={(e) => setQueueRate(Number(e.target.value))}
                    className="w-full accent-[#0F9D58] h-1" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Symptom details & review comments</label>
                <textarea
                  required
                  rows={3}
                  value={patientComment}
                  onChange={(e) => setPatientComment(e.target.value)}
                  placeholder="Describe your surgical experience, queue timings, and TPA coordination details..."
                  className="w-full bg-gray-50 border border-gray-250 p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white text-xs"
                />
              </div>

              {/* Submition */}
              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setReviewHospital(null)}
                  className="flex-1 border bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#0F9D58] hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer shadow-xs"
                >
                  Confirm Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-gray-150 py-8 mt-auto" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-gray-900 tracking-wider">
            <span>SEHAT <span className="text-[#EA580C]">SETU</span></span>
            <span>•</span>
            <span className="text-[#EA580C]">"Sehat Ka Setu, Har Ghar Tak"</span>
          </div>
          <p className="text-[10px] text-gray-400 max-w-md mx-auto leading-relaxed">
            Sehat Setu is Bihar's leading open-standards healthcare transparency registry platform, providing public hospital records, verified surgery price bands, and public welfare schemes assistance.
          </p>
          <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
            © 2026 Sehat Setu. All rights reserved. Managed under clinical audits compliance.
          </div>
        </div>
      </footer>
    </div>
  );
}
