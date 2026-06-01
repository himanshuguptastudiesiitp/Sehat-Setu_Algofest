import React, { useState, useEffect } from 'react';
import { Hospital, Doctor, Appointment } from '../types';
import { Calendar, User, Clock, Phone, FileText, CheckCircle2, ShieldEllipsis, AlertCircle } from 'lucide-react';

interface AppointmentBookerProps {
  preselectedHospital?: Hospital | null;
  preselectedDoctorId?: string | null;
  onBookingCompleted?: () => void;
}

export default function AppointmentBooker({ preselectedHospital, preselectedDoctorId, onBookingCompleted }: AppointmentBookerProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Form states
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [contactNumber, setContactNumber] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-06-01');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    fetch('/api/hospitals')
      .then(res => res.json())
      .then(data => {
        setHospitals(data);
        if (preselectedHospital) {
          setHospitalId(preselectedHospital.id);
        } else if (data.length > 0) {
          setHospitalId(data[0].id);
        }
      });

    loadAppointments();
  }, [preselectedHospital]);

  // Load doctors when hospital triggers selection
  useEffect(() => {
    if (!hospitalId) return;
    fetch(`/api/doctors?hospitalId=${hospitalId}`)
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        if (preselectedDoctorId && data.some((d: Doctor) => d.id === preselectedDoctorId)) {
          setDoctorId(preselectedDoctorId);
        } else if (data.length > 0) {
          setDoctorId(data[0].id);
        } else {
          setDoctorId('');
        }
      });
  }, [hospitalId, preselectedDoctorId]);

  const loadAppointments = () => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !contactNumber.trim()) {
      alert('Krupya patient ka naam aur telephone number bharein.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    const selectedHospital = hospitals.find(h => h.id === hospitalId);
    const selectedDoctor = doctors.find(d => d.id === doctorId);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientAge: Number(patientAge) || 28,
          patientGender,
          contactNumber,
          hospitalId,
          hospitalName: selectedHospital ? selectedHospital.name : "Associated Clinic",
          doctorId,
          doctorName: selectedDoctor ? selectedDoctor.name : "Primary Care",
          date: bookingDate,
          time: bookingTime,
          notes
        })
      });

      if (response.ok) {
        setSuccessMessage('Pranam! Aapki appointment saphalta-purvak schedule ho gayi hai. Bed state and timing confirm karne ke liye SMS bhej diya gaya hai.');
        
        // Reset inputs
        setPatientName('');
        setPatientAge('');
        setContactNumber('');
        setNotes('');
        
        loadAppointments();
        if (onBookingCompleted) {
          onBookingCompleted();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto" id="scheduler-engine">
      {/* Form column block */}
      <div className="lg:col-span-3 bg-white border border-gray-150 p-6 rounded-3xl shadow-xs">
        <h2 className="text-lg font-sans font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-1">
          <Calendar className="text-[#0F9D58] w-5 h-5" />
          OPD Slot & Telemedicine Scheduler
        </h2>
        <p className="text-xs text-gray-500 mb-5">Instantly confirm OPD consultations with verified clinical specialists in Patna & Gaya. No queue waiting fee.</p>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-xs font-semibold text-emerald-800 flex items-start gap-2.5 mb-5 shadow-3xs animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmission} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Patient Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full bg-gray-50 border border-gray-250 hover:border-gray-350 focus:border-[#0F9D58] focus:bg-white text-sm pl-10 pr-4 py-3 rounded-xl transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 9123456789"
                  className="w-full bg-gray-50 border border-gray-250 hover:border-gray-350 focus:border-[#0F9D58] focus:bg-white text-sm pl-10 pr-4 py-3 rounded-xl transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Age</label>
              <input 
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Years (e.g. 42)"
                className="w-full bg-gray-50 border border-gray-250 text-sm p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</label>
              <select 
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 cursor-pointer text-sm p-3 rounded-xl focus:bg-white font-semibold"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Preferred Time Slot</label>
              <input 
                type="text"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                placeholder="e.g. 10:30 AM"
                className="w-full bg-gray-50 border border-gray-250 text-sm p-3 rounded-xl focus:border-[#0F9D58] focus:bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hospital Destination</label>
              <select 
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 cursor-pointer text-sm p-3 rounded-xl focus:bg-white font-bold text-gray-700"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Medical Doctor</label>
              <select 
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                disabled={doctors.length === 0}
                className="w-full bg-gray-50 border border-gray-250 cursor-pointer text-sm p-3 rounded-xl focus:bg-white disabled:opacity-50 font-bold text-gray-700"
              >
                {doctors.length === 0 ? (
                  <option>No doctors scheduled here today</option>
                ) : (
                  doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Preferred Appointment Date</label>
              <input 
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 text-sm p-3 rounded-xl focus:bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Patient Symptoms / Notes</label>
              <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Regular cardiac report evaluation"
                className="w-full bg-gray-50 border border-gray-250 text-sm p-3 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0F9D58] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors mt-2 cursor-pointer"
          >
            {isSubmitting ? 'Securing slot booking...' : 'Confirm Appointment Reservation'}
          </button>
        </form>
      </div>

      {/* Right Column: Existing scheduled appointments checklist */}
      <div className="lg:col-span-2 flex flex-col justify-between">
        <div className="bg-gray-50 border border-gray-150 p-6 rounded-3xl h-full flex flex-col overflow-hidden">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 shrink-0">
            <Clock className="w-4 h-4 text-[#4285F4]" />
            Active Swasthya Queue ({appointments.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px]">
            {appointments.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <ShieldEllipsis className="w-10 h-10 text-gray-300 mb-2 animate-pulse" />
                <p className="text-xs text-gray-400 font-semibold uppercase">No Active Reservations</p>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[150px] leading-relaxed mx-auto">Book standard slots on the left for direct verified SMS integration.</p>
              </div>
            ) : (
              appointments.map(appt => (
                <div key={appt.id} className="bg-white border border-gray-150 p-4 rounded-xl shadow-3xs space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 leading-tight">{appt.patientName} ({appt.patientGender}, {appt.patientAge} yrs)</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{appt.doctorName}</p>
                    </div>
                    <span className={`inline-flex text-[9px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wide border ${
                      appt.status === 'Confirmed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-105'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-100/60 mt-2 font-mono">
                    <span className="font-semibold text-gray-400">{appt.date}</span>
                    <span className="font-semibold text-gray-400">{appt.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
