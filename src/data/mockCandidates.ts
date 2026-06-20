import { Candidate } from "../types";

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "cand_preset_1",
    name: "김은진",
    documentsSubmitted: {
      resume: true,
      selfIntro: true,
      plan: true
    },
    policyBonus: 0,
    jobCompetencyScore: 88,
    adminSkillsScore: 82,
    networkingScore: 85,
    civilScoreRaw: 90,
    cultureScoreRaw: 95,
    civilConfidence: "상",
    cultureConfidence: "상",
    civilEvidence: "있음",
    cultureEvidence: "있음",
    maskingLogs: [
      "[법정 비수집 정보] 출신학교 정보(한국대학교 졸업)가 감지되어 해당 내용은 평가 점수 산정에서 완전히 제외하고 마스킹 처리했습니다.",
      "연락처 및 주소가 감지되어 개인정보보호 원칙에 따라 [마스킹] 처리했습니다."
    ],
    uncollectedDataDetected: true,
    careerInterruptionFound: false,
    tier: "적극검토",
    candidateTypeLabel: "균형형",
    oneLineComment: "새일센터 상담 실무 이해가 깊고, 민원 대응력과 사명감을 완벽히 갖춘 핵심 적격 인재",
    longComments: "15년간 인사 업무 및 구직 알선, 행정 기획을 풍부하게 경험한 지원자입니다. 자기소개서에서 민원인의 갈등을 진정성 있게 해소하여 고용 신뢰를 준 실무 행동이 BARS 평가 기준 최상위에 속하며, 조직 기여도가 매우 높을 것으로 예측됩니다.",
    interviewQuestions: {
      jobAdmin: [
        "이전 60명 규모 사업장에서 중장년 여성 재취업 일자리 연계 프로젝트를 하셨는데, 당시에 기업 발굴에서 겪은 난관과 이를 해결한 소통 기법을 들려주세요.",
        "새일센터에서 위탁하는 직업교육훈련 과정의 보조금 기안 정산 시 지출결의 오류를 찾아내 수정했던 경험이 있습니까?"
      ],
      civilCulture: [
        "심리적 탈진을 겪으며 완강하게 항의하는 구직 민원인의 정서적 요구와 알선 요건 탈락이라는 냉정한 규정 사이에서 균형을 잡기 위해 어떤 노력을 하시겠습니까?"
      ],
      unverified: [
        "자기소개서에 명시하신 '지역 중소기업 연계 고용유지율 85%'에 관하여 협력 기업의 당시 불만을 극복했던 핵심 조치는 무엇이었습니까?"
      ]
    },
    suggestedDocuments: ["경력증명서", "직업상담사 2급 자격증 사본"]
  },
  {
    id: "cand_preset_2",
    name: "박미영",
    documentsSubmitted: {
      resume: true,
      selfIntro: true,
      plan: false
    },
    policyBonus: 0,
    jobCompetencyScore: 78,
    adminSkillsScore: 85,
    networkingScore: 70,
    civilScoreRaw: 0, // '부재' 임으로 0점 처리하였으나, 하한 보전 50점(50%) 로 하한 보장 됨!
    cultureScoreRaw: 80,
    civilConfidence: "중", 
    cultureConfidence: "중상",
    civilEvidence: "부재", // '부재'는 능력미달이 아니므로 하한보장 50%
    cultureEvidence: "있음",
    maskingLogs: [
      "경력단절(출산 및 7년간 자녀 육아공백) 사실이 있으나 새일센터 고유 가치에 의거해 무감점(0점 감점) 조치 적용하였습니다.",
      "주소 및 휴대전화 연락처를 [마스킹] 처리했습니다."
    ],
    uncollectedDataDetected: false,
    careerInterruptionFound: true,
    tier: "검토(조건부)",
    candidateTypeLabel: "고직무·정성미검증",
    oneLineComment: "행정 및 직무 기초는 우수하나, 정성적 민원 응대 극복 사례 및 행동 근거가 결여되어 면접 확인 필수",
    longComments: "7년간 육아로 인해 공백 기간이 있으나 기안서 작성, 엑셀 활용 등 행정 실무 경륜은 즉각 투입이 가능한 수준입니다. 다만 자기소개서 전반에 민원 상황 대처나 구체 갈등 극복에 관한 행동적 기술이 전혀 확인되지 않아, 근거 부재에 따른 하한 보장(50%)을 적용했습니다.",
    interviewQuestions: {
      jobAdmin: [
        "행정 실무 공백기 극복을 위해 최근 습득하신 컴퓨터활용능력 외에 추가적으로 파악하고 계시는 공문서 수발신 절차나 규정이 있으십니까?"
      ],
      civilCulture: [
        "새일센터 취업상담원으로서 다수의 구직 인원 대상 전화상담 시 발생할 수 있는 피로감을 어떻게 분안하고 마인드컨트롤하시 계획입니까?"
      ],
      unverified: [
        "[민원응대 근거부재] 악성 및 완강한 민원인을 대했을 때 감정을 제어하고 원칙적으로 해결했던 이전 실제 경험담이 있다면 사례 중심으로 상세히 소개해주십시오."
      ]
    },
    suggestedDocuments: ["직무수행계획서 추가 요구 권장", "컴퓨터활용능력 자격증 사본"]
  },
  {
    id: "cand_preset_3",
    name: "이지혜",
    documentsSubmitted: {
      resume: true,
      selfIntro: true,
      plan: true
    },
    policyBonus: 3, // 보훈 가점 3점 보유
    jobCompetencyScore: 72,
    adminSkillsScore: 68,
    networkingScore: 65,
    civilScoreRaw: 82,
    cultureScoreRaw: 85,
    civilConfidence: "하", // 신뢰도 '하' -> 0.90 계수 디스카운트 적용
    cultureConfidence: "중상",
    civilEvidence: "약함", // 자소서 내용이 있음은 하나 깊이가 약하여 하한 보정
    cultureEvidence: "있음",
    maskingLogs: [
      "[법정 비수집 정보] 부모님의 직업 정보가 자기소개서에 기재되어 확인 후 배제하고 [마스킹] 처리했습니다.",
      "보훈 가점 3점이 정책 가점으로 별도 기입되었습니다."
    ],
    uncollectedDataDetected: true,
    careerInterruptionFound: false,
    tier: "검토(조건부)",
    candidateTypeLabel: "고적합·직무보완",
    oneLineComment: "경청 태도와 사명감은 우수하나, 보수적인 직무 가동성 및 기안 행정 부서 적응 훈련 필요",
    longComments: "여성 직업 상담 사명감과 소통 의지는 우수한 수준으로 판단되나, 정부 보조금 정산 실무나 사업계획 수립 기획서 작성 등 기초 행정에 부담을 느끼는 내용이 있습니다. 신뢰성 하 카테고리가 존재해 0.9 계수로 하한 조정을 가미했습니다.",
    interviewQuestions: {
      jobAdmin: [
        "예산 집행 절차에서 수치 검증이나 엑셀 수식 작성 가독성 확보를 요구하는 지휘를 받을 때, 어떻게 정확도를 기해 가겠습니까?"
      ],
      civilCulture: [
        "동료들과의 다자간 협업 시 한정된 센터 예산과 역할 분담 격차로 인해 갈등이 생기면 어떻게 자문과 소통으로 풀어나가겠습니까?"
      ],
      unverified: [
        "[민원대응 하향보정 확인] 감정 민원 상황에서 '본인의 소극 대처 의문'을 해소하기 위해 적극적으로 개입해 중재를 끌어냈던 구체 성과를 구술해주십시오."
      ]
    },
    suggestedDocuments: ["경력증명서", "직무 교육 수료 실적"]
  },
  {
    id: "cand_preset_4",
    name: "최정호",
    documentsSubmitted: {
      resume: true,
      selfIntro: true,
      plan: false
    },
    policyBonus: 0,
    jobCompetencyScore: 40,
    adminSkillsScore: 45,
    networkingScore: 35,
    civilScoreRaw: 42,
    cultureScoreRaw: 38,
    civilConfidence: "중",
    cultureConfidence: "중",
    civilEvidence: "약함",
    cultureEvidence: "약함",
    maskingLogs: [
      "지원서 상의 혼인 여부를 감지하여 [법정 비수집 정보]로 기재 차단 및 전면 마스킹 처리완료하였습니다."
    ],
    uncollectedDataDetected: true,
    careerInterruptionFound: false,
    tier: "보류",
    candidateTypeLabel: "전반보완필요",
    oneLineComment: "직무 기초 역량 및 조직적합도 근거가 미흡하여 전반적인 심층 확인이 긴요한 보류군",
    longComments: "이력서 및 자소서 기술이 매우 짧고, 실무와 관련된 교육이나 자격 증빙이 부족합니다. 새일센터의 근무 강도와 멀티태스킹 성격을 감당하는 면모가 명확치 않으므로 면접에서 엄격한 자질 점검을 거치시기 바랍니다.",
    interviewQuestions: {
      jobAdmin: [
        "새일센터 취업 알선 실무에서 핵심인 구직 기업 협약 발굴을 어떻게 타개해 나갈 것인지 본인의 대략적인 포부를 들려주세요."
      ],
      civilCulture: [
        "우리 단체가 가치로 삼는 성인지 감수성과 여성 일자리 활성화 마스터 플랜에 대해 설명해 주십시오."
      ],
      unverified: [
        "행정과 상담 실천 사례 중 보조원 수준을 넘어 본인의 주도적 기여가 있었던 한 가지 경험을 증명해 보이십시오."
      ]
    },
    suggestedDocuments: ["직무수행계획서 보강", "직무 역량 수료 증서"]
  }
];
