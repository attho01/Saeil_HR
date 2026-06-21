import React from "react";
import { Candidate, CenterInfo } from "../types";
import { auditCandidateScores, evaluateAdjustedScore } from "./CandidateDashboard";
import { 
  ShieldAlert, 
  HelpCircle, 
  Briefcase, 
  Heart, 
  CheckSquare, 
  ArrowRightLeft, 
  ClipboardCheck, 
  Lock,
  User,
  AlertCircle
} from "lucide-react";

const BUILTIN_COMPETENCY_INFO: Record<string, { description: string; source: string }> = {
  // 상담직
  "내담자 구직 성향 및 이력 정밀 진단": {
    description: "초기 심층 상담을 통해 경력단절 여성의 취업 장애 요인을 분류하고 실질적인 진로 목표를 구체화하는 활동",
    source: "전국 여성인력개발센터 직업상담 우대조건 85%"
  },
  "취업지원 및 구인처 개척 네트워킹": {
    description: "관내 여성 친화 일자리 발굴을 위한 중소기업 및 공공기관 인사담당자 컨택 및 구인 매칭 활동",
    source: "잡코리아 직업상담원 공고 직무내용 분석"
  },
  "워크넷 및 구인구직 전산 시스템 최적 활용": {
    description: "고용노동부 워크넷 정보망에 구인 신청 및 알선 내역을 정확하고 신속하게 적재 및 기록하는 능력",
    source: "새일센터 행정 실무 가이드라인 합격수기 취합"
  },
  "직업교육훈련 기획 및 교육생 온보딩": {
    description: "경력단절 여성을 위한 세분화된 여성특화 단기 직업교육 프로그램의 운영 및 진도율 제어 관리",
    source: "여성가족부 전국 새일사업 교육평가 기준 우대"
  },
  "동행면접 지원 및 면접 피드백 지도": {
    description: "면접 공포증을 겪는 경력 여성과 구인 기업 면접장에 동행하여 긴장감 해소 및 조력 역할 지원",
    source: "네이버 카페 직업상담 합격 후기 주요 성공인자"
  },
  "새일여성 인턴십 연계 및 정부지원금 설계": {
    description: "새일인턴 채용 기업에 제공하는 법정 고용 보조금 기안 수립 및 연계 서류 작성 검증 능력",
    source: "새일센터 사업운영지침 검증 요구 64%"
  },
  "취업 후 사후관리 극대화 및 감정 안정 지도": {
    description: "사후 이탈 방지를 위하여 취업에 성공한 임직원과 지속 유선/면담 연락을 통한 멘토링 프로그램",
    source: "상담원 보조 임무 일지 주요 키워드 추출"
  },
  "행정 공문서 작성 및 공인 보조금 세무 정산": {
    description: "기안서 자물 및 정부 보조금 지출 결의서의 부서 내부 협의 및 품의 작성 지식",
    source: "인력개발본부 채용 기준 가치 수치화"
  },
  "여성 노동 법률 및 급여 체계 기초 상담": {
    description: "최저 임금, 주휴 수당, 주 52시간 등 일자리 매칭 시 문제되는 노사 쟁점을 간이 진단 및 해결책 제시",
    source: "고용노동 전문 상담 자문 가치 분석"
  },
  "다양한 경단 이력 맞춤 회복탄력성 지지 프로그램": {
    description: "장기 공백으로 고립감을 느끼는 여성 구직자의 자존감 회복을 위한 긍정 심리 개입과 감정 조율",
    source: "새일 심화 임상 상담 가치 척도 1위"
  },
  // 행정직
  "정부 지원금 지출 실무 및 품의 작성력": {
    description: "지방자치단체 및 중앙정부 지원 보조금의 계정별 예산 집행 한도 모니터링 및 실시간 품의 작성",
    source: "새일센터 행정원 공고 필수 우대요건 92%"
  },
  "공문서 기안 및 전자 결재 시스템 운용": {
    description: "정부 온나라 시스템 또는 표준 전자결재를 통한 공인문서 수신 및 완벽한 문서 서식 작성 기안력",
    source: "공공기관 행정지원 업무수칙 및 매뉴얼"
  },
  "수정 보조금 지출증빙 및 카드 전산 대조": {
    description: "지원 카드 매출 내역과 가공서 세금계산서의 회계 계정 일치성 대조 및 오지출 환수 예방 실무",
    source: "여성 신규 행정직 합격 노하우 가치 분석"
  },
  "관내 기업 DB 관리 및 개인정보 보호 엄수": {
    description: "구인처 데이터 수집 정보의 법정 보장 등급에 따른 데이터 정비 및 마스킹 처리 가이드 준수",
    source: "채용절차법 및 개인정보보호법 가이드라인"
  },
  "스프레드시트 원자료 가공 및 통계 추출": {
    description: "엑셀 피벗 테이블, VLOOKUP을 활용한 매월 실적 통계 대시보드 시각화 및 수치 정합성 분석력",
    source: "새일 통계 실적 보고 요구 역량"
  },
  "교육 훈련비 지급 청구서 정밀 검증": {
    description: "훈련 생도들의 출석률 통계와 연동된 계좌 이체 장부 작성 및 불성실 수급 필터링",
    source: "지자체 보조금 합동 검사 주요 점검 지표"
  },
  "집기비·시설 유지 예산 집행 제어": {
    description: "센터 내 환경 미화 및 실습 시설 설비 기자재의 단가 비교 견적 및 최적 수의계약 대행",
    source: "여성인력 행정 회계 매뉴얼"
  },
  "행사 및 구인 박람회 행정 기획 보조": {
    description: "연례 채용 페어 참여 연계 기업체의 신청서 접수 대행 및 사후 설문 행정 종합 가공",
    source: "구인구직 만남의날 행사 수기"
  },
  "다중 멀티태스킹 대면 민원 안내 속도": {
    description: "전화 오안내 예방을 위한 신속 차분한 센터 내선 안내 회신 및 부서 토스 매너",
    source: "새일센터 신입 사동 교육서"
  },
  "유관기관 공문 협조 및 합동 통계 정비": {
    description: "일자리지원단 합동 보고 대비 관내 연계 통계 데이터 정합 검증 실무 협동 능력",
    source: "지방노동청 정례 보고 필수 항목"
  },
  // 관리직
  "여성 취업 지원 중장기 비전 및 지침 설계": {
    description: "센터 고유 사명과 인력 가이드라인에 기반한 여성 교육 및 매칭 사업의 분기별 추진 계획 수립",
    source: "팀장직 공고 필수 자격조건 95%"
  },
  "소속 팀원 갈등 조정 및 사기 자극 리더십": {
    description: "개인 실적 압박에 시달리는 상담원과 행정원 간의 업무 배분 불만 해소를 위한 소통 프로그램",
    source: "새일센터 센터장/팀장 경험 수기 취합"
  },
  "정부 합동 감사 대응 지출 완벽성 검증": {
    description: "연례 여성가족부 및 고용센터 보조금 사후 정산 감사에 대비한 지출 일차 승인 단계 최종 스캔",
    source: "여가부 평가 가치 요건 우수 표준배점"
  },
  "대외 유관 기관(지방정부, 산단 등) 협력 서면 체결": {
    description: "지역 내 산학협력단, 여성 경제인 협회 등과 적극 MOU를 제안하여 합동 일자리 창출 활로 개척",
    source: "여성새일 일자리 창출 협력 모델사례"
  },
  "인사 채점 기준의 엄정 수립 및 공정성 수호": {
    description: "채용 시 친인척 배제 및 법정 비수집 정보 강제 철회 등 채용 절차 공정성을 최종 관리 감독",
    source: "공용부 공정 채용 가이드라인"
  },
  "상담직 성과 달성도 분석 및 보상 분배 조정": {
    description: "알선 취업률 추세 데이터를 분석하여 지쳐있는 실무진 상생 인센티브 등 비금전적 응원 가치 책정",
    source: "여성인력개발 지부 조직 관리 지침"
  },
  "악성 복합 민원 전문 2차 구원 투수 대처": {
    description: "실무선에서 해결되지 않고 폭언으로 확산되는 강성 내담자의 법리적 사후 조치 및 분리 면담",
    source: "민원인 인권 위기 대응 직업 상담 노하우"
  },
  "여성 특화 국비지원 교육 승인 제안서 심사": {
    description: "예년 대비 신직종(예: AI 데이터 레이블러 등) 여성 교육훈련 과정의 타당성 및 취업률 목표 입안",
    source: "새일 국가 심사 배점 우수 제안 요건"
  },
  "일과 가정 양립 유연 근무 조화 리더십": {
    description: "출산/육아기를 맞는 소속 팀원들의 대체 인력 풀 발굴 및 스마트 유연 근무 공평 분할 조율",
    source: "여성 친화 일터 인증 가치 척도"
  },
  "여성새일센터 종합평가 A등급 승격 혁신": {
    description: "전국 센터 평가 항목을 정확히 이해하고 가중 높은 지표를 타겟하여 연간 운영 지수 극대화",
    source: "새일 평가지표 전략 세미나 핵심 키워드"
  }
};

