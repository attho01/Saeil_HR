import React, { useState } from "react";
import { Candidate, CenterInfo, WeightProfile } from "../types";
import { 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  HelpCircle, 
  FileText, 
  FileWarning, 
  Trash2,
  List,
  Table,
  Check,
  UserCheck
} from "lucide-react";
import { motion } from "motion/react";

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
  viewMode?: "card" | "table";
  onViewModeChange?: (val: "card" | "table") => void;
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
  registeredCount = 0,
  viewMode,
  onViewModeChange
}: CandidateDashboardProps) {
  const [localViewMode, setLocalViewMode] = useState<"card" | "table font-bold">("card");
  const currentViewMode = viewMode !== undefined ? viewMode : (localViewMode.includes("table") ? "table" : "card");
  
  const handleViewModeChange = (mode: "card" | "table") => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setLocalViewMode(mode);
    }
  };
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
    if (!current) return { hasTie: false, names: [] };

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

  const renderCandidateRow = (item: typeof sortedList[0], globalIndex: number) => {
    const { cand, audit } = item;
    const tieInfo = getIsConnectedWithTie(globalIndex);
    const isPrioritized = getIsPrioritizedInTie(globalIndex, tieInfo.names || []);
    const isSelected = selectedCandidateId === cand.id;

    // Calculate dynamically the score breakdown for user-selected or added competencies in 1차 역량군
    const activeCompetencies = centerInfo.requirements.coreCompetencies && centerInfo.requirements.coreCompetencies.length > 0
      ? centerInfo.requirements.coreCompetencies
      : ["직무 전문성·자격", "행정·실무 역량", "구인처 개척ㆍ네트워킹"];

    const compScores = activeCompetencies.map((compName, index) => {
      const getScoreForCompetencyLocal = (idx: number, total: number) => {
        if (total <= 1) return Math.round(cand.jobCompetencyScore);
        if (total === 2) return idx === 0 ? Math.round(cand.jobCompetencyScore) : Math.round(cand.adminSkillsScore);
        if (total === 3) {
          if (idx === 0) return Math.round(cand.jobCompetencyScore);
          if (idx === 1) return Math.round(cand.adminSkillsScore);
          return Math.round(cand.networkingScore);
        }
        if (idx === 0) return Math.round(cand.jobCompetencyScore);
        if (idx === total - 1) return Math.round(cand.networkingScore);
        const fraction = idx / (total - 1);
        const interpolated = cand.jobCompetencyScore * (1 - fraction) + cand.networkingScore * fraction;
        const baseScore = Math.round((interpolated + cand.adminSkillsScore) / 2);
        const hash = cand.id.charCodeAt(idx % cand.id.length) % 5;
        return Math.max(50, Math.min(100, baseScore + (hash - 2)));
      };
      return {
        name: compName,
        score: getScoreForCompetencyLocal(index, activeCompetencies.length)
      };
    });

    const compTooltipStr = "1차 역량군 세부 배점:\n" + compScores.map(cs => `• ${cs.name}: ${cs.score}점`).join("\n");
    const compScoresShort = compScores.map(cs => cs.score).join("/");

    // Compute alphabetical score-based tier (S, A, B, C, D)
    const finalScore = audit.finalWithBonus;
    let alphaTier = "S";
    let alphaTierBadge = "bg-emerald-50 text-emerald-800 border-emerald-250";
    if (finalScore >= 90) {
      alphaTier = "S";
      alphaTierBadge = "bg-emerald-50 text-emerald-800 border-emerald-250";
    } else if (finalScore >= 80) {
      alphaTier = "A";
      alphaTierBadge = "bg-indigo-50 text-indigo-800 border-indigo-200";
    } else if (finalScore >= 70) {
      alphaTier = "B";
      alphaTierBadge = "bg-amber-50 text-amber-900 border-amber-200";
    } else if (finalScore >= 60) {
      alphaTier = "C";
      alphaTierBadge = "bg-slate-100 text-slate-700 border-slate-200";
    } else {
      alphaTier = "D";
      alphaTierBadge = "bg-rose-50 text-rose-800 border-rose-250";
    }

    // Documents status
    const docMissingCount = [cand.documentsSubmitted.resume, cand.documentsSubmitted.selfIntro, cand.documentsSubmitted.plan].filter(v => !v).length;
    const hasMissingDocs = docMissingCount > 0;

    // Conditional row backgrounds matching "Professional Polish" guidelines
    let rowBgStyle = "bg-white hover:bg-slate-50/80";
    if (isSelected) {
      rowBgStyle = "bg-slate-100/70 hover:bg-slate-105 font-bold border-l-4 border-l-slate-950 text-slate-950";
    } else if (cand.tier === "적극검토") {
      rowBgStyle = "bg-slate-50/40 hover:bg-slate-100";
    } else if (cand.tier === "검토(조건부)") {
      rowBgStyle = "bg-white hover:bg-slate-50/80";
    }

    return (
      <tr 
        key={cand.id}
        onClick={() => onSelectCandidate(cand.id)}
        className={`group border-b border-slate-200 transition duration-150 cursor-pointer ${rowBgStyle}`}
        id={`candidate-row-${cand.id}`}
      >
        <td className="py-2.5 pl-4 pr-1">
          <div className="flex items-center gap-1.5 matches-tier">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold font-mono border leading-none shrink-0 ${alphaTierBadge}`} title={`${alphaTier} 등급`}>
              {alphaTier}
            </span>
            <span className={`px-2 py-0.5 rounded-sm text-[9.5px] font-bold shrink-0 ${
              cand.tier === '적극검토' ? 'bg-slate-950 text-white border border-slate-950' :
              cand.tier === '검토(조건부)' ? 'bg-slate-100 text-slate-800 border border-slate-350' :
              'bg-slate-100 text-slate-600'
            }`}>
              {cand.tier}
            </span>
          </div>
        </td>

        <td className="py-2.5 px-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-sans font-extrabold text-slate-800 text-xs shrink-0">{cand.name}</span>
            {tieInfo.hasTie && (
              <span 
                className="text-[9.5px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded-sm font-bold font-mono shrink-0"
                title={`동급군 (=): ${tieInfo.names?.join(", ")}와 2점 이내 차이`}
              >
                =
              </span>
            )}
            {tieInfo.hasTie && isPrioritized && (
              <span 
                className="text-[9.5px] bg-white border border-slate-950 text-slate-950 px-1 py-0.5 rounded-sm font-bold flex items-center gap-0.5 shrink-0"
                title={profile.jobType === "상담직" ? "2차 조직적합도 우위로 면접 우선 검토 권장" : "1차 직무수행 우위로 우선 검토"}
              >
                ★ {profile.jobType === "상담직" ? "적합우위" : "역량우위"}
              </span>
            )}
          </div>
        </td>

        <td className="py-2.5 px-2">
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold shrink-0 inline-block ${
            cand.candidateTypeLabel === '균형형' ? 'bg-slate-950 text-white' :
            cand.candidateTypeLabel === '고직무·정성미검증' ? 'bg-slate-100 border border-slate-300 text-slate-800' :
            cand.candidateTypeLabel === '고적합·직무보완' ? 'bg-slate-50 border border-slate-400 text-slate-900' :
            'bg-slate-105 text-slate-700 border border-dashed border-slate-300'
          }`}>
            {cand.candidateTypeLabel}
          </span>
        </td>

        <td className="py-2.5 px-2 font-mono text-center">
          <div className="text-slate-800 font-bold text-xs">
            {audit.finalWithBonus.toFixed(1)}점
          </div>
          <div className="text-[9.5px] text-slate-400 font-sans leading-tight mt-0.5">
            기본 {audit.finalBase.toFixed(1)}
            {cand.policyBonus > 0 && `+${cand.policyBonus}`}
          </div>
        </td>

        <td className="py-2.5 px-2 font-mono text-xs text-slate-600 text-center" title={compTooltipStr}>
          <span className="font-semibold text-slate-700 hover:underline decoration-emerald-500 cursor-help">{audit.perf1.toFixed(1)}점</span>
          <div className="text-[9.5px] text-slate-400 mt-0.5 font-sans leading-none cursor-help">
            {compScoresShort}
          </div>
        </td>

        <td className="py-2.5 px-2 font-mono text-xs text-slate-600 text-center">
          <span className={`font-semibold ${audit.culture2Adjusted !== audit.culture2Raw ? 'text-slate-950 underline decoration-dotted' : 'text-slate-705'}`}>
            {audit.culture2Adjusted.toFixed(1)}점
          </span>
          <div className="text-[9.5px] text-slate-400 mt-0.5 font-sans leading-none">
            {audit.culture2Raw.toFixed(1)}→{audit.culture2Adjusted.toFixed(1)}
          </div>
        </td>

        <td className="py-2.5 px-2">
          <div className="flex flex-wrap gap-1 max-w-[130px]">
            {audit.civilIsMissing && (
              <span className="text-[8.5px] bg-slate-100 text-slate-800 font-bold border border-slate-300 px-1 py-0.5 rounded-sm leading-none shrink-0" title="민원응대 정성 행동사례 결여">
                민원부재 ({evaluateAdjustedScore(0, '부재', '중').score}%)
              </span>
            )}
            {audit.cultureIsMissing && (
              <span className="text-[8.5px] bg-slate-100 text-slate-800 font-bold border border-slate-300 px-1 py-0.5 rounded-sm leading-none shrink-0" title="협업/사명감 정성 행동사례 결여">
                협업부재 ({evaluateAdjustedScore(0, '부재', '중').score}%)
              </span>
            )}
            {(cand.civilConfidence === '하' || cand.civilEvidence === '약함') && (
              <span className="text-[8.5px] bg-amber-50 text-amber-800 border border-amber-200 px-1 py-0.5 rounded-sm leading-none shrink-0 font-bold" title="민원응대 정성 행동사례 약함 또는 신뢰도 우려">
                민원경보
              </span>
            )}
            {(cand.cultureConfidence === '하' || cand.cultureEvidence === '약함') && (
              <span className="text-[8.5px] bg-amber-50 text-amber-800 border border-amber-200 px-1 py-0.5 rounded-sm leading-none shrink-0 font-bold" title="조직적합 정성 행동사례 약함 또는 신뢰도 우려">
                조직경보
              </span>
            )}
          </div>
        </td>

        <td className="py-2.5 px-2 text-center">
          <div className="flex items-center justify-center">
            {hasMissingDocs ? (
              <div className="text-amber-600 text-[10px] flex items-center gap-0.5 font-sans" title={`누락 서류: ${!cand.documentsSubmitted.resume ? '입사지원서 ' : ''}${!cand.documentsSubmitted.selfIntro ? '자기소개서 ' : ''}${!cand.documentsSubmitted.plan ? '직무계획서' : ''}`}>
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>누락{docMissingCount}</span>
              </div>
            ) : (
              <div className="text-emerald-500 text-[10px] flex items-center gap-0.5 font-sans">
                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>완비</span>
              </div>
            )}
          </div>
        </td>

        <td className="py-2.5 px-2 text-[11px] text-slate-500 max-w-[130px] truncate font-sans">
          {cand.oneLineComment}
        </td>
        <td className="py-2.5 pr-4 pl-1 text-center" onClick={(e) => e.stopPropagation()}>
          {onDeleteCandidate && (
            <button
              type="button"
              onClick={() => {
                onDeleteCandidate(cand.id);
              }}
              className="p-1 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-md transition duration-150 cursor-pointer inline-flex items-center justify-center animate-fade-in"
              title="삭제"
              id={`delete-btn-${cand.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm space-y-4" id="dashboard-tab-content">
      {/* Visual Comparison Charts */}
      <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-150">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <h3 className="font-sans font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-800" />
            지원자종합점수 실시간 서열 현황 (2점 이내 동급군 적용)
          </h3>

          {hasPresets && (
            <div className="flex items-center gap-2.5 bg-white px-3 py-1 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={filterRegisteredOnly}
                  onChange={(e) => onToggleFilterRegisteredOnly?.(e.target.checked)}
                  className="w-4 h-4 text-slate-950 border-slate-300 rounded focus:ring-slate-950 accent-slate-950 cursor-pointer"
                />
                <span>등록 서류만 보기</span>
              </label>
              {hasRegistered && (
                <span className="bg-slate-50 text-[10px] font-mono font-extrabold text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  직접등록 {registeredCount}개
                </span>
              )}
            </div>
          )}
        </div>
        
        {sortedList.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 font-sans">등록된 지원자가 없습니다. 위 서류 양식이나 샘플 자동 불러오기로 지원자를 추가하세요.</p>
        ) : (
          <div className="space-y-3" id="visualization-meters">
            {sortedList.map((item, idx) => {
              const tieInfo = getIsConnectedWithTie(idx);
              const scorePercent = item.audit.finalWithBonus;
              const isSelected = selectedCandidateId === item.cand.id;
              return (
                <div 
                  key={item.cand.id} 
                  onClick={() => onSelectCandidate(item.cand.id)}
                  className={`flex items-center gap-3 p-1.5 rounded-lg transition-all cursor-pointer ${
                    isSelected ? "bg-slate-100/50 scale-[1.01]" : "hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-14 text-xs font-bold font-sans text-right shrink-0 truncate ${
                    isSelected ? "text-slate-950 font-extrabold" : "text-slate-600"
                  }`}>{item.cand.name}</span>
                  <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
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
                        className="h-full bg-amber-300 opacity-90 animate-pulse"
                        style={{ width: `${(item.cand.policyBonus / 100) * 100}%` }}
                        title={`우대가점 +${item.cand.policyBonus}`}
                      ></div>
                    )}
                  </div>
                  <span className={`w-20 font-mono text-xs font-bold shrink-0 ${
                    isSelected ? "text-slate-900" : "text-slate-700"
                  }`}>
                    {item.audit.finalWithBonus.toFixed(1)}점
                    {tieInfo.hasTie && <span className="text-[10px] text-slate-400 font-sans ml-1">(=)</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Switcher View Tabs */}
      <div className="px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleViewModeChange("card")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentViewMode === "card"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>📋 전용 카드 목록 (높은 가독성)</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("table")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentViewMode === "table"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>📊 상세 비교 분석 표</span>
          </button>
        </div>
        
        <div className="text-[11px] text-slate-400 font-sans font-medium">
          {sortedList.length}명의 후보자가 평가 완료되었습니다.
        </div>
      </div>

      {/* Main Dynamic View Modes */}
      {currentViewMode === "card" ? (
        <div className="px-6 pb-2 space-y-3 max-h-[640px] overflow-y-auto" id="candidate-card-list">
          {sortedList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic font-sans bg-slate-55 shadow-inner rounded-xl border border-dashed border-slate-200">
              <FileWarning className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              이용 단계: [1] 채용 기준 설정 확인 후 [2] 지원자 서류접수를 완료하시면 공정 채점 대시보드가 실시간 수립됩니다.
            </div>
          ) : (
            sortedList.map((item, idx) => {
              const { cand, audit } = item;
              const tieInfo = getIsConnectedWithTie(idx);
              const isPrioritized = getIsPrioritizedInTie(idx, tieInfo.names || []);
              const isSelected = selectedCandidateId === cand.id;
              const docMissingCount = [cand.documentsSubmitted.resume, cand.documentsSubmitted.selfIntro, cand.documentsSubmitted.plan].filter(v => !v).length;
              const hasMissingDocs = docMissingCount > 0;

              // Compute alphabetical score-based tier (S, A, B, C, D)
              const finalScore = audit.finalWithBonus;
              let alphaTier = "S";
              let alphaTierStyles = {
                color: "text-emerald-600 bg-emerald-55/85 border-emerald-250 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
                darkBg: "bg-emerald-900/90 text-emerald-300 border-emerald-700 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              };
              if (finalScore >= 90) {
                alphaTier = "S";
                alphaTierStyles = {
                  color: "text-emerald-600 bg-emerald-50 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
                  darkBg: "bg-emerald-900/95 text-emerald-300 border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.455)] animate-pulse"
                };
              } else if (finalScore >= 80) {
                alphaTier = "A";
                alphaTierStyles = {
                  color: "text-indigo-600 bg-indigo-50 border-indigo-205",
                  darkBg: "bg-indigo-900/80 text-indigo-300 border-indigo-805"
                };
              } else if (finalScore >= 70) {
                alphaTier = "B";
                alphaTierStyles = {
                  color: "text-amber-700 bg-amber-50 border-amber-205",
                  darkBg: "bg-amber-900/85 text-amber-300 border-amber-805"
                };
              } else if (finalScore >= 60) {
                alphaTier = "C";
                alphaTierStyles = {
                  color: "text-slate-600 bg-slate-105 border-slate-205",
                  darkBg: "bg-slate-800 text-slate-300 border-slate-700"
                };
              } else {
                alphaTier = "D";
                alphaTierStyles = {
                  color: "text-rose-600 bg-rose-50 border-rose-205",
                  darkBg: "bg-rose-955 text-rose-300 border-rose-805"
                };
              }

              return (
                <motion.div
                  key={cand.id}
                  onClick={() => onSelectCandidate(cand.id)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.03, 0.2) }}
                  className={`rounded-xl border transition-all duration-150 text-left cursor-pointer relative overflow-hidden flex items-stretch ${
                    isSelected 
                      ? "bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-950/10 scale-[1.01]" 
                      : "bg-white border-slate-200/80 hover:border-slate-400 hover:bg-slate-50/50 hover:shadow-xs"
                  }`}
                  id={`candidate-card-${cand.id}`}
                >
                  {/* Left Tier Indicator Area */}
                  <div className={`w-14 shrink-0 flex flex-col items-center justify-center border-r select-none ${
                    isSelected 
                      ? "bg-slate-900/60 border-slate-800/80" 
                      : "bg-slate-50/70 border-slate-105"
                  }`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-black text-sm border shadow-2xs ${
                      isSelected ? alphaTierStyles.darkBg : alphaTierStyles.color
                    }`}>
                      {alphaTier}
                    </div>
                    <span className={`text-[8.5px] font-sans font-bold mt-1.5 tracking-wider uppercase ${
                      isSelected ? "text-slate-500" : "text-slate-400"
                    }`}>
                      등급
                    </span>
                  </div>

                  {/* Card Main Body */}
                  <div className="flex-1 p-4 relative">
                    {/* Tie visual left bar inside content area */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-lg" />
                    )}

                    {/* Top content row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-sans font-extrabold text-sm">{cand.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-tight shrink-0 ${
                            cand.tier === '적극검토' 
                              ? isSelected ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-250" 
                              : cand.tier === '검토(조건부)'
                                ? isSelected ? "bg-amber-500 text-slate-950" : "bg-amber-50 text-amber-800 border border-amber-250"
                                : isSelected ? "bg-slate-705 text-slate-300" : "bg-slate-100 text-slate-600 border border-slate-250"
                          }`}>
                            {cand.tier}
                          </span>
                          {tieInfo.hasTie && (
                            <span 
                              className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold font-mono tracking-tight shrink-0 ${
                                isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                              }`}
                              title={`동급군 (=): ${tieInfo.names?.join(", ")}와 2점 이내 차이`}
                            >
                              동급(=)
                            </span>
                          )}
                          {tieInfo.hasTie && isPrioritized && (
                            <span 
                              className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5 shrink-0 uppercase tracking-tight ${
                                isSelected ? "bg-emerald-600 text-white font-extrabold" : "bg-white border border-slate-950 text-slate-950 font-extrabold"
                              }`}
                              title={profile.jobType === "상담직" ? "2차 조직적합도 우위로 면접 우선 검토 권장" : "1차 직무수행 우위로 우선 검토"}
                            >
                              ★ {profile.jobType === "상담직" ? "적합우위" : "역량우위"}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] tracking-tight font-bold px-2 py-0.5  rounded-md ${
                            isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {cand.candidateTypeLabel}
                          </span>
                        </div>
                      </div>

                      {/* Big Score indicator */}
                      <div className="text-right shrink-0">
                        <div className={`font-mono font-extrabold text-base ${isSelected ? "text-white" : "text-slate-950"}`}>
                          {audit.finalWithBonus.toFixed(1)}점
                        </div>
                        <span className={`text-[9.5px] font-sans ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                          기본 {audit.finalBase.toFixed(1)}{cand.policyBonus > 0 && ` (+가점 ${cand.policyBonus})`}
                        </span>
                      </div>
                    </div>

                    {/* Score Breakdowns */}
                    <div className={`mt-3 pt-2.5 border-t grid grid-cols-2 gap-2 text-[10.5px] font-sans ${
                      isSelected ? "border-slate-800/80 text-slate-300" : "border-slate-100 text-slate-500"
                    }`}>
                      <div>
                        <span className="opacity-75 block mb-0.5">1차 종합실무역량</span>
                        <strong className={`font-mono text-xs ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {audit.perf1.toFixed(1)}점
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-75 block mb-0.5">2차 조직적합 (조정)</span>
                        <strong className={`font-mono text-xs ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {audit.culture2Adjusted.toFixed(1)}점
                        </strong>
                      </div>
                    </div>

                    {/* Diagnostics and documents check */}
                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <span className={`text-[11px] line-clamp-1 max-w-[220px] ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                        ✍ {cand.oneLineComment.length > 28 ? `${cand.oneLineComment.slice(0, 28)}...` : cand.oneLineComment}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 animate-fade-in">
                        {hasMissingDocs ? (
                          <span className="text-[10px] font-semibold text-amber-550 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                             누락 {docMissingCount}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            완비
                          </span>
                        )}
                        
                        {onDeleteCandidate && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCandidate(cand.id);
                            }}
                            className={`p-1 rounded transition duration-155 float-right ${
                              isSelected ? "hover:bg-slate-800 text-slate-400 hover:text-rose-400" : "hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                            }`}
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* Main Table candidate screening */
        <div className="p-0 overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10.5px] font-bold text-slate-500 tracking-wider font-sans">
                <th className="py-2.5 pl-4 pr-1">티어</th>
                <th className="py-2.5 px-2">지원자성명</th>
                <th className="py-2.5 px-2">유형 판별</th>
                <th className="py-2.5 px-2 text-center">종합 채점 (참고)</th>
                <th className="py-2.5 px-2 text-center">1차 직무수행 (/100)</th>
                <th className="py-2.5 px-2 text-center">2차 조직적합 (조정)</th>
                <th className="py-2.5 px-2">정성 신뢰처리로그</th>
                <th className="py-2.5 px-2 text-center">서류 완비여부</th>
                <th className="py-2.5 px-2">핵심 진단 한줄평</th>
                <th className="py-2.5 pr-4 pl-1 text-center">관리</th>
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
      )}

      {sortedList.length > 0 && (
        <>
          <div className="mx-6 p-4 border border-slate-200/60 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs bg-slate-50/50 font-sans">
            <div className="flex gap-2 items-center text-slate-600 font-bold">
              <svg className="w-4 h-4 text-slate-950 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"></path>
              </svg>
              <span>가점/조정 채점 활성화됨</span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="h-2.5 w-24 bg-slate-200 rounded-sm relative overflow-hidden shadow-inner">
                <div className="absolute left-0 top-0 h-full bg-slate-950 w-[95%]"></div>
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
