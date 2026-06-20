import React from "react";
import { CenterInfo, JobType, WeightProfile } from "../types";
import { Settings, Award, Users, AlignLeft } from "lucide-react";

interface CenterConfigurationProps {
  centerInfo: CenterInfo;
  onChange: (updated: CenterInfo) => void;
}

export const DEFAULT_PROFILES: Record<JobType, WeightProfile> = {
  "상담직": {
    jobTitle: "직업상담원(상담직)",
    jobType: "상담직",
    ratioJobPerformance: 55,
    ratioCultureSync: 45,
    weightJobCompetency: 40,
    weightAdminSkills: 20,
    weightNetworking: 40,
    weightCivilRelation: 60,
    weightEthicalCollab: 40
  },
  "행정직": {
    jobTitle: "행정원(행정직)",
    jobType: "행정직",
    ratioJobPerformance: 65,
    ratioCultureSync: 35,
    weightJobCompetency: 25,
    weightAdminSkills: 50,
    weightNetworking: 25,
    weightCivilRelation: 40,
    weightEthicalCollab: 60
  },
  "관리직": {
    jobTitle: "팀장(관리직)",
    jobType: "관리직",
    ratioJobPerformance: 60,
    ratioCultureSync: 40,
    weightJobCompetency: 35,
    weightAdminSkills: 30,
    weightNetworking: 35,
    weightCivilRelation: 30,
    weightEthicalCollab: 70
  },
  "기타": {
    jobTitle: "기타·통합(기본값)",
    jobType: "기타",
    ratioJobPerformance: 60,
    ratioCultureSync: 40,
    weightJobCompetency: 40,
    weightAdminSkills: 30,
    weightNetworking: 30,
    weightCivilRelation: 50,
    weightEthicalCollab: 50
  }
};

