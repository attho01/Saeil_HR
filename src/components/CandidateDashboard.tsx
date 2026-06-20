import React from "react";
import { Candidate, CenterInfo, WeightProfile } from "../types";
import { Layers, AlertTriangle, CheckCircle2, TrendingUp, HelpCircle, FileText, FileWarning, Trash2 } from "lucide-react";

interface CandidateDashboardProps {
  candidates: Candidate[];
  centerInfo: CenterInfo;
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
  onDeleteCandidate?: (id: string) => void;
  filterRegisteredOnly?: boolean;
  onToggleFilterRegisteredOnly?: (val: boolean) => void;
  hasPresets?: boolean;
  hasRegistered?: boolean;
  registeredCount?: number;
}

// 4-2 Confidence processing core function
export function evaluateAdjustedScore(
  raw: number,
  evidence: "있음" | "약함" | "부재" | "부정",
  confidence: "상" | "중상" | "중" | "하"
): { score: number; isMissing: boolean; description: string } {
  if (evidence === "부재") {
    // 근거 부재 카테고리: 만점 50% 하한 보장 (100점 만점 척도로 환산 시 50점 보장)
    return {
      score: 50,
      isMissing: true,
      description: "근거 부재 최소 50점 하한 보장 (이중 감점 배제)"
    };
  }

  let final = raw;
  let description = "정상 채점";

  if (evidence === "약함" || confidence === "하") {
    final = raw * 0.90;
    description = "근거 강도 약함 또는 신뢰도 '하'로 0.9 계수 디스카운트 보정";
  }

  return {
    score: final,
    isMissing: false,
    description
  };
}

// Full candidate auditing calculation helper
export function auditCandidateScores(
  cand: Candidate,
  profile: WeightProfile
): {
  perf1: number; // 1차 직무수행 역량 종합
  culture2Raw: number; // 2차 원점수 종합
  culture2Adjusted: number; // 2차 조정 종합
  finalBase: number; // 정책 가점 제외 종합점수
  finalWithBonus: number; // 정책가점 반영 종합점수
  civilAdjusted: number;
  cultureAdjusted: number;
  civilIsMissing: boolean;
  cultureIsMissing: boolean;
} {
  // 1. 1차 직무수행역량
  const perf1 = (cand.jobCompetencyScore * profile.weightJobCompetency / 100) +
                (cand.adminSkillsScore * profile.weightAdminSkills / 100) +
                (cand.networkingScore * profile.weightNetworking / 100);

  // 2. 2차 개별 카테고리 조정
  const civilResult = evaluateAdjustedScore(cand.civilScoreRaw, cand.civilEvidence, cand.civilConfidence);
  const cultureResult = evaluateAdjustedScore(cand.cultureScoreRaw, cand.cultureEvidence, cand.cultureConfidence);

  const civilAdjusted = civilResult.score;
  const cultureAdjusted = cultureResult.score;

  // 3. 2차 종합 원점수 vs 조정점수
  const culture2Raw = (cand.civilScoreRaw * profile.weightCivilRelation / 100) +
                      (cand.cultureScoreRaw * profile.weightEthicalCollab / 100);

  const culture2Adjusted = (civilAdjusted * profile.weightCivilRelation / 100) +
                           (cultureAdjusted * profile.weightEthicalCollab / 100);

  // 4. 종합점수 계산
  const finalBase = (perf1 * profile.ratioJobPerformance / 100) +
                    (Math.min(100, culture2Adjusted) * profile.ratioCultureSync / 100);

  const finalWithBonus = finalBase + cand.policyBonus;

  return {
    perf1,
    culture2Raw,
    culture2Adjusted: Math.min(100, culture2Adjusted),
    finalBase,
    finalWithBonus,
    civilAdjusted,
    cultureAdjusted,
    civilIsMissing: civilResult.isMissing,
    cultureIsMissing: cultureResult.isMissing
  };
}

