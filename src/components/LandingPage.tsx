import React from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Play, 
  BookOpen, 
  HelpCircle,
  Gem,
  Award,
  BadgeCheck
} from "lucide-react";

interface LandingPageProps {
  onStartSetup: () => void;
  onQuickLoadSample: () => void;
  onOpenApiKeyModal: () => void;
  hasUserApiKey: boolean;
}

export default function LandingPage({ onStartSetup, onQuickLoadSample, onOpenApiKeyModal, hasUserApiKey }: LandingPageProps) {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans" id="landing-container">
      {/* Upper Navigation Header - Styled like Burnout Battery with Menu */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-950 rounded-sm flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 font-bold px-2 py-0.5 rounded tracking-tight">Saerong AI HR</span>
                <span className="text-[9px] bg-indigo-650 text-white font-extrabold px-1.5 py-0.5 rounded tracking-tight">공정인사 지원</span>
              </div>
              <h1 className="text-slate-900 font-bold text-xs tracking-tight leading-4 mt-0.5">새일센터 채용 자체 평정 종합 솔루션</h1>
            </div>
          </div>

          {/* Screenshot-matched Navigation Links and Actions */}
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="hidden md:flex items-center gap-6 text-slate-600 font-sans text-xs font-bold">
              <button 
                type="button" 
                onClick={() => scrollToId("features-section")} 
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                왜 이 진단인가
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("workflow-section")} 
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                진단 절차
              </button>
              <button 
                type="button" 
                onClick={onOpenApiKeyModal} 
                className="hover:text-indigo-600 transition cursor-pointer flex items-center gap-1 text-slate-800"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${hasUserApiKey ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                API 키 등록
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenApiKeyModal}
                className={`py-1.5 px-3 rounded-full font-sans text-xs font-bold border transition cursor-pointer ${
                  hasUserApiKey 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" 
                    : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                }`}
              >
                {hasUserApiKey ? "API 키 관리 ✓" : "API 키 등록"}
              </button>
              <button
                type="button"
                onClick={onStartSetup}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white text-xs font-bold py-1.5 px-4 rounded transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>시작하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Accent Banner section */}
      <section className="bg-slate-950 text-white pt-24 pb-28 px-6 relative overflow-hidden" id="hero-section">
        {/* Minimal Linear Grid Styling mimicking the slides architectural lines */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full blur-[160px] opacity-[0.06]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-medium text-slate-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="font-sans tracking-wide">새일센터 실무자가 전하는 똑똑하고 수월한 자체 인사</span>
          </motion.div>

          <div className="space-y-5">
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-serif tracking-tight leading-[1.12] text-white font-medium"
            >
              어려운 입사지원서 심사,<br className="sm:hidden" />
              <span className="block mt-2 italic text-slate-300 font-light">
                1초 만에 공정한 AI 평정
              </span>으로 해결하세요!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 max-w-2.5xl mx-auto font-light leading-relaxed text-xs sm:text-sm font-sans"
            >
              보조금 정산, 기획력, 구직자 관리 등 <strong className="text-white font-semibold">새일센터 고유의 직무 역량</strong>을 정밀 분석하고,<br />
              입사지원서 속 필수 마스킹 개인 정보를 자동 필터링하여 완벽하고 공정한 면접 질문지까지 원스톱으로 지원합니다.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-6 text-xs"
          >
            {hasUserApiKey ? (
              <button
                type="button"
                onClick={onStartSetup}
                className="w-full sm:w-auto py-3.5 px-8 bg-indigo-400 hover:bg-indigo-500 text-white font-bold rounded-full shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🔑 API 키 등록 완료! (채용 설계 시작)</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenApiKeyModal}
                className="w-full sm:w-auto py-3.5 px-8 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🔑 API 키 등록하고 시작하기</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </button>
            )}

            <button
              type="button"
              onClick={onQuickLoadSample}
              className="w-full sm:w-auto py-3.5 px-8 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-full border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-indigo-300 fill-indigo-350" />
              <span>무료 데모/샘플 구경하기</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToId("features-section")}
              className="w-full sm:w-auto py-3.5 px-6 text-slate-400 hover:text-white font-bold transition hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>어떻게 다른가요?</span>
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.4 }}
            className="pt-10 grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto text-center border-t border-slate-900 text-slate-400 text-[11px]"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-bold text-sm sm:text-base font-serif">Perfect</span>
              <span className="text-slate-400 text-[10px]">채용절차법 블라인드 준수</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-slate-900">
              <span className="text-white font-bold text-sm sm:text-base font-serif">Yes</span>
              <span className="text-slate-400 text-[10px]">상담·행정·관리 맞춤 지표</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-bold text-sm sm:text-base font-serif">100%</span>
              <span className="text-slate-400 text-[10px]">실시간 연동형 면접 질문지</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 Core Features / Strengths Panel */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full space-y-20 bg-white" id="features-section">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Key Pillars</span>
          <h3 className="text-3xl font-serif font-medium text-slate-950 tracking-tight leading-snug">
            새일센터 인사담당자가 안심하고 사용할 수 있는 4대 장점
          </h3>
          <div className="w-12 h-[1px] bg-slate-350 mx-auto my-3" />
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            복잡하고 어려운 법률 기준과 지원서 더미 속에서 꼭 필요한 핵심 정보만 명쾌하게 정제하여 드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Strength 1 */}
          <div className="bg-white p-8 rounded border border-slate-200 hover:border-slate-400 transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-950 border border-slate-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-950 text-base flex items-center gap-2">
                  <span className="font-sans">법정 비수집 규제정보 자동 필터링</span>
                  <span className="text-[9px] bg-slate-950 text-white font-extrabold px-1.5 py-0.5 rounded">블라인드 준수</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  지원서(입사지원서 및 자소서)에 실수로 기재되기 쉬운 연령, 성별, 혼인유무, 가족 관계 등 법적으로 채점이 금지된 요소를 AI가 사전에 탐색하여 완벽 마스킹 처리하고 신뢰를 확보합니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <span>채용절차법 제4조의3 완벽 반영</span>
              <span className="text-slate-950 font-bold">감사 로그 제공</span>
            </div>
          </div>

          {/* Strength 2 */}
          <div className="bg-white p-8 rounded border border-slate-200 hover:border-slate-400 transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-950 border border-slate-200">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-950 text-base flex items-center gap-2">
                  <span className="font-sans">새일센터 실제 직무 연계형 세부 지표</span>
                  <span className="text-[9px] bg-slate-950 text-white font-extrabold px-1.5 py-0.5 rounded">현업 맞춤화</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  일반 대기업용 평가 서류가 아닙니다. 여성새로일하기센터의 주 업무인 국비 직업훈련 기획, 구인 구직 알선 및 성향 분석, 기업 네트워킹 및 행정 사후 관리에 적합한 맞춤 역량을 정확히 확인합니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <span>상담직 / 행정직 / 총괄관리직 지원</span>
              <span className="text-slate-950 font-bold">원스톱 지표화</span>
            </div>
          </div>

          {/* Strength 3 */}
          <div className="bg-white p-8 rounded border border-slate-200 hover:border-slate-400 transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-950 border border-slate-200">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-950 text-base flex items-center gap-2">
                  <span className="font-sans">도덕성·성실함 중심 인성 키워드 매칭</span>
                  <span className="text-[9px] bg-slate-950 text-white font-extrabold px-1.5 py-0.5 rounded">진성 태도 검증</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  단순 기교적 능력을 넘어 새일센터 핵심 가치에 직결되는 도전정신, 성실함, 책임감, 배려심, 긍정적 사고, 리더십 등 엄선된 15개 핵심 인성 예시를 매칭해 인격적 적합성을 다층적으로 추출해 냅니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <span>주관성 및 직무 무관 인성 제거</span>
              <span className="text-slate-950 font-bold">15개 인성풀 탑재</span>
            </div>
          </div>

          {/* Strength 4 */}
          <div className="bg-white p-8 rounded border border-slate-200 hover:border-slate-400 transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-950 border border-slate-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-950 text-base flex items-center gap-2">
                  <span className="font-sans">즉시 활용 가능한 AI 면접 유도 질문지</span>
                  <span className="text-[9px] bg-slate-950 text-white font-extrabold px-1.5 py-0.5 rounded">면접관 리드서</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  평정 후 면접 위원들이 곧장 사용할 수 있도록 실질적인 증빙 보조 서류 제안 및 직무 실무 역량 체크포인트, 감정노동 회복탄력성 검증 코너 등 실질적인 질문지를 체계적으로 생성해 줍니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <span>서류 점검용 질문 6~9개 상시 도출</span>
              <span className="text-slate-950 font-bold">리포트 다운로드 가능</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Steps (3 Easy steps) */}
      <section className="bg-slate-50 border-y border-slate-200 py-24 px-6" id="workflow-section">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">How It Works</span>
            <h3 className="text-3xl font-serif text-slate-950 tracking-tight font-medium">
              클릭 세 번으로 끝나는 무결점 채점 단계
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto font-sans leading-relaxed">
              복잡하고 복잡한 서류 평가는 가라! 새일센터 최적 구조 설계에 입각해 실무자분들의 고민을 순식간에 해소해 드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded border border-slate-200 shadow-sm relative flex flex-col items-center">
              <div className="absolute -top-2.5 w-7 h-7 rounded-sm bg-slate-950 text-white font-bold text-xs flex items-center justify-center font-mono">1</div>
              <div className="w-10 h-10 bg-slate-50 rounded-sm flex items-center justify-center text-slate-800 border border-slate-100 mt-2 mb-4">
                <Building2 className="w-5 h-5 text-slate-950" />
              </div>
              <h4 className="font-bold text-slate-950 text-sm mb-1 font-sans">우리 센터 기준 설정</h4>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                상담직/행정직 형태를 고르고, 센터 지점 및 구인 직무에 어울리는 인적성 지표와 직무 비율 가중치 비율을 세웁니다.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded border border-slate-200 shadow-sm relative flex flex-col items-center">
              <div className="absolute -top-2.5 w-7 h-7 rounded-sm bg-slate-950 text-white font-bold text-xs flex items-center justify-center font-mono">2</div>
              <div className="w-10 h-10 bg-slate-50 rounded-sm flex items-center justify-center text-slate-800 border border-slate-100 mt-2 mb-4">
                <FileText className="w-5 h-5 text-slate-950" />
              </div>
              <h4 className="font-sans font-bold text-slate-950 text-sm mb-1">구직 서류 복사해 넣기</h4>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                해당 지원자들의 이력사항과 자기소개서 한글 텍스트를 고스란히 긁어 복사 및 입력해 넣은 뒤 즉시 연계 분석을 가동합니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded border border-slate-200 shadow-sm relative flex flex-col items-center">
              <div className="absolute -top-2.5 w-7 h-7 rounded-sm bg-slate-950 text-white font-bold text-xs flex items-center justify-center font-mono">3</div>
              <div className="w-10 h-10 bg-slate-50 rounded-sm flex items-center justify-center text-slate-800 border border-slate-100 mt-2 mb-4">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <h4 className="font-sans font-bold text-slate-950 text-sm mb-1">AI 평정 대시보드 리드</h4>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                분석 적재 결과 기반 실시간 인격적 티어와 서열 종합 평정표를 한눈에 보면서, 면접 추천 핵심 맞춤 질문지를 출력합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Quote Zone */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full text-center space-y-8 bg-white" id="testimonial-section">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 text-slate-950 rounded border border-slate-200">
          <HelpCircle className="w-5 h-5" />
        </div>
        <p className="text-base sm:text-lg text-slate-800 italic font-serif leading-relaxed font-light">
          "매년 수십 세트씩 밀려드는 자체 새일센터 대체 인력 채용 때마다, 공정한 심사 규제와 자기소개서 요약에 시간 소모가 너무 컸습니다. 이 툴을 쓰고 나서 개인정보 위법 위배 요인도 완벽히 잡혔고, 면접관들과 질문 고민 시간도 예전의 1/5 수준으로 줄어 대단히 만족스럽습니다."
        </p>
        <div className="flex items-center justify-center gap-2">
          <BadgeCheck className="w-4 h-4 text-slate-950" />
          <span className="text-xs font-bold text-slate-950 font-sans">수도권 여성새로일하기센터 5년차 선임 직업상담원 강민아</span>
        </div>
      </section>

      {/* Funnel Call To Action bottom */}
      <section className="bg-slate-950 text-white py-20 px-6 text-center relative overflow-hidden" id="bottom-cta-section">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <h4 className="text-2xl sm:text-3.5xl font-serif tracking-tight leading-snug text-white font-medium">
            구인난으로 바쁜 새일센터 실무 현장,<br />
            지금 편리하고 똑똑하게 가동해 보세요!
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed font-light">
            설치 없이 브라우저에서 바로 안전하게 구동됩니다. 모든 데이터는 인터넷 상에 불법 수집되지 않고 브라우저에 임시 정량 보관되어 보안상 극히 안전합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 text-xs font-bold">
            {hasUserApiKey ? (
              <button
                type="button"
                onClick={onStartSetup}
                className="w-full sm:w-auto py-3.5 px-8 bg-white hover:bg-slate-100 text-slate-950 rounded transition cursor-pointer flex items-center justify-center gap-1 shadow"
              >
                <span>새로운 채용조건 설정하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenApiKeyModal}
                className="w-full sm:w-auto py-3.5 px-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition cursor-pointer flex items-center justify-center gap-1 shadow"
              >
                <span>🔑 API 키 등록하고 시작하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onQuickLoadSample}
              className="w-full sm:w-auto py-3.5 px-8 bg-slate-900 hover:bg-slate-850 hover:text-white rounded transition border border-slate-800 text-slate-300 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-white fill-white" />
              <span>샘플로 1초 만에 실행하기</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
