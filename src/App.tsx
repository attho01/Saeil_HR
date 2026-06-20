import React, { useState, useEffect } from "react";
import { CenterInfo, Candidate, CandidateRawInput, JobType } from "./types";
import { MOCK_CANDIDATES } from "./data/mockCandidates";
import CenterConfiguration, { DEFAULT_PROFILES } from "./components/CenterConfiguration";
import CandidateForm from "./components/CandidateForm";
import CandidateDashboard, { auditCandidateScores } from "./components/CandidateDashboard";
import CandidateDetailsPanel from "./components/CandidateDetailsPanel";
import InitialSetupWizard from "./components/InitialSetupWizard";
import LandingPage from "./components/LandingPage";
import { 
  Building2, 
  Trash2, 
  Download, 
  Sparkles, 
  ChevronRight, 
  RefreshCw, 
  Briefcase, 
  FileCheck, 
  HeartHandshake,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const LOCAL_STORAGE_CANDIDATES_KEY = "saerong_candidates_v3.1";
const LOCAL_STORAGE_CENTER_KEY = "saerong_center_info_v3.1";

const INITIAL_CENTER_INFO: CenterInfo = {
  region: "서울중부",
  centerName: "여성새로일하기센터",
  targetJobType: "상담직",
  customProfile: { ...DEFAULT_PROFILES["상담직"] },
  requirements: {
    coreCompetencies: ["경력단절여성 온보딩", "구인기업 발굴", "직업교육훈련 기획", "예산집행 정산"],
    certificates: ["직업상담사 2급", "사회복지사"],
    requiredExperienceMonths: 12,
    orgCulture: "도전정신, 열정, 책임감, 성실함, 협동심 지향"
  },
  hasPolicyBonus: true,
  policyBonusScore: 3
};

export default function App() {
  const [centerInfo, setCenterInfo] = useState<CenterInfo>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CENTER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CENTER_INFO,
          ...parsed,
          requirements: {
            ...INITIAL_CENTER_INFO.requirements,
            ...(parsed.requirements || {})
          },
          customProfile: parsed.customProfile || (parsed.targetJobType ? DEFAULT_PROFILES[parsed.targetJobType as JobType] : { ...DEFAULT_PROFILES["상담직"] })
        };
      } catch (e) {
        return INITIAL_CENTER_INFO;
      }
    }
    return INITIAL_CENTER_INFO;
  });

  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);

  const [showWizardDirectly, setShowWizardDirectly] = useState<boolean>(false);

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CANDIDATES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [filterRegisteredOnly, setFilterRegisteredOnly] = useState<boolean>(() => {
    const saved = localStorage.getItem("saerong_filter_registered_v3.1");
    if (saved) {
      return saved === "true";
    }
    try {
      const savedCand = localStorage.getItem(LOCAL_STORAGE_CANDIDATES_KEY);
      if (savedCand) {
        const parsed = JSON.parse(savedCand);
        return parsed.some((c: any) => !c.id.startsWith("cand_preset_"));
      }
    } catch (_) {}
    return false;
  });

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string } | null>(null);

  const [currentMainStep, setCurrentMainStep] = useState<number>(() => {
    try {
      const savedCand = localStorage.getItem(LOCAL_STORAGE_CANDIDATES_KEY);
      if (savedCand) {
        const parsed = JSON.parse(savedCand);
        if (parsed && parsed.length > 0) {
          return 3;
        }
      }
      const setupDone = localStorage.getItem("saerong_setup_complete_v3.1") === "true";
      if (setupDone) {
        return 2;
      }
    } catch (_) {}
    return 1;
  });

  // Sync filter choice
  useEffect(() => {
    localStorage.setItem("saerong_filter_registered_v3.1", String(filterRegisteredOnly));
  }, [filterRegisteredOnly]);

  const displayedCandidates = filterRegisteredOnly
    ? candidates.filter(c => !c.id.startsWith("cand_preset_"))
    : candidates;

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CENTER_KEY, JSON.stringify(centerInfo));
  }, [centerInfo]);

  // Sync state with localStorage and auto-adjust selection
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CANDIDATES_KEY, JSON.stringify(candidates));
    if (displayedCandidates.length > 0) {
      const isSelectedInDisplayed = displayedCandidates.some(c => c.id === selectedCandidateId);
      if (!selectedCandidateId || !isSelectedInDisplayed) {
        setSelectedCandidateId(displayedCandidates[0].id);
      }
    } else {
      setSelectedCandidateId(null);
    }
  }, [candidates, selectedCandidateId, filterRegisteredOnly]);

  const handleAnalyzeCandidate = async (input: CandidateRawInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          resumeText: input.resumeText,
          selfIntroText: input.selfIntroText,
          planText: input.planText || "",
          policyBonus: input.policyBonus || 0,
          centerInfo
        })
      });

      if (!response.ok) {
        throw new Error("서류 분석 서버 에러입니다. 잠시 후 재시도하십시오.");
      }

      const analyzedCandidate: Candidate = await response.json();
      
      // Force direct matching logic with center settings just in case
      // (This overrides any loose policy values generated by server)
      analyzedCandidate.policyBonus = input.policyBonus || 0;

      setCandidates(prev => {
        const index = prev.findIndex(c => c.name === analyzedCandidate.name);
        if (index !== -1) {
          // Replace candidate with same name
          const updated = [...prev];
          updated[index] = analyzedCandidate;
          return updated;
        }
        return [...prev, analyzedCandidate];
      });

      setSelectedCandidateId(analyzedCandidate.id);
      setCurrentMainStep(3); // 구직서류 분석 시 3단계 AI평정 대시보드로 가로 전환!
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "서버와 통신하는 과정에서 예외가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreloadSamples = () => {
    // Inject preset mock candidates tailored for standard testing
    const processedMocks = MOCK_CANDIDATES.map(cand => {
      // Direct deep copy to protect reference
      return { 
        ...cand, 
        id: `cand_preset_${Date.now()}_${Math.floor(Math.random() * 1000)}` 
      };
    });

    setCandidates(processedMocks);
    if (processedMocks.length > 0) {
      setSelectedCandidateId(processedMocks[0].id);
      setCurrentMainStep(3); // 샘플 사전 기재 시 대시보드로 가로 전환!
    }
  };

  const handleQuickLoadSample = () => {
    handlePreloadSamples();
    setIsSetupComplete(true);
    setShowWizardDirectly(false);
    localStorage.setItem("saerong_setup_complete_v3.1", "true");
    setCurrentMainStep(3);
  };

  const handleClearCandidates = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCandidates = () => {
    setCandidates([]);
    setSelectedCandidateId(null);
    setCurrentMainStep(2); // 데이터 비워지면 2단계(서류등록)로 자연스레 안내 전환!
    setShowClearConfirm(false);
  };

  const handleDeleteCandidate = (id: string) => {
    const cand = candidates.find(c => c.id === id);
    if (cand) {
      setCandidateToDelete({ id: cand.id, name: cand.name });
    }
  };

  const confirmDeleteCandidate = () => {
    if (candidateToDelete) {
      const id = candidateToDelete.id;
      setCandidates(prev => prev.filter(c => c.id !== id));
      if (selectedCandidateId === id) {
        setSelectedCandidateId(null);
      }
      setCandidateToDelete(null);
    }
  };

  const handleExportTextReport = () => {
    if (candidates.length === 0) return;

    const profile = centerInfo.customProfile || DEFAULT_PROFILES["상담직"];
    
    // Sort descending by score for report layout
    const evaluated = candidates.map(cand => ({
      cand,
      audit: auditCandidateScores(cand, profile)
    })).sort((a, b) => b.audit.finalWithBonus - a.audit.finalWithBonus);

    let report = `========================================================================\n`;
    report += `📊 [새일센터 자체 직원 채용 분석 보고서] - v3.1 최종\n`;
    report += `========================================================================\n`;
    const displayFullCenterName = centerInfo.centerName.startsWith(centerInfo.region) 
      ? centerInfo.centerName 
      : `${centerInfo.region} ${centerInfo.centerName}`;

    report += `선발 기관: ${displayFullCenterName}\n`;
    report += `채용 직무: ${centerInfo.targetJobType} (${profile.jobTitle})\n`;
    report += `적용 비율: 직무수행역량 [${profile.ratioJobPerformance}%] : 조직적합도 [${profile.ratioCultureSync}%]\n`;
    report += `생성 일시: ${new Date().toLocaleString()}\n`;
    report += `========================================================================\n\n`;

    report += `## 1. 면접 우선순위 및 평가 티어 분류\n`;
    evaluated.forEach((item, index) => {
      const { cand, audit } = item;
      report += `[티어: ${cand.tier}] ${cand.name} (${cand.candidateTypeLabel}) | 최종환산: ${audit.finalWithBonus.toFixed(1)}점\n`;
      report += `  - 감사 라인 산식: (${audit.perf1.toFixed(1)} * ${profile.ratioJobPerformance/100}) + (${audit.culture2Adjusted.toFixed(1)} * ${profile.ratioCultureSync/100}) = ${audit.finalBase.toFixed(1)}점\n`;
      if (cand.policyBonus > 0) {
        report += `  - 정책 가산점 합산: 기본 ${audit.finalBase.toFixed(1)}점 + 법정가점 [${cand.policyBonus}점] = ${audit.finalWithBonus.toFixed(1)}점\n`;
      }
      report += `  - 성과 한줄 요약: ${cand.oneLineComment}\n\n`;
    });

    report += `\n## 2. 지원자별 세부 진단 결과 및 면접 설계문\n`;
    evaluated.forEach((item) => {
      const { cand, audit } = item;
      report += `------------------------------------------------------------------------\n`;
      report += `👤 지원자명: ${cand.name} | 유형: ${cand.candidateTypeLabel} | 티어: ${cand.tier}\n`;
      report += `  - 1차 직무수행: ${audit.perf1.toFixed(1)}점 (전문성: ${cand.jobCompetencyScore} / 행정실무: ${cand.adminSkillsScore} / 개척: ${cand.networkingScore})\n`;
      report += `  - 2차 조직적합: ${audit.culture2Adjusted.toFixed(1)}점 (민원원점: ${cand.civilScoreRaw}, 조정: ${audit.civilAdjusted.toFixed(1)} | 협업원점: ${cand.cultureScoreRaw}, 조정: ${audit.cultureAdjusted.toFixed(1)})\n`;
      report += `  - 공정성 마스킹 로그 및 사명 검증:\n`;
      if (cand.maskingLogs.length > 0) {
        cand.maskingLogs.forEach(log => report += `    * ${log}\n`);
      } else {
        report += `    * 특이 개인정보 노출 없음.\n`;
      }
      report += `  - 종합 정성 한줄평: ${cand.longComments}\n\n`;
      
      report += `  - [면접 추천 필수 질문 (Critical Questions)]:\n`;
      report += `    * 직무/기안 행정 검증: \n`;
      cand.interviewQuestions.jobAdmin.forEach(q => report += `      - ${q}\n`);
      report += `    * 민원 수습/회복력 검증: \n`;
      cand.interviewQuestions.civilCulture.forEach(q => report += `      - ${q}\n`);
      if (cand.interviewQuestions.unverified && cand.interviewQuestions.unverified.length > 0) {
        report += `    * 근거 부족 미검증 및 하한 검증: \n`;
        cand.interviewQuestions.unverified.forEach(q => report += `      - ${q}\n`);
      }
      report += `  - 추가 권장 확보 서류: ${cand.suggestedDocuments.join(", ")}\n\n`;
    });

    report += `------------------------------------------------------------------------\n`;
    report += `⚠️ [자문 성격 고지]\n`;
    report += `본 리포트는 서류 검토 및 면접 설계 보조 자료이며, 최종 합격 여부는 종합적인 면접 전형을 통하여 의사결정 수치가 수정 인준되는 사람의 판단으로 확정되어야 합니다.\n`;

    // Download file
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${centerInfo.region}_새일센터_자체인사_채용대시보드_v3.1.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || null;

  if (!isSetupComplete && !showWizardDirectly) {
    return (
      <LandingPage 
        onStartSetup={() => setShowWizardDirectly(true)}
        onQuickLoadSample={handleQuickLoadSample}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="recruiter-app-viewport">
      {/* Upper Navigation Bar - Professional Polish Edition */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-md shrink-0">
        <div className="space-y-1">
          <h1 className="font-sans font-extrabold text-white text-xl leading-tight flex flex-wrap items-center gap-2">
            <span className="bg-indigo-600 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider">v3.1 최종</span>
            <span>{centerInfo.centerName.startsWith(centerInfo.region) ? centerInfo.centerName : `${centerInfo.region} ${centerInfo.centerName}`} 채용 분석 시스템</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            채용 직무: <span className="text-slate-200 font-medium">{centerInfo.customProfile?.jobTitle || centerInfo.targetJobType}</span> | 
            가중치 배율: <span className="text-slate-200 font-medium">직무 {centerInfo.customProfile?.ratioJobPerformance}% : 조직적합 {centerInfo.customProfile?.ratioCultureSync}%</span> | 
            상태: <span className="text-emerald-400 font-medium inline-flex items-center gap-1">● 법정보호 마스킹 활성</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSetupComplete(false);
                setShowWizardDirectly(false);
              }}
              className="py-1.5 px-3 bg-slate-850 hover:bg-slate-700 text-slate-200 border border-slate-700 font-sans text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              시스템 소개(홈)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSetupComplete(false);
                setShowWizardDirectly(true);
              }}
              className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-sans text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              id="run-wizard-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              인사설정 마법사
            </button>
            {candidates.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportTextReport}
                  className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 border border-transparent text-white font-sans text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  id="export-text-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  종합 분석서 다운로드
                </button>
                <button
                  type="button"
                  onClick={handleClearCandidates}
                  className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-sans text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                  id="clear-all-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  초기화
                </button>
              </>
            )}
          </div>
          
          {/* Agent Badge from Professional Polish theme */}
          <div className="flex items-center gap-3 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 pl-0 sm:pl-4 sm:border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold">Evaluator Mode</p>
              <p className="text-xs font-bold text-slate-300 italic">HR Specialist Agent</p>
            </div>
            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 font-extrabold text-sm text-indigo-400 shadow-inner">
              HR
            </div>
          </div>
        </div>
      </header>

      {/* Horizon Step Navigation Stepper */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm px-6 py-3.5 shrink-0">
        <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5 md:gap-3 flex-1 justify-around max-w-4xl mx-auto w-full">
            {[
              { id: 1, title: "1단계. 심사 기준 설정", desc: "분석 핵심역량 수립" },
              { id: 2, title: "2단계. 구직서류 등록/분석", desc: "텍스트 판독 및 적재" },
              { id: 3, title: "3단계. AI 종합 평정 대시보드", desc: "실시간 서열 및 감사 리드" }
            ].map((item, index) => {
              const isCompleted = item.id < currentMainStep;
              const isActive = item.id === currentMainStep;
              return (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentMainStep(item.id)}
                    className={`flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1.5 md:p-2 hover:bg-white transition-all cursor-pointer ${
                      isActive ? "bg-white shadow-sm ring-1 ring-slate-100" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-50" 
                        : isCompleted 
                          ? "bg-indigo-100 text-indigo-700 font-extrabold" 
                          : "bg-slate-200 text-slate-500 border border-slate-300/40"
                    }`}>
                      {isCompleted ? "✓" : item.id}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-xs font-bold leading-tight ${isActive ? "text-indigo-600" : isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                  {index < 2 && (
                    <div className={`hidden sm:block flex-1 max-w-[40px] md:max-w-[70px] h-0.5 shrink-0 transition-all duration-300 ${isCompleted ? "bg-indigo-400" : "bg-slate-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container - Horizon Tab Slide Screen Container */}
      <div className="flex-1 overflow-x-hidden flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* Main Step 1 Layout */}
          {currentMainStep === 1 && (
            <motion.main
              key="main-step-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
              className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-start space-y-6"
            >
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-6">
                  <h3 className="font-sans font-bold text-slate-800 text-base mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    1단계: 채용 기관 정보 및 직무 가중치 기준 설정
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    여성새일센터 지침에 입각하여 각 직무 형태에 알맞은 핵심역량과 가중치 배율을 고지합니다.
                  </p>
                </div>
                
                <CenterConfiguration 
                  centerInfo={centerInfo}
                  onChange={setCenterInfo}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentMainStep(2)}
                  className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>2단계 구직서류 등록하러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.main>
          )}

          {/* Main Step 2 Layout */}
          {currentMainStep === 2 && (
            <motion.main
              key="main-step-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
              className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-start space-y-6"
            >
              {/* Error panel if any */}
              {errorMessage && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3 text-xs text-orange-800 font-sans">
                  <AlertCircle className="w-4.5 h-4.5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">평가 진행 중 일부 제한이 발생했습니다.</p>
                    <p className="mt-1 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-sans font-bold text-slate-800 text-base flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-indigo-600" />
                      2단계: 심사 대상 구직서류(이력서 및 자소서) 분석 적재
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">파일을 드래그해 놓거나 가이드 순차 양식을 활용하여 쉽게 수집할 수 있습니다.</p>
                  </div>
                  {candidates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentMainStep(3)}
                      className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>대시보드로 바로가기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                
                <CandidateForm 
                  centerInfo={centerInfo}
                  onAnalyze={handleAnalyzeCandidate}
                  isLoading={isLoading}
                  onPreloadSamples={handlePreloadSamples}
                  hasCandidates={candidates.length > 0}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentMainStep(1)}
                  className="py-3 px-5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-sans text-xs font-bold rounded-2xl transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계 (심사 기준 수립)</span>
                </button>
                {candidates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentMainStep(3)}
                    className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>3단계 AI 평정 대시보드 검토</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.main>
          )}

          {/* Main Step 3 Layout */}
          {currentMainStep === 3 && (
            <motion.main
              key="main-step-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
              className="flex-1 p-6 max-w-[1600px] mx-auto w-full flex flex-col justify-start space-y-6"
            >
              {/* Error panel if any */}
              {errorMessage && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3 text-xs text-orange-800 font-sans">
                  <AlertCircle className="w-4.5 h-4.5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">평가 진행 중 일부 제한이 발생했습니다.</p>
                    <p className="mt-1 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {candidates.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center max-w-2xl mx-auto space-y-5 my-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <FileCheck className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-slate-800">등록된 구직자가 없습니다.</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      실시간 가로 분석 대시보드를 생성하려면 이력서 적재 및 서류 분석이 우선되어야 합니다.<br />
                      2단계에서 서류 양식을 직접 입력하거나, 샘플 자동 불러오기를 실행해 보세요.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentMainStep(2)}
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold rounded-xl transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>2단계 구직서류 등록하러 가기</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* Left Table Panel */}
                  <div className="xl:col-span-5">
                    <CandidateDashboard 
                      candidates={displayedCandidates}
                      centerInfo={centerInfo}
                      selectedCandidateId={selectedCandidateId}
                      onSelectCandidate={setSelectedCandidateId}
                      onDeleteCandidate={handleDeleteCandidate}
                      filterRegisteredOnly={filterRegisteredOnly}
                      onToggleFilterRegisteredOnly={setFilterRegisteredOnly}
                      hasPresets={candidates.some(c => c.id.startsWith("cand_preset_"))}
                      hasRegistered={candidates.some(c => !c.id.startsWith("cand_preset_"))}
                      registeredCount={candidates.filter(c => !c.id.startsWith("cand_preset_")).length}
                    />
                  </div>

                  {/* Right Details Panel */}
                  <div className="xl:col-span-7">
                    {selectedCandidate ? (
                      <CandidateDetailsPanel 
                        candidate={selectedCandidate}
                        centerInfo={centerInfo}
                      />
                    ) : (
                      <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm font-sans text-xs">
                        동종 평가 검증을 기획할 구직자를 좌측 목록에서 선택하십시오.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentMainStep(2)}
                  className="py-3 px-5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-sans text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계 (구직서류 등록 및 분석)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMainStep(1)}
                  className="py-3 px-5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-sans text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>1단계 (인사/심사 기준 설정) 재조정</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.main>
          )}

        </AnimatePresence>
      </div>

      {/* Recruiter Policy footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-10 text-center space-y-2 text-xs text-slate-400">
        <div className="flex justify-center items-center gap-6 text-slate-500 font-sans font-bold flex-wrap">
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span>경력단절 무감점 원격 준수</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>티어 동급군(±2점) 서열 해제</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            <span>민감정보 의무 마스킹 보장</span>
          </div>
        </div>
        <p className="pt-2 font-sans text-[11px] text-slate-500">본 프로그램은 여성새로일하기센터의 서류 스크리닝 및 면접 가이드 제작을 돕는 의사결정 보조 도구(자문 목적)입니다. 법정 비수집 정보는 완벽히 마스킹되어 평가에서 배제되었습니다.</p>
        <p className="text-[10px] font-mono text-slate-400">© 2026 여성새로일하기센터 자체인사팀 종합평가지원단. All rights reserved.</p>
      </footer>

      {!isSetupComplete && (
        <InitialSetupWizard 
          centerInfo={centerInfo}
          onChange={setCenterInfo}
          onComplete={() => {
            setIsSetupComplete(true);
            setShowWizardDirectly(false);
            setCurrentMainStep(2);
            localStorage.setItem("saerong_setup_complete_v3.1", "true");
          }}
        />
      )}

      {/* 1. Clear All candidates custom modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="clear-modal">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-slate-900 text-sm">전체 데이터 초기화</h3>
                <p className="text-xs text-slate-500 font-sans">이 작업은 취소할 수 없습니다.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              등록된 모든 지원자 분석 서류 및 3단계 대시보드 평가 데이터가 완전히 영구 삭제됩니다. 계속 진행하시겠습니까?
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-bold rounded-xl transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmClearCandidates}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-bold rounded-xl transition cursor-pointer"
              >
                초기화 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete single candidate custom modal */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="delete-cand-modal">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-slate-900 text-sm">지원자 자료 삭제</h3>
                <p className="text-xs text-slate-500 font-sans">지원자 정보를 삭제합니다.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              지원자 <strong className="text-slate-900">[{candidateToDelete.name}]</strong> 님의 자체 분석 서류 및 평가 점수표가 대시보드 목록에서 완전히 제거됩니다. 정말 삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCandidateToDelete(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-bold rounded-xl transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDeleteCandidate}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-bold rounded-xl transition cursor-pointer"
              >
                삭제 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
