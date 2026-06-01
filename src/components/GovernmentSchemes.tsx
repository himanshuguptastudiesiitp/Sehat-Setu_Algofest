import React, { useState, useEffect } from 'react';
import { HealthScheme } from '../types';
import { Landmark, CheckSquare, Sparkles, BookOpen, UserCheck, ShieldCheck, AlertCircle, Eye, X } from 'lucide-react';

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState<HealthScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [showSchemeModal, setShowSchemeModal] = useState(false);

  // Eligibility check state vars
  const [familyIncome, setFamilyIncome] = useState('');
  const [hasRationCard, setHasRationCard] = useState('No');
  const [isBiharResident, setIsBiharResident] = useState('Yes');
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => {
        setSchemes(data);
        if (data.length > 0) setSelectedSchemeId(data[0].id);
      });
  }, []);

  const activeScheme = schemes.find(s => s.id === selectedSchemeId);

  const handleApplyCheck = () => {
    const income = Number(familyIncome) || 0;
    
    let eligibleList: string[] = [];
    let reason = "";

    if (hasRationCard === "Yes") {
      eligibleList.push("Ayushman Bharat PM-JAY (Free ₹5 Lakh family surgery insurance)");
    }

    if (isBiharResident === "Yes" && income <= 250000) {
      eligibleList.push("Bihar Mukhyamantri Chikitsa Sahayata Kosh (Up to ₹2.5 Lakh state surgery grant)");
    }

    if (eligibleList.length > 0) {
      setEvaluationResult({
        status: "Eligible",
        schemes: eligibleList,
        reason: "AAPKE inputs ke aadhar par aap swasthya yojanao ke yogya hain. Desk guidelines and document checks niches inspect karein."
      });
    } else {
      setEvaluationResult({
        status: "Not Eligible",
        schemes: [],
        reason: "Income caps ya ration cards limitations ki vajah se state funds available nahi hain. Krupya normal empanelled low-cost diagnostic schemes (AIIMS/IGIMS generic list) check karein."
      });
    }
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-[16px] p-6 shadow-3xs max-w-4xl mx-auto" id="govt-schemes-panel">
      <div className="border-b border-[#dadce0]/60 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#0F9D58]" />
            Ayushman Bharat & Bihar Govt Swasthya Desk
          </h2>
          <p className="text-xs text-gray-500 mt-1">Nishulk guide for subvention models, state-grant aids, CGHS guidelines, and family document checklist verification.</p>
        </div>
        <span className="bento-pill self-start sm:self-auto border border-[#0f9d58]/15">
          ★ Sarkari Desk Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* State Grants Eligibility Validator */}
        <div className="md:col-span-2 bg-gray-50 border border-gray-150 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Check eligibility (Yojana Patrata)
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Annual family income (INR)</label>
              <input 
                type="number"
                value={familyIncome}
                onChange={(e) => setFamilyIncome(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full bg-white border border-gray-250 text-xs p-3 rounded-xl focus:border-[#0F9D58] font-semibold text-gray-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Do You Hold NFSA Ration Card?</label>
              <select 
                value={hasRationCard}
                onChange={(e) => setHasRationCard(e.target.value)}
                className="w-full bg-white border border-gray-250 cursor-pointer text-xs p-3 rounded-xl font-bold text-gray-700"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bihar Permanent Resident Status?</label>
              <select 
                value={isBiharResident}
                onChange={(e) => setIsBiharResident(e.target.value)}
                className="w-full bg-white border border-gray-250 cursor-pointer text-xs p-3 rounded-xl font-bold text-gray-700"
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            <button
              onClick={handleApplyCheck}
              className="w-full bg-[#0F9D58] hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-3xs cursor-pointer transition-colors"
            >
              Analyze Yojana Patrata
            </button>
          </div>

          {evaluationResult && (
            <div className={`mt-4 p-4 rounded-xl border text-xs ${
              evaluationResult.status === "Eligible" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}>
              <h4 className="font-bold flex items-center gap-1">
                {evaluationResult.status === "Eligible" ? "✓ Patra Hain (Eligible)" : "⚠️ Aprapt (Not Eligible)"}
              </h4>
              <p className="mt-1 pb-2 leading-relaxed">{evaluationResult.reason}</p>
              {evaluationResult.schemes.map((sch: string, index: number) => (
                <div key={index} className="bg-white/80 font-bold border border-emerald-150 p-2 rounded-md mt-1.5 uppercase tracking-wide text-[9px] text-[#0F9D58]">
                  {sch}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Scheme listings */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex gap-2">
            {schemes.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSchemeId(s.id)}
                className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all text-center cursor-pointer ${
                  selectedSchemeId === s.id 
                    ? 'bg-[#0F9D58] text-white border-[#0F9D58] shadow-xs' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-250'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {activeScheme && (
            <div className="border border-gray-150 p-5 rounded-2xl bg-gray-50/10 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-white border border-gray-150 p-3.5 rounded-xl">
                <div className="space-y-1">
                  <h3 className="text-base font-sans font-extrabold text-gray-900 leading-tight">{activeScheme.name}</h3>
                  <p className="text-xs text-gray-500 leading-normal text-gray-650">{activeScheme.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchemeModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#FFF3EE] hover:bg-[#FFE5D8] text-[#EA580C] text-[10.5px] py-2 px-3 rounded-xl border border-[#FFD2BC] transition-all cursor-pointer font-extrabold shadow-3xs shrink-0 self-start md:self-auto"
                >
                  <Eye className="w-3.5 h-3.5" /> View Yojana Guidelines
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs leading-none">
                <div className="bg-white border border-gray-150 p-3 rounded-xl shadow-3xs">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Financial Cap</span>
                  <span className="text-sm font-extrabold text-[#0F9D58]">{activeScheme.coverageAmount}</span>
                </div>
                <div className="bg-white border border-gray-150 p-3 rounded-xl shadow-3xs">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Eligibility Pool</span>
                  <span className="text-xs font-bold text-gray-700 leading-tight leading-normal block">{activeScheme.eligibility}</span>
                </div>
              </div>

              {/* Required document checklists */}
              <div>
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Required Documents Checklist</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeScheme.documentsRequired.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border border-gray-150 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 shadow-3xs">
                      <input type="checkbox" defaultChecked className="accent-[#0F9D58]" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits highlight */}
              <div className="border-t border-gray-150/60 pt-4">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Key Yojana Benefits</span>
                <ul className="text-xs font-semibold text-gray-650 space-y-1.5">
                  {activeScheme.benefits.map((ben, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-normal">
                      <span className="text-[#0F9D58] font-bold">✓</span>
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GOVERNMENT YOJANA IMPLEMENTATION OVERLAY DIAGORAM */}
      {showSchemeModal && activeScheme && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in"
          id={`scheme-details-modal-${activeScheme.id}`}
          onClick={() => setShowSchemeModal(false)}
        >
          <div 
            className="bg-white border text-gray-800 border-gray-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8 cursor-default max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 shrink-0 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#EA580C] bg-[#FFF3EE] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  ✓ National Health Policy Desk
                </span>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none pt-1">
                  {activeScheme.name} — Implementation Scheme
                </h3>
                <p className="text-[11px] text-gray-550 font-semibold uppercase tracking-wider">Government of Bihar & Ministry of Health</p>
              </div>
              <button 
                onClick={() => setShowSchemeModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full p-1.5 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Scroll area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Detailed Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C]">Official Rationale</span>
                <p className="text-gray-750 font-semibold leading-relaxed text-sm bg-slate-50 border border-slate-150 p-3.5 rounded-xl">
                  {activeScheme.description}
                </p>
              </div>

              {/* Financial Cap block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FFFDFB] border border-orange-100 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EA580C]">Financial Aid Cap</span>
                  <div className="text-xl font-black text-gray-900">{activeScheme.coverageAmount}</div>
                  <p className="text-gray-500 font-semibold text-[10.5px]">Standardized post-op bed charges, sterile OT fees, and surgery packages are cashless capped under standard CGHS guidelines.</p>
                </div>

                <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F9D58]">Eligibility Pool</span>
                  <div className="text-sm font-black text-emerald-800">{activeScheme.eligibility}</div>
                  <p className="text-gray-500 font-semibold text-[10.5px]">Verified using permanent Bihar residence certificate registers, NFSA Ration Cards, SECC database listings.</p>
                </div>
              </div>

              {/* Document checklist */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">📄 Document Checklist for Application Desk</span>
                <p className="text-[11px] font-semibold text-gray-500 leading-normal">
                  Krupya nearest hospital panel par swasthya upchar ticket book karte samay in documents ki original copies sath le jayein:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeScheme.documentsRequired.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-800">
                      <span className="text-emerald-700 font-black">✓</span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by Step Government Application Steps */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">📌 Step-by-Step Offline/Online Application Process</span>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div className="space-y-0.5">
                      <h5 className="font-extrabold text-gray-900">Visit Swasthya Desk</h5>
                      <p className="text-gray-500 font-semibold">Visit the empanelled hospital (IGIMS, PMCH, AIIMS, or certified private partners in Sehat Setu) and approach the <strong>Ayushman Bharat Desk / Swasthya Mitra</strong>.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0F9D58] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div className="space-y-0.5">
                      <h5 className="font-extrabold text-gray-900">Biometric Verification & ID Check</h5>
                      <p className="text-gray-500 font-semibold">Present your Aadhaar Card and Ration Card for immediate biometric thumb/eye verification on the National Health Authority (NHA) database.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div className="space-y-0.5">
                      <h5 className="font-extrabold text-gray-900">Direct Doctor Prescription Match</h5>
                      <p className="text-gray-500 font-semibold">The hospital chief surgeon enters your specific surgical code into the Ayushman portal according to standard clinical pre-auth ceilings.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Helplines */}
              <div className="bg-[#FFFDFB] border border-orange-100 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">📞 Official Help Centers & Grievance desk</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 leading-normal">
                  <div className="space-y-0.5">
                    <h6 className="font-black text-gray-900">Ayushman Bharat PM-JAY Helpline</h6>
                    <p className="font-semibold text-gray-500">Toll-Free Phone Call: <strong>14555</strong> / 1800 111 565</p>
                  </div>
                  <div className="space-y-0.5">
                    <h6 className="font-black text-gray-900">Bihar Mukhyamantri Relief Cell</h6>
                    <p className="font-semibold text-gray-500">E-mail contact: CM-Bihar-Welfare@bihar.gov.in</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-gray-150 flex items-center justify-between shrink-0">
              <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">SEHAT SETU SCHEME REF ID: {activeScheme.id}</span>
              <button 
                type="button"
                onClick={() => setShowSchemeModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-3xs"
              >
                Accept & Close Yojana Panel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
