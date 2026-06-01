import React, { useState, useEffect } from 'react';
import { Hospital, Doctor, AuditLog, Review } from '../types';
import { ShieldAlert, Plus, Edit, Trash2, Sliders, FileText, CheckSquare, Eye, KeyRound, Award, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Admin section tracker
  const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors' | 'audit' | 'reviews'>('hospitals');

  // Input states for Hospital creation
  const [hName, setHName] = useState('');
  const [hAddress, setHAddress] = useState('');
  const [hCity, setHCity] = useState('Patna');
  const [hArea, setHArea] = useState('');
  const [hIcuTotal, setHIcuTotal] = useState('10');
  const [hIcuAvail, setHIcuAvail] = useState('4');
  const [hSpecialties, setHSpecialties] = useState('Cardiology, Oncology, Pediatrics');

  // Input state for doctor addition
  const [dName, setDName] = useState('');
  const [dSpecialty, setDSpecialty] = useState('Cardiology');
  const [dExp, setDExp] = useState('8');
  const [dDegree, setDDegree] = useState('MD, DNB');
  const [dFee, setDFee] = useState('500');
  const [dHospitalId, setDHospitalId] = useState('');

  // Selected hospital for Quick Beds update
  const [selectedHospId, setSelectedHospId] = useState('');
  const [quickIcuBeds, setQuickIcuBeds] = useState('5');

  // Live indicators
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    loadAllInventory();
  }, []);

  const loadAllInventory = () => {
    fetch('/api/hospitals')
      .then(res => res.json())
      .then(data => {
        setHospitals(data);
        if (data.length > 0) {
          setDHospitalId(data[0].id);
          setSelectedHospId(data[0].id);
        }
      });

    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));

    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => setAuditLogs(data));

    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => setReviews(data));
  };

  const showSuccess = (msg: string) => {
    setSuccessInfo(msg);
    setTimeout(() => {
      setSuccessInfo(null);
    }, 4000);
  };

  // Hospital CRUD
  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName.trim() || !hArea.trim()) return;

    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: hName,
          address: hAddress,
          city: hCity,
          area: hArea,
          specialization: hSpecialties.split(',').map(s => s.trim()),
          icuBedsAvailable: Number(hIcuAvail) || 0,
          icuBedsTotal: Number(hIcuTotal) || 12,
          mri: true,
          ambulance: true,
          cashless: true,
          tpaSupport: true
        })
      });

      if (response.ok) {
        showSuccess('Hospital addition successfully verified and audits signed.');
        setHName('');
        setHAddress('');
        setHArea('');
        loadAllInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBeds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospId) return;

    try {
      const response = await fetch(`/api/hospitals/${selectedHospId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icuBedsAvailable: Number(quickIcuBeds)
        })
      });

      if (response.ok) {
        showSuccess('ICU bed limits updated live.');
        loadAllInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm('Are you absolutely certain you wish to delete this hospital? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/hospitals/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showSuccess('Hospital record removed securely.');
        loadAllInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Doctor CRUD
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName.trim() || !dHospitalId) return;

    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dName,
          specialty: dSpecialty,
          experience: Number(dExp),
          degree: dDegree,
          fee: Number(dFee),
          hospitalId: dHospitalId
        })
      });

      if (response.ok) {
        showSuccess('Specialist rosters updated live.');
        setDName('');
        setDDegree('');
        setDFee('500');
        loadAllInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to remove this doctor from the network roster?')) return;
    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showSuccess('Specialist removed from roster.');
        loadAllInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs max-w-5xl mx-auto animate-fade-in" id="admin-panel-control">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-sans font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-5.5 h-5.5 text-[#0F9D58]" />
            Sehat Setu Administrator Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">Hospital admissions controls, bed updates, HIPAA security registers, doctor rosters, and patient logs moderation desk.</p>
        </div>
        <span className="self-start sm:self-auto bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          Authorized Admin Level 3
        </span>
      </div>

      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-bold p-4 rounded-xl mb-6 shadow-3xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0F9D58] shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2 flex-wrap text-xs font-bold">
        <button 
          onClick={() => setActiveTab('hospitals')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'hospitals' ? 'bg-[#0F9D58] text-white border-[#0F9D58] shadow-3xs' : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-gray-250'
          }`}
        >
          Hospitals CRUD ({hospitals.length})
        </button>
        <button 
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'doctors' ? 'bg-[#0F9D58] text-white border-[#0F9D58] shadow-3xs' : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-gray-250'
          }`}
        >
          Doctors Roster ({doctors.length})
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'reviews' ? 'bg-[#0F9D58] text-white border-[#0F9D58] shadow-3xs' : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-gray-250'
          }`}
        >
          Ratings Moderation ({reviews.length})
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'audit' ? 'bg-[#0F9D58] text-white border-[#0F9D58] shadow-3xs' : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-gray-250'
          }`}
        >
          HIPAA Audit Trails ({auditLogs.length})
        </button>
      </div>

      {/* SECTION 1: Hospitals CRUD */}
      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Rapid beds modify */}
            <div className="bg-emerald-50/20 border border-emerald-150/60 p-4 rounded-2xl">
              <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest mb-3">Live ICU Beds updater</h3>
              <form onSubmit={handleUpdateBeds} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Hospital</label>
                  <select 
                    value={selectedHospId}
                    onChange={(e) => setSelectedHospId(e.target.value)}
                    className="w-full bg-white border border-gray-250 p-2.5 rounded-lg font-semibold cursor-pointer text-gray-700"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Active ICU Beds Free</label>
                  <input 
                    type="number"
                    value={quickIcuBeds}
                    onChange={(e) => setQuickIcuBeds(e.target.value)}
                    className="w-full bg-white border border-gray-250 p-2 rounded-lg font-bold text-gray-700"
                  />
                </div>
                <button type="submit" className="w-full bg-[#0F9D58] hover:bg-emerald-700 text-white font-bold py-2 rounded-lg cursor-pointer">
                  Update Beds Count Live
                </button>
              </form>
            </div>

            {/* Add Hosptial form */}
            <div className="bg-gray-50 border border-gray-150 p-5 rounded-2xl">
              <h3 className="text-xs font-extrabold text-[#0F9D58] uppercase tracking-widest mb-3.5 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Clinic registry
              </h3>
              <form onSubmit={handleAddHospital} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hospital Brand Name</label>
                  <input 
                    type="text"
                    required
                    value={hName}
                    onChange={(e) => setHName(e.target.value)}
                    placeholder="e.g. Satyamev Hospital"
                    className="w-full bg-white border border-gray-250 p-2.5 rounded-lg text-gray-700 font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Area / Location</label>
                    <input 
                      type="text"
                      required
                      value={hArea}
                      onChange={(e) => setHArea(e.target.value)}
                      placeholder="e.g. Kankerbagh"
                      className="w-full bg-white border border-gray-250 p-2.5 rounded-lg text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">City</label>
                    <input 
                      type="text"
                      required
                      value={hCity}
                      onChange={(e) => setHCity(e.target.value)}
                      className="w-full bg-white border border-gray-250 p-2.5 rounded-lg text-gray-700 font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">ICU beds Total</label>
                    <input 
                      type="number"
                      value={hIcuTotal}
                      onChange={(e) => setHIcuTotal(e.target.value)}
                      className="w-full bg-white border border-gray-250 p-2 rounded-lg text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">ICU Beds Free</label>
                    <input 
                      type="number"
                      value={hIcuAvail}
                      onChange={(e) => setHIcuAvail(e.target.value)}
                      className="w-full bg-white border border-gray-250 p-2 rounded-lg text-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Primary Specialties List (Comma-separated)</label>
                  <input 
                    type="text"
                    value={hSpecialties}
                    onChange={(e) => setHSpecialties(e.target.value)}
                    className="w-full bg-white border border-gray-250 p-2.5 rounded-lg text-gray-700"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
                  Insert Hospital to Directory
                </button>
              </form>
            </div>
          </div>

          {/* Hospitals database list mapping */}
          <div className="lg:col-span-3 border border-gray-150 p-4 rounded-3xl bg-gray-50/20 max-h-[500px] overflow-y-auto">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-3">Live verified lists ({hospitals.length})</span>
            <div className="space-y-2.5">
              {hospitals.map(h => (
                <div key={h.id} className="bg-white border border-gray-150 p-4 rounded-xl flex items-center justify-between gap-4 shadow-3xs">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight flex items-center gap-1.5">{h.name} 
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[8px] font-extrabold px-1 rounded-sm">{h.rating} ★</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-none">{h.address}, {h.area}, {h.city}</p>
                    <p className="text-[9px] text-[#0F9D58] font-bold mt-1 uppercase tracking-wide">
                      Free ICU: {h.icuBedsAvailable} beds ({h.icuBedsTotal} total)
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteHospital(h.id)}
                    className="p-2 border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 rounded-lg shrink-0 cursor-pointer"
                    title="Remove hospital"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Doctors Roster */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-gray-50 border border-gray-150 p-5 rounded-2xl text-xs">
            <h3 className="text-xs font-extrabold text-[#0F9D58] uppercase tracking-widest mb-3 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Specialist Doctor
            </h3>
            <form onSubmit={handleAddDoctor} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Doctor Full Name</label>
                <input 
                  type="text"
                  required
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="e.g. Dr. Sudhanshu Sekhar Mishra"
                  className="w-full bg-white border border-gray-250 p-2.5 rounded-lg font-semibold text-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Specialty</label>
                  <select 
                    value={dSpecialty}
                    onChange={(e) => setDSpecialty(e.target.value)}
                    className="w-full bg-white border border-gray-250 p-2.5 rounded-lg cursor-pointer font-semibold text-gray-700"
                  >
                    <option>Cardiology</option>
                    <option>Oncology</option>
                    <option>Orthopedics</option>
                    <option>Nephrology</option>
                    <option>Urology</option>
                    <option>General Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Experience (Yrs)</label>
                  <input 
                    type="number"
                    value={dExp}
                    onChange={(e) => setDExp(e.target.value)}
                    className="w-full bg-white border border-gray-250 p-2 rounded-lg font-semibold text-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Timing degrees</label>
                  <input 
                    type="text"
                    value={dDegree}
                    onChange={(e) => setDDegree(e.target.value)}
                    placeholder="e.g. MD, DM"
                    className="w-full bg-white border border-gray-250 p-2.5 rounded-lg text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Consultation Fee (INR)</label>
                  <input 
                    type="number"
                    value={dFee}
                    onChange={(e) => setDFee(e.target.value)}
                    className="w-full bg-white border border-gray-250 p-2 rounded-lg font-bold text-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Assigned Hospital</label>
                <select 
                  value={dHospitalId}
                  onChange={(e) => setDHospitalId(e.target.value)}
                  className="w-full bg-white border border-gray-250 p-2.5 rounded-lg cursor-pointer font-bold text-gray-700"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer">
                Commit Doctor to Database
              </button>
            </form>
          </div>

          <div className="lg:col-span-3 border border-gray-150 p-4 rounded-3xl bg-gray-50/20 max-h-[500px] overflow-y-auto">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-4">Doctor Specialty Directory ({doctors.length})</span>
            <div className="space-y-2.5">
              {doctors.map(d => (
                <div key={d.id} className="bg-white border border-gray-150 p-4 rounded-xl flex items-center justify-between gap-4 shadow-3xs">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">{d.name}</h4>
                    <p className="text-[10px] text-[#0F9D58] font-bold mt-0.5 leading-none">{d.specialty} • {d.experience} Years Experience • {d.degree}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold tracking-wide">Hospital: {d.hospitalName}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1 font-semibold">Consultation Fee: ₹{d.fee}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteDoctor(d.id)}
                    className="p-2 border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 rounded-lg shrink-0 cursor-pointer"
                    title="Remove doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="space-y-3 animate-fade-in text-xs max-h-[480px] overflow-y-auto">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Verified Patient Ratings moderation panel</span>
          {reviews.length === 0 ? (
            <p className="text-gray-400 italic text-center py-8 font-semibold">No patient reviews submitted yet.</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="bg-gray-50/50 border border-gray-150 p-4 rounded-xl shadow-3xs space-y-2 flex justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 leading-tight">{r.userName}</h4>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[8px] font-extrabold px-1 rounded-sm uppercase">Verified</span>
                  </div>
                  <p className="text-xs italic text-gray-600">"{r.comment}"</p>
                  <p className="text-[9px] text-[#0F9D58] font-bold uppercase tracking-wider">Rating: {r.rating} / 5 ★ • Date: {r.date}</p>
                </div>
                <button className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-lg shrink-0 self-center">
                  Approve Review
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION 4: HIPAA Audits */}
      {activeTab === 'audit' && (
        <div className="space-y-3 overflow-y-auto max-h-[440px] border border-gray-150 p-4 rounded-2xl bg-gray-50/15 animate-fade-in font-mono text-[11px]">
          <div className="flex items-center justify-between border-b pb-2.5 mb-3 text-xs shrink-0 font-sans">
            <span className="font-extrabold text-gray-450 uppercase tracking-wider">HIPAA Audit Trails & Logs Register</span>
            <span className="bg-[#4285F4] text-white font-bold opacity-85 text-[10px] px-2 py-0.5 rounded-sm letter-spacing uppercase">Audit Active</span>
          </div>
          {auditLogs.map(log => (
            <div key={log.id} className="bg-white border border-gray-150 p-3 rounded-lg shadow-3xs space-y-1 mt-1 leading-normal">
              <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-1 flex-wrap">
                <span className="text-[#0F9D58] font-bold">[{log.action}]</span>
                <span className="text-gray-450 font-semibold">{log.timestamp}</span>
              </div>
              <p className="text-gray-700 mt-1 font-semibold"><span className="text-gray-400">Operator:</span> {log.user}</p>
              <p className="text-gray-500 mt-0.5">{log.details}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
