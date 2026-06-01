import React, { useState, useEffect } from 'react';
import { Treatment, InsuranceProvider } from '../types';
import { FileText, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, BarChart3, HelpCircle, Eye, X } from 'lucide-react';

export default function CostEstimator() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [insurances, setInsurances] = useState<InsuranceProvider[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('');
  const [coveragePercent, setCoveragePercent] = useState(80); // Slider state
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

  useEffect(() => {
    // Fetch treatments and insurance from API
    fetch('/api/treatments')
      .then(res => res.json())
      .then(data => {
        setTreatments(data);
        if (data.length > 0) setSelectedTreatmentId(data[0].id);
      });

    fetch('/api/insurance')
      .then(res => res.json())
      .then(data => {
        setInsurances(data);
        if (data.length > 0) setSelectedInsuranceId(data[0].id);
      });
  }, []);

  const activeTreatment = treatments.find(t => t.id === selectedTreatmentId);
  const activeInsurance = insurances.find(i => i.id === selectedInsuranceId);

  // Calculations
  const averageCost = activeTreatment ? activeTreatment.avgCost : 0;
  const maxCost = activeTreatment ? activeTreatment.maxCost : 0;
  const minCost = activeTreatment ? activeTreatment.minCost : 0;
  const coverageRate = activeInsurance ? activeInsurance.claimSuccessRate : 96.0;

  const estimatedInsuranceCoverage = Math.round(averageCost * (coveragePercent / 100));
  const estimatedOutPocket = Math.round(averageCost - estimatedInsuranceCoverage);

  // Render elegant vector graph trends inside the component
  const renderTrendSVG = () => {
    if (!activeTreatment || !activeTreatment.trends) return null;
    const trends = activeTreatment.trends;
    
    // Simple coordinate mapping for years 2024, 2025, 2026
    const padding = 45;
    const width = 380;
    const height = 140;

    const maxVal = Math.max(...trends.map(t => t.cost)) * 1.05;
    const minVal = Math.min(...trends.map(t => t.cost)) * 0.95;

    const getX = (index: number) => padding + (index * (width - padding * 2) / (trends.length - 1));
    const getY = (val: number) => height - padding - ((val - minVal) * (height - padding * 2) / (maxVal - minVal));

    const points = trends.map((t, idx) => `${getX(idx)},${getY(t.cost)}`).join(' ');

    return (
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F9D58" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0F9D58" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Grids / Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1" />

        {/* Shaded Area under spline */}
        <polygon 
          points={`${getX(0)},${height - padding} ${points} ${getX(trends.length - 1)},${height - padding}`}
          fill="url(#chartGrad)"
        />

        {/* Polylines */}
        <polyline
          fill="none"
          stroke="#0F9D58"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Points and Text Info */}
        {trends.map((t, index) => (
          <g key={index}>
            <circle 
              cx={getX(index)} 
              cy={getY(t.cost)} 
              r="5" 
              fill="#FFFFFF" 
              stroke="#0F9D58" 
              strokeWidth="2.5" 
            />
            {/* Year Label */}
            <text 
              x={getX(index)} 
              y={height - padding + 18} 
              fontSize="9" 
              textAnchor="middle" 
              fill="#9CA3AF"
              fontWeight="bold"
            >
              Yr {t.year}
            </text>
            {/* Cost Label */}
            <text 
              x={getX(index)} 
              y={getY(t.cost) - 10} 
              fontSize="10" 
              textAnchor="middle" 
              fill="#374151" 
              fontWeight="extrabold"
            >
              ₹{(t.cost / 1000).toFixed(0)}K
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-[16px] p-6 shadow-3xs max-w-4xl mx-auto" id="cost-estimator-panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#dadce0]/60">
        <div>
          <h2 className="text-xl font-sans font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0F9D58]" />
            Surgical Cost Intelligence Engine
          </h2>
          <p className="text-xs text-gray-500 mt-1">Configure clinical treatments, insurance networks and coverage variables for instant Patna/Bihar standard outlay estimations.</p>
        </div>
        <span className="bento-pill self-start md:self-auto border border-[#0f9d58]/15">
          ★ Realtime Cost Estimator Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
        {/* Left Side: Setup Selection */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Surgical Treatment</label>
            <select
              value={selectedTreatmentId}
              onChange={(e) => setSelectedTreatmentId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-250 cursor-pointer text-sm font-semibold p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0F9D58] focus:outline-hidden transition-all text-gray-800"
              id="select-treatment"
            >
              {treatments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Health Insurance Partner</label>
            <select
              value={selectedInsuranceId}
              onChange={(e) => setSelectedInsuranceId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-250 cursor-pointer text-sm font-semibold p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0F9D58] focus:outline-hidden transition-all text-gray-800"
              id="select-insurance"
            >
              {insurances.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.claimSuccessRate}% claim rate)</option>
              ))}
            </select>
          </div>

          {/* Coverage Percent Sliding Gauge bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adjust Co-pay Coverage</label>
              <span className="text-sm font-extrabold text-[#0F9D58]">{coveragePercent}% Covered</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="100" 
              step="5"
              value={coveragePercent}
              onChange={(e) => setCoveragePercent(Number(e.target.value))}
              className="w-full accent-[#0F9D58] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
              id="copay-slider"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1 uppercase">
              <span>50% Copay</span>
              <span>100% Full Cashless</span>
            </div>
          </div>

          {/* Treatment Details Box */}
          {activeTreatment && (
            <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl text-xs space-y-2.5">
              <div className="flex items-start gap-1 text-gray-700">
                <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 leading-none mb-1">Clinical Definition</h4>
                  <p className="leading-relaxed leading-normal text-gray-500">{activeTreatment.description}</p>
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-200/60 pt-2 text-gray-700">
                <span className="font-semibold text-gray-500">Standard Duration:</span>
                <span className="font-extrabold text-[#0F9D58]">{activeTreatment.duration}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTreatmentModal(true)}
                className="w-full mt-2.5 inline-flex items-center justify-center gap-1 bg-[#FFF3EE] hover:bg-[#FFE5D8] text-[#EA580C] text-xs py-2 px-3 rounded-lg border border-[#FFD2BC] transition-all cursor-pointer font-extrabold shadow-3xs"
              >
                <Eye className="w-3.5 h-3.5" /> View Protocols & Standard Details
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Analysis and Graphing visualizations */}
        <div className="md:col-span-3 space-y-5">
          {/* Main cost meter block */}
          <div className="bg-gradient-to-br from-gray-50 to-emerald-50/10 border border-gray-150 p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Treatment Pricing Spectrums (INR)</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-white border border-gray-200 p-2.5 rounded-xl shadow-3xs">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subsidized Min</span>
                <span className="text-xs font-bold text-gray-500 underline decoration-emerald-500">starts at</span>
                <span className="block text-sm font-extrabold text-gray-800 focus:outline-hidden mt-0.5">₹{minCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50/30 border border-emerald-100/50 p-2.5 rounded-xl shadow-3xs">
                <span className="block text-[10px] font-bold text-[#0F9D58] uppercase tracking-wider">Average Cost</span>
                <span className="text-xs font-semibold text-gray-500">Patient Mean</span>
                <span className="block text-base font-extrabold text-emerald-800 mt-0.5">₹{averageCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white border border-gray-200 p-2.5 rounded-xl shadow-3xs">
                <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider">Estimated Max</span>
                <span className="text-xs font-semibold text-gray-500">Premium ward</span>
                <span className="block text-sm font-extrabold text-gray-800 mt-0.5">₹{maxCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* In-pocket vs Claims breakdown progress bar visual */}
            <div className="space-y-2 bg-white border border-gray-150 p-4 rounded-xl text-xs shadow-3xs">
              <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-2 text-center">Outlay Co-pay Distribution</h4>
              <div className="h-6 w-full bg-gray-100 rounded-lg overflow-hidden flex font-bold text-center text-[10px]">
                <div 
                  className="bg-[#0F9D58] text-white flex items-center justify-center transition-all duration-300"
                  style={{ width: `${coveragePercent}%` }}
                >
                  Insurance: ₹{estimatedInsuranceCoverage.toLocaleString('en-IN')}
                </div>
                <div 
                  className="bg-[#EA4335] text-white flex items-center justify-center transition-all duration-300 flex-1"
                >
                  Out-Of-Pocket: ₹{estimatedOutPocket.toLocaleString('en-IN')}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center leading-normal pt-1.5">
                Calculations derived from Star Rate and TPA averages on Patna medical clinics. Outlays may vary depending on ICU days and bed level selected.
              </p>
            </div>
          </div>

          {/* SVG Trends Segment */}
          <div className="bg-white border border-gray-150 p-4 rounded-2xl flex flex-col items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 self-start flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#0F9D58]" />
              Historical Surgery Cost Inflation Trends (Median Patna)
            </h3>
            <div className="w-full h-36 flex items-center justify-center bg-gray-50 rounded-xl border border-dotted border-gray-200 p-1">
              {renderTrendSVG()}
            </div>
          </div>
        </div>
      </div>

      {/* Package inclusion lists */}
      {activeTreatment && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Clinical Package Inclusions (Standardized)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeTreatment.packageDetails.map((det, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-150 p-3 rounded-xl text-xs font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0" />
                <span>{det}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED SURGICAL TREATMENT OVERLAY MODAL */}
      {showTreatmentModal && activeTreatment && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in"
          id={`treatment-details-modal-${activeTreatment.id}`}
          onClick={() => setShowTreatmentModal(false)}
        >
          <div 
            className="bg-white border text-gray-800 border-gray-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8 cursor-default max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 shrink-0 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#EA580C] bg-[#FFF3EE] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  🏥 Verified Clinical Protocol Sheet
                </span>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none pt-1">
                  {activeTreatment.name}
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{activeTreatment.category} Category</p>
              </div>
              <button 
                onClick={() => setShowTreatmentModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full p-1.5 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Scroll area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Definition block */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C]">Treatment Description</span>
                <p className="text-gray-750 font-semibold leading-relaxed text-sm bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  {activeTreatment.description}
                </p>
              </div>

              {/* Standard Hospital Outlays and statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FFFDFB] border border-orange-100 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EA580C]">Standard Duration</span>
                  <div className="text-xl font-black text-gray-900">{activeTreatment.duration}</div>
                  <p className="text-gray-500 font-semibold text-[10.5px]">Standardized post-op bed duration allocated under standard Patna clinical board oversight.</p>
                </div>

                <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F9D58]">Average Cost Cap</span>
                  <div className="text-xl font-black text-emerald-800">₹{activeTreatment.avgCost.toLocaleString('en-IN')}</div>
                  <p className="text-gray-500 font-semibold text-[10.5px]">Includes phlebotomy standard, sterile OT fee, surgical supplies, and basic room rent.</p>
                </div>
              </div>

              {/* Pre-Operative Preparation protocols */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">⚠️ Pre-Operative Standard Preparations (Patient Guide)</span>
                <div className="space-y-1.5 text-gray-700">
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p className="leading-relaxed font-semibold">
                      <strong>NPO (Fasting Guidelines):</strong> Absolute fasting is mandatory for 8-12 hours prior to the estimated surgery time. Avoid taking solid foods, fluids, or water.
                    </p>
                  </div>
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white font-extrabold text-[9px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p className="leading-relaxed font-semibold">
                      <strong>Mandatory Clinical Screens:</strong> Patients must present recent Complete Blood Count (CBC), Serum Creatinine, Random Blood Sugar (RBS), ECG, and coagulation profile reports before anesthesia clearance.
                    </p>
                  </div>
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p className="leading-relaxed font-semibold">
                      <strong>Active Medication Disclosures:</strong> Notify your surgeon of any blood thinners (aspirin, clopidogrel), diabetic treatments, or cardiac pills.
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating steps */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">🛠️ Standard Operating Theater (OT) Safeguards</span>
                <p className="text-gray-550 leading-relaxed font-semibold bg-gray-50 border border-gray-150 p-3 rounded-xl">
                  Every surgical episode must carry accredited phlebotomy safety barriers, sterilized instruments under autoclave regulation, full surgical gowning protocols, and the active presence of at least one chief surgeon and one anesthesiologist. Post-operative tissue recovery biopsy is triggered automatically when relevant.
                </p>
              </div>

              {/* Post-Op Care Recovery */}
              <div className="space-y-2 bg-[#FFFDFB] border border-orange-100 p-4.5 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA580C] block">🌱 Post-Operative Recovery Standards & Home Care</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-gray-700">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-[11px] text-gray-900">Immediate Nursing Care</h5>
                    <p className="leading-relaxed font-semibold text-gray-500">2-4 hours observation in post-operative recovery suite till vital stats stabilize perfectly. Vital signs monitor active.</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-[11px] text-gray-900">Suture Removal & Dressings</h5>
                    <p className="leading-relaxed font-semibold text-gray-500">Scheduled dress checks occur on Day 3. Permanent suture removal takes place between Day 7 and Day 10 at the outpatient clinic.</p>
                  </div>
                  <div className="space-y-1 col-span-1 sm:col-span-2 border-t border-orange-100 pt-2 text-orange-950">
                    <p className="leading-relaxed font-bold flex items-start gap-1">
                      <span>✓</span>
                      <span><strong>Dhanvantari AI Checkup:</strong> Sehat Setu users can instantly scan discharge summaries and phlebotomy lab reports using the AI Desk for instant transparent breakdown of healing markers and medicines dosage.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Rent and Cap ceiling transparency standard */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0F9D58]" /> Price Transparency & Cap Commitments
                </span>
                <p className="text-gray-500 font-semibold leading-relaxed">
                  Under Bihar's standardized clinical guidelines registry, Sehat Setu mapped private hospitals are committed to charging within the standard price spectrum (₹{activeTreatment.minCost.toLocaleString('en-IN')} to ₹{activeTreatment.maxCost.toLocaleString('en-IN')}) for direct standard procedures. Excess bill margins can be flagged instantly to the Bihar Clinical Grievance Board via Sehat Setu grid portal.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-gray-150 flex items-center justify-between shrink-0">
              <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">SEHAT SETU CLINICAL REF ID: {activeTreatment.id}</span>
              <button 
                type="button"
                onClick={() => setShowTreatmentModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-3xs"
              >
                Accept & Close Rationale
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