export default function CandidateDashboard({
  candidates,
  centerInfo,
  selectedCandidateId,
  onSelectCandidate,
  onDeleteCandidate,
  filterRegisteredOnly = false,
  onToggleFilterRegisteredOnly,
  hasPresets = false,
  hasRegistered = false,
  registeredCount = 0
}: CandidateDashboardProps) {
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

  // 1. Map candidates with calculated scores
  const evaluatedCandidatesList = candidates.map(cand => {
    const audit = auditCandidateScores(cand, profile);
    return {
      cand,
      audit
    };
  });

  // 2. Sort by Final Cumulative Score DESC (To prevent any score layout inversion)
  const sortedList = [...evaluatedCandidatesList].sort((a, b) => b.audit.finalWithBonus - a.audit.finalWithBonus);

  // 3. Handle Ties ("동급군") within 2.0 points inside each candidate context
  const getIsConnectedWithTie = (index: number) => {
    const current = sortedList[index];
    if (!current) return { hasTie: false, tieWith: [] };

    const tieWithNames: string[] = [];
    sortedList.forEach((other, oIdx) => {
      if (index === oIdx) return;
      const diff = Math.abs(current.audit.finalWithBonus - other.audit.finalWithBonus);
      if (diff <= 2.0) {
        tieWithNames.push(other.cand.name);
      }
    });

    return {
      hasTie: tieWithNames.length > 0,
      names: tieWithNames
    };
  };

  // 4. Priority tag flag:
  // - 상담직 (Counsel): Prioritize candidate with higher adjusted 2차 (조직적합도) score.
  // - Other jobs: Prioritize 1차 performance -> 1차 Job Competency -> 2차 Adjusted
  const getIsPrioritizedInTie = (index: number, tieNames: string[]) => {
    if (tieNames.length === 0) return false;
    const current = sortedList[index];
    
    // Check if current is best among its ties in specified rules
    let isBest = true;
    
    sortedList.forEach((other, oIdx) => {
      if (index === oIdx) return;
      if (!tieNames.includes(other.cand.name)) return;

      if (profile.jobType === "상담직") {
        // 우선순위: 2차 조정 조직적합도
        if (other.audit.culture2Adjusted > current.audit.culture2Adjusted) {
          isBest = false;
        }
      } else {
        // 우선순위: 1차 종합역량 -> 1차 직무전문성
        if (other.audit.perf1 > current.audit.perf1) {
          isBest = false;
        } else if (other.audit.perf1 === current.audit.perf1) {
          if (other.cand.jobCompetencyScore > current.cand.jobCompetencyScore) {
            isBest = false;
          }
        }
      }
    });

    return isBest;
  };

  // Group candidates into Tiers (적극검토, 검토(조건부), 보류) for visualization
  // Keep order inside tiers descending based on score
  const activeCandidates = sortedList.filter(item => item.cand.tier === "적극검토");
  const conditionalCandidates = sortedList.filter(item => item.cand.tier === "검토(조건부)");
  const holdCandidates = sortedList.filter(item => item.cand.tier === "보류");

  const renderCandidateRow = (item: typeof sortedList[0], globalIndex: number) => {
    const { cand, audit } = item;
    const tieInfo = getIsConnectedWithTie(globalIndex);
    const isPrioritized = getIsPrioritizedInTie(globalIndex, tieInfo.names || []);
    const isSelected = selectedCandidateId === cand.id;

    // Documents status
    const docMissingCount = [cand.documentsSubmitted.resume, cand.documentsSubmitted.selfIntro, cand.documentsSubmitted.plan].filter(v => !v).length;
    const hasMissingDocs = docMissingCount > 0;

    // Conditional row backgrounds matching "Professional Polish" guidelines
    let rowBgStyle = "bg-white hover:bg-slate-50/80";
    if (isSelected) {
      rowBgStyle = "bg-indigo-50/60 hover:bg-indigo-50/80 font-medium border-l-[3px] border-l-indigo-600";
    } else if (cand.tier === "적극검토") {
      rowBgStyle = "bg-emerald-50/15 hover:bg-emerald-50/35";
    } else if (cand.tier === "검토(조건부)") {
      rowBgStyle = "bg-amber-50/10 hover:bg-amber-50/25";
    }

    return (
      <tr 
        key={cand.id}
        onClick={() => onSelectCandidate(cand.id)}
        className={`group border-b border-slate-100 transition duration-150 cursor-pointer ${rowBgStyle}`}
        id={`candidate-row-${cand.id}`}
      >
        <td className="py-4 pl-4 pr-1">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              cand.tier === '적극검토' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
              cand.tier === '검토(조건부)' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
              'bg-slate-100 text-slate-600'
            }`}>
              {cand.tier}
            </span>
          </div>
        </td>

        <td className="py-4 px-3">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-slate-800 text-sm">{cand.name}</span>
            {tieInfo.hasTie && (
              <span 
                className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold font-mono"
                title={`동급군 (=): ${tieInfo.names?.join(", ")}와 2점 이내 차이`}
              >
                =
              </span>
            )}
            {tieInfo.hasTie && isPrioritized && (
              <span 
                className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5"
                title={profile.jobType === "상담직" ? "2차 조직적합도 우위로 면접 우선 검토 권장" : "1차 직무수행 우위로 우선 검토"}
              >
                ★ {profile.jobType === "상담직" ? "적합우위" : "역량우위"}
              </span>
            )}
          </div>
        </td>

        <td className="py-4 px-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            cand.candidateTypeLabel === '균형형' ? 'bg-indigo-50 text-indigo-700' :
            cand.candidateTypeLabel === '고직무·정성미검증' ? 'bg-cyan-50 text-cyan-700' :
            cand.candidateTypeLabel === '고적합·직무보완' ? 'bg-yellow-50 text-amber-800' :
            'bg-rose-50 text-rose-700'
          }`}>
            {cand.candidateTypeLabel}
          </span>
        </td>

        <td className="py-4 px-3 font-mono">
          <div className="text-slate-800 font-bold text-sm">
            {audit.finalWithBonus.toFixed(1)}점
          </div>
          <div className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
            기본 {audit.finalBase.toFixed(1)}
            {cand.policyBonus > 0 && ` + 가점 ${cand.policyBonus}`}
          </div>
        </td>

        <td className="py-4 px-3 font-mono text-xs text-slate-600">
          <span className="font-semibold text-slate-700">{audit.perf1.toFixed(1)}점</span>
          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">
            전문 {cand.jobCompetencyScore} / 행정 {cand.adminSkillsScore} / 개척 {cand.networkingScore}
          </div>
        </td>

        <td className="py-4 px-3 font-mono text-xs text-slate-600">
          <span className={`font-semibold ${audit.culture2Adjusted !== audit.culture2Raw ? 'text-indigo-600' : 'text-slate-700'}`}>
            {audit.culture2Adjusted.toFixed(1)}점
          </span>
          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">
            원 {audit.culture2Raw.toFixed(1)} → 조정 {audit.culture2Adjusted.toFixed(1)}
          </div>
        </td>

        <td className="py-4 px-3">
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {audit.civilIsMissing && (
              <span className="text-[9px] bg-rose-50 text-rose-700 font-bold border border-rose-200/50 px-1 py-0.5 rounded leading-none shrink-0" title="민원응대 정성 행동사례 결여">
                민원부재 (하한{evaluateAdjustedScore(0, '부재', '중').score}%)
              </span>
            )}
            {audit.cultureIsMissing && (
              <span className="text-[9px] bg-rose-50 text-rose-700 font-bold border border-rose-200/50 px-1 py-0.5 rounded leading-none shrink-0" title="협업/사명감 정성 행동사례 결여">
                협업부재 (하한{evaluateAdjustedScore(0, '부재', '중').score}%)
              </span>
            )}
            {(cand.civilConfidence === '하' || cand.civilEvidence === '약함') && (
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/40 px-1 py-0.5 rounded leading-none shrink-0">
                민원 보정(0.9)
              </span>
            )}
            {(cand.cultureConfidence === '하' || cand.cultureEvidence === '약함') && (
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/40 px-1 py-0.5 rounded leading-none shrink-0">
                협업 보정(0.9)
              </span>
            )}
            {!audit.civilIsMissing && !audit.cultureIsMissing && cand.civilEvidence !== '약함' && cand.cultureEvidence !== '약함' && (
              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/40 px-1 py-0.5 rounded leading-none shrink-0">
                정성 신뢰 보통이상
              </span>
            )}
          </div>
        </td>

        <td className="py-4 px-3">
          {hasMissingDocs ? (
            <div className="text-amber-600 text-xs flex items-center gap-1 font-sans" title={`누락 서류: ${!cand.documentsSubmitted.resume ? '이력서 ' : ''}${!cand.documentsSubmitted.selfIntro ? '자기소개서 ' : ''}${!cand.documentsSubmitted.plan ? '직무계획서' : ''}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>미제출 {docMissingCount}개</span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs flex items-center gap-1 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>전부 완비</span>
            </div>
          )}
        </td>

        <td className="py-4 px-2 text-xs text-slate-500 max-w-[150px] truncate font-sans">
          {cand.oneLineComment}
        </td>
        <td className="py-4 pr-4 pl-1 text-center" onClick={(e) => e.stopPropagation()}>
          {onDeleteCandidate && (
            <button
              type="button"
              onClick={() => {
                onDeleteCandidate(cand.id);
              }}
              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition duration-150 cursor-pointer inline-flex items-center justify-center"
              title="삭제"
              id={`delete-btn-${cand.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-6" id="dashboard-tab-content">
      {/* Visual Chart meters - Comparison charts */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="font-sans font-semibold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            지원자종합점수 실시간 서열 현황 (2점 이내 동급군 적용)
          </h3>

          {hasPresets && (
            <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={filterRegisteredOnly}
                  onChange={(e) => onToggleFilterRegisteredOnly?.(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                />
                <span>등록 서류만 보기</span>
              </label>
              {hasRegistered && (
                <span className="bg-indigo-50 text-[10px] font-mono font-bold text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  직접등록 {registeredCount}개
                </span>
              )}
            </div>
          )}
        </div>
        
        {sortedList.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 font-sans">등록된 지원자가 없습니다. 위 서류 양식이나 샘플 자동 불러오기로 지원자를 추가하세요.</p>
        ) : (
          <div className="space-y-3 max-w-4xl" id="visualization-meters">
            {sortedList.map((item, idx) => {
              const tieInfo = getIsConnectedWithTie(idx);
              const scorePercent = item.audit.finalWithBonus;
              return (
                <div key={item.cand.id} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-slate-600 font-bold font-sans text-right shrink-0 truncate">{item.cand.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.cand.tier === '적극검토' ? 'bg-emerald-500' :
                        item.cand.tier === '검토(조건부)' ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    ></div>
                    {/* policy bonus striping inside the meter */}
                    {item.cand.policyBonus > 0 && (
                      <div 
                        className="h-full bg-amber-400 opacity-80"
                        style={{ width: `${(item.cand.policyBonus / 100) * 100}%` }}
                        title={`우대가점 +${item.cand.policyBonus}`}
                      ></div>
                    )}
                  </div>
                  <span className="w-20 font-mono text-xs font-bold text-slate-800 shrink-0">
                    {item.audit.finalWithBonus.toFixed(1)}점
                    {tieInfo.hasTie && " (=)"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Table candidate screening */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 tracking-wider font-sans">
              <th className="py-3 pl-4 pr-1">티어</th>
              <th className="py-3 px-3">지원자성명</th>
              <th className="py-3 px-3">유형 판별</th>
              <th className="py-3 px-3">종합 채점 (참고값)</th>
              <th className="py-3 px-3">1차 직무수행 (/100)</th>
              <th className="py-3 px-3">2차 조직적합 (원점→조정)</th>
              <th className="py-3 px-3">정성 신뢰처리로그</th>
              <th className="py-3 px-3">서류 완비여부</th>
              <th className="py-3 px-2">핵심 진단 한술평</th>
              <th className="py-3 pr-4 pl-1 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 text-xs italic font-sans bg-slate-50/20">
                  <FileWarning className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  이용 단계: [1] 채용 기준 설정 확인 후 [2] 지원자 서류접수를 완료하시면 공정 채점 대시보드가 실시간 수립됩니다.
                </td>
              </tr>
            ) : (
              sortedList.map((item, idx) => renderCandidateRow(item, idx))
            )}
          </tbody>
        </table>
      </div>

      {sortedList.length > 0 && (
        <>
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs bg-slate-50/30 font-sans">
            <div className="flex gap-2 items-center text-slate-500 font-medium italic">
              <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"></path>
              </svg>
              <span>종합점수 2점 이내 '동급군(=)' 판정 및 서열 해제 필터 활성화됨</span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="h-2.5 w-24 bg-slate-200 rounded-full relative overflow-hidden shadow-inner">
                <div className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full w-[95%]"></div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Data Reliability: 95%</span>
            </div>
          </div>

          <div className="p-4.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed font-sans space-y-2">
            <p className="border-b border-slate-200/60 pb-1.5"><strong className="text-slate-700">⚠️ 대시보드 인사 관리 가이드라인:</strong></p>
            <p>1. <strong>동급 가치 보장 (=):</strong> 소수점 점수 차이는 서류상 측정 오차 범위 내이므로 2.0점 이내 후보는 동급군(=)으로 병렬 표기하며 강제 서열화로 부당 감점하지 않습니다.</p>
            <p>2. <strong>직무 맞춤 리포트:</strong> {profile.jobTitle} 가중치 프로파일이 실시간 적재되었습니다. 직업상담직은 현지 민원 갈등 해결성과 회복탄력성이 우수한 최선의 인재를, 행정원 등은 법정 기안력 및 수치 신뢰도가 우수한 인재(★)를 자동 우대 추천합니다.</p>
            <p>3. <strong>정성적 근거부재 하한제:</strong> 자기소개서에 행동사례 증명이 누락된 '미검증'(부재) 영역 후보에게는 50%의 채점 하한을 의무 보장해 정성 부재로 인한 강제 영점 탈락을 방지하고 대신 면접 질문에서 진위를 검증하도록 권고합니다.</p>
          </div>
        </>
      )}
    </div>
  );
}
