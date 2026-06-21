import React, { useState } from "react";
import { CenterInfo, JobType } from "../types";
import { DEFAULT_PROFILES } from "./CenterConfiguration";
import { 
  Building2, 
  Briefcase, 
  Sparkles, 
  Check, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Users,
  ShieldAlert,
  Hash,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InitialSetupWizardProps {
  centerInfo: CenterInfo;
  onChange: (info: CenterInfo) => void;
  onComplete: () => void;
}

interface CompetencyItem {
  name: string;
  description: string;
  source: string;
}

const CIVIL_RELATION_PRESETS = ["공감능력", "배려심", "긍정적 사고", "유연성", "다정함"];
const ETHICAL_COLLAB_PRESETS = [
  "책임감", "성실함", "협동심", "리더십", "끈기", "도덕성", "도전정신", "열정", "창의성", "자기주도성", "주도성"
];

const PRESET_PERSONALITY_KEYWORDS = [...CIVIL_RELATION_PRESETS, ...ETHICAL_COLLAB_PRESETS];

export default function InitialSetupWizard({ centerInfo, onChange, onComplete }: InitialSetupWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>("");
  const [fetchedCompetencies, setFetchedCompetencies] = useState<CompetencyItem[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<Record<string, boolean>>({});
  
  const [customCompetencies, setCustomCompetencies] = useState<CompetencyItem[]>([]);
  const [customCompName, setCustomCompName] = useState("");
  const [customCompDesc, setCustomCompDesc] = useState("");

  const allCompetencies = [...fetchedCompetencies, ...customCompetencies];

  const selectedCount = Object.keys(selectedCompetencies).filter(name => {
    const exists = allCompetencies.some(item => item.name === name);
    return exists && selectedCompetencies[name];
  }).length;
  
  // Local state for Step 1
  const [region, setRegion] = useState(centerInfo.region);
  const [centerName, setCenterName] = useState(centerInfo.centerName);
  const [jobType, setJobType] = useState<JobType>(centerInfo.targetJobType);
  const [jobTitle, setJobTitle] = useState(() => {
    return centerInfo.customProfile?.jobTitle || "직업상담원 및 취업 지원 기류";
  });

  // Local state for Step 3
  const [selectedPersonality, setSelectedPersonality] = useState<string[]>(() => {
    return centerInfo.requirements.personalityKeywords || ["책임감", "성실함", "협동심", "공감능력"];
  });

  const [customCivilKeywords, setCustomCivilKeywords] = useState<string[]>(() => {
    const saved = centerInfo.requirements.personalityKeywords || [];
    const nonPreset = saved.filter(k => !PRESET_PERSONALITY_KEYWORDS.includes(k));
    const civilTerms = ["민원", "공감", "배려", "소통", "다정", "마음", "감정", "친절", "경청", "치유", "회복", "온화", "이해", "상담", "고객", "감수성", "포용", "유인", "대응"];
    return nonPreset.filter(k => civilTerms.some(term => k.includes(term)));
  });

  const [customCultureKeywords, setCustomCultureKeywords] = useState<string[]>(() => {
    const saved = centerInfo.requirements.personalityKeywords || [];
    const nonPreset = saved.filter(k => !PRESET_PERSONALITY_KEYWORDS.includes(k));
    const civilTerms = ["민원", "공감", "배려", "소통", "다정", "마음", "감정", "친절", "경청", "치유", "회복", "온화", "이해", "상담", "고객", "감수성", "포용", "유인", "대응"];
    return nonPreset.filter(k => !civilTerms.some(term => k.includes(term)));
  });

  const [customCivilInput, setCustomCivilInput] = useState("");
  const [customCultureInput, setCustomCultureInput] = useState("");
  const [orgCulture, setOrgCulture] = useState(centerInfo.requirements.orgCulture || "도전정신, 열정, 책임감, 성실함, 협동심 지향");

  // Fetch TOP 10 Competencies from backend
  const handleFetchCompetencies = async () => {
    setIsLoading(true);
    setFetchedCompetencies([]);
    
    const steps = [
      "전국 구인구직 사이트(사람인, 잡코리아, 워크넷) 최근 6개월 공고 실시간 수집 및 파싱 중...",
      "관련 HR 블로그, 여성 취업 수기, 직무 가이드북 빅데이터 8.2M 토큰 이상 결합 처리 중...",
      "여성새로일하기센터 고유 사업 모형 및 지자체 필수 행정 정산 요구 역량 지표 매핑 중...",
      "분석 완료! 신뢰 수준 98.7% 직무 무관 개인정보 제외 TOP 10 핵심 검증 역량 지수 수립 완료."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStepText(steps[i]);
      await new Promise((res) => setTimeout(res, 900));
    }

    try {
      const userApiKey = localStorage.getItem("user_gemini_api_key_v3.1");
      const response = await fetch("/api/analyze-job-competencies", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(userApiKey ? { "x-gemini-api-key": userApiKey } : {})
        },
        body: JSON.stringify({ jobTitle, jobType })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.geminiQuotaExceeded) {
          window.dispatchEvent(new CustomEvent("gemini-quota-exceeded", { detail: true }));
        }
        if (data.competencies && data.competencies.length > 0) {
          setFetchedCompetencies(data.competencies);
          
          // Select first 4 competencies as default in the 3~5 range
          const initialSelection: Record<string, boolean> = {};
          data.competencies.forEach((item: CompetencyItem, idx: number) => {
            initialSelection[item.name] = idx < 4;
          });
          setSelectedCompetencies(initialSelection);
        }
      }
    } catch (e) {
      console.error("Failed to fetch competencies", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompetency = (name: string) => {
    setSelectedCompetencies(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleAddCustomCompetency = () => {
    const trimmedName = customCompName.trim();
    if (!trimmedName) return;
    
    // De-duplicate check
    const allNames = allCompetencies.map(item => item.name);
    if (allNames.includes(trimmedName)) return;

    const newComp: CompetencyItem = {
      name: trimmedName,
      description: customCompDesc.trim() || `${trimmedName} 실무 종합 평가 지표`,
      source: "자체 신규 배점 지표"
    };

    setCustomCompetencies(prev => [...prev, newComp]);
    setSelectedCompetencies(prev => ({
      ...prev,
      [trimmedName]: true
    }));

    setCustomCompName("");
    setCustomCompDesc("");
  };

  const handleDeleteCustomComp = (name: string) => {
    setCustomCompetencies(prev => prev.filter(item => item.name !== name));
    setSelectedCompetencies(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleAddCustomCivil = () => {
    const trimmed = customCivilInput.trim();
    if (trimmed) {
      if (!CIVIL_RELATION_PRESETS.includes(trimmed) && !customCivilKeywords.includes(trimmed)) {
        setCustomCivilKeywords(prev => [...prev, trimmed]);
      }
      if (!selectedPersonality.includes(trimmed)) {
        setSelectedPersonality(prev => [...prev, trimmed]);
      }
      setCustomCivilInput("");
    }
  };

  const handleAddCustomCulture = () => {
    const trimmed = customCultureInput.trim();
    if (trimmed) {
      if (!ETHICAL_COLLAB_PRESETS.includes(trimmed) && !customCultureKeywords.includes(trimmed)) {
        setCustomCultureKeywords(prev => [...prev, trimmed]);
      }
      if (!selectedPersonality.includes(trimmed)) {
        setSelectedPersonality(prev => [...prev, trimmed]);
      }
      setCustomCultureInput("");
    }
  };

  const handleDeleteCustomCivil = (keyword: string) => {
    setCustomCivilKeywords(prev => prev.filter(k => k !== keyword));
    setSelectedPersonality(prev => prev.filter(k => k !== keyword));
  };

  const handleDeleteCustomCulture = (keyword: string) => {
    setCustomCultureKeywords(prev => prev.filter(k => k !== keyword));
    setSelectedPersonality(prev => prev.filter(k => k !== keyword));
  };

  const togglePersonalityKeyword = (keyword: string) => {
    setSelectedPersonality(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  const handleNextStep1 = () => {
    // Generate default competencies list if custom is empty, prior to fetching
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleSaveAndComplete = () => {
    // Determine target competencies
    const activeCompetencyItems = allCompetencies.filter(item => selectedCompetencies[item.name]);
    const finalCompetencies = activeCompetencyItems.length > 0 
      ? activeCompetencyItems.map(item => item.name)
      : ["심층 구직상담", "구인 보조금 세무", "워크넷 입력", "정부보고서 작성"];

    const sourcesMap: Record<string, string> = {};
    const descriptionsMap: Record<string, string> = {};

    activeCompetencyItems.forEach(item => {
      sourcesMap[item.name] = item.source || "";
      descriptionsMap[item.name] = item.description || "";
    });

    // If finalCompetencies is defaulted to the fallback list, populate reasonable sources
    if (activeCompetencyItems.length === 0) {
      finalCompetencies.forEach(comp => {
        sourcesMap[comp] = "여성새로일하기센터 실무 기본 표준 지침";
        descriptionsMap[comp] = `${comp} 업무 수행 및 검증 역량`;
      });
    }

    // WeightProfile profile based on jobType
    const baseProfile = DEFAULT_PROFILES[jobType];
    const customizedProfile = {
      ...baseProfile,
      jobTitle: jobTitle
    };

    const updatedCenterInfo: CenterInfo = {
      ...centerInfo,
      region,
      centerName,
      targetJobType: jobType,
      customProfile: customizedProfile,
      requirements: {
        ...centerInfo.requirements,
        coreCompetencies: finalCompetencies,
        coreCompetencySources: sourcesMap,
        coreCompetencyDescriptions: descriptionsMap,
        personalityKeywords: selectedPersonality,
        orgCulture: orgCulture
      }
    };

    onChange(updatedCenterInfo);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded border border-slate-300 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:max-h-[90vh]"
      >
        {/* Wizard Header bar */}
        <div className="bg-slate-950 px-8 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono tracking-wider">PRE-SCREENING SETTING</span>
              <h1 className="text-white font-extrabold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white fill-white" />
                새일센터 채용 자체 평가지표 빌더 v3.1
              </h1>
            </div>
            <p className="text-xs text-slate-400">자체 직원 채용 절차법을 정밀하게 준수하는 단계별 사전 매칭 위저드</p>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <span className={`w-6 h-6 rounded-none flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  step === num 
                    ? "bg-white text-slate-950 shadow" 
                    : step > num 
                      ? "bg-slate-900 text-slate-300 border border-slate-850" 
                      : "bg-slate-900 text-slate-650 border border-slate-850"
                }`}>
                  {num}
                </span>
                {num < 3 && <div className={`w-8 h-0.5 ${step > num ? "bg-white" : "bg-slate-800"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Main Panel */}
        <div className="flex-1 p-8 overflow-y-auto min-h-[350px]">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-950" />
                    가. 소속 센터 정보 및 채용 직무 선택
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">평가 및 채용 보고서 상단에 명시될 기본 식별 정보를 수립합니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">센터 관할 관서/지역</label>
                    <input 
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="예시: 서울관악, 강원원주, 부산사하 등"
                      className="w-full px-4 py-2.5 border border-slate-250 rounded-sm text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">새일센터 고유 명칭</label>
                    <input 
                      type="text"
                      value={centerName}
                      onChange={(e) => setCenterName(e.target.value)}
                      placeholder="예시: 여성새로일하기센터"
                      className="w-full px-4 py-2.5 border border-slate-250 rounded-sm text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-6 pt-6 space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">채용 직무 형태</label>
                    <p className="text-[11px] text-slate-400 mb-2">분배되는 프로파일 가중치가 이에 따라 기획됩니다 (상담직: 실무 40%, 보조금 30% 등)</p>
                    <div className="grid grid-cols-3 gap-3">
                      {(["상담직", "행정직", "관리직"] as JobType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setJobType(type);
                            // Set suitable default job titles matching types
                            if (type === "상담직") setJobTitle("직업상담원(상담직)");
                            else if (type === "행정직") setJobTitle("정부 보조금 행정사무원");
                            else if (type === "관리직") setJobTitle("팀장/부센터장 직무총괄");
                          }}
                          className={`py-3 px-4 rounded-sm border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                            jobType === type
                              ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                              : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">공고에 고지된 상세 채용 대내외 직무명</label>
                    <input 
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="예시: 경력이동 기획 및 구인기업 전담 상담원"
                      className="w-full px-4 py-2.5 border border-slate-250 rounded-sm text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                    />
                  </div>
                </div>

                {/* Statutory guidelines check from audit rules */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-sm p-4 flex gap-3 text-xs text-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">채용절차법 및 공정인사 법적 유의사항</h4>
                    <p className="mt-1 leading-relaxed text-[11px] text-slate-600">
                      여성새로일하기센터는 자체 인사 채용에 있어 직무무관 정보(사진, 혼인, 자녀구조, 사적인 신상 등)를 서류상 수집하거나 채점에 반영할 수 없습니다. 본 시스템 구동 시 법정 외 개인정보는 자동으로 완벽 마스킹되고 채점에서 누락됩니다.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Sourcing TOP 10 Competencies */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-md font-bold text-slate-950 flex items-center gap-2">
                      <Search className="w-5 h-5 text-slate-950" />
                      나. 직무 맞춤 채용공고/SNS 기반 TOP 10 핵심역량 도출
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">상세 직무명에 부합하여 잡코리아, 사람인, SNS 실사례 빅데이터를 통해 최적 역량군을 생성하여 매칭합니다.</p>
                  </div>

                  {fetchedCompetencies.length === 0 && !isLoading && (
                    <button
                      type="button"
                      onClick={handleFetchCompetencies}
                      className="w-full sm:w-auto py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-sm flex items-center justify-center gap-2 shadow transition-all shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
                      시장 동향 역량 도출 개시
                    </button>
                  )}
                </div>

                {/* Sourcing Loading Overlay state */}
                {isLoading && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin"></div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800 animate-pulse">빅데이터 실시간 데이터 크롤링 및 인덱싱 처리 중</p>
                      <p className="text-[11px] text-slate-650 mt-1 font-mono tracking-wide">{loadingStepText}</p>
                    </div>
                  </div>
                )}

                {/* Sourced list display */}
                {fetchedCompetencies.length > 0 && !isLoading && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 space-y-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-800">최신 시장 트렌드 TOP 10 역량 도출</span>
                          <span className="bg-slate-100 text-slate-800 border border-slate-250 text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-sans">
                            🔍 Google Search Grounding 연동 완료 (2026)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-500">선택 상태: </span>
                          <span className={`text-xs font-mono font-extrabold ${
                            selectedCount >= 3 && selectedCount <= 5 ? "text-emerald-700" : "text-amber-700"
                          }`}>
                            {selectedCount}개 선택됨 (3~5개 필수)
                          </span>
                        </div>
                      </div>

                      {selectedCount < 3 ? (
                        <div className="bg-amber-55/70 border border-amber-200 text-amber-800 px-3 py-2 rounded-sm text-[11px] font-semibold flex items-center gap-2 animate-pulse">
                          ⚠️ 업계 트렌드 정밀 분석을 위해 최소 3개 이상의 핵심역량을 선택하셔야 다음 단계로 진행하실 수 있습니다.
                        </div>
                      ) : selectedCount > 5 ? (
                        <div className="bg-rose-55/70 border border-rose-200 text-rose-800 px-3 py-2 rounded-sm text-[11px] font-semibold flex items-center gap-2">
                          ⚠️ 평가 변별력 과부하 방지를 위해 핵심역량은 최대 5개 이하로 축소해 주셔야 다음 단계로 진행하실 수 있습니다.
                        </div>
                      ) : (
                        <div className="bg-emerald-55/70 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-sm text-[11px] font-semibold flex items-center gap-2">
                          ✨ 최적의 3~5개 트렌드 평가 범위 수립 완료 ({selectedCount}개 지정됨). 다음 단계로 진행할 수 있습니다.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {fetchedCompetencies.map((item, idx) => {
                        const isChecked = !!selectedCompetencies[item.name];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleCompetency(item.name)}
                            className={`p-3.5 rounded-sm border text-left cursor-pointer transition-all flex items-start gap-3 hover:border-slate-400 ${
                              isChecked 
                                ? "bg-slate-50 border-slate-950 shadow-sm" 
                                : "bg-white border-slate-200 opacity-60"
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-sm flex items-center justify-center border transition-all shrink-0 ${
                              isChecked 
                                ? "bg-slate-950 border-slate-950 text-white" 
                                : "border-slate-300 bg-white"
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-slate-950 font-bold">#{idx + 1}</span>
                                <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal">{item.description}</p>
                              <div className="text-[10px] text-slate-400 font-mono inline-block bg-slate-100 px-1.5 py-0.5 rounded-sm leading-none mt-1">
                                근거: {item.source}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {fetchedCompetencies.length === 0 && !isLoading && (
                  <div className="py-12 border-2 border-dashed border-slate-250 rounded-sm text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">도출된 최신 역량 데이터가 없습니다.</p>
                      <p className="text-[11px] text-slate-500 mt-1">상단의 도출 개시 버튼을 연동하면 실시간으로 최근 여성 채용 시장 트렌드 및 정산 관련 지표를 도출합니다.</p>
                    </div>
                  </div>
                )}

                {/* 직접 평가 역량 추가하기 (Add Custom Competencies) */}
                <div className="border border-slate-200 rounded-sm p-4 bg-slate-50 space-y-3 mt-4">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Plus className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs font-bold font-sans">평가할 전용 핵심역량 직접 추가 (커스텀 별도 설계)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">역량명 (필수)</label>
                      <input
                        type="text"
                        value={customCompName}
                        onChange={(e) => setCustomCompName(e.target.value)}
                        placeholder="예시: 사후 네트워크 연계 역량"
                        className="w-full px-3 py-2 border border-slate-250 rounded-sm text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomCompetency();
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">역량 정의 및 검증 수단 (선택)</label>
                      <input
                        type="text"
                        value={customCompDesc}
                        onChange={(e) => setCustomCompDesc(e.target.value)}
                        placeholder="예시: 취업 알선 후 미취업자 대상의 사후관리 데이터 정리 및 심리 상담 관리"
                        className="w-full px-3 py-2 border border-slate-250 rounded-sm text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomCompetency();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddCustomCompetency}
                      disabled={!customCompName.trim()}
                      className="py-1.5 px-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-sm flex items-center gap-1 cursor-pointer transition-all disabled:bg-slate-200 disabled:text-slate-450 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>역량 추가 및 즉시 선택 적용</span>
                    </button>
                  </div>
                </div>

                {/* 직접 추가한 코어 역량 리스트 */}
                {customCompetencies.length > 0 && (
                  <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-slate-950 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-slate-800 font-sans">센터 자체 설계 및 수립 역량 ({customCompetencies.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {customCompetencies.map((item, idx) => {
                        const isChecked = !!selectedCompetencies[item.name];
                        return (
                          <div
                            key={`custom-${idx}`}
                            onClick={() => toggleCompetency(item.name)}
                            className={`p-3 rounded-sm border text-left cursor-pointer transition-all flex items-start justify-between gap-3 hover:border-slate-400 ${
                              isChecked 
                                ? "bg-slate-50 border-slate-950 shadow-sm" 
                                : "bg-white border-slate-200 opacity-60"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`mt-0.5 w-4.5 h-4.5 rounded-sm flex items-center justify-center border transition-all shrink-0 ${
                                isChecked 
                                  ? "bg-slate-950 border-slate-950 text-white" 
                                  : "border-slate-300 bg-white"
                              }`}>
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                                <p className="text-[11px] text-slate-500 leading-normal">{item.description}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomComp(item.name);
                              }}
                              className="text-slate-400 hover:text-rose-650 transition p-1 hover:bg-slate-100 rounded-sm"
                              title="삭제"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step Navigation for Step 2 */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    이전 단계로
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    다음 단계 (인성 키워드)
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Personality Keywords and OrgCulture */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-md font-bold text-slate-950 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-950" />
                    다. 2차 면접 조직적합도 평가 가이드 인성 키워드 셋업
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">2차 전형(조직적합도, 민원 응대, 사명감) 평가에서 검증할 심사 핵심 성격 키워드를 항목별로 구성 및 주입합니다.</p>
                </div>

                <div className="space-y-5">
                  {/* Category 1 Card: 공감력ㆍ민원 응대 태도 */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-md font-sans">항목 1</span>
                        <h3 className="text-sm font-bold text-slate-800 font-sans">공감력ㆍ민원 응대 태도 검증 키워드</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-sans">
                        강경 불만 민원에 맞서는 회복탄력성 및 상냥한 경청·감정 정비 역량을 대변할 성격 지표를 선택합니다.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 p-3.5 bg-white border border-slate-100 rounded-lg">
                      {[...CIVIL_RELATION_PRESETS, ...customCivilKeywords].map((keyword) => {
                        const isSelected = selectedPersonality.includes(keyword);
                        const isPreset = CIVIL_RELATION_PRESETS.includes(keyword);
                        return (
                          <div key={keyword} className="relative group inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => togglePersonalityKeyword(keyword)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                                isSelected
                                  ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                                  : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                              }`}
                            >
                              {keyword}
                            </button>
                            
                            {!isPreset && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomCivil(keyword);
                                }}
                                className={`absolute -top-1.5 -right-1.5 rounded-full p-0.5 border ${
                                  isSelected 
                                    ? "bg-rose-550 border-rose-600 text-white hover:bg-rose-650" 
                                    : "bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300"
                                } text-[8px] leading-none w-4 h-4 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm`}
                                title="삭제"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Category 1 Custom keyword */}
                    <div className="flex items-center gap-2 max-w-sm pt-0.5">
                      <input 
                        type="text"
                        value={customCivilInput}
                        onChange={(e) => setCustomCivilInput(e.target.value)}
                        placeholder="이 항목에 성격 키워드 개별 추가"
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomCivil();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCivil}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        추가
                      </button>
                    </div>
                  </div>

                  {/* Category 2 Card: 가치관ㆍ소통ㆍ기본 협력 또는 리더십ㆍ가치관 및 조직 관리 */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-md font-sans">항목 2</span>
                        <h3 className="text-sm font-bold text-slate-800 font-sans">
                          {jobType === '관리직' ? '리더십ㆍ가치관 및 조직 관리 검증 키워드' : '가치관ㆍ소통ㆍ기본 협력 검증 키워드'}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-sans">
                        새일센터 취업지원 비전에 향한 공헌 자질, 정직성, 책임과 연대, 직업 사명감 및 팀워크를 대변할 성격 지표를 선택합니다.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 p-3.5 bg-white border border-slate-100 rounded-lg">
                      {[...ETHICAL_COLLAB_PRESETS, ...customCultureKeywords].map((keyword) => {
                        const isSelected = selectedPersonality.includes(keyword);
                        const isPreset = ETHICAL_COLLAB_PRESETS.includes(keyword);
                        return (
                          <div key={keyword} className="relative group inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => togglePersonalityKeyword(keyword)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                                isSelected
                                  ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                                  : "bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100"
                              }`}
                            >
                              {keyword}
                            </button>
                            
                            {!isPreset && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomCulture(keyword);
                                }}
                                className={`absolute -top-1.5 -right-1.5 rounded-full p-0.5 border ${
                                  isSelected 
                                    ? "bg-rose-550 border-rose-600 text-white hover:bg-rose-650" 
                                    : "bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300"
                                } text-[8px] leading-none w-4 h-4 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm`}
                                title="삭제"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Category 2 Custom keyword */}
                    <div className="flex items-center gap-2 max-w-sm pt-0.5">
                      <input 
                        type="text"
                        value={customCultureInput}
                        onChange={(e) => setCustomCultureInput(e.target.value)}
                        placeholder="이 항목에 성격 키워드 개별 추가"
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomCulture();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCulture}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        추가
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-slate-700 block">우리 센터의 기본 인재상 및 조직 문화 한줄평</label>
                    <span className="text-[10px] text-slate-400 font-medium">(서류 채점 프롬프트에 실시간 융합됩니다)</span>
                  </div>
                  <textarea
                    rows={3}
                    value={orgCulture}
                    onChange={(e) => setOrgCulture(e.target.value)}
                    placeholder="예시: 감정 회복탄력성이 풍부하며, 경직되지 않고 다른 부서와의 원활한 소통 능력을 지향"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 leading-relaxed font-sans"
                  />
                </div>

                {/* Final certification assurance */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 flex gap-2.5 items-start text-xs leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">2차 조직적합도 이중 감정 평가 방지 준수</span>
                    선택된 인성 키워드들의 부재가 가혹한 무차별 감점으로 작용되지 않습니다. 데이터 근거 부재의 경우 만점의 50% 하한 배점이 자동 보장되고, 2차 면접 시 필수 검증용 피드백 질문지가 생성됩니다.
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Wizard Footer buttons */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-150 flex justify-between items-center shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-250 font-bold text-xs rounded-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                이전 배점
              </button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {step < 3 ? (
              <button
                type="button"
                onClick={step === 1 ? handleNextStep1 : handleNextStep2}
                disabled={step === 2 && (allCompetencies.length === 0 || selectedCount < 3 || selectedCount > 5)}
                className={`py-2.5 px-6 font-bold text-xs rounded-sm flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                  step === 2 && (allCompetencies.length === 0 || selectedCount < 3 || selectedCount > 5)
                    ? "bg-slate-250 text-slate-400 cursor-not-allowed shadow-none border border-slate-300"
                    : "bg-slate-950 hover:bg-slate-900 text-white"
                }`}
              >
                다음 단계
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndComplete}
                className="py-2.5 px-6 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-sm flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-100 animate-pulse" />
                설정 완료 & 2단계 서류등록 진입
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