export default function CenterConfiguration({ centerInfo, onChange }: CenterConfigurationProps) {
  
  const handleJobTypeChange = (type: JobType) => {
    // Standard v3.1 profile lookup
    const targetProfile = DEFAULT_PROFILES[type];
    
    onChange({
      ...centerInfo,
      targetJobType: type,
      customProfile: { ...targetProfile }
    });
  };

  const handleRatioChange = (field: 'ratioJobPerformance' | 'ratioCultureSync', value: number) => {
    if (!centerInfo.customProfile) return;
    const oppositeField = field === 'ratioJobPerformance' ? 'ratioCultureSync' : 'ratioJobPerformance';
    const clampedOpposite = Math.max(0, Math.min(100, 100 - value));
    
    onChange({
      ...centerInfo,
      customProfile: {
        ...centerInfo.customProfile,
        [field]: value,
        [oppositeField]: clampedOpposite
      }
    });
  };

  const handleWeight1Change = (field: 'weightJobCompetency' | 'weightAdminSkills' | 'weightNetworking', value: number) => {
    if (!centerInfo.customProfile) return;
    
    // Maintain sum of 100 beautifully by spreading remainder amongst the other two fields
    const currentProfile = centerInfo.customProfile;
    const fields: ('weightJobCompetency' | 'weightAdminSkills' | 'weightNetworking')[] = [
      'weightJobCompetency', 'weightAdminSkills', 'weightNetworking'
    ];
    
    const otherFields = fields.filter(f => f !== field);
    const remainder = 100 - value;
    const currentSumOther = currentProfile[otherFields[0]] + currentProfile[otherFields[1]];
    
    let other0New = 0;
    let other1New = 0;
    
    if (currentSumOther === 0) {
      other0New = Math.floor(remainder / 2);
      other1New = Math.ceil(remainder / 2);
    } else {
      other0New = Math.round((currentProfile[otherFields[0]] / currentSumOther) * remainder);
      other1New = remainder - other0New;
    }

    onChange({
      ...centerInfo,
      customProfile: {
        ...currentProfile,
        [field]: value,
        [otherFields[0]]: other0New,
        [otherFields[1]]: other1New
      }
    });
  };

  const handleWeight2Change = (field: 'weightCivilRelation' | 'weightEthicalCollab', value: number) => {
    if (!centerInfo.customProfile) return;
    const oppositeField = field === 'weightCivilRelation' ? 'weightEthicalCollab' : 'weightCivilRelation';
    const brandNewValue = Math.max(0, Math.min(100, 100 - value));
    
    onChange({
      ...centerInfo,
      customProfile: {
        ...centerInfo.customProfile,
        [field]: value,
        [oppositeField]: brandNewValue
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="center-config-card">
      <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Settings className="w-5 h-5" id="settings-icon" />
          </div>
          <div>
            <h2 className="font-sans font-semibold text-slate-800 text-lg leading-tight">새일센터 채용 기준 설정</h2>
            <p className="text-xs text-slate-500 mt-0.5">센터 기본 정보와 직무 등급 가중치 프로파일 v3.1을 제어합니다.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Institution Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">지역 정보</label>
            <input
              type="text"
              value={centerInfo.region}
              onChange={(e) => onChange({ ...centerInfo, region: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="예: 서울마포"
              id="region-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">새일센터명</label>
            <input
              type="text"
              value={centerInfo.centerName}
              onChange={(e) => onChange({ ...centerInfo, centerName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="예: 여성새로일하기센터"
              id="center-name-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-sans">채용 직무</label>
            <select
              value={centerInfo.targetJobType}
              onChange={(e) => handleJobTypeChange(e.target.value as JobType)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              id="job-type-select"
            >
              <option value="상담직">직업상담원 (상담직)</option>
              <option value="행정직">행정원 (행정직)</option>
              <option value="관리직">팀장 (관리직)</option>
              <option value="기타">기타·통합 (기본값)</option>
            </select>
          </div>
        </div>

        {/* Informative system info */}
        <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex gap-3 text-xs text-indigo-800">
          <Award className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans">
            <span className="font-semibold">시스템 적용 가중치:</span> 해당 공고는 <span className="font-semibold text-indigo-900">[{centerInfo.targetJobType === '상담직' ? '상담직(직업상담원)' : centerInfo.targetJobType === '행정직' ? '행정직(행정원)' : centerInfo.targetJobType === '관리직' ? '관리직(팀장)' : '기본통합'}]</span> 프로파일이 가중 적용됩니다. 아래 슬라이더로 기관 특별 내규에 따른 임의 세부 배율 재조정이 가능합니다.
          </p>
        </div>

        {/* Weights Sliders Profile */}
        {centerInfo.customProfile && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-sans">종합 가중치 설정 (합산: 100%)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ratio Block */}
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">1차 직무수행 역량 비중</span>
                  <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-sm">
                    {centerInfo.customProfile.ratioJobPerformance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={centerInfo.customProfile.ratioJobPerformance}
                  onChange={(e) => handleRatioChange('ratioJobPerformance', Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">2차 조직적합도 비중</span>
                  <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-sm">
                    {centerInfo.customProfile.ratioCultureSync}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 leading-normal pt-1 flex gap-1 font-sans">
                  <span>※</span>
                  <span>두 영역의 반영비는 직무 성격에 맞춰 상호 보완적으로 실시간 자동 조립됩니다.</span>
                </div>
              </div>

              {/* Sub evaluation weight 1 (1차 내부배점) */}
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-3">
                <span className="block text-xs font-bold text-slate-700 mb-2 font-sans">1차 내부 배율 (합산 100)</span>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>직무 전문성·자격</span>
                      <span className="font-mono font-bold text-slate-800">{centerInfo.customProfile.weightJobCompetency}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={centerInfo.customProfile.weightJobCompetency}
                      onChange={(e) => handleWeight1Change('weightJobCompetency', Number(e.target.value))}
                      className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>행정·실무 역량</span>
                      <span className="font-mono font-bold text-slate-800">{centerInfo.customProfile.weightAdminSkills}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={centerInfo.customProfile.weightAdminSkills}
                      onChange={(e) => handleWeight1Change('weightAdminSkills', Number(e.target.value))}
                      className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>구인처 개척ㆍ매칭</span>
                      <span className="font-mono font-bold text-slate-800">{centerInfo.customProfile.weightNetworking}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={centerInfo.customProfile.weightNetworking}
                      onChange={(e) => handleWeight1Change('weightNetworking', Number(e.target.value))}
                      className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Sub evaluation weight 2 (2차 내부배점) */}
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-4 md:col-span-2">
                <span className="block text-xs font-bold text-slate-700 mb-1 font-sans">2차 내부 배율 (합산 100)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>공감력·민원응대 태도</span>
                      <span className="font-mono font-bold text-slate-800">{centerInfo.customProfile.weightCivilRelation}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={centerInfo.customProfile.weightCivilRelation}
                      onChange={(e) => handleWeight2Change('weightCivilRelation', Number(e.target.value))}
                      className="w-full accent-rose-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{centerInfo.targetJobType === '관리직' ? '리더십·가치관·협업' : '가치관·기본협업'}</span>
                      <span className="font-mono font-bold text-slate-800">{centerInfo.customProfile.weightEthicalCollab}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={centerInfo.customProfile.weightEthicalCollab}
                      onChange={(e) => handleWeight2Change('weightEthicalCollab', Number(e.target.value))}
                      className="w-full accent-rose-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Policy Bonus Rules & Requirements */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Certs and Requirements */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">핵심 검증 우대자격증 (쉼표 구분)</label>
                <input
                  type="text"
                  value={centerInfo.requirements.certificates.join(", ")}
                  onChange={(e) => onChange({
                    ...centerInfo,
                    requirements: {
                      ...centerInfo.requirements,
                      certificates: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  placeholder="예: 직업상담사 2급, 사회복지사"
                  id="certificates-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">요구하는 관련 최저 경력공백/경력 기간 (개월)</label>
                <input
                  type="number"
                  value={centerInfo.requirements.requiredExperienceMonths}
                  onChange={(e) => onChange({
                    ...centerInfo,
                    requirements: {
                      ...centerInfo.requirements,
                      requiredExperienceMonths: Math.max(0, Number(e.target.value))
                    }
                  })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  id="experience-months-input"
                />
              </div>
            </div>

            {/* Right: Policy Bonus Controls */}
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900 font-sans">법정 우대 가점 설정 (보훈/장애인 가점)</span>
                </div>
                <input
                  type="checkbox"
                  checked={centerInfo.hasPolicyBonus}
                  onChange={(e) => onChange({ ...centerInfo, hasPolicyBonus: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  id="policy-bonus-checkbox"
                />
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                공정채용 가이드라인에 따라 보훈·장애인 법정 혜택은 정성 기초 종합점수 산정과 완전히 분리 표기하여 합산합니다.
              </p>
              {centerInfo.hasPolicyBonus && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-amber-900">본 채용 부여 추가 가산점 수치:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={centerInfo.policyBonusScore}
                    onChange={(e) => onChange({ ...centerInfo, policyBonusScore: Math.max(1, Number(e.target.value)) })}
                    className="w-16 px-2 py-1 border border-amber-200 focus:outline-none focus:border-amber-500 rounded bg-white text-xs font-mono font-bold text-amber-900"
                    id="policy-bonus-score-input"
                  />
                  <span className="text-xs text-amber-900">점</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
