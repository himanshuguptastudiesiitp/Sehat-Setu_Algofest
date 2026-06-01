import React from 'react';
import { Hospital } from '../types';
import { Check, X, ShieldAlert, GitCompare, Landmark, HeartHandshake, Eye, Award } from 'lucide-react';

interface HospitalCompareProps {
  comparingHospitals: Hospital[];
  onRemove: (id: string) => void;
  onBook: (hospital: Hospital) => void;
  onClearAll: () => void;
}

export default function HospitalCompare({ comparingHospitals, onRemove, onBook, onClearAll }: HospitalCompareProps) {
  if (comparingHospitals.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-150 border-dashed rounded-3xl p-8 text-center max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[220px]">
        <GitCompare className="w-10 h-10 text-gray-300 mb-3" />
        <h3 className="font-sans font-bold text-gray-800 text-base leading-none">No Hospitals Selected for Comparison</h3>
        <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
          Select individual cards from the hospital directory using the <strong>Compare</strong> toggle to inspect bed spaces, cashless network support, and rating segment comparisons side-by-side.
        </p>
      </div>
    );
  }

  // Helper rating bar representation
  const renderRateBar = (label: string, value: number, colorClass: string) => {
    const percentage = value * 20; // convert 0-5 to 0-100%
    return (
      <div className="space-y-1 my-1.5 text-left">
        <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500 uppercase">
          <span>{label}</span>
          <span className="font-extrabold text-gray-800">{value} / 5</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} rounded-full transition-all duration-300`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs max-w-4xl mx-auto" id="comparison-block">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div>
          <h2 className="text-lg font-sans font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
            <GitCompare className="w-5 h-5 text-[#4285F4]" />
            Side-by-Side Comparison Engine
          </h2>
          <p className="text-xs text-gray-500 mt-1">Direct parameter inspections on up to 3 selected clinics in the Patna/Gaya super-specialty grid.</p>
        </div>
        <button 
          onClick={onClearAll}
          className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Clear Selection ({comparingHospitals.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparingHospitals.map(hospital => (
          <div 
            key={hospital.id} 
            className="border border-gray-150 rounded-2xl p-5 flex flex-col relative bg-gray-50/30"
          >
            {/* Close element icon */}
            <button 
              onClick={() => onRemove(hospital.id)}
              className="absolute top-3 right-3 bg-white hover:bg-rose-50 hover:text-rose-600 border border-gray-200 hover:border-rose-100 p-1 rounded-full transition-colors cursor-pointer"
              aria-label="Remove comparison item"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Visual Title Header */}
            <div className="mb-4 pr-6">
              <span className="inline-flex items-center bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm tracking-wider mb-1.5">
                {hospital.city}
              </span>
              <h3 className="font-sans font-bold text-base text-gray-900 tracking-tight leading-snug">
                {hospital.name}
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">{hospital.area}</p>
            </div>

            {/* Critical Bed count compared */}
            <div className="bg-white border border-gray-150 rounded-xl p-3 mb-4 space-y-1.5 text-center shadow-3xs">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Beds Space Live</span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="border-r border-gray-100">
                  <span className="block text-[9px] text-gray-400 leading-none">ICU FREE</span>
                  <span className="text-lg font-extrabold text-[#0F9D58] block mt-1">{hospital.icuBedsAvailable} <span className="text-[10px] font-normal text-gray-450">/ {hospital.icuBedsTotal}</span></span>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-400 leading-none">NICU FREE</span>
                  <span className="text-lg font-extrabold text-[#4285F4] block mt-1">{hospital.nicuBedsAvailable}</span>
                </div>
              </div>
            </div>

            {/* Rating breakdown meters compared */}
            <div className="space-y-2 mb-4 bg-white border border-gray-150 p-3.5 rounded-xl shadow-3xs">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center leading-none mb-2">Category Scores</span>
              {renderRateBar("Facility Care Level", hospital.ratingBreakdown.care, "bg-[#0F9D58]")}
              {renderRateBar("Cost Index Value", hospital.ratingBreakdown.cost, "bg-[#4285F4]")}
              {renderRateBar("OPD Wait Queue", hospital.ratingBreakdown.queue, "bg-amber-500")}
            </div>

            {/* Boolean specs compared */}
            <div className="space-y-2 text-xs border-t border-gray-100 pt-3.5 mb-4 text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Standard MRI available:</span>
                {hospital.features.mri ? (
                  <Check className="w-4 h-4 text-[#0F9D58] stroke-[3]" />
                ) : (
                  <X className="w-4 h-4 text-[#EA4335] stroke-[3]" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">24x7 Ambulance fleet:</span>
                {hospital.features.ambulance ? (
                  <Check className="w-4 h-4 text-[#0F9D58] stroke-[3]" />
                ) : (
                  <X className="w-4 h-4 text-[#EA4335] stroke-[3]" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Claims Cashless Partner:</span>
                {hospital.features.cashless ? (
                  <Check className="w-4 h-4 text-[#0F9D58] stroke-[3]" />
                ) : (
                  <X className="w-4 h-4 text-[#EA4335] stroke-[3]" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">Empanelled TPA:</span>
                {hospital.features.tpaSupport ? (
                  <Check className="w-4 h-4 text-[#0F9D58] stroke-[3]" />
                ) : (
                  <X className="w-4 h-4 text-[#EA4335] stroke-[3]" />
                )}
              </div>
            </div>

            {/* Call to action booking */}
            <button 
              onClick={() => onBook(hospital)}
              className="w-full bg-[#0F9D58] hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors mt-auto cursor-pointer"
            >
              Book At {hospital.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
