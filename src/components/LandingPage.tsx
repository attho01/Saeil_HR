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
  BadgeCheck,
  Check,
  Search,
  Globe,
  Settings,
  HelpCircle as QuestionIcon
} from "lucide-react";

interface LandingPageProps {
  onStartSetup: () => void;
  onQuickLoadSample: () => void;
  onOpenApiKeyModal: () => void;
  hasUserApiKey: boolean;
  onLogoClick?: () => void;
}

export default function LandingPage({ onStartSetup, onQuickLoadSample, onOpenApiKeyModal, hasUserApiKey, onLogoClick }: LandingPageProps) {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#2f353d] min-h-screen flex flex-col font-sans text-slate-200" id="landing-container">
      {/* 1. Header Contact Line (Top Mini Bar) from the image */}
      <div className="bg-[#1f2226] text-slate-400 text-[11px] py-2 px-6 border-b border-white/5 font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>여성가족부 고용지원 정책 준수</span>
            <span className="text-slate-600">|</span>
            <button type="button" onClick={onOpenApiKeyModal} className="hover:text-white transition">Gemini API 키 등록</button>
            <span className="text-slate-600">|</span>
            <button type="button" onClick={onStartSetup} className="hover:text-white transition">설정 마법사 실행</button>
          </div>
          <div className="flex gap-3 text-[10px] items-center">
            <span className="text-[#8ac43f] font-bold">● 공공기관 가이드라인 반영</span>
          </div>
        </div>
      </div>

      {/* 2. Brand Upper Navigation Header - Styled 100% like HOSTLINEA */}
      <header className="sticky top-0 z-40 bg-[#2f353d]/98 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo with 2 green vertical stripes and White HOSTLINEA text */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none hover:opacity-90 transition-opacity" 
            onClick={() => {
              scrollToId("landing-container");
              if (onLogoClick) onLogoClick();
            }}
          >
            <div className="flex gap-1 shrink-0">
              <div className="w-[6px] h-6 bg-[#8ac43f] rounded-xs" />
              <div className="w-[6px] h-6 bg-[#8ac43f] rounded-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-xl tracking-tight font-sans">SAEIL EVAL</span>
                <span className="text-[9px] bg-[#8ac43f] text-white font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">HR ENGINE</span>
              </div>
              <h1 className="text-slate-400 font-medium text-[10px] tracking-tight leading-3 mt-0.5">
                여성새로일하기센터 자체인사 직원 채용 평정 시스템 (Blinded v3.1)
              </h1>
            </div>
          </div>

          {/* Screenshot Match Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="hidden lg:flex items-center gap-5 text-white/80 font-sans text-xs font-bold tracking-wider">
              <button 
                type="button" 
                onClick={() => scrollToId("hero-section")} 
                className="hover:text-[#8ac43f] text-[#8ac43f] transition uppercase"
              >
                메인홈
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("what-we-offer-section")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                평정직무
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("workflow-section")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                진행과정
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("testimonial-section")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                만족도사례
              </button>
              <button 
                type="button" 
                onClick={onOpenApiKeyModal} 
                className="hover:text-[#8ac43f] transition uppercase flex items-center gap-1 text-slate-300"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hasUserApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-[#8ac43f]'}`} />
                API 연결 상태
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenApiKeyModal}
                className={`py-1.5 px-3 rounded-md font-sans text-[11px] font-bold border transition cursor-pointer ${
                  hasUserApiKey 
                    ? "bg-[#8ac43f]/20 text-white border-[#8ac43f] hover:bg-[#8ac43f]/30" 
                    : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/15"
                }`}
              >
                {hasUserApiKey ? "API 키 설정완료" : "API KEY 등록"}
              </button>
              <button
                type="button"
                onClick={onStartSetup}
                className="bg-[#8ac43f] hover:bg-[#7cb337] text-white text-[11px] font-bold py-1.5 px-3.5 rounded shadow-sm transition-all duration-150 cursor-pointer flex items-center gap-1"
                id="header-setup-trigger"
              >
                <span>인사평가 시작하기</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Section - Styled like Hostlinea with overlaid center-specific visuals */}
      <section className="relative text-white min-h-[520px] flex items-center px-6 py-20 overflow-hidden" id="hero-section" style={{
        backgroundImage: `linear-gradient(rgba(47, 53, 61, 0.75), rgba(31, 34, 38, 0.90)), url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1200&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="md:col-span-8 space-y-6">
            <span className="text-[#8ac43f] font-extrabold text-xs tracking-wider uppercase bg-[#8ac43f]/10 py-1.5 px-3 rounded-md border border-[#8ac43f]/30 w-fit block">
              ★ Saerong AI HR - Saeil Center Standard
            </span>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5.5xl font-extrabold tracking-tight leading-tight uppercase font-sans">
                여성새일센터<br />
                <span className="text-[#8ac43f]">자체직원 채용평가</span>
              </h1>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-100 max-w-2xl leading-snug">
                까다로운 자소서 심사 및 블라인드 규제, 일관성 높은 평정표와 전용 면접 질문으로 완벽하게 마감하세요!
              </h2>
            </div>

            <p className="text-slate-300 max-w-2xl font-light leading-relaxed text-xs sm:text-sm font-sans">
              보조금 정산, 일자리 네트워킹, 여성 취업 사후관리 등 <strong>여성새로일하기센터 고용서비스 업무 특성</strong>에 최적화된 직무 역량을 도량 분석합니다.
              더불어 입사지원서 내 수집금지 개인정보(연령, 가족관계, 성별 등)를 <strong>인공지능 실시간 마스킹 기술로 마스킹</strong>하여 공정한 직무 중심의 블라인드 면접 질문지 출력을 완벽 지원합니다.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 text-xs font-bold font-sans">
              <button
                type="button"
                onClick={onStartSetup}
                className="bg-[#8ac43f] hover:bg-[#7cb337] uppercase text-white font-extrabold py-3.5 px-8 rounded transition duration-150 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>인사 기준 설정 마법사 실행</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onQuickLoadSample}
                className="bg-white/10 hover:bg-white/21 border border-white/20 text-white font-extrabold uppercase py-3.5 px-6 rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>체험용 샘플 지원자 즉시 적재</span>
              </button>
            </div>
          </div>

          {/* Hero Right Floating Circle Badges from the screenshot! */}
          <div className="md:col-span-4 flex flex-row md:flex-col justify-center items-center gap-6 pt-6 md:pt-0">
            {/* White up to 50% circle */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white text-slate-900 flex flex-col items-center justify-center text-center shadow-2xl p-2 border-4 border-[#8ac43f]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">인증 지표</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">100%</span>
              <span className="text-[10px] uppercase font-extrabold text-[#8ac43f] tracking-wide mt-1">블라인드</span>
            </div>

            {/* Lime green starting at $4.99 /mo circle */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#8ac43f] text-white flex flex-col items-center justify-center text-center shadow-2xl p-2 border-4 border-white/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">새로일하기센터</span>
              <span className="text-2xl sm:text-3xl font-black text-white font-sans leading-none my-0.5">자체인사</span>
              <span className="text-[10px] font-bold text-white/90">특화 모델</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Domain check bar (Adapted to Job Type Track Indicators) */}
      <div className="bg-[#8ac43f] py-4 px-6 text-white" id="domain-pricing-bar">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 font-sans">
          
          {/* Left domain price tags */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 font-extrabold text-xs tracking-wider shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white/80 font-normal">직무 1형:</span>
              <span className="text-white text-sm">직업상담원</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/80 font-normal">직무 2형:</span>
              <span className="text-white text-sm">취업지원원</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/80 font-normal">직무 3형:</span>
              <span className="text-white text-sm">기획행정 및 교육원</span>
            </div>
          </div>

          {/* Right actual mockup search bar */}
          <div className="flex items-stretch w-full lg:max-w-xl bg-white rounded-md overflow-hidden p-1 shadow-md">
            <input 
              type="text" 
              placeholder="평정할 새일센터 명칭 입력..." 
              defaultValue="서울남부새일센터 채용 심사계획"
              className="flex-1 px-3.5 py-1.5 text-slate-800 focus:outline-none text-xs font-semibold"
              onClick={(e) => (e.target as HTMLInputElement).select()}
              readOnly
            />
            <div className="bg-slate-100/85 text-slate-600 px-3 flex items-center border-l border-slate-200 text-xs font-extrabold select-none shrink-0">
              상상 ▾
            </div>
            <button 
              type="button"
              onClick={onStartSetup}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold uppercase px-5 py-2 text-xs cursor-pointer select-none shrink-0"
            >
              인사 매뉴얼 빌드
            </button>
          </div>

        </div>
      </div>

      {/* 5. WHAT WE OFFER Section - Matched exactly with 3 beautiful boxes adapted to job profiles */}
      <section className="bg-[#2a2f36] py-20 px-6" id="what-we-offer-section">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Section title match */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold uppercase text-white tracking-widest font-sans">
              EVALUATION <span className="underline decoration-[#8ac43f] decoration-3 underline-offset-8">JOB</span> TRACKS
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans font-light leading-relaxed">
              새일센터 대표 직종의 직업상담 능력, 구인개척 네트워킹 능력, 국비교육 정산 행정 능력을 법정 마스킹 장치를 활용하여 1초 만에 최상으로 계측하는 전용 평정 가이드를 활용해 보세요.
            </p>
          </div>

          {/* 3 Large Boxes matching: Counselor, Job Matcher, Administrator split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Box 1: Counselor Profile */}
            <div className="bg-[#1f2226] border border-white/5 rounded-md p-8 text-center space-y-6 hover:border-[#8ac43f]/50 transition-all duration-350 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[#8ac43f] text-xs font-mono font-bold tracking-widest block uppercase border-b border-white/5 pb-2">새일센터 직무 1형</span>
                <h3 className="text-lg font-black text-white font-sans uppercase">직업상담원</h3>
                
                <div className="py-2">
                  <div className="text-[11px] text-slate-400">대표 분석 역량</div>
                  <div className="text-xl font-bold text-[#8ac43f] mt-1">심층 구직 매칭력</div>
                </div>

                <div className="h-[1px] bg-white/5 w-12 mx-auto" />

                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-white text-xs text-center">직무고유소양 중 구직상담 및 집단상담 집중 계측</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center font-sans">
                    전통적인 경력단절 전입 인력에 대한 이해도, 회복탄력성 지지 능력, 직업상담사 자격 기반 상담 실무 능성을 중점으로 점수 도량화 지표를 매칭합니다.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onStartSetup}
                  className="w-full py-2.5 bg-[#8ac43f] hover:bg-[#7cb337] text-white text-xs font-bold uppercase rounded transition-all cursor-pointer"
                >
                  상담직 지표 설계
                </button>
              </div>
            </div>

            {/* Box 2: Job Supporter Profile */}
            <div className="bg-[#1f2226] border border-[#8ac43f]/30 rounded-md p-8 text-center space-y-6 shadow-xl relative scale-100 flex flex-col justify-between">
              {/* Special Badge inside */}
              <div className="absolute top-2 right-2 bg-[#8ac43f] text-white font-extrabold text-[8px] uppercase tracking-wider py-1 px-2.5 rounded-sm">
                대표직무
              </div>

              <div className="space-y-4">
                <span className="text-[#8ac43f] text-xs font-mono font-bold tracking-widest block uppercase border-b border-white/5 pb-2">새일센터 직무 2형</span>
                <h3 className="text-lg font-black text-white font-sans uppercase">취업지원원</h3>
                
                <div className="py-2">
                  <div className="text-[11px] text-slate-400">대표 분석 역량</div>
                  <div className="text-xl font-bold text-[#8ac43f] mt-1">기업발굴 및 네트워크</div>
                </div>

                <div className="h-[1px] bg-white/5 w-12 mx-auto" />

                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-white text-xs text-center">새일센터 고용 생태계 연계형 외향성 개척 역량</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center font-sans">
                    일자리 발굴, 기업 네트워킹, 여성친화기업 협약 관리, 동행 면접 능동성 등 대외 협력 마인드에 비중을 두어 지원자의 직무 적합성을 조준합니다.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onStartSetup}
                  className="w-full py-2.5 bg-[#8ac43f] hover:bg-[#7cb337] text-white text-xs font-bold uppercase rounded transition-all cursor-pointer"
                >
                  지원직 지표 설계
                </button>
              </div>
            </div>

            {/* Box 3: Administrator Profile */}
            <div className="bg-[#1f2226] border border-white/5 rounded-md p-8 text-center space-y-6 hover:border-[#8ac43f]/50 transition-all duration-350 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[#8ac43f] text-xs font-mono font-bold tracking-widest block uppercase border-b border-white/5 pb-2">새일센터 직무 3형</span>
                <h3 className="text-lg font-black text-white font-sans uppercase">행정 및 직업훈련기획</h3>
                
                <div className="py-2">
                  <div className="text-[11px] text-slate-400">대표 분석 역량</div>
                  <div className="text-xl font-bold text-[#8ac43f] mt-1">보조금정산 및 국비기획</div>
                </div>

                <div className="h-[1px] bg-white/5 w-12 mx-auto" />

                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-white text-xs text-center">전수 보조금 점검 정산 및 직업안정 행정 실무력</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center font-sans">
                    지자체 예산 연계 정산 책임감, 한글 기안 업무 완결성, 데이터 소통 능력을 횡적으로 탐색해 실무 현장 배치 즉시 가동 가능한 최적 전력을 도안합니다.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onStartSetup}
                  className="w-full py-2.5 bg-[#8ac43f] hover:bg-[#7cb337] text-white text-xs font-bold uppercase rounded transition-all cursor-pointer"
                >
                  행정직 지표 설계
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. WHAT'S HOT Section - Detailed overview of features */}
      <section className="bg-[#1e2227] grid grid-cols-1 md:grid-cols-2 overflow-hidden border-t border-white/5">
        
        {/* Left half: Modern office paper discussion photo from Unsplash */}
        <div className="min-h-[380px] w-full" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45)), url('https://images.unsplash.com/photo-1542744095-291853412781?q=80&w=800&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} referrerPolicy="no-referrer" />

        {/* Right half: Detailed dark container holding stats and ticks */}
        <div className="p-8 sm:p-14 flex flex-col justify-center space-y-6 font-sans">
          <div className="space-y-1.5">
            <span className="text-[#8ac43f] font-extrabold text-[10px] uppercase tracking-widest block">Core Strengths</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-sans tracking-tight">AI 평정 엔진 핵심 강점</h3>
            <div className="w-10 h-[1.5px] bg-[#8ac43f]" />
          </div>

          <p className="text-xs text-slate-350 leading-relaxed font-light font-sans">
            새로일하기센터 실무에 가장 적절하게 튜닝된 '인성·직무 다차원 교차 분석 지표'를 토대로, 이력서와 이력사항 한글 파일 텍스트에서 보조금 정산력과 성실 협업심까지 추출합니다.
          </p>

          {/* List layout from the screenshot with check marks */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            
            <div className="flex bg-[#1f2226]/50 p-3.5 rounded-lg border border-white/5 items-start gap-4">
              {/* Circular yellow/green 100% Free badge style inside */}
              <div className="w-14 h-14 rounded-full bg-[#8ac43f] text-white flex flex-col items-center justify-center text-center shrink-0 border border-white/25 shadow-md">
                <span className="text-[8px] uppercase font-black tracking-wider leading-none">블라인드</span>
                <span className="text-[10px] font-black leading-none mt-0.5">100%</span>
              </div>
              
              <div className="space-y-1 font-sans">
                <h4 className="text-white font-extrabold text-sm block">법정 금지 개인정보 마스킹 연동</h4>
                <div className="space-y-1 text-slate-300 text-xs">
                  <div className="flex items-center gap-1.5 leading-normal">
                    <Check className="w-3.5 h-3.5 text-[#8ac43f] shrink-0" />
                    <span>개인정보위원회 블라인드 채용 가이드라인 완벽 상호 호환</span>
                  </div>
                  <div className="flex items-center gap-1.5 leading-normal">
                    <Check className="w-3.5 h-3.5 text-[#8ac43f] shrink-0" />
                    <span>자소서 본문 안의 연령, 거주지, 학교명, 성별 등 위반 요소를 사전 자동 순화</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 flex items-center justify-start">
            <button
              type="button"
              onClick={onStartSetup}
              className="px-6 py-2.5 border border-white/30 hover:border-white/90 text-white bg-transparent hover:bg-white/5 text-xs font-bold uppercase rounded transition-all cursor-pointer font-sans"
            >
              평가 엔진 기획 빌드하기 
            </button>
          </div>
        </div>

      </section>

      {/* 7. Detailed Workflow Section - 3 Steps with Hostlinea Theme */}
      <section className="bg-[#292e35] py-20 px-6 border-y border-white/5" id="workflow-section">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] text-[#8ac43f] font-extrabold tracking-widest uppercase block">How It Works</span>
            <h3 className="text-2xl sm:text-3.5xl font-extrabold text-white tracking-tight uppercase font-sans">
              3단계 자체 직원 선발 프로세스
            </h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans leading-relaxed font-light">
              복잡하고 일관성 없는 서류 검증은 안녕! 원클릭으로 가동하는 여성새일센터 전용 평정 업무 단계를 개시하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[#1f2226] p-8 rounded-lg border border-white/5 relative flex flex-col items-center text-center space-y-4">
              <div className="absolute -top-3 w-7 h-7 rounded bg-[#8ac43f] text-white font-extrabold text-xs flex items-center justify-center font-mono border-2 border-white/10">1</div>
              <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-[#8ac43f] border border-white/10 mt-2 mb-1">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-xs uppercase font-sans">우리 센터 평정 스펙 수립</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                상담사 배치 계획에 최적인 비율(예: 성능 60% : 인성 40%) 및 센터 위치, 특화 평가 키워드를 마법사 단계에서 세밀 수립합니다.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1f2226] p-8 rounded-lg border border-[#8ac43f]/20 relative flex flex-col items-center text-center space-y-4 shadow-xl">
              <div className="absolute -top-3 w-7 h-7 rounded bg-[#8ac43f] text-white font-extrabold text-xs flex items-center justify-center font-mono border-2 border-white/10">2</div>
              <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-[#8ac43f] border border-white/10 mt-2 mb-1">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-xs uppercase font-sans">이력서 자소서 한글 복사 입력</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                등장인물 간의 블라인드 수칙을 완벽 실시간 반영하여, 한글 텍스트를 고스란히 복사-붙여넣기 함으로써 점수를 균형 있게 수거합니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1f2226] p-8 rounded-lg border border-white/5 relative flex flex-col items-center text-center space-y-4">
              <div className="absolute -top-3 w-7 h-7 rounded bg-[#8ac43f] text-white font-extrabold text-xs flex items-center justify-center font-mono border-2 border-white/10">3</div>
              <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-[#8ac43f] border border-white/10 mt-2 mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-xs uppercase font-sans">실시간 계량화 대시보드 검토</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                자동 평점 총합, 정책가산점, 공정 마스킹 위배 일일 로그 및 자소서 분석 요약, 실무 검증용 고유 면접 유도 질문을 획득합니다.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Quote testimonial zone */}
      <section className="bg-[#1f2226] py-16 px-6 text-center" id="testimonial-section">
        <div className="max-w-4xl mx-auto space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-[#8ac43f]/10 text-[#8ac43f] rounded border border-[#8ac43f]/20">
            <QuestionIcon className="w-5 h-5" />
          </div>
          <p className="text-sm sm:text-base text-slate-300 italic font-sans leading-relaxed max-w-3xl mx-auto font-light">
            "매해 여성가족부 센터 종합평가 준비와 자체 상근직 채용 때마다 편파성 시비나 수집 규제 위배 걱정이 태산이었습니다. 이 시스템을 통해 면접관들이 면접 가이드라인 질문을 직종별로 명확히 공급받고, 공정성까지 지킬 수 있어 평정 신뢰도가 비약적으로 높아졌습니다."
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 font-sans">
            <BadgeCheck className="w-4 h-4 text-[#8ac43f]" />
            <span className="font-bold text-slate-200">전국 여성새로일하기센터 7년차 선임 직업상담원 이진우</span>
          </div>
        </div>
      </section>

      {/* 9. Bottom Funnel CTA */}
      <section className="bg-[#2f353d] text-white py-14 px-6 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4">
          <h4 className="text-xl sm:text-2.5xl font-extrabold uppercase font-sans tracking-tight text-white">
            새일센터 공정 채용의 새로운 시작
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed font-light">
            입력해주신 구직자 정보 및 자기소개서는 전량 브라우저 내부 세션 메모리 영역(Local Storage)에 국한되어 안전하게 보호됩니다.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={onStartSetup}
              className="bg-[#8ac43f] hover:bg-[#7cb337] text-white font-extrabold uppercase px-6 py-2.5 rounded text-xs transition duration-150 shadow cursor-pointer font-sans"
            >
              종합 인사 정보 등록 개시
            </button>
            <button
              type="button"
              onClick={onQuickLoadSample}
              className="bg-white/10 hover:bg-white/20 text-white font-extrabold uppercase px-6 py-2.5 rounded text-xs transition border border-white/10 cursor-pointer font-sans"
            >
              안전한 데모 샘플 자동 분석
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