const CIVIL_RELATION_PRESETS = ["공감능력", "배려심", "긍정적 사고", "유연성", "다정함"];
const ETHICAL_COLLAB_PRESETS = [
  "책임감", "성실함", "협동심", "리더십", "끈기", "도덕성", "도전정신", "열정", "창의성", "자기주도성", "주도성"
];
const CIVIL_TERMS = ["민원", "공감", "배려", "소통", "다정", "마음", "감정", "친절", "경청", "치유", "회복", "온화", "이해", "상담", "고객", "감수성", "포용", "유인", "대응"];

function evaluateKeywordMatch(candidate: Candidate, keyword: string): { 
  isMatched: boolean; 
  evidenceQuote?: string; 
} {
  const resume = candidate.resumeText || "";
  const selfIntro = candidate.selfIntroText || "";
  const plan = candidate.planText || "";
  const combined = `${resume}\n${selfIntro}\n${plan}`.trim();
  
  if (!combined) {
    return { isMatched: false };
  }

  const keywordClean = keyword.trim();
  
  const keywordSynonyms: Record<string, string[]> = {
    "공감능력": ["공감", "경청", "이해", "마음", "입장", "소통"],
    "배려심": ["배려", "존중", "양보", "돕고", "친절", "따뜻"],
    "긍정적 사고": ["긍정", "웃음", "밝은", "낙천", "희망"],
    "유연성": ["유연", "수용", "조율", "대처", "변화"],
    "다정함": ["다정", "상냥", "따뜻", "친절", "다정한"],
    "책임감": ["책임", "성실", "맡은", "임무", "완수", "끝까지"],
    "성실함": ["성실", "꾸준", "묵묵", "지속", "근면"],
    "협동심": ["협력", "협동", "팀워크", "같이", "동료", "상생", "함께"],
    "리더십": ["리더", "지도", "이끌", "주도", "솔선수범", "조율", "갈등 조정"],
    "끈기": ["끈기", "인내", "지속", "포기하지", "끝까지", "악착"],
    "도덕성": ["정직", "준수", "윤리", "도덕", "양심", "규정"],
    "도전정신": ["도전", "개척", "새로운", "시도", "극복"],
    "열정": ["열정", "적극", "몰입", "애정", "간절"],
    "창의성": ["창의", "새로운", "아이디어", "개선", "혁신"],
    "자기주도성": ["자기주도", "스스로", "직접", "먼저", "계획"],
    "주도성": ["주도", "능동", "먼저", "솔선"]
  };

  const synonyms = keywordSynonyms[keywordClean] || [keywordClean];
  const isMatched = synonyms.some(sym => combined.includes(sym));
  
  let evidenceQuote: string | undefined = undefined;
  if (isMatched) {
    // split into lines and then find clean sentences
    const sentences = combined
      .split(/[\n.!?]+/g)
      .map(s => s.trim())
      .filter(s => s.length > 8 && s.length < 160);
      
    for (const term of [keywordClean, ...synonyms]) {
      const found = sentences.find(s => s.includes(term));
      if (found) {
        evidenceQuote = found;
        break;
      }
    }
    
    if (!evidenceQuote) {
      evidenceQuote = sentences.find(s => synonyms.some(sym => s.includes(sym)));
    }
  }

  return { isMatched, evidenceQuote };
}

