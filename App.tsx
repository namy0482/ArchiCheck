
import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ResultView } from './components/ResultView';
import { LoadingScreen } from './components/LoadingScreen';
import { analyzeBuildingRegulations } from './services/geminiService';
import { AnalysisResult, UserInput } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<UserInput | null>(null);

  const handleAnalysisRequest = async (input: UserInput) => {
    setIsLoading(true);
    setError(null);
    setCurrentInput(input);
    
    try {
      const data = await analyzeBuildingRegulations(input.address, input.landArea, input.mainUse, input.subUse);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async (newUse: string) => {
    if (!currentInput) return;
    
    setIsReanalyzing(true);
    // Keep existing result visible in left column if possible, but for now we replace the data
    // In a real app, we might want to update only the Right Column, but here we update the whole object
    // to maintain consistency between the "Possible Uses" list and the "Quantitative Analysis" which might slightly change for specific uses (e.g., officetel vs APT)
    
    try {
        // We treat the selected "possible use" as a generic "Main Use" or try to map it. 
        // For simplicity, we pass it as subUse and mainUse combined or let the AI infer.
        // Let's pass it as SubUse and use "기타" or infer Main Use in prompt.
        // But to be cleaner, let's just use the string as subUse.
        const data = await analyzeBuildingRegulations(currentInput.address, currentInput.landArea, "선택된 용도", newUse);
        setResult(data);
    } catch (err: any) {
        alert("해당 용도 분석 중 오류가 발생했습니다.");
    } finally {
        setIsReanalyzing(false);
    }
  };

  const resetApp = () => {
    setResult(null);
    setError(null);
    setCurrentInput(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="bg-primary-600 rounded-lg p-1.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ArchiCheck AI</h1>
          </div>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
            사용 가이드
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-bounce-in">
             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span>{error}</span>
          </div>
        )}

        {!result && !isLoading && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                건축 가능성 검토 및 <span className="text-primary-600">법규 체크리스트</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                토지 주소와 면적을 입력하면 용도지역을 추론하고<br className="hidden sm:block" />
                건폐율, 용적률 계산부터 관계 법령까지 원스톱으로 분석합니다.
              </p>
            </div>
            <InputForm onSubmit={handleAnalysisRequest} isLoading={isLoading} />
          </div>
        )}

        {isLoading && <LoadingScreen />}

        {result && (
            <ResultView 
                data={result} 
                onReset={resetApp} 
                onAnalyzeUse={handleReanalyze}
                isReanalyzing={isReanalyzing}
            />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2024 ArchiCheck AI. Powered by Google Gemini.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary-600">이용약관</a>
            <a href="#" className="hover:text-primary-600">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
