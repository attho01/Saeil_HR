import React from "react";
import { CenterInfo, JobType, WeightProfile } from "../types";
import { Settings, Award, Users, AlignLeft, Sparkles } from "lucide-react";

interface CenterConfigurationProps {
  centerInfo: CenterInfo;
  onChange: (updated: CenterInfo) => void;
  onReopenWizard?: () => void;
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

export default function CenterConfiguration({ centerInfo, onChange, onReopenWizard }: CenterConfigurationProps) {
  
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
    <div className="bg-[#1f2226] rounded border border-white/10 shadow-lg overflow-hidden" id="center-config-card">
      <div className="p-6 bg-[#292e35] border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8ac43f]/20 text-[#8ac43f] rounded">
              <Settings className="w-5 h-5" id="settings-icon" />
            </div>
            <div>
              <h2 className="font-sans font-semibold text-white text-lg leading-tight">새일센터 채용 기준 설정</h2>
              <p className="text-xs text-slate-400 mt-0.5">센터 기본 정보와 직무 등급 가중치 프로파일 v3.1을 제어합니다.</p>
            </div>
          </div>
          {onReopenWizard && (
            <button
              type="button"
              onClick={onReopenWizard}
              className="py-2 px-3.5 bg-[#8ac43f] hover:bg-[#7cb337] text-white font-sans text-xs font-bold rounded shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
              <span>1차 직무역량 & 2차 인성 설정 마법사 실행</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Institution Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-sans">지역 정보</label>
            <input
              type="text"
              value={centerInfo.region}
              onChange={(e) => onChange({ ...centerInfo, region: e.target.value })}
              className="w-full px-3.5 py-2 border border-white/10 bg-[#2f353d] rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#8ac43f]/30 focus:border-[#8ac43f]"
              placeholder="예: 서울마포"
              id="region-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-sans">새일센터명</label>
            <input
              type="text"
              value={centerInfo.centerName}
              onChange={(e) => onChange({ ...centerInfo, centerName: e.target.value })}
              className="w-full px-3.5 py-2 border border-white/10 bg-[#2f353d] rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#8ac43f]/30 focus:border-[#8ac43f]"
              placeholder="예: 여성새로일하기센터"
              id="center-name-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-sans">채용 직무</label>
            <select
              value={centerInfo.targetJobType}
              onChange={(e) => handleJobTypeChange(e.target.value as JobType)}
              className="w-full px-3.5 py-2 border border-white/10 bg-[#2f353d] text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8ac43f]/30 focus:border-[#8ac43f]"
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
        <div className="p-3.5 bg-[#8ac43f]/10 rounded border border-[#8ac43f]/20 flex gap-3 text-xs text-slate-300">
          <Award className="w-4 h-4 shrink-0 mt-0.5 text-[#8ac43f]" />
          <p className="leading-relaxed font-sans text-slate-300">
            <span className="font-semibold text-[#8ac43f]">시스템 적용 가중치:</span> 해당 공고는 <span className="font-semibold text-[#8ac43f]">[{centerInfo.targetJobType === '상담직' ? '상담직(직업상담원)' : centerInfo.targetJobType === '행정직' ? '행정직(행정원)' : centerInfo.targetJobType === '관리직' ? '관리직(팀장)' : '기본통합'}]</span> 프로파일이 가중 적용됩니다. 아래 슬라이더로 기관 특별 내규에 따른 임의 세부 배율 재조정이 가능합니다.
          </p>
        </div>

        {/* Weights Sliders Profile */}
        {centerInfo.customProfile && (
          <div className="space-y-5 pt-3 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-sans">종합 가중치 설정 (합산: 100%)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ratio Block */}
              <div className="bg-[#292e35] border border-white/10 p-4 rounded space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">1차 직무수행 역량 비중</span>
                  <span className="font-mono bg-[#8ac43f]/25 text-[#8ac43f] px-2 py-0.5 rounded font-bold text-sm">
                    {centerInfo.customProfile.ratioJobPerformance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={centerInfo.customProfile.ratioJobPerformance}
                  onChange={(e) => handleRatioChange('ratioJobPerformance', Number(e.target.value))}
                  className="w-full accent-[#8ac43f] h-1.5 bg-slate-700 rounded-lg cursor-pointer animate-pulse"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">2차 조직적합도 비중</span>
                  <span className="font-mono bg-[#8ac43f]/25 text-[#8ac43f] px-2 py-0.5 rounded font-bold text-sm">
                    {centerInfo.customProfile.ratioCultureSync}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-normal pt-1 flex gap-1 font-sans">
                  <span>※</span>
                  <span>두 영역의 반영비는 직무 성격에 맞춰 상호 보완적으로 실시간 자동 조립됩니다.</span>
                </div>
              </div>

              {/* Sub evaluation weight 1 (1차 내부배점) */}
              <div className="bg-[#292e35] border border-white/10 p-4 rounded space-y-3">
                <span className="block text-xs font-bold text-slate-200 mb-2 font-sans">1차 내부 배율 (합산 100)</span>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>직무 전문성·자격</span>
                      <span className="font-mono font-bold text-[#8ac43f]">{centerInfo.customProfile.weightJobCompetency}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={centerInfo.customProfile.weightJobCompetency}
                      onChange={(e) => handleWeight1Change('weightJobCompetency', Number(e.target.value))}
                      className="w-full accent-[#8ac43f] h-1 bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#8ac43f]/90 mb-1">
                      <span>행정·실무 역량</span>
                      <span className="font-mono font-bold text-[#8ac43f]">{centerInfo.customProfile.weightAdminSkills}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={centerInfo.customProfile.weightAdminSkills}
                      onChange={(e) => handleWeight1Change('weightAdminSkills', Number(e.target.value))}
                      className="w-full accent-[#8ac43f] h-1 bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>구인처 개척ㆍ매칭</span>
                      <span className="font-mono font-bold text-[#8ac43f]">{centerInfo.customProfile.weightNetworking}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={centerInfo.customProfile.weightNetworking}
                      onChange={(e) => handleWeight1Change('weightNetworking', Number(e.target.value))}
                      className="w-full accent-[#8ac43f] h-1 bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Sub evaluation weight 2 (2차 내부배점) */}
              <div className="bg-[#292e35] border border-white/10 p-4 rounded space-y-4 md:col-span-2">
                <span className="block text-xs font-bold text-slate-200 mb-1 font-sans">2차 내부 배율 (합산 100)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>공감력·민원응대 태도</span>
                      <span className="font-mono font-bold text-[#8ac43f]">{centerInfo.customProfile.weightCivilRelation}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={centerInfo.customProfile.weightCivilRelation}
                      onChange={(e) => handleWeight2Change('weightCivilRelation', Number(e.target.value))}
                      className="w-full accent-[#8ac43f] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{centerInfo.targetJobType === '관리직' ? '리더십·가치관·협업' : '가치관·기본협업'}</span>
                      <span className="font-mono font-bold text-[#8ac43f]">{centerInfo.customProfile.weightEthicalCollab}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={centerInfo.customProfile.weightEthicalCollab}
                      onChange={(e) => handleWeight2Change('weightEthicalCollab', Number(e.target.value))}
                      className="w-full accent-[#8ac43f] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1차 및 2차 평가 세부 지표 리스트 */}
        <div className="border-t border-white/10 pt-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">1차 및 2차 평가 설정 지표</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1차 핵심 직무역량 */}
            <div className="p-4 bg-[#292e35] border border-white/10 rounded space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 font-sans">1차 전형 직무수행평가 역량 (3~5개 필수)</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-extrabold font-sans">1차 직무수행</span>
              </div>
              <div className="space-y-2">
                {centerInfo.requirements.coreCompetencies && centerInfo.requirements.coreCompetencies.length > 0 ? (
                  centerInfo.requirements.coreCompetencies.map((comp) => {
                    const desc = centerInfo.requirements.coreCompetencyDescriptions?.[comp] || "여성새일센터 직무 기본 표준 역량";
                    const source = centerInfo.requirements.coreCompetencySources?.[comp];
                    return (
                      <div key={comp} className="p-2.5 bg-[#1f2226] border border-white/5 rounded">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-[#8ac43f]">{comp}</span>
                          {source && (
                            <span className="text-[9.5px] font-mono text-slate-500 bg-[#292e35] px-1.5 py-0.5 rounded border border-white/5">
                              근거: {source}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal mt-1.5 font-sans">{desc}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic font-sans py-4 text-center">도출되거나 직접 추가해둔 1차 직무역량이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 2차 평가 인성역량 */}
            <div className="p-4 bg-[#292e35] border border-white/10 rounded space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200 font-sans">2차 전형 면접 / 조직적합도 인성 키워드</span>
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-extrabold font-sans">2차 인성면접</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 bg-[#1f2226] border border-white/5 rounded min-h-[90px] content-start">
                  {centerInfo.requirements.personalityKeywords && centerInfo.requirements.personalityKeywords.length > 0 ? (
                    centerInfo.requirements.personalityKeywords.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 bg-[#292e35] border border-white/10 text-slate-300 rounded text-xs font-semibold">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic font-sans py-4 w-full text-center">선정해둔 2차 인성역량 키워드가 없습니다.</p>
                  )}
                </div>
              </div>
              <div className="p-3 bg-[#1f2226] border border-white/5 rounded text-[11px] text-slate-400 leading-relaxed font-sans mt-2">
                <span className="font-semibold block text-slate-200 mb-0.5">※ 우리 센터 인재상 및 조직 문화 한줄평:</span>
                {centerInfo.requirements.orgCulture || "감정 회복탄력성이 풍부하며, 경직되지 않고 다른 부서와의 원활한 소통 능력을 지향"}
              </div>
            </div>
          </div>

          {onReopenWizard && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onReopenWizard}
                className="w-full py-2.5 bg-[#292e35] hover:bg-[#323942] text-slate-300 hover:text-white font-sans text-xs font-bold rounded border border-white/10 hover:border-white/20 shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8ac43f] fill-[#8ac43f]" />
                <span>지표 설계 마법사 실행하여 1차 직무역량 및 2차 인성역량 상세 설계하기</span>
              </button>
            </div>
          )}
        </div>

        {/* Policy Bonus Rules & Requirements */}
        <div className="border-t border-white/5 pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Certs and Requirements */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">핵심 검증 우대자격증 (쉼표 구분)</label>
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
                  className="w-full px-3 py-1.5 border border-white/10 bg-[#2f353d] text-white focus:outline-none focus:ring-1 focus:ring-[#8ac43f]/30 rounded text-xs"
                  placeholder="예: 직업상담사 2급, 사회복지사"
                  id="certificates-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">요구하는 관련 최저 경력공백/경력 기간 (개월)</label>
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
                  className="w-full px-3 py-1.5 border border-white/10 bg-[#2f353d] text-white focus:outline-none focus:ring-1 focus:ring-[#8ac43f]/30 rounded text-xs"
                  id="experience-months-input"
                />
              </div>
            </div>

            {/* Right: Policy Bonus Controls */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-200 font-sans">법정 우대 가점 설정 (보훈/장애인 가점)</span>
                </div>
                <input
                  type="checkbox"
                  checked={centerInfo.hasPolicyBonus}
                  onChange={(e) => onChange({ ...centerInfo, hasPolicyBonus: e.target.checked })}
                  className="w-4 h-4 accent-[#8ac43f] rounded cursor-pointer"
                  id="policy-bonus-checkbox"
                />
              </div>
              <p className="text-[11px] text-amber-400/80 leading-normal">
                공정채용 가이드라인에 따라 보훈·장애인 법정 혜택은 정성 기초 종합점수 산정과 완전히 분리 표기하여 합산합니다.
              </p>
              {centerInfo.hasPolicyBonus && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-amber-200">본 채용 부여 추가 가산점 수치:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={centerInfo.policyBonusScore}
                    onChange={(e) => onChange({ ...centerInfo, policyBonusScore: Math.max(1, Number(e.target.value)) })}
                    className="w-16 px-2 py-1 border border-white/10 bg-[#2f353d] text-white focus:outline-none focus:border-[#8ac43f] rounded text-xs font-mono font-bold"
                    id="policy-bonus-score-input"
                  />
                  <span className="text-xs text-amber-200">점</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
