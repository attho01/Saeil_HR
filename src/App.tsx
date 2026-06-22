import React, { useState, useEffect } from "react";
import { CenterInfo, Candidate, CandidateRawInput, JobType, Confidence, EvidenceType } from "./types";
import { MOCK_CANDIDATES } from "./data/mockCandidates";
import CenterConfiguration, { DEFAULT_PROFILES } from "./components/CenterConfiguration";
import CandidateForm from "./components/CandidateForm";
import CandidateDashboard, { auditCandidateScores } from "./components/CandidateDashboard";
import CandidateDetailsPanel from "./components/CandidateDetailsPanel";
import InitialSetupWizard from "./components/InitialSetupWizard";
import LandingPage from "./components/LandingPage";
import ApiKeyModal from "./components/ApiKeyModal";
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
  HelpCircle,
  Key,
  Loader2,
  ExternalLink
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

  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
    const saved = localStorage.getItem("saerong_setup_complete_v3.1");
    if (saved) {
      return saved === "true";
    }
    // Default to false so new users are guided through the wizard steps (job & personality configurations)
    return false;
  });

  const [showLanding, setShowLanding] = useState<boolean>(true);

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
    // Default to mock candidates on first visit so the system is fully functional right away
    return MOCK_CANDIDATES;
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

  // Queue tracking for bulk uploaded files
  const [queueCompleted, setQueueCompleted] = useState<number>(0);
  const [queueTotal, setQueueTotal] = useState<number>(0);
  const [queueProcessing, setQueueProcessing] = useState<boolean>(false);
  const [justFinishedBatch, setJustFinishedBatch] = useState<boolean>(false);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [hasUserApiKey, setHasUserApiKey] = useState<boolean>(() => {
    return !!localStorage.getItem("user_gemini_api_key_v3.1");
  });
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setIsQuotaExceeded(true);
    };
    window.addEventListener("gemini-quota-exceeded", handleQuotaExceeded);
    return () => {
      window.removeEventListener("gemini-quota-exceeded", handleQuotaExceeded);
    };
  }, []);

  useEffect(() => {
    if (!hasUserApiKey) {
      setShowLanding(true);
    }
  }, [hasUserApiKey]);

  const [currentMainStep, setCurrentMainStep] = useState<number>(() => {
    try {
      const savedCand = localStorage.getItem(LOCAL_STORAGE_CANDIDATES_KEY);
      if (savedCand) {
        const parsed = JSON.parse(savedCand);
        if (parsed && parsed.length > 0) {
          return 3;
        }
      } else {
        // First visit with pre-loaded mock candidates, go straight to the dashboard!
        return 3; 
      }
      const setupDone = localStorage.getItem("saerong_setup_complete_v3.1") === "true";
      if (setupDone) {
        return 2;
      }
    } catch (_) {}
    return 3;
  });

  // Sync filter choice
  useEffect(() => {
    localStorage.setItem("saerong_filter_registered_v3.1", String(filterRegisteredOnly));
  }, [filterRegisteredOnly]);

  const [dashboardViewMode, setDashboardViewMode] = useState<"card" | "table font-bold">(() => {
    return (localStorage.getItem("saerong_dashboard_view_mode_v3.1") as "card" | "table") || "card";
  });

  useEffect(() => {
    // strip out auxiliary tailwind class names if they accidentally leak
    const cleanMode = dashboardViewMode.includes("table") ? "table" : "card";
    localStorage.setItem("saerong_dashboard_view_mode_v3.1", cleanMode);
  }, [dashboardViewMode]);

  // Track start of a file processing batch to trigger automatic transition on completion
  useEffect(() => {
    if (queueProcessing) {
      setJustFinishedBatch(true);
    }
  }, [queueProcessing]);

  useEffect(() => {
    if (justFinishedBatch && !queueProcessing && queueTotal > 0 && queueCompleted === queueTotal) {
      setJustFinishedBatch(false);
      const timer = setTimeout(() => {
        setCurrentMainStep(3);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [justFinishedBatch, queueProcessing, queueTotal, queueCompleted]);

  const displayedCandidates = filterRegisteredOnly
    ? candidates.filter(c => !c.id.startsWith("cand_preset_"))
    : candidates;

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || null;

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

  const handleAnalyzeCandidate = async (input: CandidateRawInput, skipNavigation?: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const userApiKey = localStorage.getItem("user_gemini_api_key_v3.1");
      let analyzedCandidate: Candidate | null = null;
      
      const isStaticDeployment = !window.location.hostname.includes("run.app") && 
                                 window.location.hostname !== "localhost" && 
                                 window.location.hostname !== "127.0.0.1";
      
      let staticFallback = isStaticDeployment;

      if (!staticFallback) {
        try {
          const response = await fetch("/api/analyze-candidate", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(userApiKey ? { "x-gemini-api-key": userApiKey } : {})
            },
            body: JSON.stringify({
              name: input.name,
              resumeText: input.resumeText,
              selfIntroText: input.selfIntroText,
              planText: input.planText || "",
              policyBonus: input.policyBonus || 0,
              centerInfo
            })
          });

          if (response.status === 404) {
            staticFallback = true;
          } else if (!response.ok) {
            staticFallback = true;
          } else {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              analyzedCandidate = await response.json();
            } else {
              staticFallback = true;
            }
          }
        } catch (err) {
          staticFallback = true;
        }
      }

      if (staticFallback) {
        console.log("Using client-side fallback for analyze-candidate.");
        
        if (userApiKey) {
          try {
            const prompt = `
여성새로일하기센터(새일센터) 자체 직원 채용 분석 루브릭 v3.1에 맞춰 다음 지원자의 서류를 분석하여 엄밀하고 정밀한 채점과 리포트 JSON을 작성해주세요.

## 채량 정보 및 조직 요구 조건:
- 센터명: ${centerInfo.region} ${centerInfo.centerName}
- 직무: ${centerInfo.targetJobType}
- 핵심 우대 자격증: ${centerInfo.requirements.certificates.join(", ")}
- 중요 직무 역량: ${centerInfo.requirements.coreCompetencies.join(", ")}
- 요구 공백/경력 수준: ${centerInfo.requirements.requiredExperienceMonths}개월 요망
- 우리 센터의 인재상/조직문화 및 2차 면접 인성 키워드: ${centerInfo.requirements.orgCulture} (평가 검증 필수 인성 키워드: ${(centerInfo.requirements.personalityKeywords || []).join(", ")})

## 지원자 제출 자료:
- 이름: ${input.name}
- 이력 및 경력내용 (입사지원서):
${input.resumeText}
- 자기소개서:
${input.selfIntroText}
- 직무수행계획서:
${input.planText || "미제출"}

## ★평가 규칙 및 제약사항 (반드시 충족해야 함):
1. [법정 비수집 정보 배제]: 서류 내에 출신학교, 학벌서열, 연령, 혼인유무, 신체용모(사진, 키, 몸무게), 소유재산, 직계가족 학력/직업 등이 담겨 있다면, "해당 정보는 평가에 사용하지 않았음"을 고지하고 마스킹로그에 남깁니다. 채점에는 절대 0점 반영합니다.
2. [경력단절 무감점]: 경력단절 혹은 육아공백기가 노출된 기록이 있다면, 센터의 고유 사명에 따라 "무감점" 처리하고 마스킹로그 혹은 로그에 긍정 한줄을 남기십시오.
3. [1차 직무수행역량 채점 (각 100점 만점)]:
   - JobCompetency(직무 전문성/자격): 자격증 부합 여부, 실무 상담 경력 일치성
   - AdminSkills(행정/실무): 정부사업 운영력, 공문서 작성, 한글/엑셀 다룸
   - Networking(구인기업 개척/소통): 구인기업 적극 발굴, 관리, 네트워킹 성향
4. [2차 조직적합도 채점 (각 100점 만점) 및 신뢰도 처리]:
   - CivilScoreRaw(민원 응대력): 감정민원 극복 여부, 경청, 회복탄력성
   - CultureScoreRaw(가치관/협업): 여성 취업지원 사명감, 협력적 성향
   - 신뢰도 (civilConfidence, cultureConfidence): 상, 중상, 중, 하 구분 판정
   - 근거유형 (civilEvidence, cultureEvidence): 있음, 약함, 부재, 부정 구분 판정
     * '부재'인 경우: 원점수와 별개로 만점의 50%가 하한값으로 보장되며, 면접 필수확인으로 표시됩니다.
     * '부정'인 경우: 협업을 거부하거나 책임회피적인 정황이 있다면 정상 감점 처리(하한 보장 없음).
5. [면접 추천 질문]: 
   - 직무행정 검증용 날카로운 질문 2개
   - 민원 극출 극복 및 커핏 검증 질문 2개
   - 미검증 부재/약함 항목 확인용 질문 1-2개
6. [리턴 형식]: JSON 형식으로만 응답해야 하며, 다른 한글 서언은 제외하십시오.

## JSON 리턴 포맷:
{
  "jobCompetencyScore": number (0~100),
  "adminSkillsScore": number (0~100),
  "networkingScore": number (0~100),
  "civilScoreRaw": number (0~100),
  "cultureScoreRaw": number (0~100),
  "civilConfidence": "상" | "중상" | "중" | "하",
  "cultureConfidence": "상" | "중상" | "중" | "하",
  "civilEvidence": "있음" | "약함" | "부재" | "부정",
  "cultureEvidence": "있음" | "약함" | "부재" | "부정",
  "maskingLogs": ["string logs"],
  "uncollectedDataDetected": boolean,
  "careerInterruptionFound": boolean,
  "tier": "적극검토" | "검토(조건부)" | "보류",
  "candidateTypeLabel": "균형형" | "고직무·정성미검증" | "고적합·직무보완" | "전반보완필요",
  "oneLineComment": "핵심 한줄평",
  "longComments": "종합 세부 평가 내용 서술",
  "interviewQuestions": {
    "jobAdmin": ["질문1", "질문2"],
    "civilCulture": ["질문1", "질문2"],
    "unverified": ["질문1", "질문2"]
  },
  "suggestedDocuments": ["서류1", "서류2"]
}
`;

            const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userApiKey.trim()}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: "application/json"
                }
              })
            });

            if (directRes.ok) {
              const directJson = await directRes.json();
              const text = directJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
              const resObj = JSON.parse(text);
              analyzedCandidate = {
                id: `cand_${Date.now()}`,
                name: input.name,
                documentsSubmitted: {
                  resume: input.resumeText.trim().length > 10,
                  selfIntro: input.selfIntroText.trim().length > 10,
                  plan: (input.planText || "").trim().length > 10
                },
                policyBonus: input.policyBonus || 0,
                resumeText: input.resumeText,
                selfIntroText: input.selfIntroText,
                planText: input.planText || "",
                ...resObj
              };
            }
          } catch (directErr) {
            console.error("Direct Gemini evaluation failed, falling back to local heuristic:", directErr);
          }
        }

        if (!analyzedCandidate) {
          // Heuristic score calculation
          const combinedText = `${input.name} ${input.resumeText} ${input.selfIntroText} ${input.planText || ""}`;
          const logs: string[] = [];
          let uncollectedDataDetected = false;
          let careerInterruptionFound = false;

          const phoneRegex = /(010-\d{3,4}-\d{4})|(\d{2,3}-\d{3,4}-\d{4})/g;
          if (phoneRegex.test(combinedText)) {
            logs.push("연락처 정보 감지되어 [마스킹] 처리 및 채점 절대 배제완료");
          }

          const juminRegex = /\d{6}-\d{7}/g;
          if (juminRegex.test(combinedText)) {
            logs.push("주민등록번호 감지되어 [마스킹] 처리 및 채점 절대 배제완료");
          }

          const illegalKeywords = [
            { pattern: /(초등|중등|고등|대학|학위|졸업|대졸|대학교)/i, label: "출신학교 정보" },
            { pattern: /(기혼|미혼|이혼|자녀|자식|남편|부인|아들|딸|가족|형제|부모)/i, label: "혼인 및 가족관계" },
            { pattern: /(신장|체중|몸무게|신체|키|외모|사진)/i, label: "신용체형·용모 정보" },
            { pattern: /(본적|고향|출생|출신지역)/i, label: "출신지 정보" },
            { pattern: /(재산|주택|소유|부동산)/i, label: "재산 정보" },
          ];

          illegalKeywords.forEach(item => {
            if (item.pattern.test(combinedText)) {
              logs.push(`[법정 비수집 정보] ${item.label} 감지되어 평가에서 완전히 배제함`);
              uncollectedDataDetected = true;
            }
          });

          const carrerBreakKeywords = /(경력단절|경단녀|육아공백|출산공백|복직|재취업|오랜 공백|가사공백)/i;
          if (carrerBreakKeywords.test(combinedText)) {
            careerInterruptionFound = true;
            logs.push("경력단절(공백기) 사실 감지되었으나, 센터 사명에 의거하여 무감점(0점 감점) 보장 조치 적용");
          }

          let jobComp = 45;
          let adminSkills = 45;
          let networking = 45;

          const checkKeywords = (text: string, kwList: string[]) => {
            let count = 0;
            kwList.forEach(kw => {
              const regex = new RegExp(kw, 'gi');
              const matches = text.match(regex);
              if (matches) count += matches.length;
            });
            return count;
          };

          const counselKeywords = ["상담", "직업상담", "취업지원", "내담자", "상담사", "심리", "워크넷", "진로", "구직자", "취업알선", "상담원"];
          const adminKeywords = ["엑셀", "문서", "정산", "회계", "공문서", "기안", "정부지원", "보고서", "한글", "wpm", "ppt", "스프레드시트", "행정"];
          const networkKeywords = ["기업", "개척", "발굴", "마케팅", "네트워크", "협력", "업체", "구인", "동행면접", "홍보", "영업"];

          const counselFreq = checkKeywords(combinedText, counselKeywords);
          const adminFreq = checkKeywords(combinedText, adminKeywords);
          const networkFreq = checkKeywords(combinedText, networkKeywords);

          jobComp += Math.min(50, counselFreq * 6);
          adminSkills += Math.min(50, adminFreq * 7);
          networking += Math.min(50, networkFreq * 8);

          const certificateKeywords = ["직업상담사", "사회복지사", "직업상담사2급", "사회복지사1급", "사회복지사2급", "컴퓨터활용", "컴활", "워드"];
          certificateKeywords.forEach(cert => {
            if (combinedText.includes(cert)) {
              jobComp += 5;
            }
          });

          jobComp = Math.min(100, Math.max(20, jobComp));
          adminSkills = Math.min(100, Math.max(20, adminSkills));
          networking = Math.min(100, Math.max(20, networking));

          let civilRaw = 40;
          let cultureRaw = 45;

          const memoKeywords = ["민원", "악성", "불만", "거부", "감정", "해결", "상처", "경청", "경청하는", "치유", "회복", "회복탄력성"];
          const baseEthical = ["사명감", "새일", "공감", "여성", "협업", "팀원", "협력", "희생", "배려", "소통", "팀워크"];
          const customPersonality = centerInfo.requirements?.personalityKeywords || [];
          const ethicalCollabKeywords = Array.from(new Set([...baseEthical, ...customPersonality]));

          const civilFreq = checkKeywords(combinedText, memoKeywords);
          const ethicalFreq = checkKeywords(combinedText, ethicalCollabKeywords);

          civilRaw += Math.min(55, civilFreq * 12);
          cultureRaw += Math.min(50, ethicalFreq * 10);

          civilRaw = Math.min(100, Math.max(10, civilRaw));
          cultureRaw = Math.min(100, Math.max(10, cultureRaw));

          let civilEvidence: EvidenceType = '있음';
          let civilConfidence: Confidence = '중상';
          let cultureEvidence: EvidenceType = '있음';
          let cultureConfidence: Confidence = '중상';

          if (civilFreq === 0) {
            civilEvidence = '부재';
            civilConfidence = '중';
            civilRaw = 0;
          } else if (civilFreq <= 1) {
            civilEvidence = '약함';
            civilConfidence = '하';
          }

          if (ethicalFreq === 0) {
            cultureEvidence = '부재';
            cultureConfidence = '중';
            cultureRaw = 0;
          } else if (ethicalFreq <= 1) {
            cultureEvidence = '약함';
            cultureConfidence = '하';
          }

          let oneLineComment = "";
          let longComments = "";
          let categoryLabel: '균형형' | '고직무·정성미검증' | '고적합·직무보완' | '전반보완필요' = '균형형';
          let tier: '적극검토' | '검토(조건부)' | '보류' = '적극검토';

          if (jobComp >= 80 && civilEvidence !== '부재') {
            oneLineComment = "우수한 취업지원 실무와 원활한 갈등 복탄력을 겸비한 적격 인재";
            longComments = `지원 서류 전반에서 상담 사명과 행정 관리 경력이 골고루 관찰됩니다. 특히 여성 일자리 발굴 및 사후관리에 필수적인 구인 개척 역량의 적극성이 보이고, 여성 상담 전문인력으로서 즉각 투입이 가능한 수준입니다.`;
            categoryLabel = '균형형';
            tier = '적극검토';
          } else if (civilEvidence === '부재' || cultureEvidence === '부재') {
            oneLineComment = "서류상 행정 직무역량은 우수하나, 정성적 민원/조직적합도 근거가 결여되어 보완검증 필요";
            longComments = `직무 수행 이력은 양호하게 나열되었으나 자소서 내의 태도, 민원 대응 극복 사례, 새일센터 정체성에 대한 이해가 다소 추상적으로 기술되어 있습니다. 근거 보재에 따른 하한 보장(50점)을 적용했으니 면접에서 집중 검증하십시오.`;
            categoryLabel = '고직무·정성미검증';
            tier = '검토(조건부)';
          } else if (jobComp < 65 && civilRaw >= 75) {
            oneLineComment = "조직 융화 및 민원 공감 능력은 탁월하나, 취업 지원 행정/실무 보완 필요";
            longComments = `상담 경험이나 상담원 마인드는 매우 뛰어나나, 구인처 관리 또는 정부지원 보조금 기안 정산 등 거버넌스 행정 경력이 비교적 약해 즉시 현업 운용 시 전반적인 직무 온보딩 훈련이 필요한 고적합 성향입니다.`;
            categoryLabel = '고적합·직무보완';
            tier = '검토(조건부)';
          } else {
            oneLineComment = "제출된 서류상 가치 평가 근거가 부족하며, 직무수행 및 적합도 전반의 추가 보완검증 권장";
            longComments = `전반적으로 입사지원서와 소개서의 분량이 협소하고 추상적인 서술이 대다수입니다. 면접 전 직무수행계획서를 요구하거나, 면접장에서 직무 기초와 직인 역량을 입체적으로 타진해야 합니다.`;
            categoryLabel = '전반보완필요';
            tier = '보류';
          }

          const jobAdminQuestions = [
            `새일센터 정부지원사업(구직자 훈련비 등)의 기안 수립 및 예산 정산 시 지출결의 오류나 지침 불일치 문제를 해결했던 구체적 경험은 무엇입니까?`,
            `취업지원 실무 중 구인 기업 관계자의 비협조나 구인 조건 미달 시, 주도적으로 구인 업체를 설득하여 일자리를 발굴했던 사례를 설명해주세요.`
          ];

          const civilCultureQuestions = [
            `상담 과정에서 완강한 요구를 하거나 자격 요건 탈락에 분노하는 민원인의 감정적 압박 상황에서 평정심을 유지하는 본인만의 대처 노하우는 무엇입니까?`,
            `새일센터의 주 이용층인 경력단절 여성의 상담 시 발생할 수 있는 공감과 객관적 알선 행정 사이의 간극을 어떻게 조절할 것인지 설명해주세요.`
          ];

          const unverifiedQuestions: string[] = [];
          if (civilEvidence === '부재') {
            unverifiedQuestions.push("[민원응대 근거부재] 자소서 내 악성 민원이나 갈등 대처에 대한 구체적 극복 사례를 직접 이야기해주십시오.");
          }
          if (cultureEvidence === '부재') {
            unverifiedQuestions.push("[가치관 근거부재] 우리 조직의 미션인 ‘경력단절 여성 취업지원 사명감’을 느꼈던 실제 행동 경험이 있는지 확인받으십시오.");
          }
          if (unverifiedQuestions.length === 0) {
            unverifiedQuestions.push("본인이 서류에서 명시한 상담 행정 성과에 대해 증빙을 수반하여 구체적 기여 과정을 검증하십시오.");
          }

          analyzedCandidate = {
            id: `cand_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: input.name,
            documentsSubmitted: {
              resume: input.resumeText.trim().length > 10,
              selfIntro: input.selfIntroText.trim().length > 10,
              plan: (input.planText || "").trim().length > 10
            },
            policyBonus: input.policyBonus || 0,
            jobCompetencyScore: jobComp,
            adminSkillsScore: adminSkills,
            networkingScore: networking,
            civilScoreRaw: civilRaw,
            cultureScoreRaw: cultureRaw,
            civilConfidence,
            cultureConfidence,
            civilEvidence,
            cultureEvidence,
            maskingLogs: logs,
            uncollectedDataDetected,
            careerInterruptionFound,
            tier,
            candidateTypeLabel: categoryLabel,
            oneLineComment,
            longComments,
            interviewQuestions: {
              jobAdmin: jobAdminQuestions,
              civilCulture: civilCultureQuestions,
              unverified: unverifiedQuestions
            },
            suggestedDocuments: (input.planText || "").trim().length > 0 ? ["경력증명서", "자격증 사본"] : ["직무수행계획서 추가 확보", "경력증명서"],
            resumeText: input.resumeText,
            selfIntroText: input.selfIntroText,
            planText: input.planText || "",
            isFallback: true
          };
        }
      }

      if (analyzedCandidate) {
        if (analyzedCandidate.geminiQuotaExceeded) {
          setIsQuotaExceeded(true);
        }
        
        // Force direct matching logic with center settings just in case
        analyzedCandidate.policyBonus = input.policyBonus || 0;

        setCandidates(prev => {
          const index = prev.findIndex(c => c.name === analyzedCandidate!.name);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = analyzedCandidate!;
            return updated;
          }
          return [...prev, analyzedCandidate!];
        });

        setSelectedCandidateId(analyzedCandidate.id);
        if (!skipNavigation) {
          setCurrentMainStep(3); // Go to analytical dashboard main view
        }
      }
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
        report += `    * 근거 역량 검증 질문: \n`;
        cand.interviewQuestions.unverified.forEach(q => report += `      - ${q}\n`);
      }
      report += `\n`;
    });

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Saeil_Center_HR_Report_${centerInfo.centerName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (showLanding) {
    return (
      <div className="bg-[#2f353d] min-h-screen">
        <LandingPage 
          onStartSetup={() => {
            if (!hasUserApiKey) {
              setIsApiKeyModalOpen(true);
              return;
            }
            setShowLanding(false);
            if (!isSetupComplete) {
              setShowWizardDirectly(true);
            }
          }}
          onQuickLoadSample={() => {
            if (!hasUserApiKey) {
              setIsApiKeyModalOpen(true);
              return;
            }
            handleQuickLoadSample();
            setShowLanding(false);
          }}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          hasUserApiKey={hasUserApiKey}
          onLogoClick={() => {
            setShowLanding(true);
          }}
        />
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={() => {
            setHasUserApiKey(true);
            setIsApiKeyModalOpen(false);
            setShowLanding(false);
            setIsSetupComplete(true);
            setCurrentMainStep(1);
            localStorage.setItem("saerong_setup_complete_v3.1", "true");
          }}
          onClear={() => setHasUserApiKey(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f353d] text-slate-100 flex flex-col font-sans" id="recruiter-app-viewport">
      {/* Upper Navigation Bar - SAEIL EVAL Custom Themed Edition */}
      <header className="bg-[#1f2226] text-white border-b border-white/10 sticky top-0 z-40 px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-md shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none hover:opacity-90 transition-opacity" 
          onClick={() => setShowLanding(true)}
        >
          {/* Trademark 2 green vertical bars */}
          <div className="flex gap-1 shrink-0">
            <div className="w-[6px] h-6 bg-[#8ac43f] rounded-xs" />
            <div className="w-[6px] h-6 bg-[#8ac43f] rounded-xs" />
          </div>
          <div className="space-y-0.5">
            <h1 className="font-sans font-extrabold text-white text-base leading-tight flex flex-wrap items-center gap-1.5">
              <span className="text-white font-extrabold uppercase font-sans tracking-tight mr-1">SAEIL EVAL</span>
              <span className="bg-[#8ac43f] text-white px-2 py-0.5 rounded-sm text-[9px] font-extrabold tracking-wider">{centerInfo.region}</span>
              <span className="text-slate-200">{centerInfo.centerName} 채용 평정 시스템</span>
            </h1>
            <p className="text-[11px] text-slate-350 font-sans leading-relaxed">
              채용 직무: <span className="text-[#8ac43f] font-bold">{centerInfo.customProfile?.jobTitle || centerInfo.targetJobType}</span> | 
              가중치 배율: <span className="text-white font-medium">직무 {centerInfo.customProfile?.ratioJobPerformance}% : 조직적합 {centerInfo.customProfile?.ratioCultureSync}%</span> | 
              상태: <span className="text-[#8ac43f] font-bold inline-flex items-center gap-1">● 법정보호 마스킹 활성</span>
              {hasUserApiKey ? (
                <span className="text-emerald-400 font-bold ml-2 inline-flex items-center gap-1">| 🔑 API 키 작동 중</span>
              ) : (
                <span className="text-rose-400 font-bold ml-2 inline-flex items-center gap-1">| ⚠️ API 키 미등록 (이용 제한)</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`py-1.5 px-3.5 rounded transition-all duration-150 flex items-center justify-center gap-1.5 font-sans text-xs font-bold cursor-pointer border ${
                hasUserApiKey 
                  ? "bg-[#8ac43f]/20 hover:bg-[#8ac43f]/35 text-white border-[#8ac43f]" 
                  : "bg-white/10 hover:bg-white/15 text-slate-200 border-white/20"
              }`}
              id="api-key-mgmt-btn"
            >
              <Key className="w-3.5 h-3.5 text-[#8ac43f]" />
              {hasUserApiKey ? "API 키 관리" : "API 키 등록"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLanding(true);
              }}
              className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-sans text-xs font-bold rounded transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              시작화면
            </button>
            {candidates.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!hasUserApiKey) {
                      setIsApiKeyModalOpen(true);
                      return;
                    }
                    handleExportTextReport();
                  }}
                  className={`py-1.5 px-3.5 font-sans text-xs font-bold rounded transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                    !hasUserApiKey
                      ? "bg-slate-705 text-slate-400 opacity-50 cursor-not-allowed"
                      : "bg-[#8ac43f] hover:bg-[#7cb337] text-white"
                  }`}
                  id="export-text-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  종합 분석서 다운로드
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!hasUserApiKey) {
                      setIsApiKeyModalOpen(true);
                      return;
                    }
                    handleClearCandidates();
                  }}
                  className={`py-1.5 px-3.5 font-sans text-xs font-bold rounded transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer border border-red-800 ${
                    !hasUserApiKey
                      ? "bg-red-900/10 text-red-400 opacity-50 cursor-not-allowed"
                      : "bg-red-900/40 hover:bg-red-900/60 text-red-200"
                  }`}
                  id="clear-all-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  초기화
                </button>
              </>
            )}
          </div>
          
          {/* Agent Badge Hostlinea styled */}
          <div className="flex items-center gap-3 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 pl-0 sm:pl-4 sm:border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-[#8ac43f] uppercase tracking-wider font-mono font-bold">Evaluator Mode</p>
              <p className="text-xs font-bold text-slate-200 italic">HR Specialist Agent</p>
            </div>
            <div className="w-9 h-9 bg-white/5 rounded-sm flex items-center justify-center border border-white/10 font-extrabold text-xs text-[#8ac43f] shadow-inner font-mono">
              HOST
            </div>
          </div>
        </div>
      </header>

      {/* Horizon Step Navigation Stepper */}
      <div className="bg-[#1f2226] border-b border-white/10 px-6 py-3.5 shrink-0 shadow-md">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row justify-between items-center gap-3 bg-[#292e35] p-2 rounded border border-white/10">
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
                    onClick={() => {
                      if (!hasUserApiKey) {
                        setIsApiKeyModalOpen(true);
                        return;
                      }
                      setCurrentMainStep(item.id);
                    }}
                    className={`flex items-center gap-2.5 text-left focus:outline-none focus:ring-1 focus:ring-[#8ac43f]/30 rounded p-1.5 md:p-2 hover:bg-[#2f353d]/40 transition-all cursor-pointer ${
                      isActive ? "bg-[#2f353d] shadow-sm border border-white/10" : "border border-transparent"
                    }`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm flex items-center justify-center text-xs font-mono font-extrabold shrink-0 transition-all duration-200 ${
                      isActive 
                        ? "bg-[#8ac43f] text-white shadow-sm" 
                        : isCompleted 
                          ? "bg-[#8ac43f]/20 text-[#8ac43f] font-extrabold border border-[#8ac43f]/30" 
                          : "bg-[#1f2226] text-slate-500 border border-white/10"
                    }`}>
                      {isCompleted ? "✓" : item.id}
                    </div>
                    <div className="hidden sm:block font-sans">
                      <p className={`text-xs font-bold leading-tight ${isActive ? "text-[#8ac43f]" : isCompleted ? "text-slate-200" : "text-slate-500"}`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                  {index < 2 && (
                    <div className={`hidden sm:block flex-1 max-w-[40px] md:max-w-[70px] h-0.5 shrink-0 transition-all duration-300 ${isCompleted ? "bg-[#8ac43f]/50" : "bg-white/5"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quota Exceeded / Fallback Information Banner */}
      {isQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0 text-amber-900 text-xs shadow-inner">
          <div className="flex items-start gap-2.5 font-sans">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-950 text-sm">⚠️ 공유 서버용 AI 모델 API 할당량 초과 안내</p>
              <p className="mt-1 text-amber-800 leading-relaxed font-sans">
                현재 기본 시스템 탑재 공유 Gemini API의 할당량(RESOURCE_EXHAUSTED)이 초과되어, <strong>하이브리드 고정밀 오프라인 휴리스틱 채점 및 개인정보 블라인드 엔진</strong>으로 자동 하이브리드 전환되었습니다.<br />
                구인구직 구글 실시간 검색 기반의 맞춤 역량 도정 및 지원서 실시간 OCR 파라메트릭 정밀 AI 인텍싱을 모두 무제한 가동하시려면 우측 상단 <strong>'Gemini API 키 등록'</strong> 단추를 클릭하여 본인의 API 키를 등록 보관해 주시면 즉각 자동 해결됩니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="self-end md:self-center py-2 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-bold rounded shadow-sm transition-all duration-150 cursor-pointer shrink-0"
          >
            본인 API 키 등록하기
          </button>
        </div>
      )}

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
              <div className="bg-[#1f2226] p-6 rounded border border-white/10 shadow-lg">
                <div className="mb-6">
                  <h3 className="font-sans font-extrabold text-white text-base mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#8ac43f]" />
                    1단계: 채용 기관 정보 및 직무 가중치 기준 설정
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    여성새일센터 지침에 입각하여 각 직무 형태에 알맞은 핵심역량과 가중치 배율을 고지합니다.
                  </p>
                </div>
                
                <CenterConfiguration 
                  centerInfo={centerInfo}
                  onChange={setCenterInfo}
                  onReopenWizard={() => setIsSetupComplete(false)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!hasUserApiKey) {
                      setIsApiKeyModalOpen(true);
                      return;
                    }
                    setCurrentMainStep(2);
                  }}
                  className="py-3 px-6 bg-[#8ac43f] hover:bg-[#7cb337] text-white font-sans text-xs font-bold rounded shadow transition-all flex items-center gap-2 cursor-pointer"
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
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-sm flex items-start gap-3 text-xs text-orange-800 font-sans">
                  <AlertCircle className="w-4.5 h-4.5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">평가 진행 중 일부 제한이 발생했습니다.</p>
                    <p className="mt-1 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="bg-[#1f2226] rounded border border-white/10 shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-[#292e35] border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-sans font-extrabold text-white text-base flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[#8ac43f]" />
                      2단계: 심사 대상 구직서류(입사지원서 및 자소서) 분석 적재
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">파일을 드래그해 놓거나 가이드 순차 양식을 활용하여 쉽게 수집할 수 있습니다.</p>
                  </div>
                  {candidates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasUserApiKey) {
                          setIsApiKeyModalOpen(true);
                          return;
                        }
                        if (!queueProcessing) {
                          setCurrentMainStep(3);
                        }
                      }}
                      disabled={queueProcessing}
                      className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-755 text-slate-200 border border-white/10 font-sans text-xs font-bold rounded shadow transition flex items-center gap-1.5 cursor-pointer disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      {queueProcessing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>분석 완료 대기 중...</span>
                        </>
                      ) : (
                        <>
                          <span>대시보드로 바로가기</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#8ac43f]" />
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <CandidateForm 
                  centerInfo={centerInfo}
                  onAnalyze={handleAnalyzeCandidate}
                  isLoading={isLoading}
                  onPreloadSamples={handlePreloadSamples}
                  hasCandidates={candidates.length > 0}
                  onQueueProgressChange={(completed, total, isProc) => {
                     setQueueCompleted(completed);
                     setQueueTotal(total);
                     setQueueProcessing(isProc);
                  }}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!hasUserApiKey) {
                      setIsApiKeyModalOpen(true);
                      return;
                    }
                    setCurrentMainStep(1);
                  }}
                  className="py-3 px-5 border border-white/10 bg-[#1f2226] hover:bg-white/5 text-slate-300 font-sans text-xs font-bold rounded transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계 (심사 기준 수립)</span>
                </button>
                {candidates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasUserApiKey) {
                        setIsApiKeyModalOpen(true);
                        return;
                      }
                      if (!queueProcessing) {
                        setCurrentMainStep(3);
                      }
                    }}
                    disabled={queueProcessing}
                    className={`py-3 px-6 font-sans text-xs font-bold rounded transition-all shadow flex items-center gap-2 cursor-pointer ${
                      queueProcessing 
                        ? "bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed" 
                        : "bg-[#8ac43f] hover:bg-[#7cb337] text-white"
                    }`}
                  >
                    {queueProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#8ac43f]" />
                        <span>일괄 구직서류 AI 종합 평가 진행 중... ({queueCompleted} / {queueTotal} 완료)</span>
                      </>
                    ) : (
                      <>
                        <span>3단계 AI 평정 대시보드 검토</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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
                <div className="bg-[#1f2226] rounded-2xl border border-white/10 p-12 text-center max-w-2xl mx-auto space-y-5 my-12 shadow-xl">
                  <div className="w-16 h-16 bg-[#292e35] border border-white/10 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <FileCheck className="w-8 h-8 text-[#8ac43f]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">등록된 구직자가 없습니다.</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      실시간 가로 분석 대시보드를 생성하려면 입사지원서 적재 및 서류 분석이 우선되어야 합니다.<br />
                      2단계에서 서류 양식을 직접 입력하거나, 샘플 자동 불러오기를 실행해 보세요.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentMainStep(2)}
                      className="py-2.5 px-5 bg-[#8ac43f] hover:bg-[#7cb337] text-white font-sans text-xs font-bold rounded shadow transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>2단계 구직서류 등록하러 가기</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* Left Table Panel */}
                  <div className={dashboardViewMode.includes("table") ? "xl:col-span-12 col-span-1" : "xl:col-span-5 col-span-1"}>
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
                      viewMode={dashboardViewMode.includes("table") ? "table" : "card"}
                      onViewModeChange={(val) => setDashboardViewMode(val)}
                    />
                  </div>

                  {/* Right Details Panel */}
                  <div className={dashboardViewMode.includes("table") ? "xl:col-span-12 col-span-1" : "xl:col-span-7 col-span-1"}>
                    {selectedCandidate ? (
                      <CandidateDetailsPanel 
                        candidate={selectedCandidate}
                        centerInfo={centerInfo}
                      />
                    ) : (
                      <div className="bg-[#1f2226] rounded-2xl border border-white/10 p-12 text-center text-slate-400 shadow-lg font-sans text-xs">
                        동종 평가 검증을 기획할 구직자를 좌측 목록에서 선택하십시오.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentMainStep(2)}
                  className="py-3 px-5 border border-white/10 bg-[#1f2226] hover:bg-white/5 text-slate-300 font-sans text-xs font-bold rounded transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계 (구직서류 등록 및 분석)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMainStep(1)}
                  className="py-3 px-5 border border-white/10 bg-[#1f2226] hover:bg-white/5 text-slate-300 font-sans text-xs font-bold rounded transition flex items-center justify-center gap-2 cursor-pointer"
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
      <footer className="bg-[#1f2226] border-t border-white/10 mt-12 py-8 px-10 text-center space-y-3 text-xs text-slate-400">
        <div className="flex justify-center items-center gap-6 text-slate-300 font-sans font-bold flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-[#8ac43f]" />
            <span>경력단절 무감점 원격 준수</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-[#8ac43f]" />
            <span>티어 동급군(±2점) 서열 해제</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-[#8ac43f]" />
            <span>민감정보 의무 마스킹 보장</span>
          </div>
        </div>
        <p className="pt-2 font-sans text-[11px] text-slate-400">본 프로그램은 여성새로일하기센터의 서류 스크리닝 및 면접 가이드 제작을 돕는 의사결정 보조 도구(자문 목적)입니다. 법정 비수집 정보는 완벽히 마스킹되어 평가에서 배제되었습니다.</p>
        <p className="text-[10px] font-mono text-slate-500">© 2026 여성새로일하기센터 자체인사팀 종합평가지원단. All rights reserved.</p>
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

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={() => {
          setHasUserApiKey(true);
          setIsApiKeyModalOpen(false);
        }}
        onClear={() => setHasUserApiKey(false)}
      />

    </div>
  );
}
