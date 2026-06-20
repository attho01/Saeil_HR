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

interface CandidateDetailsPanelProps {
  candidate: Candidate;
  centerInfo: CenterInfo;
}

export default function CandidateDetailsPanel({ candidate, centerInfo }: CandidateDetailsPanelProps) {
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

  return (
    <div className="bg-white text-slate-800 rounded-2xl border border-slate-150 shadow-sm overflow-hidden self-start" id="candidate-details-card">
      {/* Header */}
      <div className="p-6 bg-slate-50/60 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shadow-inner">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans font-extrabold text-slate-900 text-lg leading-tight">{candidate.name} 지원자</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  candidate.tier === '적극검토' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                  candidate.tier === '검토(조건부)' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                  'bg-slate-100 text-slate-600 border border-slate-200/50'
                }`}>
                  {candidate.tier}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-sans">{profile.jobTitle} 지원 ｜ 유형: <strong className="text-indigo-650 font-semibold">{candidate.candidateTypeLabel}</strong></p>
            </div>
          </div>
          
          <div className="text-right sm:text-right">
            <span className="text-[10px] block text-slate-400 font-sans tracking-tight">수식 검증 종합 환산점수</span>
            <div className="text-2xl font-mono font-extrabold text-indigo-600">{audit.finalWithBonus.toFixed(1)}점</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Audit Trail Line (감사 라인) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 font-mono">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 border-b border-slate-150 pb-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-650" />
            <span className="font-sans">종합 점수 계산식 투명성 (감사 감사-라인)</span>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed font-mono">
            {/* Display full formula with variables inserted */}
            <p className="text-slate-550 text-[11px] mb-2 font-sans leading-normal">
              수식: <code>종합점수 = (1차종합[{audit.perf1.toFixed(1)}] × {profile.ratioJobPerformance / 100}) + (2차조정[{audit.culture2Adjusted.toFixed(1)}] × {profile.ratioCultureSync / 100})</code>
            </p>
            <div className="p-3.5 bg-indigo-50/40 rounded-lg border border-indigo-100/50 text-indigo-950 font-sans">
              <span className="font-mono font-semibold">({audit.perf1.toFixed(1)} × {profile.ratioJobPerformance / 100}) + ({audit.culture2Adjusted.toFixed(1)} × {profile.ratioCultureSync / 100}) = <span className="font-semibold text-slate-900 text-sm font-mono">{audit.finalBase.toFixed(1)}점</span></span>
              {candidate.policyBonus > 0 && (
                <span className="text-slate-650 text-xs block mt-1.5 pt-1.5 border-t border-slate-200/50 font-sans">
                  기본 {audit.finalBase.toFixed(1)}점 + 법정 정책가점 {candidate.policyBonus}점 = <strong className="text-indigo-600 text-sm font-mono">{audit.finalWithBonus.toFixed(1)}점</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Legal Protections & Masking Dashboard */}
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-extrabold text-slate-800 font-sans">법정 비수집 정보 마스킹 및 공정성 탐지</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">채용절차법 준수</span>
          </div>

          {(candidate.maskingLogs || []).length > 0 ? (
            <div className="space-y-2">
              {(candidate.maskingLogs || []).map((log, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-lg flex items-start gap-2 border border-slate-100 text-[11px] text-slate-500 font-sans leading-relaxed">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-550 mt-0.5 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
              <div className="py-1 px-2.5 bg-indigo-50/50 text-indigo-800 border border-indigo-100/40 rounded text-[10px] font-semibold text-center font-sans tracking-wide">
                ⚠️ 공정채용에 저해되는 해당 정보는 기계적 파싱을 거쳐 완벽히 채점 배제 및 난화 처리되었습니다.
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic pb-1 font-sans">탐지된 직무무관 의무 수집 개인정보가 없습니다. 깨끗한 원 서류 상태입니다.</p>
          )}

          {/* Career interruption check */}
          <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-xs font-sans">
            <span className="text-slate-500 text-[11px]">수련 기회 확대 (경력단절 무감점 여부):</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              candidate.careerInterruptionFound 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                : 'bg-slate-100 text-slate-500'
            }`}>
              {candidate.careerInterruptionFound ? "경력단절 무감점 보장 완료" : "공백 정보 미감지"}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown for 1차 Performace */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-sans">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              1차 직무수행 역량 세부
            </h3>
            <span className="font-mono text-xs text-emerald-600 font-bold">{audit.perf1.toFixed(1)} / 100점</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-sans">직무 전문성·자격</div>
              <div className="text-base font-mono font-extrabold text-slate-800 mt-0.5">{candidate.jobCompetencyScore}점</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">우대자격증 부합도 및 상담 경험</div>
            </div>

            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-sans">행정·실무 역량</div>
              <div className="text-base font-mono font-extrabold text-slate-800 mt-0.5">{candidate.adminSkillsScore}점</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">문서, 전산 및 보조금 정산 다룸</div>
            </div>

            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-sans">구인처 개척ㆍ네트워킹</div>
              <div className="text-base font-mono font-extrabold text-slate-800 mt-0.5">{candidate.networkingScore}점</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">관내 여성 친화 기업체 발굴 능동성</div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown for 2차 Adjusted (정성평가 신뢰도) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-sans">
              <Heart className="w-4 h-4 text-indigo-600" />
              2차 조직적합도 및 신뢰도 처리 세부
            </h3>
            <span className="font-mono text-xs text-indigo-600 font-bold">{audit.culture2Adjusted.toFixed(1)} / 100점</span>
          </div>

          <div className="space-y-3">
            {/* Category 1: Civil complaints resilience */}
            <div className="bg-slate-50/30 p-3.5 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 font-sans">공감력ㆍ민원 응대 태도</span>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  강경 불만 민원에 맞서는 회복탄력성 및 감정 정비 역량
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-sans">
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100/50">
                    신뢰도: {candidate.civilConfidence}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/50">
                    근거유형: {candidate.civilEvidence}
                  </span>
                </div>
              </div>

              <div className="text-right sm:text-right shrink-0">
                <div className="text-[10px] text-slate-400 font-sans">원점 {candidate.civilScoreRaw}점 → 조정</div>
                <div className="text-base font-mono font-extrabold text-indigo-600">
                  {audit.civilAdjusted.toFixed(1)}점
                </div>
                <span className="text-[9px] text-amber-700 block font-sans">
                  {evaluateAdjustedScore(candidate.civilScoreRaw, candidate.civilEvidence, candidate.civilConfidence).description}
                </span>
              </div>
            </div>

            {/* Category 2: Core Values ethics and collaboration */}
            <div className="bg-slate-50/30 p-3.5 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 font-sans">
                  {profile.jobType === '관리직' ? '리더십ㆍ가치관 및 조직 관리' : '가치관ㆍ소통ㆍ기본 협력'}
                </span>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  새일센터 취업지원 비전에 향한 공헌 자질 및 직업 사명감
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-sans">
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100/50">
                    신뢰도: {candidate.cultureConfidence}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/50">
                    근거유형: {candidate.cultureEvidence}
                  </span>
                </div>
              </div>

              <div className="text-right sm:text-right shrink-0">
                <div className="text-[10px] text-slate-400 font-sans">원점 {candidate.cultureScoreRaw}점 → 조정</div>
                <div className="text-base font-mono font-extrabold text-indigo-600">
                  {audit.cultureAdjusted.toFixed(1)}점
                </div>
                <span className="text-[9px] text-amber-700 block font-sans">
                  {evaluateAdjustedScore(candidate.cultureScoreRaw, candidate.cultureEvidence, candidate.cultureConfidence).description}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Narrative Comment */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 font-sans">종합 진단 요약 및 한술평</h4>
          <div className="p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-xl space-y-1.5">
            <p className="text-sm font-extrabold text-indigo-950 font-sans">"{candidate.oneLineComment}"</p>
            <p className="text-xs text-slate-650 leading-relaxed font-sans">{candidate.longComments}</p>
          </div>
        </div>

        {/* Section 5: Customized Interview Critical Questions */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-sans">
              심층 검증 면접 필수 질문 (Critical Questions)
            </h3>
          </div>

          <div className="space-y-3">
            {/* Job and Admin questions */}
            <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-indigo-800 block tracking-wide uppercase font-sans">1. 직무ㆍ원 기안 행정 실무 자격 검증</span>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 pl-1 leading-relaxed font-sans">
                {(candidate.interviewQuestions?.jobAdmin || []).map((q, idx) => <li key={idx}>{q}</li>)}
              </ul>
            </div>

            {/* Civil fit and Recovery loop situational questions */}
            <div className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-indigo-800 block tracking-wide uppercase font-sans">2. 민원 현지 극복 및 사명감 검증</span>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 pl-1 leading-relaxed font-sans">
                {(candidate.interviewQuestions?.civilCulture || []).map((q, idx) => <li key={idx}>{q}</li>)}
              </ul>
            </div>

            {/* Unverified Missing Properties Area */}
            {(audit.civilIsMissing || audit.cultureIsMissing || candidate.civilConfidence === '하' || candidate.cultureConfidence === '하') && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/40 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-rose-800 block tracking-wide uppercase font-sans flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  3. 근거 부족 및 저신뢰 정보 현지 증명 질문 (`[근거 부족 · 면접 필수확인]`)
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-rose-700 pl-1 leading-relaxed font-sans">
                  {(candidate.interviewQuestions?.unverified || []).map((q, idx) => <li key={idx}>{q}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Suggested documents to request */}
        <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 block font-sans">📎 인사검증 추가 확보 권장 서류</span>
          <div className="flex flex-wrap gap-2">
            {(candidate.suggestedDocuments || []).map((doc, idx) => (
              <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200/50 px-2 py-0.5 rounded font-sans font-medium">
                ✔ {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer advice */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 italic text-center font-sans">
        본 리포트는 여성새로일하기센터의 공정하고 합당한 서류 심사 보조를 위한 자문 자료입니다. 면접에서의 심층 진위를 통해 최종 점수를 수정 인준하십시오.
      </div>
    </div>
  );
}
