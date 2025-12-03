
import React, { useState } from 'react';
import { AnalysisResult, ImportanceLevel, RegulationItem, SpecialZone, PermitStep } from '../types';

interface ResultViewProps {
  data: AnalysisResult;
  onReset: () => void;
  onAnalyzeUse: (use: string) => void; // Function to trigger re-analysis for a different use
  isReanalyzing?: boolean;
}

const ImportanceBadge: React.FC<{ level: ImportanceLevel }> = ({ level }) => {
  const colors = {
    [ImportanceLevel.CRITICAL]: "bg-red-100 text-red-700 border-red-200",
    [ImportanceLevel.HIGH]: "bg-orange-100 text-orange-700 border-orange-200",
    [ImportanceLevel.MEDIUM]: "bg-yellow-100 text-yellow-700 border-yellow-200",
    [ImportanceLevel.INFO]: "bg-blue-100 text-blue-700 border-blue-200",
  };
  const labels = {
    [ImportanceLevel.CRITICAL]: "필수",
    [ImportanceLevel.HIGH]: "중요",
    [ImportanceLevel.MEDIUM]: "검토",
    [ImportanceLevel.INFO]: "참고",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[level]}`}>
      {labels[level]}
    </span>
  );
};

// --- Modals ---

const LawDetailModal: React.FC<{ item: RegulationItem; onClose: () => void }> = ({ item, onClose }) => {
    // Generate a search URL for the Korean National Law Information Center
    const lawSearchUrl = `https://www.law.go.kr/LSW/lsSc.do?menuId=1&query=${encodeURIComponent(item.codeReference)}`;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        법령 상세 정보
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                     <div className="mb-6">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">관련 법규/조항</span>
                        <div className="text-lg font-bold text-primary-700 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 flex items-center justify-between">
                            {item.codeReference}
                        </div>
                     </div>
                     
                     <div className="mb-6">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">규제 핵심 내용</span>
                        <div className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                            {item.description}
                        </div>
                     </div>

                     <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">체크리스트</span>
                        <ul className="space-y-2">
                            {item.checkPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-primary-500 mt-0.5">•</span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                     </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        닫기
                    </button>
                    <a 
                        href={lawSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        법제처 원문 보기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

const ZoneDetailModal: React.FC<{ zone: SpecialZone; onClose: () => void }> = ({ zone, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in print:hidden">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        {zone.isApplied ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                        )}
                        {zone.name}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                     <div className="mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">관련 근거 법령</span>
                        <div className="text-sm text-primary-700 bg-primary-50 border border-primary-100 rounded px-3 py-2">
                            {zone.relatedLaw}
                        </div>
                     </div>
                     <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">상세 규제 내용 및 설명</span>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {zone.description}
                        </p>
                     </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

const PermitChecklistModal: React.FC<{ 
    checklist: PermitStep[]; 
    overview: AnalysisResult['overview']; 
    onClose: () => void 
}> = ({ checklist, overview, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm overflow-y-auto print:bg-white print:static print:z-auto print:overflow-visible">
            {/* Modal Container */}
            <div className="min-h-screen flex items-center justify-center p-4 print:p-0 print:block print:min-h-0">
                {/* Printable Content Area (A4 Landscape Aspect Ratio) */}
                <div 
                    id="printable-checklist"
                    className="bg-white w-full max-w-[297mm] mx-auto rounded-none shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header (Screen only actions) */}
                    <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center print:hidden">
                        <h3 className="font-bold text-lg">인허가 체크리스트 (출력 미리보기)</h3>
                        <div className="flex gap-3">
                            <button 
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                인쇄하기 (A4)
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>

                    {/* Actual Checklist Content */}
                    <div className="p-8 md:p-12 print:p-8">
                        {/* Title Section */}
                        <div className="border-b-2 border-slate-800 pb-4 mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">건축 인허가 체크리스트</h1>
                                <span className="text-slate-500 font-medium">ArchiCheck AI Analysis Report</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                                <div>
                                    <span className="font-bold text-slate-600 mr-2">대지위치:</span>
                                    <span className="text-slate-900">{overview.address}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-600 mr-2">지역지구:</span>
                                    <span className="text-slate-900">{overview.zoning} {overview.district && `/ ${overview.district}`}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-600 mr-2">대지면적:</span>
                                    <span className="text-slate-900">{overview.landArea}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-600 mr-2">발행일자:</span>
                                    <span className="text-slate-900">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Checklist Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                            {checklist?.map((step, idx) => (
                                <div key={idx} className="break-inside-avoid">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-primary-200">
                                        <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold print:bg-slate-800 print:text-white">
                                            {idx + 1}
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800">{step.stepName}</h3>
                                    </div>
                                    <ul className="space-y-0">
                                        {step.items.map((item, itemIdx) => (
                                            <li key={itemIdx} className="flex items-start gap-3 py-2 border-b border-slate-100 text-sm text-slate-700">
                                                <div className="w-4 h-4 border border-slate-300 rounded flex-shrink-0 mt-0.5"></div>
                                                <span className="leading-snug">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 print:mt-12">
                            <p>본 체크리스트는 참고용 자료이며, 실제 인허가 과정에서는 해당 지자체 담당 공무원의 확인이 필요합니다.</p>
                            <p>Page 1 of 1</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles Injection */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printable-checklist, #printable-checklist * {
                        visibility: visible;
                    }
                    #printable-checklist {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        border: none;
                        box-shadow: none;
                        z-index: 9999;
                        overflow: visible;
                    }
                    /* Ensure background colors are printed */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};


// --- Components ---

const RegulationCard: React.FC<{ item: RegulationItem; onClickReference: (item: RegulationItem) => void }> = ({ item, onClickReference }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border border-slate-200 rounded-lg mb-3 bg-white hover:border-primary-300 transition-colors">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <ImportanceBadge level={item.importance} />
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickReference(item);
                        }}
                        className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded hover:bg-primary-100 hover:text-primary-700 hover:underline transition-colors flex items-center gap-1"
                        title="법령 상세 보기"
                    >
                        <span>{item.codeReference}</span>
                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </button>
                </div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight mt-1">{item.title}</h4>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
        {!isExpanded && <p className="text-xs text-slate-500 mt-2 line-clamp-1">{item.description}</p>}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
          <p className="text-sm text-slate-700 mt-3 mb-3 leading-relaxed">{item.description}</p>
          <div className="space-y-1">
             <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">체크리스트</h5>
             {item.checkPoints.map((point, idx) => (
                 <div key={idx} className="flex items-start gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                     <span className="text-primary-500 mt-0.5">✓</span>
                     <span>{point}</span>
                 </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProgressBar: React.FC<{ label: string; current: number; max: number; unit: string; area: number }> = ({ label, current, max, unit, area }) => {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    // Calculate precise area based on percentage
    const plannedArea = (area * (current / 100));
    const formattedPlannedArea = plannedArea.toLocaleString(undefined, { maximumFractionDigits: 1 });

    return (
        <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <div className="text-right">
                    <span className="text-lg font-bold text-primary-600">{current}{unit}</span>
                    <span className="text-xs text-slate-400 ml-1">/ 법정 {max}{unit}</span>
                </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="text-right mt-1.5 flex justify-end items-center gap-1">
                <span className="text-xs text-slate-500">계획가능면적:</span>
                <span className="text-sm font-bold text-slate-700">{formattedPlannedArea} m²</span>
            </div>
        </div>
    );
};

const SpecialZoneCard: React.FC<{ zones: SpecialZone[] }> = ({ zones }) => {
    const [selectedZone, setSelectedZone] = useState<SpecialZone | null>(null);

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">특수 규제 구역 체크</h3>
                    <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 rounded">Click to View</span>
                </div>
                <div className="p-0 divide-y divide-slate-100">
                    {zones?.map((zone, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedZone(zone)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {zone.isApplied ? (
                                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </span>
                                ) : (
                                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                )}
                                <div>
                                    <p className={`text-sm font-bold ${zone.isApplied ? 'text-red-700' : 'text-slate-700'}`}>
                                        {zone.name}
                                    </p>
                                    <p className="text-xs text-slate-500">{zone.status}</p>
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))}
                </div>
            </div>

            {selectedZone && (
                <ZoneDetailModal zone={selectedZone} onClose={() => setSelectedZone(null)} />
            )}
        </>
    );
};

export const ResultView: React.FC<ResultViewProps> = ({ data, onReset, onAnalyzeUse, isReanalyzing }) => {
  // Robust parsing of land area: remove non-numeric chars (except dot) to prevent "m² m²"
  const landAreaString = String(data.overview.landArea).replace(/[^0-9.]/g, '');
  const landAreaNum = parseFloat(landAreaString) || 0;
  
  const [selectedRegulation, setSelectedRegulation] = useState<RegulationItem | null>(null);
  const [showPermitChecklist, setShowPermitChecklist] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="mb-4 md:mb-0">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {data.overview.address}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">건축 규제 분석 보고서</h2>
            </div>
            <div className="flex gap-2">
                <button onClick={onReset} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    새로운 주소 입력
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:hidden">
            
            {/* Left Column: Basic Info & Quantitative Analysis (Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                
                {/* 1. Zoning & Overview Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">토지 개요</h3>
                        <a 
                            href="http://www.eum.go.kr/web/am/amMain.jsp" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary-600 border border-primary-200 bg-primary-50 px-2 py-0.5 rounded hover:bg-primary-100 transition-colors flex items-center gap-1"
                        >
                            토지이음에서 확인
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                    <div className="p-5 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">공부상 면적</span>
                                {/* Display parsed number to avoid duplicate units */}
                                <span className="font-semibold text-slate-800">{landAreaNum.toLocaleString()} m²</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">용도지역</span>
                                <span className="font-semibold text-primary-600">{data.overview.zoning}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs text-slate-400 block mb-1">지구/구역 (일반)</span>
                                <span className="text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                                    {data.overview.district || "해당없음"}
                                </span>
                            </div>
                         </div>
                    </div>
                </div>

                {/* 1-A. Special Zone Card (Greenbelt, etc.) */}
                {data.overview.specialZones && (
                    <SpecialZoneCard zones={data.overview.specialZones} />
                )}

                {/* 2. Quantitative Analysis Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">규모 검토</h3>
                        <span className="text-[10px] bg-white border border-slate-200 px-1.5 rounded text-slate-500">법정기준</span>
                    </div>
                    <div className="p-5">
                        <ProgressBar 
                            label="건폐율 (건축면적)" 
                            current={data.quantitative.planBCR} 
                            max={data.quantitative.legalBCR} 
                            unit="%" 
                            area={landAreaNum}
                        />
                        <ProgressBar 
                            label="용적률 (지상연면적)" 
                            current={data.quantitative.planFAR} 
                            max={data.quantitative.legalFAR} 
                            unit="%" 
                            area={landAreaNum}
                        />
                        
                        <div className="border-t border-slate-100 my-4 pt-4 space-y-3">
                            <div>
                                <span className="text-xs font-semibold text-slate-500 block">계획 가능 층수</span>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-800 font-bold">{data.quantitative.planMaxFloors}</span>
                                    <span className="text-xs text-slate-400">(법정: {data.quantitative.legalMaxFloors})</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 block">주차대수 산정</span>
                                <span className="text-slate-800 text-sm block mt-0.5">{data.quantitative.requiredParking}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 block">조경 면적</span>
                                <span className="text-slate-800 text-sm block mt-0.5">{data.quantitative.requiredLandscaping}</span>
                            </div>
                        </div>

                        {/* Permit Checklist Button */}
                        <div className="pt-2">
                             <button 
                                onClick={() => setShowPermitChecklist(true)}
                                className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-sm"
                             >
                                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                인허가 체크리스트
                             </button>
                        </div>
                    </div>
                </div>

                {/* 3. Permissible Uses List Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[500px]">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex-shrink-0">
                        <h3 className="font-bold text-slate-700">건축 가능 용도</h3>
                    </div>
                    <div className="p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <p className="text-xs text-slate-400 p-3 pb-2">
                            클릭하여 해당 용도의 상세 법규를 우측에서 확인하세요.
                        </p>
                        <ul className="space-y-1">
                            {data.overview.possibleUses.map((use, idx) => (
                                <li key={idx}>
                                    <button
                                        onClick={() => onAnalyzeUse(use)}
                                        disabled={isReanalyzing}
                                        className="w-full text-left px-3 py-2.5 text-sm rounded-md hover:bg-primary-50 hover:text-primary-700 text-slate-600 transition-colors flex justify-between items-center group"
                                    >
                                        <span className="line-clamp-1">{use}</span>
                                        <svg className="w-4 h-4 text-slate-300 group-hover:text-primary-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right Column: Regulations & Checklists */}
            <div className="lg:col-span-8">
                {isReanalyzing ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center h-full min-h-[400px] flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                        <h3 className="text-lg font-bold text-slate-800">법규 재검토 중...</h3>
                        <p className="text-slate-500">선택하신 용도에 맞는 관계 법령을 다시 분석하고 있습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                         {/* Analysis Summary */}
                        <div className="bg-primary-50 border border-primary-100 rounded-xl p-6">
                            <h3 className="font-bold text-primary-800 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                분석 결과 요약
                            </h3>
                            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                                {data.summary}
                            </p>
                        </div>

                        {/* Regulation Categories */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-800">관계 법규 상세 리스트</h3>
                                <span className="text-sm text-slate-500">총 {data.categories.reduce((acc, cat) => acc + cat.items.length, 0)}개 항목</span>
                            </div>
                            
                            <div className="space-y-8">
                                {data.categories.map((category, catIdx) => (
                                    <div key={catIdx}>
                                        <h4 className="text-lg font-bold text-slate-700 mb-3 pl-2 border-l-4 border-primary-500">
                                            {category.categoryName}
                                        </h4>
                                        <div className="space-y-3">
                                            {category.items.map((item, itemIdx) => (
                                                <RegulationCard 
                                                    key={itemIdx} 
                                                    item={item} 
                                                    onClickReference={setSelectedRegulation}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-xs text-slate-400 mt-12 pb-8 border-t border-slate-100 pt-8">
                            본 분석 결과는 건축법 시행령 및 지자체 조례의 일반적인 기준을 적용한 시뮬레이션입니다. <br/>
                            대지의 특수한 조건(경사도, 지반상태 등)이나 최신 조례 개정 사항에 따라 실제 인허가 가능 여부는 달라질 수 있습니다.
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Modal Layer */}
        {selectedRegulation && (
            <LawDetailModal 
                item={selectedRegulation} 
                onClose={() => setSelectedRegulation(null)} 
            />
        )}
        
        {showPermitChecklist && data.permitChecklist && (
            <PermitChecklistModal 
                checklist={data.permitChecklist}
                overview={data.overview}
                onClose={() => setShowPermitChecklist(false)}
            />
        )}
    </div>
  );
};
