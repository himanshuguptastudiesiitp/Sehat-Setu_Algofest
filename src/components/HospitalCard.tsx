import React, { useState, useEffect } from 'react';
import { Hospital, Doctor } from '../types';
import { CheckCircle, AlertTriangle, ShieldCheck, Award, Eye, Navigation, GitCompare, MessageSquare, Calendar, ChevronDown, ChevronUp, Stethoscope, Star } from 'lucide-react';

interface HospitalCardProps {
  key?: string;
  hospital: Hospital;
  onBook: (hospital: Hospital, doctorId?: string) => void;
  onCompare: (hospital: Hospital) => void;
  onReview: (hospital: Hospital) => void;
  isComparing: boolean;
}

export default function HospitalCard({ hospital, onBook, onCompare, onReview, isComparing }: HospitalCardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (expanded && doctors.length === 0) {
      setIsLoading(true);
      fetch(`/api/doctors?hospitalId=${hospital.id}`)
        .then(res => res.json())
        .then(data => {
          // Sort doctors by rating (descending), then experience (descending) to show top doctors
          const sorted = data.sort((a: Doctor, b: Doctor) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.experience - a.experience;
          });
          setDoctors(sorted);
        })
        .catch(err => console.error("Error fetching doctors:", err))
        .finally(() => setIsLoading(false));
    }
  }, [expanded, hospital.id, doctors.length]);

  const getBedStatusColor = (avail: number) => {
    if (avail === 0) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (avail < 5) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-[16px] shadow-3xs hover:shadow-2xs transition-all duration-300 overflow-hidden flex flex-col h-full hover:translate-y-[-2px]" id={`hosp-card-${hospital.id}`}>
      {/* Hospital Hero Banner Image */}
      <div className="relative h-44 w-full bg-[#f8f9fa] border-b border-[#dadce0]/60">
        <img 
          src={hospital.image} 
          alt={hospital.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {hospital.isVerified && (
            <span className="bento-pill shadow-xs border border-[#0f9d58]/10">
              ★ Sehat Verified
            </span>
          )}
          <span className="bento-pill-blue shadow-xs border border-[#1a73e8]/10">
            {hospital.city}
          </span>
        </div>
      </div>

      {/* Hospital Metadata info body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-sans font-bold text-lg text-gray-900 tracking-tight leading-snug hover:text-[#0F9D58] transition-colors cursor-pointer">
              {hospital.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-[#e6f4ea] border border-[#0f9d58]/25 px-2 py-0.5 rounded-lg">
              <span className="text-xs font-black text-[#0F9D58]">{hospital.rating}</span>
              <span className="text-yellow-500 text-[10px]">★</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold">
            <Navigation className="w-3" />
            {hospital.address}, {hospital.area}
          </p>
        </div>

        {/* ICU & NICU beds availability live meter */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            hospital.icuBedsAvailable === 0 
              ? 'bg-rose-50 border-rose-200 text-rose-700' 
              : 'bg-[#f8f9fa] border-[#dadce0] text-gray-800'
          }`}>
            <span className="block text-[9px] font-bold uppercase tracking-widest text-[#5f6368] mb-0.5">ICU Beds Free</span>
            <span className="text-sm font-black leading-none">{hospital.icuBedsAvailable} <span className="text-[10px] font-normal text-gray-500">/ {hospital.icuBedsTotal}</span></span>
          </div>
          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            hospital.nicuBedsAvailable === 0 
              ? 'bg-[#fce8e6] border-rose-200 text-[#d93025]' 
              : 'bg-[#f8f9fa] border-[#dadce0] text-gray-800'
          }`}>
            <span className="block text-[9px] font-bold uppercase tracking-widest text-[#5f6368] mb-0.5">NICU Beds Free</span>
            <span className="text-sm font-black leading-none">{hospital.nicuBedsAvailable} <span className="text-[10px] font-normal text-[#5f6368]">avail</span></span>
          </div>
        </div>

        {/* Specialties and capabilities details */}
        <div className="my-2.5">
          <span className="text-[9px] font-bold text-[#5f6368] uppercase tracking-widest block mb-1.5">Specialties</span>
          <div className="flex flex-wrap gap-1 leading-none">
            {hospital.specialization.slice(0, 3).map((spec, i) => (
              <span key={i} className="text-xs font-semibold text-gray-700 bg-[#f1f3f4]/80 rounded-[8px] px-2.5 py-1 border border-[#dadce0]/60">
                {spec}
              </span>
            ))}
            {hospital.specialization.length > 3 && (
              <span className="text-[10px] font-extrabold text-gray-400 self-center px-1.5">
                +{hospital.specialization.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Feature toggles indicator badges */}
        <div className="flex gap-2.5 pt-3 border-t border-gray-100 mt-auto">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${hospital.features.cashless ? 'text-[#0F9D58]' : 'text-gray-350 line-through'}`}>
            <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Cashless Partner
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${hospital.features.ambulance ? 'text-[#4285F4]' : 'text-gray-350 line-through'}`}>
            <CheckCircle className="w-3.5 h-3.5 shrink-0" /> 24x7 Ambulance
          </span>
          {hospital.features.mri && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Advanced MRI
            </span>
          )}
        </div>

        {/* Top Doctors Collapsible Section */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-50/80 cursor-pointer"
            id={`btn-toggle-docs-${hospital.id}`}
          >
            <span className="flex items-center gap-1.5 text-[#0F9D58] font-sans font-bold">
              <Stethoscope className="w-4 h-4 shrink-0" />
              Top Doctors Directory
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 text-[#0F9D58] border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">
              {expanded ? 'Hide Panel' : 'Show Roster'}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </button>

          {expanded && (
            <div className="mt-2 text-xs space-y-2.5 max-h-56 overflow-y-auto pr-1" id={`docs-list-${hospital.id}`}>
              {isLoading ? (
                <div className="text-center py-4 text-xs text-gray-400 font-bold uppercase tracking-wider animate-pulse">
                  Querying specialists...
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-3 text-xs text-gray-500 font-medium">
                  No registered specialists scheduled here today.
                </div>
              ) : (
                doctors.slice(0, 3).map((doctor) => (
                  <div 
                    key={doctor.id} 
                    className="flex gap-2.5 p-2 bg-gray-50 hover:bg-[#e8f5e9]/50 border border-gray-200/60 hover:border-[#0F9D58]/35 rounded-[12px] transition-all"
                  >
                    <img 
                      src={doctor.image} 
                      alt={doctor.name} 
                      className="w-10 h-10 rounded-full object-cover border border-emerald-100 shadow-3xs shrink-0 self-center"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {doctor.name}
                        </span>
                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1 py-0.5 rounded-xs shrink-0 flex items-center gap-0.5">
                          ★ {doctor.rating}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-500 truncate mt-0.5">
                        {doctor.specialty} • {doctor.degree}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                        <span>{doctor.experience}+ yrs exp</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#0F9D58] lowercase font-extrabold text-[10px]">fee: ₹{doctor.fee}</span>
                          <button
                            onClick={() => onBook(hospital, doctor.id)}
                            className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-extrabold px-2.5 py-1 rounded-md text-[8.5px] uppercase tracking-wide cursor-pointer transition-colors"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {doctors.length > 3 && (
                <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                  + {doctors.length - 3} more specialists registered
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panel Action keys */}
      <div className="px-5 pb-5 pt-2 grid grid-cols-3 gap-1.5 mt-auto border-t border-[#f1f3f4]">
        <button 
          id={`btn-book-${hospital.id}`}
          onClick={() => onBook(hospital)}
          className="col-span-2 inline-flex items-center justify-center gap-1 bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-xs py-2 px-3 rounded-lg shadow-xs hover:shadow-2xs transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book Appointment
        </button>
        <button 
          id={`btn-comp-${hospital.id}`}
          onClick={() => onCompare(hospital)}
          className={`inline-flex items-center justify-center gap-1 text-xs font-bold py-2 px-1.5 rounded-lg border cursor-pointer transition-colors ${
            isComparing 
              ? 'bg-[#4285F4] text-white border-[#4285F4]' 
              : 'bg-white hover:bg-gray-50 text-gray-700 border-[#dadce0]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          {isComparing ? 'Selected' : 'Compare'}
        </button>
        <button 
          id={`btn-review-${hospital.id}`}
          onClick={() => onReview(hospital)}
          className="col-span-3 inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs py-1.5 px-3 rounded-lg border border-[#dadce0] transition-all cursor-pointer font-bold"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Submit Patient Feedback
        </button>
        <button 
          id={`btn-details-${hospital.id}`}
          onClick={() => setShowDetailsModal(true)}
          className="col-span-3 inline-flex items-center justify-center gap-1.5 bg-[#FFF3EE] hover:bg-[#FFE5D8] text-[#EA580C] text-xs py-2 px-3 rounded-lg border border-[#FFD2BC] transition-all cursor-pointer font-extrabold shadow-3xs"
        >
          <Eye className="w-3.5 h-3.5" />
          View Detailed Profile
        </button>
      </div>

      {/* DETAILED HOSPITAL HOVER/POPUP OVERLAY MODAL */}
      {showDetailsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" 
          id={`hospital-details-modal-${hospital.id}`}
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white border text-gray-800 border-gray-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8 cursor-default max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header banner */}
            <div className="relative h-48 w-full bg-slate-100 shrink-0">
              <img 
                src={hospital.image} 
                alt={hospital.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                <div className="flex gap-2 mb-1.5">
                  {hospital.isVerified && (
                    <span className="bg-[#0F9D58] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
                      ★ Sehat Verified
                    </span>
                  )}
                  <span className="bg-[#EA580C] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
                    {hospital.city} Registration
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                  {hospital.name}
                </h2>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 cursor-pointer transition-all"
                title="Close"
              >
                <span className="text-lg font-bold leading-none block w-4 h-4 flex items-center justify-center">×</span>
              </button>
            </div>

            {/* Modal Body scrollable area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Address Map Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C]">Hospital Identity & Location</span>
                <p className="text-gray-700 font-bold text-sm flex items-start gap-1.5">
                  <Navigation className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                  <span>{hospital.address}, {hospital.area}, {hospital.city}, Bihar</span>
                </p>
                <div className="bg-gray-50 border border-gray-150 p-2.5 rounded-xl font-mono text-[10px] text-gray-500 flex justify-between items-center">
                  <span>🛰️ GPS Coordinates: {hospital.location.lat.toFixed(6)}° N, {hospital.location.lng.toFixed(6)}° E</span>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-55/15 px-1.5 py-0.5 rounded-md">Map Geo-located</span>
                </div>
              </div>

              {/* Patient Satisfaction Index breakdowns */}
              <div className="bg-[#FFFDFB] border border-orange-100 p-4.5 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-black uppercase text-[#EA580C] flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Patient Care Quality Ratings
                  </span>
                  <div className="flex items-center gap-1 bg-[#FFF3EE] border border-[#FFD9C6] px-2.5 py-1 rounded-xl">
                    <span className="text-xs font-black text-[#EA580C]">{hospital.rating}</span>
                    <span className="text-yellow-500 text-[11px]">★</span>
                    <span className="text-[10px] font-semibold text-gray-500">({hospital.reviewsCount} verified reviews)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-150 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-550 uppercase">
                      <span>Clinical Care Quality</span>
                      <span className="text-[#0F9D58]">{hospital.ratingBreakdown.care} / 5</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0F9D58] h-full" style={{ width: `${(hospital.ratingBreakdown.care / 5) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-150 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-550 uppercase">
                      <span>Affordability Cost Index</span>
                      <span className="text-[#EA580C]">{hospital.ratingBreakdown.cost} / 5</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#EA580C] h-full" style={{ width: `${(hospital.ratingBreakdown.cost / 5) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-150 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-550 uppercase">
                      <span>Queue & Waiting Times</span>
                      <span className="text-blue-600">{hospital.ratingBreakdown.queue} / 5</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${(hospital.ratingBreakdown.queue / 5) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ICU and NICU real-time beds statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/20 border border-emerald-100 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">ICU Beds Roster</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${hospital.icuBedsAvailable > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {hospital.icuBedsAvailable > 0 ? 'Vacancies Alert' : 'No vacant beds'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-emerald-950">
                      {hospital.icuBedsAvailable} <span className="text-[12px] text-gray-500 font-bold">beds free</span>
                    </div>
                    <p className="text-[10.5px] text-gray-500 font-semibold">Total licensed ICU beds capacity: <strong className="text-emerald-950">{hospital.icuBedsTotal}</strong></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/20 border border-blue-100 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Neonatal ICU (NICU) Status</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-850">
                      Standard Care
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-blue-950">
                      {hospital.nicuBedsAvailable} <span className="text-[12px] text-gray-500 font-bold">beds free</span>
                    </div>
                    <p className="text-[10.5px] text-gray-500 font-semibold">Specialized neonatal pediatric incubators equipped for newborn infants.</p>
                  </div>
                </div>
              </div>

              {/* Specializations list */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C]">Accredited Clinical Specialties</span>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.specialization.map((spec, i) => (
                    <span key={i} className="text-xs font-bold text-slate-800 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-1.5 flex items-center gap-1.5 shadow-3xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D58]" />
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Facilities array */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C]">Infrastructure & Diagnostic Equipment Facilities</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hospital.facilities && hospital.facilities.map((fac, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2">
                      <span className="text-xs">⚡</span>
                      <span className="font-semibold text-slate-700 leading-tight">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurances & Benefit partnerships */}
              <div className="bg-slate-50 border border-gray-200 p-4 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">Direct Cashless, Insurance & TPA Support Panels</span>
                <div className="grid grid-cols-2 gap-3 font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${hospital.features.cashless ? 'bg-[#0F9D58]' : 'bg-gray-300'}`}>✓</span>
                    <span>Cashless Facility: {hospital.features.cashless ? 'Active Partnership' : 'Inactive'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${hospital.features.tpaSupport ? 'bg-[#0F9D58]' : 'bg-gray-300'}`}>✓</span>
                    <span>TPA Claim Desk: {hospital.features.tpaSupport ? 'Available Direct' : 'Liaison Desk Required'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${hospital.features.mri ? 'bg-[#4285F4]' : 'bg-gray-300'}`}>✓</span>
                    <span>High-Tesla MRI Imaging: {hospital.features.mri ? 'In-House Scan Unit' : 'External Referral'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${hospital.features.ambulance ? 'bg-red-500' : 'bg-gray-300'}`}>✓</span>
                    <span>24x7 Ambulance fleet: {hospital.features.ambulance ? 'GPS Fleet Active' : 'On-Call Arrangement'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-slate-50 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">SEHAT SETU ID: {hospital.id}</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    onBook(hospital);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#0F9D58] hover:bg-[#0b8043] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
                >
                  <Calendar className="w-4 h-4" /> Book Appointment
                </button>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center bg-gray-200 hover:bg-gray-250 text-gray-800 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  Close Desk
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
