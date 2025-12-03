
import React, { useState } from 'react';
import { BUILDING_USES } from '../constants';
import { UserInput } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [address, setAddress] = useState('');
  const [landArea, setLandArea] = useState('');
  const [userZoning, setUserZoning] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [selectedMainUse, setSelectedMainUse] = useState('');
  const [selectedSubUse, setSelectedSubUse] = useState('');

  const subUseOptions = BUILDING_USES.find(u => u.main === selectedMainUse)?.sub || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && landArea && selectedMainUse && selectedSubUse) {
      onSubmit({ 
        address, 
        landArea,
        mainUse: selectedMainUse, 
        subUse: selectedSubUse,
        userZoning,
        userDistrict
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">건축 규제 분석 요청</h2>
        <p className="text-slate-500">대지 정보와 용도를 입력하면 건폐율, 용적률, 관계 법규를 분석합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Address Input */}
            <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                대지 위치 (주소/지번)
            </label>
            <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="예: 서울특별시 강남구 역삼동 123-45"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder-slate-400"
                required
                disabled={isLoading}
            />
            </div>
            
            {/* Land Area Input */}
            <div>
            <label htmlFor="landArea" className="block text-sm font-semibold text-slate-700 mb-2">
                대지면적 (m²)
            </label>
            <input
                id="landArea"
                type="number"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder="예: 330"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder-slate-400"
                required
                min="1"
                disabled={isLoading}
            />
            </div>
        </div>

        {/* Optional: User Defined Zoning */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    용도지역/지구 정보 (선택사항)
                </label>
                <a 
                    href="http://www.eum.go.kr/web/am/amMain.jsp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1 font-medium"
                >
                    토지이음(LURIS)에서 확인하기
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
            <p className="text-xs text-slate-500 mb-3">
                정확한 분석을 위해 토지이용계획확인서 상의 정보를 직접 입력하는 것을 권장합니다. 입력하지 않으면 AI가 주소를 기반으로 추론합니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    value={userZoning}
                    onChange={(e) => setUserZoning(e.target.value)}
                    placeholder="용도지역 (예: 제2종일반주거지역)"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm outline-none"
                    disabled={isLoading}
                />
                <input
                    type="text"
                    value={userDistrict}
                    onChange={(e) => setUserDistrict(e.target.value)}
                    placeholder="기타 지구 (예: 시가지경관지구)"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm outline-none"
                    disabled={isLoading}
                />
            </div>
        </div>

        {/* Main Use Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="mainUse" className="block text-sm font-semibold text-slate-700 mb-2">
              주용도
            </label>
            <div className="relative">
              <select
                id="mainUse"
                value={selectedMainUse}
                onChange={(e) => {
                  setSelectedMainUse(e.target.value);
                  setSelectedSubUse(''); // Reset sub use
                }}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 appearance-none bg-white"
                required
                disabled={isLoading}
              >
                <option value="">선택해주세요</option>
                {BUILDING_USES.map((use) => (
                  <option key={use.main} value={use.main}>
                    {use.main}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sub Use Select */}
          <div>
            <label htmlFor="subUse" className="block text-sm font-semibold text-slate-700 mb-2">
              세부 용도
            </label>
            <div className="relative">
              <select
                id="subUse"
                value={selectedSubUse}
                onChange={(e) => setSelectedSubUse(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 appearance-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                required
                disabled={!selectedMainUse || isLoading}
              >
                <option value="">
                  {selectedMainUse ? "선택해주세요" : "주용도를 먼저 선택하세요"}
                </option>
                {subUseOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            isLoading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-primary-600 hover:bg-primary-700 shadow-primary-500/30"
          }`}
        >
          {isLoading ? "건축 규제 분석 중..." : "법규 분석 실행하기"}
        </button>
      </form>
    </div>
  );
};
