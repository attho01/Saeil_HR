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
}

export default function LandingPage({ onStartSetup, onQuickLoadSample }: LandingPageProps) {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans" id="landing-container">
      {/* Upper Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full font-sans tracking-wide">Saerong AI HR</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded">공정인사 지원</span>
              </div>
              <h1 className="text-slate-900 font-black text-sm tracking-tight leading-4">새일센터 채용 자체 평정 종합 솔루션</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onQuickLoadSample}
              className="hidden sm:flex items-center gap-1.5 py-2 px-3 text-slate-600 hover:text-slate-950 text-xs font-bold transition hover:bg-slate-100 rounded-xl"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>실제 예시 체험하기</span>
            </button>
            <button
              onClick={onStartSetup}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm shadow-indigo-100 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>시작하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Accent Banner section */}
      <section className="bg-slate-900 text-white pt-20 pb-24 px-6 relative overflow-hidden" id="hero-section">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-25"></div>
        <div className="absolute -bottom-45 -left-40 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-15"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-7">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-semibold text-indigo-300 shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>새일센터 실무자가 전하는 똑똑하고 수월한 자체 인사</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4.5xl font-black tracking-tight leading-[1.2] text-white"
            >
              어려운 이력서 심사,<br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                1초 만에 공정한 AI 평정
              </span>으로 해결하세요!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300 max-w-2.5xl mx-auto font-normal leading-relaxed"
            >
              보조금 정산, 기획력, 구직자 관리 등 <strong className="text-slate-100">새일센터 고유의 직무 역량</strong>을 정밀 분석하고,<br />
              이력서 속 필수 마스킹 개인 정보를 자동 필터링하여 완벽하고 공정한 면접 질문지까지 원스톱으로 지원합니다.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 text-sm"
          >
            <button
              onClick={onStartSetup}
              className="w-full sm:w-auto py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-900/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>우리 센터 조건에 맞춰 지표 만들기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onQuickLoadSample}
              className="w-full sm:w-auto py-4 px-8 bg-slate-800 hover:bg-slate-700/90 text-slate-200 hover:text-white font-extrabold rounded-2xl border border-slate-700 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>샘플 지원자로 즉시 대시보드 구경하기</span>
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.4 }}
            className="pt-8 grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto text-center border-t border-slate-800/60 text-slate-400 text-xs"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-extrabold text-base sm:text-lg">Perfect</span>
              <span>채용절차법 블라인드 준수</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-slate-800/80">
              <span className="text-white font-extrabold text-base sm:text-lg">Yes</span>
              <span>상담·행정·관리 맞춤 지표</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-extrabold text-base sm:text-lg">100%</span>
              <span>실시간 연동형 면접 질문지</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 Core Features / Strengths Panel */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-16" id="features-section">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">Key Pillars</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            새일센터 인사담당자가 안심하고 사용할 수 있는 4대 장점
          </h3>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            복잡하고 어려운 법률 기준과 지원서 더미 속에서 꼭 필요한 핵심 정보만 명쾌하게 정제하여 드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Strength 1 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm shadow-rose-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>법정 비수집 규제정보 자동 필터링</span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.5 rounded">블라인드 준수</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  지원서(이력서 및 자소서)에 실수로 기재되기 쉬운 연령, 성별, 혼인유무, 가족 관계 등 법적으로 채점이 금지된 요소를 AI가 사전에 탐색하여 완벽 마스킹 처리하고 신뢰를 확보합니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span>채용절차법 제4조의3 완벽 반영</span>
              <span className="text-indigo-600 font-bold">감사 로그 제공</span>
            </div>
          </div>

          {/* Strength 2 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>새일센터 실제 직무 연계형 세부 지표</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded">현업 맞춤화</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  일반 대기업용 평가 서류가 아닙니다. 여성새로일하기센터의 주 업무인 국비 직업훈련 기획, 구인 구직 알선 및 성향 분석, 기업 네트워킹 및 행정 사후 관리에 적합한 맞춤 역량을 정확히 확인합니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span>상담직 / 행정직 / 총괄관리직 지원</span>
              <span className="text-indigo-600 font-bold">원스톱 지표화</span>
            </div>
          </div>

          {/* Strength 3 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>도덕성·성실함 중심 인성 키워드 매칭</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded">진성 태도 검증</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  단순 기교적 능력을 넘어 새일센터 핵심 가치에 직결되는 도전정신, 성실함, 책임감, 배려심, 긍정적 사고, 리더십 등 엄선된 15개 핵심 인성 예시를 매칭해 인격적 적합성을 다층적으로 추출해 냅니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span>주관성 및 직무 무관 인성 제거</span>
              <span className="text-indigo-600 font-bold">15개 인성풀 탑재</span>
            </div>
          </div>

          {/* Strength 4 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shadow-amber-100">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>즉시 활용 가능한 AI 면접 유도 질문지</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded">면접관 리드서</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  평정 후 면접 위원들이 곧장 사용할 수 있도록 실질적인 증빙 보조 서류 제안 및 직무 실무 역량 체크포인트, 감정노동 회복탄력성 검증 코너 등 실질적인 질문지를 체계적으로 생성해 줍니다.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span>서류 점검용 질문 6~9개 상시 도출</span>
              <span className="text-indigo-600 font-bold">리포트 다운로드 가능</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Steps (3 Easy steps) */}
      <section className="bg-slate-100 py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs text-indigo-600 font-extrabold tracking-wider uppercase">How It Works</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              클릭 세 번으로 끝나는 무결점 채점 단계
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto font-sans leading-relaxed">
              복잡하고 복잡한 서류 평가는 가라! 새일센터 최적 구조 설계에 입각해 실무자분들의 고민을 순식간에 해소해 드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition relative flex flex-col items-center">
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 mt-2 mb-4">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">우리 센터 기준 설정</h4>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                상담직/행정직 형태를 고르고, 센터 지점 및 구인 직무에 어울리는 인적성 지표와 직무 비율 가중치 비율을 세웁니다.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition relative flex flex-col items-center">
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 mt-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">구직 서류 복사해 넣기</h4>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                해당 지원자들의 이력사항과 자기소개서 한글 텍스트를 고스란히 긁어 복사 및 입력해 넣은 뒤 즉시 연계 분석을 가동합니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition relative flex flex-col items-center">
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 mt-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">AI 평정 대시보드 리드</h4>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                분석 적재 결과 기반 실시간 인격적 티어와 서열 종합 평정표를 한눈에 보면서, 면접 추천 핵심 맞춤 질문지를 출력합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Quote Zone */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full">
          <HelpCircle className="w-6 h-6" />
        </div>
        <p className="text-base sm:text-lg text-slate-700 italic font-medium leading-relaxed">
          "매년 수십 세트씩 밀려드는 자체 새일센터 대체 인력 채용 때마다, 공정한 심사 규제와 자기소개서 요약에 시간 소모가 너무 컸습니다. 이 툴을 쓰고 나서 개인정보 위법 위배 요인도 완벽히 잡혔고, 면접관들과 질문 고민 시간도 예전의 1/5 수준으로 줄어 대단히 만족스럽습니다."
        </p>
        <div className="flex items-center justify-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-900">수도권 여성새로일하기센터 5년차 선임 직업상담원 강민아</span>
        </div>
      </section>

      {/* Funnel Call To Action bottom */}
      <section className="bg-slate-900 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h4 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            구인난으로 바쁜 새일센터 실무 현장,<br />
            지금 편리하고 똑똑하게 가동해 보세요!
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            설치 없이 브라우저에서 바로 안전하게 구동됩니다. 모든 데이터는 인터넷 상에 불법 수집되지 않고 브라우저에 임시 정량 보관되어 보안상 극히 안전합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 text-xs font-bold">
            <button
              onClick={onStartSetup}
              className="w-full sm:w-auto py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow shadow-indigo-900/50"
            >
              <span>새로운 채용조건 설정하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onQuickLoadSample}
              className="w-full sm:w-auto py-3.5 px-6 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition border border-slate-700 text-slate-300 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>샘플로 1초 만에 실행하기</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