function findCandidateEvidenceForCompetency(
  candidate: Candidate,
  targetName: string,
  customKeywords?: string[]
): string {
  const resume = candidate.resumeText || "";
  const selfIntro = candidate.selfIntroText || "";
  const plan = candidate.planText || "";
  const combined = `${resume}\n${selfIntro}\n${plan}`.trim();

  if (!combined) {
    return "";
  }

  // Split by line breaks, and then by sentences (by period, exclamation, and bullet marks)
  const lines = combined
    .split(/\n+/g)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const sentences: string[] = [];
  lines.forEach(line => {
    // Split by sentence terminators
    const parts = line.split(/[.!?]\s+/g).map(p => p.trim()).filter(p => p.length > 0);
    sentences.push(...parts);
  });

  // Identify keywords
  let searchTerms: string[] = [];
  if (customKeywords && customKeywords.length > 0) {
    searchTerms = customKeywords;
  } else {
    const stopWords = ["및", "의", "를", "을", "에", "과", "와", "로", "으로", "정밀", "최적", "활용", "기획", "지원", "설계", "구축", "극대화", "관리", "세부", "운용", "작성력", "대조"];
    searchTerms = targetName
      .split(/[\s·,・/\-()]+/g)
      .map(w => w.trim().replace(/^[조직직무행정구직정부보조금]+/g, "")) // clean prefix jargon
      .filter(w => w.length >= 2 && !stopWords.includes(w));
  }

  let bestMatch = "";
  let maxScore = 0;

  for (const sentence of sentences) {
    let score = 0;
    const actionWords = ["근무", "경력", "경험", "했습니다", "소지", "취득", "했다", "담당", "수행", "참여", "처리", "통해", "다루며", "맞춰", "마쳤습니다", "있습니다", "바 있습니다", "일해왔", "일했습니다", "대처", "결의", "기안", "정산", "가공", "극복했습니다"];
    const hasAction = actionWords.some(act => sentence.includes(act));
    
    for (const term of searchTerms) {
      if (sentence.includes(term)) {
        score += 2;
      }
    }

    if (score > 0) {
      if (hasAction) score += 1.5; // strong action bias
      if (sentence.length > 130) score -= 0.5; // long sentence decay
      if (sentence.length < 15) score -= 0.5; // short penalty
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = sentence;
    }
  }

  if (maxScore >= 2 && bestMatch) {
    // clean bullet markings
    const cleanQuote = bestMatch.replace(/^[\s\-*•·\d.]+/g, '').trim();
    return `"${cleanQuote}"`;
  }

  return "";
}

interface CandidateDetailsPanelProps {
  candidate: Candidate;
  centerInfo: CenterInfo;
}

