import React, { useEffect, useState } from 'react';
import { MOCK_LOADING_STEPS } from '../constants';

export const LoadingScreen: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Cycle through messages while waiting
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % MOCK_LOADING_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center w-full max-w-2xl mx-auto">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2">건축 법규 분석 중</h3>
      <div className="h-8 overflow-hidden relative w-full">
         <p key={currentStepIndex} className="text-slate-500 animate-fade-in-up absolute w-full left-0">
           {MOCK_LOADING_STEPS[currentStepIndex]}
         </p>
      </div>
      
      <p className="mt-8 text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
        Gemini 2.5 AI 모델이 수천 페이지의 법령 데이터를 검토하고 있습니다. 잠시만 기다려주세요.
      </p>
    </div>
  );
};
