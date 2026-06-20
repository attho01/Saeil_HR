export type JobType = '상담직' | '행정직' | '관리직' | '기타';

export type Confidence = '상' | '중상' | '중' | '하';
export type EvidenceType = '있음' | '약함' | '부재' | '부정';

export interface WeightProfile {
  jobTitle: string;
  jobType: JobType;
  ratioJobPerformance: number; // e.g. 55
  ratioCultureSync: number; // e.g. 45
  
  // 1차 내부배점 (Sum must be 100)
  weightJobCompetency: number; // 직무전문성 배점
  weightAdminSkills: number; // 행정실무 배점
  weightNetworking: number; // 구인개척 배점

  // 2차 내부배점 (Sum must be 100)
  weightCivilRelation: number; // 민원응대 배점
  weightEthicalCollab: number; // 가치관/협업 배점 (for 관리직, can be 리더십·가치관·협업)
}

export interface CandidateRawInput {
  name: string;
  resumeText: string;
  selfIntroText: string;
  planText?: string;
  policyBonus?: number; // 보훈, 장애인 등 정책 가점
  detectedPersonalInfo?: string; // e.g. "출신학교: 한국대학교, 나이: 42세, 가족관계: 자녀 2명, 주소: 서울시 강남구"
}

export interface Candidate {
  id: string;
  name: string;
  documentsSubmitted: {
    resume: boolean;
    selfIntro: boolean;
    plan: boolean;
  };
  policyBonus: number; // 사용자 지정 정책 가점 (종합점수에 섞지 않고 별도 계산식 표기)
  
  // 1차 직무수행 역량 (각 100점 만점 원점수)
  jobCompetencyScore: number; // 직무 전문성·자격
  adminSkillsScore: number;   // 행정·실무 역량
  networkingScore: number;    // 구인처 개척·네트워킹
  
  // 2차 조직적합도 (각 100점 만점 원점수)
  civilScoreRaw: number;      // 공감력·민원 응대 태도
  cultureScoreRaw: number;    // 가치관·협업 (팀장: 리더십·가치관·협업)

  // 2차 신뢰도
  civilConfidence: Confidence;
  cultureConfidence: Confidence;

  // 2차 근거유형
  civilEvidence: EvidenceType;
  cultureEvidence: EvidenceType;

  // 마스킹/법정 정보
  maskingLogs: string[];
  uncollectedDataDetected: boolean;
  careerInterruptionFound: boolean; // 경력단절 여부 (무감점 보장)

  // 평가 결과
  tier: '적극검토' | '검토(조건부)' | '보류';
  candidateTypeLabel: '균형형' | '고직무·정성미검증' | '고적합·직무보완' | '전반보완필요';
  oneLineComment: string;
  longComments: string;

  // 면접 질문
  interviewQuestions: {
    jobAdmin: string[];      // 직무·행정 검증 질문
    civilCulture: string[];  // 민원·컬쳐핏 검증 질문
    unverified: string[];    // 근거 부족 항목 확인 질문
  };

  // 추가 서류
  suggestedDocuments: string[];
}

export interface CenterInfo {
  region: string;
  centerName: string;
  targetJobType: JobType;
  customProfile?: WeightProfile;
  requirements: {
    coreCompetencies: string[];
    certificates: string[];
    requiredExperienceMonths: number;
    orgCulture: string;
    personalityKeywords?: string[];
  };
  hasPolicyBonus: boolean;
  policyBonusScore: number;
}