export default function CandidateDetailsPanel({ candidate, centerInfo }: CandidateDetailsPanelProps) {
  const [showRawTexts, setShowRawTexts] = React.useState(false);
  const [activeTextTab, setActiveTextTab] = React.useState<"resume" | "selfIntro" | "plan">("resume");

  const profile = centerInfo.customProfile || {
    jobTitle: "기본 통합",
    jobType: "기타" as const,
    ratioJobPerformance: 60,
    ratioCultureSync: 40,
    weightJobCompetency: 40,
    weightAdminSkills: 30,
    weightNetworking: 30,
    weightCivilRelation: 50,
    weightEthicalCollab: 50
  };

  const audit = auditCandidateScores(candidate, profile);

  const selectedKeywords = centerInfo.requirements?.personalityKeywords || ["책임감", "성실함", "협동심", "공감능력"];
  
  const selectedCivilKeywords = selectedKeywords.filter(k => 
    CIVIL_RELATION_PRESETS.includes(k) || CIVIL_TERMS.some(term => k.includes(term))
  );
  
  const selectedCultureKeywords = selectedKeywords.filter(k => 
    !selectedCivilKeywords.includes(k)
  );

  return (
    <div className="bg-[#1f2226] text-slate-300 rounded border border-white/10 overflow-hidden self-start" id="candidate-details-card">
      {/* Header */}
      <div className="p-6 bg-[#292e35] border-b border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1f2226] border border-white/10 flex items-center justify-center shadow-inner">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans font-extrabold text-white text-lg leading-tight">{candidate.name} 지원자</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  candidate.tier === '적극검토' ? 'bg-[#8ac43f]/25 text-[#8ac43f] border border-[#8ac43f]/30' :
                  candidate.tier === '검토(조건부)' ? 'bg-amber-500/20 text-amber-305 border border-amber-500/20' :
                  'bg-slate-700/40 text-slate-300 border border-white/5'
                }`}>
                  {candidate.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">{profile.jobTitle} 지원 ｜ 유형: <strong className="text-[#8ac43f] font-bold">{candidate.candidateTypeLabel}</strong></p>
            </div>
          </div>
          
          <div className="text-right sm:text-right">
            <span className="text-[10px] block text-slate-400 font-sans tracking-tight">수식 검증 종합 환산점수</span>
            <div className="text-2xl font-mono font-extrabold text-[#8ac43f]">{audit.finalWithBonus.toFixed(1)}점</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Audit Trail Line (감사 라인) */}
        <div className="bg-[#292e35] p-4 rounded border border-white/5 space-y-3 font-mono">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8ac43f] border-b border-white/5 pb-2">
            <ClipboardCheck className="w-4 h-4 text-[#8ac43f]" />
            <span className="font-sans">종합 점수 계산식 투명성 (심사 감사-라인)</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-mono">
            {/* Display full formula with variables inserted */}
            <p className="text-slate-400 text-[11px] mb-2 font-sans leading-normal">
              수식: <code>종합점수 = (1차종합[{audit.perf1.toFixed(1)}] × {profile.ratioJobPerformance / 100}) + (2차조정[{audit.culture2Adjusted.toFixed(1)}] × {profile.ratioCultureSync / 100})</code>
            </p>
            <div className="p-3.5 bg-[#1f2226] rounded border border-white/5 text-slate-205 font-sans">
              <span className="font-mono font-semibold">({audit.perf1.toFixed(1)} × {profile.ratioJobPerformance / 100}) + ({audit.culture2Adjusted.toFixed(1)} × {profile.ratioCultureSync / 100}) = <span className="font-semibold text-white text-sm font-mono">{audit.finalBase.toFixed(1)}점</span></span>
              {candidate.policyBonus > 0 && (
                <span className="text-slate-400 text-xs block mt-1.5 pt-1.5 border-t border-white/5 font-sans">
                  기본 {audit.finalBase.toFixed(1)}점 + 법정 정책가점 {candidate.policyBonus}점 = <strong className="text-[#8ac43f] text-sm font-mono">{audit.finalWithBonus.toFixed(1)}점</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Legal Protections & Masking Dashboard */}
        <div className="p-4 bg-[#292e35] border border-white/5 rounded space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-300" />
              <h3 className="text-xs font-extrabold text-slate-205 font-sans">법정 비수집 정보 마스킹 및 공정성 탐지</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">채용절차법 준수</span>
          </div>

          {(candidate.maskingLogs || []).length > 0 ? (
            <div className="space-y-2">
              {(candidate.maskingLogs || []).map((log, idx) => (
                <div key={idx} className="p-2.5 bg-[#1f2226] rounded flex items-start gap-2 border border-white/5 text-[11px] text-slate-400 font-sans leading-relaxed">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
              <div className="py-1 px-2.5 bg-[#2f353d] text-amber-300 border border-amber-500/20 rounded text-[10px] font-semibold text-center font-sans tracking-wide">
                ⚠️ 공정채용에 저해되는 해당 정보는 기계적 파싱을 거쳐 완벽히 채점 배제 및 난화 처리되었습니다.
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-450 italic pb-1 font-sans">탐지된 직무무관 의무 수집 개인정보가 없습니다. 깨끗한 원 서류 상태입니다.</p>
          )}

          {/* Career interruption check */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-sans">
            <span className="text-slate-400 text-[11px]">수련 기회 확대 (경력단절 무감점 여부):</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              candidate.careerInterruptionFound 
                ? 'bg-[#8ac43f]/25 text-[#8ac43f] border border-[#8ac43f]/30' 
                : 'bg-[#2f353d] text-slate-400 border border-white/5'
            }`}>
              {candidate.careerInterruptionFound ? "경력단절 무감점 보장 완료" : "공백 정보 미감지"}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown for 1차 Performace */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-sans">
              <Briefcase className="w-4 h-4 text-[#8ac43f]" />
              1차 직무수행 역량 세부
            </h3>
            <span className="font-mono text-xs text-[#8ac43f] font-bold">{audit.perf1.toFixed(1)} / 100점</span>
          </div>

          <div className={`grid grid-cols-1 gap-3 ${
            (centerInfo.requirements.coreCompetencies || []).length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}>
            {(centerInfo.requirements.coreCompetencies && centerInfo.requirements.coreCompetencies.length > 0
              ? centerInfo.requirements.coreCompetencies
              : ["직무 전문성·자격", "행정·실무 역량", "구인처 개척ㆍ매칭"]
            ).map((compName, idx) => {
              let score = 0;
              let weight = 0;
              let sub = "기본역량";
              if (idx === 0) {
                score = candidate.jobCompetencyScore;
                weight = profile.weightJobCompetency;
                sub = `직무 전문성·자격 (${weight}%)`;
              } else if (idx === 1) {
                score = candidate.adminSkillsScore;
                weight = profile.weightAdminSkills;
                sub = `행정·실무 역량 (${weight}%)`;
              } else {
                score = candidate.networkingScore;
                weight = profile.weightNetworking;
                sub = `구인처 개척·네트워킹 (${weight}%)`;
              }

              const info = BUILTIN_COMPETENCY_INFO[compName] || {
                description: centerInfo.requirements.coreCompetencyDescriptions?.[compName] || `여성새로일하기센터 ${compName}에 부합하는 종합 실무 직무 수행 능력`,
                source: centerInfo.requirements.coreCompetencySources?.[compName] || "여가부 새일센터 공통 표준 역량지표"
              };

              const desc = info.description;
              const source = info.source;
              const evidenceQuote = findCandidateEvidenceForCompetency(candidate, compName);

              return (
                <div key={idx} className="bg-[#292e35] p-4 rounded border border-white/5 flex flex-col justify-between hover:bg-[#292e35]/80 transition" id={`comp-card-${idx}`}>
                  <div>
                    <div className="text-[10px] text-[#8ac43f] font-bold bg-[#8ac43f]/15 self-start px-2 py-0.5 rounded border border-[#8ac43f]/20 font-sans tracking-wide inline-block mb-1.5 leading-none">
                      {sub}
                    </div>
                    <h4 className="text-sm font-sans font-extrabold text-white leading-snug break-keep">
                      {compName}
                    </h4>
                    <p className="text-xs text-slate-350 mt-1 pb-1.5 font-sans leading-normal">
                      {desc}
                    </p>
                    {evidenceQuote ? (
                      <div className="mt-2.5 bg-[#1f2226] border border-white/5 rounded p-2.5 text-[11px] font-sans text-slate-300 leading-normal flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] text-[#8ac43f] font-bold tracking-wider uppercase">입사지원서·자기소개서 근거 발췌</span>
                        <span className="break-all italic select-all leading-snug">{evidenceQuote}</span>
                      </div>
                    ) : source ? (
                      <div className="mt-2.5 bg-[#1f2226] border border-white/5 rounded px-2 py-1 text-[10px] font-sans text-slate-400 flex flex-col gap-0.5">
                        <span className="text-slate-300 font-bold shrink-0 text-[9px] uppercase tracking-wider">업계 표준 근거</span>
                        <span className="break-all leading-snug">{source}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right mt-3 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-slate-450 font-mono">획득점수</span>
                    <div className="text-sm font-mono font-black text-[#8ac43f]">{score}점</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Breakdown for 2차 Adjusted (정성평가 신뢰도) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-sans">
              <Heart className="w-4 h-4 text-[#8ac43f]" />
              2차 조직적합도 및 신뢰도 처리 세부
            </h3>
            <span className="font-mono text-xs text-[#8ac43f] font-extrabold">{audit.culture2Adjusted.toFixed(1)} / 100점</span>
          </div>

          <div className="space-y-3">
            {/* Category 1: Civil complaints resilience */}
            <div className="bg-[#292e35] p-4 rounded border border-white/5 flex flex-col md:flex-row justify-between gap-4" id="civil-complaints-card">
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-bold text-white font-sans">공감력ㆍ민원 응대 태도</span>
                <p className="text-xs text-slate-350 leading-normal font-sans font-medium">
                  강경 불만 민원에 맞서는 회복탄력성 및 감정 정비 역량
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5 font-sans">
                  <span className="text-[10px] bg-[#1f2226] text-slate-300 px-2 py-0.5 rounded border border-white/5">
                    신뢰도: {candidate.civilConfidence}
                  </span>
                  <span className="text-[10px] bg-[#1f2226] text-slate-300 px-2 py-0.5 rounded border border-white/5">
                    근거유형: {candidate.civilEvidence}
                  </span>
                </div>
                {(() => {
                  const civilQuote = findCandidateEvidenceForCompetency(candidate, "", ["민원", "불만", "강경", "악성", "속상", "경청", "경청하는", "치유", "회복", "회복탄력성", "전화", "항의", "납득", "극복", "중재", "원만하게", "해소"]);
                  return (candidate.civilEvidence !== "부재" && civilQuote) ? (
                    <div className="mt-2.5 bg-[#1f2226] border border-white/5 rounded p-2.5 text-[11px] font-sans text-slate-300 leading-normal flex flex-col gap-1 shadow-sm">
                      <span className="text-[9px] text-[#8ac43f] font-bold tracking-wider uppercase">자기소개서 민원 해결 근거 발췌</span>
                      <span className="break-all italic select-all leading-snug">{civilQuote}</span>
                    </div>
                  ) : null;
                })()}

                {/* Selected Keywords evaluation item-by-item */}
                {selectedCivilKeywords.length > 0 && (
                  <div className="mt-5 border-t border-white/5 pt-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#8ac43f] tracking-wider bg-[#8ac43f]/15 py-1.5 px-3 rounded border border-white/5 w-fit">
                      <CheckSquare className="w-3.5 h-3.5 text-[#8ac43f]" />
                      <span>민원 응대 및 공감 - 인성 역량 세부 검증</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                      {selectedCivilKeywords.map(keyword => {
                        const { isMatched, evidenceQuote } = evaluateKeywordMatch(candidate, keyword);
                        return (
                          <div key={keyword} className={`relative overflow-hidden rounded border p-3.5 transition-all duration-200 ${
                            isMatched 
                              ? "bg-[#1f2226] border-[#8ac43f]/30 shadow-xs shadow-[#8ac43f]/5" 
                              : "bg-[#2f353d] border-white/5"
                          }`} id={`civil-keyword-${keyword}`}>
                            {isMatched && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-[#8ac43f]" />
                            )}
                            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-dashed border-white/10">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isMatched ? "bg-[#8ac43f]" : "bg-slate-500"}`} />
                                <span className="font-extrabold text-slate-200 text-xs">{keyword}</span>
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                isMatched 
                                  ? "bg-[#8ac43f]/25 text-[#8ac43f] border border-[#8ac43f]/30" 
                                  : "bg-[#2f353d] text-slate-400 border border-white/10"
                              }`}>
                                {isMatched ? (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-[#8ac43f] animate-pulse" />
                                    <span>자기소개서 기재됨</span>
                                  </>
                                ) : (
                                  <>
                                    <span>질문 필요 (미기재)</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {isMatched && evidenceQuote ? (
                              <div className="bg-[#292e35] border border-white/5 rounded p-2 text-[11px] font-sans text-slate-300 leading-relaxed shadow-xs">
                                <div className="text-[9px] text-[#8ac43f] font-extrabold tracking-widest uppercase mb-1">인성 우수 발췌 근거</div>
                                <p className="break-all italic leading-relaxed select-all">
                                  "… {evidenceQuote.trim()} …"
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal italic">
                                서류상 관련 키워드가 발견되지 않아, 면접 시 적격 여부 확인을 권장합니다.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right sm:text-right shrink-0">
                <div className="text-[10px] text-slate-400 font-sans">원점 {candidate.civilScoreRaw}점 → 조정</div>
                <div className="text-base font-mono font-extrabold text-[#8ac43f]">
                  {audit.civilAdjusted.toFixed(1)}점
                </div>
                <span className="text-[9px] text-amber-305 block font-sans">
                  {evaluateAdjustedScore(candidate.civilScoreRaw, candidate.civilEvidence, candidate.civilConfidence).description}
                </span>
              </div>
            </div>

            {/* Category 2: Core Values ethics and collaboration */}
            <div className="bg-[#292e35] p-4 rounded border border-white/5 flex flex-col md:flex-row justify-between gap-4" id="values-collaboration-card">
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-bold text-white font-sans">
                  {profile.jobType === '관리직' ? '리더십ㆍ가치관 및 조직 관리' : '가치관ㆍ소통ㆍ기본 협력'}
                </span>
                <p className="text-xs text-slate-350 leading-normal font-sans font-medium">
                  새일센터 취업지원 비전에 향한 공헌 자질 및 직업 사명감
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5 font-sans">
                  <span className="text-[10px] bg-[#1f2226] text-slate-300 px-2 py-0.5 rounded border border-white/5">
                    신뢰도: {candidate.cultureConfidence}
                  </span>
                  <span className="text-[10px] bg-[#1f2226] text-slate-300 px-2 py-0.5 rounded border border-white/5">
                    근거유형: {candidate.cultureEvidence}
                  </span>
                </div>
                {(() => {
                  const cultureQuote = findCandidateEvidenceForCompetency(candidate, "", ["사명감", "새일", "신뢰", "공감", "여성", "협업", "팀원", "협력", "희생", "배려", "소통", "협력적", "팀워크", "나누며", "동료", "멘토링", "인성", "리더십"]);
                  return (candidate.cultureEvidence !== "부재" && cultureQuote) ? (
                    <div className="mt-2.5 bg-[#1f2226] border border-white/5 rounded p-2.5 text-[11px] font-sans text-slate-300 leading-normal flex flex-col gap-1 shadow-sm">
                      <span className="text-[9px] text-[#8ac43f] font-bold tracking-wider uppercase">자기소개서 사명감 및 협업 근거 발췌</span>
                      <span className="break-all italic select-all leading-snug">{cultureQuote}</span>
                    </div>
                  ) : null;
                })()}

                {/* Selected Keywords evaluation item-by-item */}
                {selectedCultureKeywords.length > 0 && (
                  <div className="mt-5 border-t border-white/5 pt-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#8ac43f] tracking-wider bg-[#8ac43f]/15 py-1.5 px-3 rounded border border-white/5 w-fit">
                      <CheckSquare className="w-3.5 h-3.5 text-[#8ac43f]" />
                      <span>{profile.jobType === '관리직' ? '조직 관리 및 리더십 - 인성 역량 세부 검증' : '가치관 및 협업 - 인성 역량 세부 검증'}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                      {selectedCultureKeywords.map(keyword => {
                        const { isMatched, evidenceQuote } = evaluateKeywordMatch(candidate, keyword);
                        return (
                          <div key={keyword} className={`relative overflow-hidden rounded border p-3.5 transition-all duration-200 ${
                            isMatched 
                              ? "bg-[#1f2226] border-[#8ac43f]/30 shadow-xs shadow-[#8ac43f]/5" 
                              : "bg-[#2f353d] border-white/5"
                          }`} id={`culture-keyword-${keyword}`}>
                            {isMatched && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-[#8ac43f]" />
                            )}
                            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-dashed border-white/10">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isMatched ? "bg-[#8ac43f]" : "bg-slate-500"}`} />
                                <span className="font-extrabold text-slate-200 text-xs">{keyword}</span>
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                isMatched 
                                  ? "bg-[#8ac43f]/25 text-[#8ac43f] border border-[#8ac43f]/30" 
                                  : "bg-[#2f353d] text-slate-400 border border-white/10"
                              }`}>
                                {isMatched ? (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-[#8ac43f] animate-pulse" />
                                    <span>자기소개서 기재됨</span>
                                  </>
                                ) : (
                                  <>
                                    <span>질문 필요 (미기재)</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {isMatched && evidenceQuote ? (
                              <div className="bg-[#292e35] border border-white/5 rounded p-2 text-[11px] font-sans text-slate-300 leading-relaxed shadow-xs">
                                <div className="text-[9px] text-[#8ac43f] font-extrabold tracking-widest uppercase mb-1">인성 우수 발췌 근거</div>
                                <p className="break-all italic leading-relaxed select-all">
                                  "… {evidenceQuote.trim()} …"
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal italic">
                                서류상 관련 키워드가 발견되지 않아, 면접 시 적격 여부 확인을 권장합니다.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right sm:text-right shrink-0">
                <div className="text-[10px] text-slate-400 font-sans">원점 {candidate.cultureScoreRaw}점 → 조정</div>
                <div className="text-base font-mono font-extrabold text-[#8ac43f]">
                  {audit.cultureAdjusted.toFixed(1)}점
                </div>
                <span className="text-[9px] text-amber-305 block font-sans">
                  {evaluateAdjustedScore(candidate.cultureScoreRaw, candidate.cultureEvidence, candidate.cultureConfidence).description}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Narrative Comment */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 font-sans">종합 진단 요약 및 한술평</h4>
          <div className="p-4 bg-[#292e35] border border-white/5 rounded space-y-1.5">
            <p className="text-sm font-extrabold text-white font-sans">"{candidate.oneLineComment}"</p>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">{candidate.longComments}</p>
          </div>
        </div>

        {/* Section 5: Customized Interview Critical Questions */}
        <div className="space-y-4" id="critical-questions-section">
          <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#8ac43f]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-sans">
                💡 5대 심층 검증 면접 필수 질문 (Critical Questions)
              </h3>
            </div>
            <span className="text-[10px] text-slate-300 bg-[#292e35] px-2 py-0.5 rounded-full border border-white/5 font-sans font-medium">직무·인성 매칭형</span>
          </div>

          <p className="text-xs text-slate-400 leading-normal font-sans -mt-1.5">
            자기소개서 발췌 분석 결과 및 성격 키워드 검증 현황을 바탕으로 설계된 맞춤형 면접 구술 질문 리스트입니다. 실무 역량 검증과 허위 기재 방지 및 감정 적응 노하우를 정밀 평가할 수 있습니다.
          </p>

          <div className="space-y-3.5">
            {(() => {
              // Get unverified personality keywords to tailor dynamic questions 
              const unverifiedKeywords = selectedKeywords.filter(k => !evaluateKeywordMatch(candidate, k).isMatched);
              
              const questionsList = [
                {
                  num: "1",
                  tag: "직무 기술 및 매칭",
                  badgeColor: "bg-[#8ac43f]/15 border-[#8ac43f]/30 text-[#8ac43f]",
                  lineColor: "bg-[#8ac43f]",
                  title: `${profile.jobTitle || '직무'} 현업 이해도 및 상황 제어 능력`,
                  question: candidate.interviewQuestions?.jobAdmin?.[0] || `이전 직장에서 ${profile.jobTitle || '유관 직무'} 관련 중요 프로젝트나 구직 중개 활동을 수행하는 도중 발생했던 가장 까다로운 조율 갈등은 부서 간 혹은 기업체 관계자와 어떻게 조율하셨습니까?`,
                  checkpoint: "지원 무대와 관련된 실제 유사 경험의 기재 무오류성 및 주도성 척도 점검"
                },
                {
                  num: "2",
                  tag: "기안 및 회계",
                  badgeColor: "bg-amber-500/20 border-amber-500/30 text-amber-300",
                  lineColor: "bg-amber-500",
                  title: "공공 보조금 무결성 정산 및 회계 무오류 마인드",
                  question: candidate.interviewQuestions?.jobAdmin?.[1] || `여가부/노동부 지원 예산과 새일센터의 보조금 회계 정산은 10원의 영수증 불일치도 큰 법정 감사를 유발합니다. 정산 마감 전 발생한 오류를 직접 바로잡았던 경험이나 본인만의 검증 원칙이 있다면 구체적으로 설명해 주세요.`,
                  checkpoint: "한글/엑셀 등 사무 행정 자격의 직접 적용력 및 보조금에 관한 기안 준법 정신"
                },
                {
                  num: "3",
                  tag: "내담자 민원 응대",
                  badgeColor: "bg-rose-500/20 border-rose-500/30 text-rose-300",
                  lineColor: "bg-rose-505",
                  title: "악성 수위 민원 우회 및 감정 회복 탄력성",
                  question: candidate.interviewQuestions?.civilCulture?.[0] || `새일센터를 찾는 여성 내담자 중에는 오랜 단절로 고도로 날카로워져 불합리한 처우 주장이나 고성을 지르는 경우가 발생할 수 있습니다. 이를 가이드하는 방법과 본인의 감정 스트레스 회복탄력성 조절 메커니즘을 들려주세요.`,
                  checkpoint: "BARS 공감 응대 구간 우수성, 장기 근속을 가능케 하는 스트레스 무력화 능력"
                },
                {
                  num: "4",
                  tag: unverifiedKeywords.length > 0 ? "미기재 성향 보완" : "기재 진위 교차 검증",
                  badgeColor: unverifiedKeywords.length > 0 ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-sky-500/20 border-sky-500/30 text-sky-350",
                  lineColor: "bg-sky-500",
                  title: unverifiedKeywords.length > 0 
                    ? `자기소개서 미기재 인성 키워드 [${unverifiedKeywords.join(", ")}]의 정밀 검증` 
                    : `소개서 상 강점 표현의 실제 발현 내역 교차 질문`,
                  question: unverifiedKeywords.length > 0 
                    ? `이번 채용 조건으로 강조된 성격 소양 중 [${unverifiedKeywords.slice(0, 2).join(", ")}] 소양에 관한 본인의 직접적 경험 사례가 서류에 충분히 드러나지 않았습니다. 본인이 해당 인성 역량에서 높은 점수를 가지고 있음을 설득해줄 사건이 있다면 말씀해 주세요.`
                    : `자기소개서에 작성한 강력한 이력 행동들과 일하는 방식에 대해, 실제 업무에서 동료들이 바라본 본인의 가장 리얼한 평가는 어땠습니까? 입사 시 실제 조직 협동에 어떻게 시너지가 날지 말씀해주세요.`,
                  checkpoint: "미기재 상태 보완 진술의 구체성과 논리력, 서류 작성 시 과장 여부 스크리닝"
                },
                {
                  num: "5",
                  tag: "가치관 및 사명감",
                  badgeColor: "bg-[#8ac43f]/15 border-[#8ac43f]/30 text-[#8ac43f]",
                  lineColor: "bg-[#8ac43f]",
                  title: "여성 일자리 창출 헌신 사명감 및 비전 정렬",
                  question: candidate.interviewQuestions?.unverified?.[0] || `경력단절 여성의 삶을 단순히 행정적 '구직 건수'로 처리하지 않고 정서적이고 실무적으로 견인해야 함에 따라 소명의식이 필수적입니다. 본인이 새 일자리 제공 현장에서 투영하고자 하는 철학을 한 말씀 듣고 싶습니다.`,
                  checkpoint: "새일센터의 공익적 사명 지향성 일치 레벨과 연차별 장기 근무 적격성 평가"
                }
              ];

              return (
                <div className="grid grid-cols-1 gap-3.5">
                  {questionsList.map((q) => (
                    <div key={q.num} className="relative overflow-hidden rounded border border-white/5 bg-[#292e35] hover:border-white/10 transition-all duration-200">
                      {/* Left color bar */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${q.lineColor}`} />
                      
                      <div className="p-4 pl-5">
                        {/* Question Header Info */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-extrabold w-5 h-5 rounded-full bg-[#1f2226] text-white flex items-center justify-center border border-white/10">
                              {q.num}
                            </span>
                            <span className="font-extrabold text-[12px] text-white font-sans tracking-tight">
                              {q.title}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${q.badgeColor}`}>
                            {q.tag}
                          </span>
                        </div>

                        {/* Question Main Box */}
                        <div className="bg-[#1f2226] rounded p-3 border border-white/5 font-sans text-xs text-slate-300 leading-relaxed font-medium">
                          🌱 <span className="font-semibold text-slate-200 font-sans select-all leading-relaxed whitespace-pre-line">"${q.question}"</span>
                        </div>

                        {/* Interview Checkpoint Instruction */}
                        <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-slate-400 font-sans">
                          <span className="font-extrabold text-[#8ac43f] uppercase tracking-wide bg-[#8ac43f]/15 px-1.5 py-0.5 rounded border border-[#8ac43f]/20 shrink-0 select-none">
                            💡 평가 포인트
                          </span>
                          <span className="leading-normal pt-0.5">
                            {q.checkpoint}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Suggested documents to request */}
        <div className="p-3.5 bg-[#292e35] border border-white/5 rounded space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 block font-sans">📎 인사검증 추가 확보 권장 서류</span>
          <div className="flex flex-wrap gap-2">
            {(candidate.suggestedDocuments || []).map((doc, idx) => (
              <span key={idx} className="text-[10px] bg-[#1f2226] text-slate-300 border border-white/5 px-2 py-0.5 rounded font-sans font-medium">
                ✔ {doc}
              </span>
            ))}
          </div>
        </div>

        {/* 제출 서류 원문 전체 보기 (Expandable viewer) */}
        <div className="border border-white/5 rounded overflow-hidden mt-4 bg-[#292e35]" id="raw-docs-viewer">
          <button
            onClick={() => setShowRawTexts(!showRawTexts)}
            className="w-full px-4 py-3 bg-[#1f2226]/80 hover:bg-[#1f2226] border-b border-white/5 flex items-center justify-between transition focus:outline-none"
          >
            <span className="text-xs font-bold text-white font-sans flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#8ac43f]" />
              📄 지원자 제출 서류 원본 텍스트 전체 보기 (입사지원서·자기소개서)
            </span>
            <span className="text-xs font-bold text-[#8ac43f] font-mono">
              {showRawTexts ? "접기 ▲" : "펼치기 ▼"}
            </span>
          </button>

          {showRawTexts && (
            <div className="p-4 border-t border-white/5 bg-[#292e35] space-y-4">
              <div className="flex gap-2 border-b border-white/5 pb-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTextTab("resume")}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition ${
                    activeTextTab === "resume"
                      ? "bg-[#8ac43f] text-white shadow-sm"
                      : "bg-[#1f2226] text-slate-300 hover:bg-[#1f2226]/85 border border-white/5"
                  }`}
                >
                  입사지원서 원문 ({candidate.resumeText ? `${candidate.resumeText.length}자` : "0자"})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTextTab("selfIntro")}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition ${
                    activeTextTab === "selfIntro"
                      ? "bg-[#8ac43f] text-white shadow-sm"
                      : "bg-[#1f2226] text-slate-305 hover:bg-[#1f2226]/85 border border-white/5"
                  }`}
                >
                  자기소개서 원문 ({candidate.selfIntroText ? `${candidate.selfIntroText.length}자` : "0자"})
                </button>
                {candidate.planText && (
                  <button
                    type="button"
                    onClick={() => setActiveTextTab("plan")}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition ${
                      activeTextTab === "plan"
                        ? "bg-[#8ac43f] text-white shadow-sm"
                        : "bg-[#1f2226] text-slate-305 hover:bg-[#1f2226]/85 border border-white/5"
                    }`}
                  >
                    직무수행계획서 ({candidate.planText.length}자)
                  </button>
                )}
              </div>

              <div className="bg-[#1f2226] rounded p-3.5 border border-white/5 max-h-90 overflow-y-auto font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text break-all">
                {activeTextTab === "resume" && (
                  candidate.resumeText ? candidate.resumeText.trim() : (
                    <p className="text-slate-400 italic font-sans">등록된 입사지원서 텍스트가 없습니다. 입사지원서 파일 업로드나 AI 파싱을 진행하십시오.</p>
                  )
                )}
                {activeTextTab === "selfIntro" && (
                  candidate.selfIntroText ? candidate.selfIntroText.trim() : (
                    <p className="text-slate-400 italic font-sans">등록된 자기소개서 텍스트가 없습니다. 자기소개서 파일 업로드나 AI 파싱을 진행하십시오.</p>
                  )
                )}
                {activeTextTab === "plan" && (
                  candidate.planText ? candidate.planText.trim() : (
                    <p className="text-slate-400 italic font-sans">등록된 직무수행계획서 텍스트가 없습니다.</p>
                  )
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-sans italic text-center leading-normal">
                ※ 위 데이터는 지원자가 직접 업로드했거나 AI 분석 과정에서 마스킹 및 추출된 실제 텍스트 원본입니다. 임의 변조나 누락이 배제되어 공정한 대조 검증을 보조해 줍니다.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer advice */}
      <div className="p-4 bg-[#292e35] border-t border-white/5 text-[10px] text-slate-400 italic text-center font-sans">
        본 리포트는 여성새로일하기센터의 공정하고 합당한 서류 심사 보조를 위한 자문 자료입니다. 면접에서의 심층 진위를 통해 최종 점수를 수정 인준하십시오.
      </div>
    </div>
  );
}