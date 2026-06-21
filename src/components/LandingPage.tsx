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
}

export default function LandingPage({ onStartSetup, onQuickLoadSample, onOpenApiKeyModal, hasUserApiKey }: LandingPageProps) {
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
            <span>Customer Care : (888) 123-4567</span>
            <span className="text-slate-600">|</span>
            <button type="button" onClick={onOpenApiKeyModal} className="hover:text-white transition">Login</button>
            <span className="text-slate-600">|</span>
            <button type="button" onClick={onStartSetup} className="hover:text-white transition">Register</button>
          </div>
          <div className="flex gap-3 text-[10px] items-center">
            <span className="hover:text-white cursor-pointer select-none">f</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-white cursor-pointer select-none">t</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-white cursor-pointer select-none">g+</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-white cursor-pointer select-none">ln</span>
          </div>
        </div>
      </div>

      {/* 2. Brand Upper Navigation Header - Styled 100% like HOSTLINEA */}
      <header className="sticky top-0 z-40 bg-[#2f353d]/98 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo with 2 green vertical stripes and White HOSTLINEA text */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 shrink-0">
              <div className="w-[6px] h-6 bg-[#8ac43f] rounded-xs" />
              <div className="w-[6px] h-6 bg-[#8ac43f] rounded-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-xl tracking-tight font-sans">HOSTLINEA</span>
                <span className="text-[9px] bg-[#8ac43f] text-white font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">SAERONG</span>
              </div>
              <h1 className="text-slate-400 font-medium text-[10px] tracking-tight leading-3 mt-0.5">
                새일센터 자체인사 채용 평정 시스템 (Blinded v3.1)
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
                HOME
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("features-section")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                LAYOUTS
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("domain-pricing-bar")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                DOMAINS
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("what-we-offer-section")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                HOSTING
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("workflow-section")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                PAGES
              </button>
              <button 
                type="button" 
                onClick={() => scrollToId("testimonial-section")} 
                className="hover:text-[#8ac43f] transition uppercase"
              >
                PORTFOLIO
              </button>
              <button 
                type="button" 
                onClick={onOpenApiKeyModal} 
                className="hover:text-[#8ac43f] transition uppercase flex items-center gap-1 text-slate-300"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hasUserApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-[#8ac43f]'}`} />
                API KEYS
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
                {hasUserApiKey ? "API 키 완료" : "API KEY"}
              </button>
              <button
                type="button"
                onClick={onStartSetup}
                className="bg-[#8ac43f] hover:bg-[#7cb337] text-white text-[11px] font-bold py-1.5 px-3.5 rounded shadow-sm transition-all duration-150 cursor-pointer flex items-center gap-1"
                id="header-setup-trigger"
              >
                <span>시작하기</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Section - Unlimited Web Hosting Overlaid Style */}
      <section className="relative text-white min-h-[520px] flex items-center px-6 py-20 overflow-hidden" id="hero-section" style={{
        backgroundImage: `linear-gradient(rgba(47, 53, 61, 0.72), rgba(31, 34, 38, 0.88)), url('https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?q=80&w=1200&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="md:col-span-8 space-y-6">
            <span className="text-[#8ac43f] font-extrabold text-xs tracking-wider uppercase bg-[#8ac43f]/10 py-1.5 px-3 rounded-md border border-[#8ac43f]/30 w-fit block">
              ★ Saerong AI HR - Web Hosting Standard
            </span>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5.5xl font-extrabold tracking-tight leading-tight uppercase font-sans">
                UNLIMITED<br />
                <span className="text-[#8ac43f]">WEB HOSTING</span>
              </h1>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-100 max-w-2xl leading-snug">
                어려운 입사지원서 심사, 1초 만에 공정한 AI 평정으로 완벽히 가동하세요!
              </h2>
            </div>

            <p className="text-slate-300 max-w-2xl font-light leading-relaxed text-xs sm:text-sm font-sans">
              보조금 정산, 기획력, 구직자 관리 등 <strong>여성새로일하기센터 고유의 실무 역량</strong>을 정밀 분석하고, 
              입사지원서 속 주민번호 등 수집금지 개인정보를 <strong>실시간 마스킹 자동 필터링</strong>하여 완벽하게 정정당당한 면접 질문지까지 원스톱 출력합니다.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 text-xs font-bold">
              <button
                type="button"
                onClick={onStartSetup}
                className="bg-[#8ac43f] hover:bg-[#7cb337] uppercase text-white font-extrabold py-3.5 px-8 rounded transition duration-150 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onQuickLoadSample}
                className="bg-white/10 hover:bg-white/25 border border-white/20 text-white font-extrabold uppercase py-3.5 px-6 rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>무료 데모/샘플 구경</span>
              </button>
            </div>
          </div>

          {/* Hero Right Floating Circle Badges from the screenshot! */}
          <div className="md:col-span-4 flex flex-row md:flex-col justify-center items-center gap-6 pt-6 md:pt-0">
            {/* White up to 50% circle */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white text-slate-900 flex flex-col items-center justify-center text-center shadow-2xl p-2 border-4 border-[#8ac43f]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Up to</span>
              <span className="text-2xl sm:text-3.5xl font-extrabold text-slate-900 leading-none">50%</span>
              <span className="text-[10px] uppercase font-extrabold text-[#8ac43f] tracking-wide mt-1">/Offer</span>
            </div>

            {/* Lime green starting at $4.99 /mo circle */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#8ac43f] text-white flex flex-col items-center justify-center text-center shadow-2xl p-2 border-4 border-white/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">Starting at</span>
              <span className="text-3xl sm:text-4xl font-black text-white font-mono leading-none my-0.5">$4.99</span>
              <span className="text-[10px] font-bold text-white/90">/mo</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Domain check bar (Vivid Lime green strip) */}
      <div className="bg-[#8ac43f] py-4 px-6 text-white" id="domain-pricing-bar">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 font-sans">
          
          {/* Left domain price tags */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 font-extrabold text-xs tracking-wider shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white/80 font-normal">.com</span>
              <span className="text-white text-base">$11.99</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/80 font-normal">.org</span>
              <span className="text-white text-base">$9.99</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/80 font-normal">.net</span>
              <span className="text-white text-base">$7.99</span>
            </div>
          </div>

          {/* Right actual domain/candidate mockup search bar */}
          <div className="flex items-stretch w-full lg:max-w-xl bg-white rounded-md overflow-hidden p-1 shadow-md">
            <input 
              type="text" 
              placeholder="Enter your Domain Name here..." 
              defaultValue="saerong-center-hr.com"
              className="flex-1 px-3.5 py-1.5 text-slate-800 focus:outline-none text-xs font-semibold"
              onClick={(e) => (e.target as HTMLInputElement).select()}
              readOnly
            />
            <div className="bg-slate-100/85 text-slate-600 px-3 flex items-center border-l border-slate-200 text-xs font-extrabold select-none shrink-0">
              .com ▾
            </div>
            <button 
              type="button"
              onClick={onQuickLoadSample}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold uppercase px-5 py-2 text-xs cursor-pointer select-none shrink-0"
            >
              Search
            </button>
          </div>

        </div>
      </div>

      {/* 5. WHAT WE OFFER Section - Matched exactly with 3 beautiful boxes */}
      <section className="bg-[#2a2f36] py-20 px-6" id="what-we-offer-section">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Section title match */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold uppercase text-white tracking-widest font-sans">
              WHAT <span className="underline decoration-[#8ac43f] decoration-3 underline-offset-8">WE</span> OFFER
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans font-light leading-relaxed">
              여성새로일하기센터의 주 업무인 보조금 정산, 기업 구인처 발굴 및 상담 가이드를 법적 마스킹 장치를 활용하여 1초 만에 최상으로 대우하는 원스톱 솔루션
            </p>
          </div>

          {/* 3 Large Boxes matching: Reseller, VPS, Dedicated style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Box 1: Reseller theme matching Strength 1 */}
            <div className="bg-[#1f2226] border border-white/5 rounded-md p-8 text-center space-y-6 hover:border-[#8ac43f]/50 transition-all duration-350 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[#8ac43f] text-xs font-mono font-bold tracking-widest block uppercase border-b border-white/5 pb-2">RECOMMENDED PILLAR</span>
                <h3 className="text-lg font-black text-white font-sans uppercase">RESELLER HOSTING</h3>
                
                <div className="py-2">
                  <div className="text-[11px] text-slate-400">Start at</div>
                  <div className="text-3xl font-mono font-black text-[#8ac43f]">$19.99 <span className="text-xs font-normal text-slate-400">/month</span></div>
                </div>

                <div className="h-[1px] bg-white/5 w-12 mx-auto" />

                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-white text-xs text-center">법정 비수집 규제정보 자동 필터링 (블라인드)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center font-sans">
                    지원서(입사지원서 및 자소서)에 실수로 기재되기 쉬운 연령, 성별, 혼인유무 등 금지 요소를 자동 탐색하여 완벽 마스킹 처리하여 신뢰를 확보합니디.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onStartSetup}
                  className="w-full py-2.5 bg-[#8ac43f] hover:bg-[#7cb337] text-white text-xs font-bold uppercase rounded transition-all cursor-pointer"
                >
                  View all Plans
                </button>
              </div>
            </div>

            {/* Box 2: VPS theme matching Strength 2 */}
            <div className="bg-[#1f2226] border border-[#8ac43f]/30 rounded-md p-8 text-center space-y-6 shadow-xl relative scale-100 flex flex-col justify-between">
              {/* Sale green flag banner */}
              <div className="absolute top-2 right-2 bg-[#8ac43f] text-white font-extrabold text-[8px] uppercase tracking-wider py-1 px-2.5 rounded-sm">
                Sale
              </div>

              <div className="space-y-4">
                <span className="text-[#8ac43f] text-xs font-mono font-bold tracking-widest block uppercase border-b border-white/5 pb-2">ADVANCED ENGINE</span>
                <h3 className="text-lg font-black text-white font-sans uppercase">VPS HOSTING</h3>
                
                <div className="py-2">
                  <div className="text-[11px] text-slate-400">Start at</div>
                  <div className="text-3xl font-mono font-black text-[#8ac43f]">$20.99 <span className="text-xs font-normal text-slate-400">/month</span></div>
                </div>

                <div className="h-[1px] bg-white/5 w-12 mx-auto" />

                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-white text-xs text-center">새일센터 현직 직무 연계형 세부 평정 지표</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center font-sans">
                    일반 대기업용 지표가 아닙니다. 국비 직업훈련 기획, 구인알선, 기업 네트워킹 및 행정 사후관리에 특화된 고유 소양을 명쾌하게 채점하여 드립니다.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onStartSetup}
                  className="w-full py-2.5 bg-[#8ac43f] hover:bg-[#7cb337] text-white text-xs font-bold uppercase rounded transition-all cursor-pointer"
                >
                  View all Plans
                </button>
              </div>
            </div>

            {/* Box 3: Dedicated theme matching Strength 3 */}
            <div className="bg-[#1f2226] border border-white/5 rounded-md p-8 text-center space-y-6 hover:border-[#8ac43f]/50 transition-all duration-350 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[#8ac43f] text-xs font-mono font-bold tracking-widest block uppercase border-b border-white/5 pb-2">SECURE METRIC</span>
                <h3 className="text-lg font-black text-white font-sans uppercase">DEDICATED SERVERS</h3>
                
                <div className="py-2">
                  <div className="text-[11px] text-slate-400">Start at</div>
                  <div className="text-3xl font-mono font-black text-[#8ac43f]">$19.99 <span className="text-xs font-normal text-slate-400">/month</span></div>
                </div>

                <div className="h-[1px] bg-white/5 w-12 mx-auto" />

                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-white text-xs text-center">도덕성·성실함 중심 인성 키워드 정밀 검증</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center font-sans">
                    단순 기교를 넘어 새일센터 핵심가치인 성실함, 책임감, 배려심, 긍정적 사고를 엄선 매칭해 인격적 적격성을 분석 및 검출해 냅니다.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onStartSetup}
                  className="w-full py-2.5 bg-[#8ac43f] hover:bg-[#7cb337] text-white text-xs font-bold uppercase rounded transition-all cursor-pointer"
                >
                  View all Plans
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. WHAT'S HOT Section - 50/50 Grid matching the screenshot with actual image */}
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
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-sans tracking-tight">WHAT'S HOT</h3>
            <div className="w-10 h-[1.5px] bg-[#8ac43f]" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-light">
            새로 채택된 '인성 소양 다차원 검증 기술'을 바탕으로, 자기소개서에 직접적으로 나타나지 않은 소양까지 추론하고 그에 필요한 면접 구술 스크립트 5문항을 완벽히 준비합니다.
          </p>

          {/* List layout from the screenshot with check marks */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            
            <div className="flex bg-[#1f2226]/50 p-3.5 rounded-lg border border-white/5 items-start gap-4">
              {/* Circular yellow/green 100% Free badge style inside */}
              <div className="w-14 h-14 rounded-full bg-[#8ac43f] text-white flex flex-col items-center justify-center text-center shrink-0 border border-white/25 shadow-md">
                <span className="text-[8px] uppercase font-black tracking-wider leading-none">100%</span>
                <span className="text-[10px] font-black leading-none mt-0.5">Free</span>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-white font-extrabold text-sm font-sans uppercase">GET 25% OFF ON HOSTING</h4>
                <div className="space-y-1 text-slate-300 text-xs">
                  <div className="flex items-center gap-1.5 leading-normal">
                    <Check className="w-3.5 h-3.5 text-[#8ac43f] shrink-0" />
                    <span>전국 여성새로일하기센터 100% 한글 서류 및 즉각 분석 호환</span>
                  </div>
                  <div className="flex items-center gap-1.5 leading-normal">
                    <Check className="w-3.5 h-3.5 text-[#8ac43f] shrink-0" />
                    <span>개인정보보호법에 위배되는 불필요한 나이·소득정보 전면 블라인드 처리</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 flex items-center justify-start">
            <button
              type="button"
              onClick={onStartSetup}
              className="px-6 py-2.5 border border-white/30 hover:border-white/90 text-white bg-transparent hover:bg-white/5 text-xs font-bold uppercase rounded transition-all cursor-pointer"
            >
              sign up now !
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
              EASY THREE-STEP DEPLOYMENT
            </h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans leading-relaxed font-light">
              복잡하고 번거로운 서류 심사는 이제 끝! 자체 행정력 지표 설정부터 종합 분석 평정표 도출까지 완벽하게 이어집니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[#1f2226] p-8 rounded-lg border border-white/5 relative flex flex-col items-center text-center space-y-4">
              <div className="absolute -top-3 w-7 h-7 rounded bg-[#8ac43f] text-white font-extrabold text-xs flex items-center justify-center font-mono border-2 border-white/10">1</div>
              <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-[#8ac43f] border border-white/10 mt-2 mb-1">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-xs uppercase font-sans">우리 센터 기준 설정</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                상담직/행정직 형태를 선택하고, 센터 위치에 어울리는 인성 지표와 직무 비율 가중치 스펙을 세웁니다.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1f2226] p-8 rounded-lg border border-[#8ac43f]/20 relative flex flex-col items-center text-center space-y-4 shadow-xl">
              <div className="absolute -top-3 w-7 h-7 rounded bg-[#8ac43f] text-white font-extrabold text-xs flex items-center justify-center font-mono border-2 border-white/10">2</div>
              <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-[#8ac43f] border border-white/10 mt-2 mb-1">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-xs uppercase font-sans">구직 서류 복사해 넣기</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                대상 지원자들의 이력사항과 자기소개서 한글 텍스트를 고스란히 긁어 복사해 넣는 순간 즉각 분석이 개시됩니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1f2226] p-8 rounded-lg border border-white/5 relative flex flex-col items-center text-center space-y-4">
              <div className="absolute -top-3 w-7 h-7 rounded bg-[#8ac43f] text-white font-extrabold text-xs flex items-center justify-center font-mono border-2 border-white/10">3</div>
              <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-[#8ac43f] border border-white/10 mt-2 mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-xs uppercase font-sans">AI 평정 대시보드 마감</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                분석 적재 가동에 따라 자동 도량화된 심사와 5대 심층 질문 리스트를 확인하며 최고의 구직인력을 선발합니다.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Quote testimonial zone */}
      <section className="bg-[#1f2226] py-16 px-6 text-center" id="testimonial-section">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-[#8ac43f]/10 text-[#8ac43f] rounded border border-[#8ac43f]/20">
            <QuestionIcon className="w-5 h-5" />
          </div>
          <p className="text-sm sm:text-base text-slate-350 italic font-mono leading-relaxed max-w-3xl mx-auto font-light">
            "매년 수십 세트씩 밀려드는 자체 새일센터 대체 인력 채용 때마다, 공정한 심사 규제와 자기소개서 요약에 시간 소모가 너무 컸습니다. 이 툴을 쓰고 나서 개인정보 위법 위배 요인도 완벽히 잡혔고, 면접관들과 질문 고민 시간도 예전의 1/5 수준으로 줄어 대단히 만족스럽습니다."
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 font-sans">
            <BadgeCheck className="w-4 h-4 text-[#8ac43f]" />
            <span className="font-bold text-slate-200">수도권 여성새로일하기센터 5년차 선임 직업상담원 강민아</span>
          </div>
        </div>
      </section>

      {/* 9. Bottom Funnel CTA */}
      <section className="bg-[#2f353d] text-white py-14 px-6 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4">
          <h4 className="text-xl sm:text-2.5xl font-extrabold uppercase font-sans tracking-tight text-white">
            READY TO JOIN SAERONG HOSTLINEA?
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed font-light">
            모든 평가 및 연산 내용은 유출 위험 없이 웹브라우저 영토 내에 자가 저장되므로 완벽히 안전합니다.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={onStartSetup}
              className="bg-[#8ac43f] hover:bg-[#7cb337] text-white font-extrabold uppercase px-6 py-2.5 rounded text-xs transition duration-150 shadow cursor-pointer"
            >
              Start setup Now
            </button>
            <button
              type="button"
              onClick={onQuickLoadSample}
              className="bg-white/10 hover:bg-white/20 text-white font-extrabold uppercase px-6 py-2.5 rounded text-xs transition border border-white/10 cursor-pointer"
            >
              Direct Load Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
