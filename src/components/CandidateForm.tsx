import React, { useState } from "react";
import { CenterInfo, CandidateRawInput } from "../types";
import { 
  UserPlus, 
  Sparkles, 
  Clipboard, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  FileText,
  UploadCloud,
  AlertCircle,
  CheckCircle,
  FileIcon,
  Trash2,
  Play,
  Loader2,
  ShieldAlert,
  ListPlus,
  Check
} from "lucide-react";

interface CandidateFormProps {
  centerInfo: CenterInfo;
  onAnalyze: (input: CandidateRawInput) => Promise<void>;
  isLoading: boolean;
  onPreloadSamples: () => void;
  hasCandidates: boolean;
}

export default function CandidateForm({ 
  centerInfo, 
  onAnalyze, 
  isLoading, 
  onPreloadSamples,
  hasCandidates 
}: CandidateFormProps) {
  const [intakeMode, setIntakeMode] = useState<'fast' | 'upload'>('upload');
  
  // States for File Upload Mode
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  
  // States for Fast Mode
  const [fastName, setFastName] = useState("");
  const [fastResume, setFastResume] = useState("");
  const [fastIntro, setFastIntro] = useState("");
  const [fastPlan, setFastPlan] = useState("");
  const [fastBonus, setFastBonus] = useState(0);
  const [detectedPersonal, setDetectedPersonal] = useState("");

  interface UploadedFileItem {
    id: string;
    name: string;
    size: number;
    status: "pending" | "processing" | "success" | "error";
    progressMsg?: string;
    errorMsg?: string;
    result?: {
      name: string;
      resumeText: string;
      selfIntroText: string;
      planText: string;
      detectedPersonalInfo: string;
    };
    registerLoading?: boolean;
    registerSuccess?: boolean;
  }

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);

  const handleMultipleFilesProcess = async (filesList: FileList | File[] | null) => {
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);
    const validFiles: { file: File; item: UploadedFileItem }[] = [];
    const invalidErrors: string[] = [];

    filesArray.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        invalidErrors.push(`[${file.name}] 파일 크기가 10MB를 초과하여 제외되었습니다.`);
        return;
      }
      const item: UploadedFileItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        status: "pending",
        progressMsg: "대기 중..."
      };
      validFiles.push({ file, item });
    });

    if (invalidErrors.length > 0) {
      setUploadError(invalidErrors.join("\n"));
    } else {
      setUploadError("");
    }

    if (validFiles.length === 0) return;

    // Add new items to state
    setUploadedFiles(prev => [...prev, ...validFiles.map(v => v.item)]);

    // Process each document sequentially
    for (const { file, item } of validFiles) {
      setUploadedFiles(prev =>
        prev.map(p =>
          p.id === item.id
            ? { ...p, status: "processing", progressMsg: "파일 바이너리 인코딩 및 전송 중..." }
            : p
        )
      );

      const steps = [
        "1/4. 서류 레이아웃 및 폰트 구조화 인덱싱...",
        "2/4. 개인정보 블라인드 스크리닝 필터 조율 중...",
        "3/4. 취업 자격 이력 및 직무 전문 역량 수집 중...",
        "4/4. 지원 포부 및 갈등극복 민원 자소서 문장 파싱 중...",
        "최종 AI 무결성 스펙 대조 검토 중..."
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < steps.length) {
          setUploadedFiles(prev =>
            prev.map(p =>
              p.id === item.id
                ? { ...p, progressMsg: steps[currentStep] }
                : p
            )
          );
          currentStep++;
        }
      }, 600);

      try {
        // Read to Base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;

        const response = await fetch("/api/parse-document-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: file.type || "application/pdf",
            fileName: file.name
          })
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "구직 서류 파싱 중 오류가 보고되었습니다.");
        }

        const data = await response.json();
        if (data.result) {
          setUploadedFiles(prev =>
            prev.map(p =>
              p.id === item.id
                ? {
                    ...p,
                    status: "success",
                    progressMsg: "분석 완료",
                    result: data.result,
                    registerLoading: true
                  }
                : p
            )
          );

          // 3단계 대시보드로 자동 전송 및 정밀 AI 심사 개시
          try {
            await onAnalyze({
              name: data.result.name || "구직자",
              resumeText: data.result.resumeText || "",
              selfIntroText: data.result.selfIntroText || "",
              planText: data.result.planText || "",
              policyBonus: 0,
              detectedPersonalInfo: data.result.detectedPersonalInfo || ""
            });

            setUploadedFiles(prev =>
              prev.map(p =>
                p.id === item.id
                  ? {
                      ...p,
                      registerLoading: false,
                      registerSuccess: true,
                      progressMsg: "종합 채점 완료 (3단계 대시보드에서 확인 가능)"
                    }
                  : p
              )
            );
          } catch (deepErr: any) {
            console.error("자동 대시보드 종합 채점 연동 실패:", deepErr);
            setUploadedFiles(prev =>
              prev.map(p =>
                p.id === item.id
                  ? {
                      ...p,
                      registerLoading: false,
                      status: "error",
                      errorMsg: deepErr.message || "종합 AI 채점 과정에서 오류가 발생했습니다."
                    }
                  : p
              )
            );
          }
        } else {
          throw new Error("서류 안에서 평가 정합성을 갖춘 텍스트를 찾지 못했습니다.");
        }
      } catch (err: any) {
        clearInterval(progressInterval);
        setUploadedFiles(prev =>
          prev.map(p =>
            p.id === item.id
              ? {
                  ...p,
                  status: "error",
                  errorMsg: err.message || "파일 업로드 분석 장애가 발생했습니다."
                }
              : p
          )
        );
      }
    }
  };

  const handleInspectAndEdit = (item: UploadedFileItem) => {
    if (!item.result) return;
    const { name, resumeText, selfIntroText, planText, detectedPersonalInfo } = item.result;

    // Load to fast mode
    setFastName(name || "");
    setFastResume(resumeText || "");
    setFastIntro(selfIntroText || "");
    setFastPlan(planText || "");
    setDetectedPersonal(detectedPersonalInfo || "");

    setUploadSuccessMessage(`🎉 [${item.name}]의 내용이 편집창에 성공적으로 로드되었습니다. 확인 및 교정 후 등록하십시오.`);
    setIntakeMode("fast");
  };

  const handleQuickRegister = async (item: UploadedFileItem) => {
    if (!item.result) return;

    setUploadedFiles(prev =>
      prev.map(p => p.id === item.id ? { ...p, registerLoading: true } : p)
    );

    try {
      await onAnalyze({
        name: item.result.name,
        resumeText: item.result.resumeText,
        selfIntroText: item.result.selfIntroText,
        planText: item.result.planText,
        policyBonus: 0,
        detectedPersonalInfo: item.result.detectedPersonalInfo
      });

      setUploadedFiles(prev =>
        prev.map(p => p.id === item.id ? { ...p, registerLoading: false, registerSuccess: true } : p)
      );
    } catch (err: any) {
      setUploadedFiles(prev =>
        prev.map(p => p.id === item.id ? { ...p, registerLoading: false, errorMsg: err.message || "심사 등록에 실패했습니다." } : p)
      );
    }
  };

  const handleBulkRegisterAll = async () => {
    const successItemsOnly = uploadedFiles.filter(f => f.status === "success" && !f.registerSuccess && !f.registerLoading);
    if (successItemsOnly.length === 0) return;

    for (const item of successItemsOnly) {
      await handleQuickRegister(item);
    }
  };

  const handleRemoveFileItem = (id: string) => {
    setUploadedFiles(prev => prev.filter(p => p.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleMultipleFilesProcess(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleMultipleFilesProcess(e.target.files);
    }
  };

  const handleFastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastName || !fastResume || !fastIntro) return;
    
    await onAnalyze({
      name: fastName,
      resumeText: fastResume,
      selfIntroText: fastIntro,
      planText: fastPlan,
      policyBonus: centerInfo.hasPolicyBonus ? fastBonus : 0,
      detectedPersonalInfo: detectedPersonal
    });

    // Reset Form
    setFastName("");
    setFastResume("");
    setFastIntro("");
    setFastPlan("");
    setFastBonus(0);
    setDetectedPersonal("");
  };

  // Pre-fill text with realistic sample to help testing
  const autofillTemplate = () => {
    setFastName("안민영");
    setFastBonus(3);
    setDetectedPersonal("출신학교: 동대문직업여전 은하대학교, 나이: 1985년생(41세), 남편과 자녀 1명 가족");
    setFastResume(`[자격증] 직업상담사 2급 보유, 컴퓨터활용능력 1급
[경력] 
- OO행복센터 희망취업지원단 (2018.03 - 2021.11, 44개월) : 중장년 및 경력보유여성 파트너십 구인 알선기획, 공문서 관리업무
- AA테크 총무팀 기획원 (2022.02 - 2023.08) : 전결 문서 기안 배포, 사업비 세무정산 7억 담당`);
    
    setFastIntro(`[새일센터 지원동기 및 사명]
가사 및 육아로 인한 영외 복귀의 막연함을 전소하고자 지원했습니다. 새일센터의 일자리가 한 여성의 삶의 복지와 성장을 구축한다는 것에 깊은 사명감을 느끼며, 상담과 세밀한 기업영업 멀티태스킹을 영위하고 싶습니다.

[민원 극복 노하우 및 팀워크]
상담 중 고령 구직자와 요건 불충분으로 인해 위탁금 지급이 보류되자 언성을 높이는 강경한 불만이 발발했었습니다. 사려깊게 경청하며 동요하지 않고 사정을 청취한 후, 주차별 대안 알선책을 브리핑해 마음을 다스려 드린 사건이 있습니다. 어떤 격동의 상황에서도 회복력을 유지해 팀에 보탬이 되겠습니다.`);
    
    setFastPlan(`[새일센터 입사 후 직무수행 포부]
수요처 기반 고용유지 실무: 관내 50개 대표 여성채용 친화기업의 이탈방지 밀착 사후관리를 수립하겠습니다.
기초 지자체 협력 예산정산 최적화: 엑셀 정산 매크로 및 정부 지표 데이터 관리를 지성적으로 도모하여 부서의 행정 부담을 최소화하겠습니다.`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="candidate-form-card">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans font-semibold text-slate-800 text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            지원자 서류 접수 및 분석
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">서류를 분석하여 법정보호, 직무역량, 조직적합도 채점을 설계합니다.</p>
        </div>

        {/* Action button to preload presets */}
        {!hasCandidates && (
          <button
            type="button"
            onClick={onPreloadSamples}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-sans text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
            id="preload-samples-button"
          >
            <Sparkles className="w-4 h-4" />
            v3.1 모범 샘플 후보자 자동 불러오기
          </button>
        )}
      </div>

      {/* Mode Selectors */}
      <div className="p-6 pb-0 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => setIntakeMode('upload')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-2 border ${
            intakeMode === 'upload'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/75'
          }`}
          id="mode-upload-btn"
        >
          <UploadCloud className="w-4 h-4" />
          입사서류 PDF/TXT 자동 판독 모드
        </button>
        <button
          type="button"
          onClick={() => setIntakeMode('fast')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-sans text-xs font-bold transition flex items-center justify-center gap-2 border ${
            intakeMode === 'fast'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/75'
          }`}
          id="mode-fast-btn"
        >
          <Clipboard className="w-4 h-4" />
          빠른 모드 (직접 입력/교정)
        </button>
      </div>

      {/* Floating Success Notification */}
      {uploadSuccessMessage && (
        <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-2.5 text-xs animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{uploadSuccessMessage}</p>
            <p className="text-[11px] text-emerald-700/80 mt-1">이력서와 자기소개서 내용이 복구되어 아래 편집창에 자동 적재되었습니다. 아래 값들을 검토한 후 하단의 ‘서류 종합 정밀분석 실행’ 버튼을 누르시면 종합 AI 스크리닝 채점이 실행됩니다.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setUploadSuccessMessage("")}
            className="text-emerald-500 hover:text-emerald-700 text-xs font-bold focus:outline-none px-1"
          >
            닫기
          </button>
        </div>
      )}

      {/* File Upload Panel */}
      {intakeMode === 'upload' && (
        <div className="p-6 space-y-6" id="upload-mode-section">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-sans font-semibold text-slate-800 text-sm">지원서 파일 다중 판독 및 벌크 대기열</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                여성지원자들의 PDF, TXT 형식 입사지리서 및 자기소개서 파일을 복수 선택하여 동시에 업로드할 수 있습니다.<br />
                AI가 각 파일의 정보를 순차적으로 디코딩하여 성함 자동추출, 이력 요약, 그리고 규정에 어긋난 아웃라이어 정보(나이/학교명/가족관계 등) 유실 방지 검열을 독립 실시합니다.
              </p>
            </div>
            {uploadedFiles.some(f => f.status === "success" && !f.registerSuccess) && (
              <button
                type="button"
                onClick={handleBulkRegisterAll}
                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-sans text-xs font-bold rounded-xl shadow-md hover:from-indigo-700 hover:to-indigo-900 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <ListPlus className="w-4 h-4" />
                분석 성공 서류 일괄 심사 등록
              </button>
            )}
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] ${
              isDragging
                ? "border-indigo-600 bg-indigo-50/50"
                : "border-slate-200 hover:border-indigo-400 bg-slate-50/50"
            }`}
          >
            <label className="cursor-pointer space-y-3 block w-full py-4">
              <input
                type="file"
                accept=".pdf,.txt,text/plain"
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center mx-auto text-slate-400 hover:text-indigo-600 transition-all">
                <UploadCloud className="w-7 h-7 text-indigo-550" />
              </div>
              <div className="space-y-1.5 px-4 animate-fade-in">
                <p className="text-xs font-bold text-slate-800">
                  여기에 구직 서류(PDF/TXT) 파일들을 끌어다 놓거나 클릭하여 다중 선택하십시오
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  다중 파일 동시 분석 지원 • 개별 최대 10MB 크기 제한 • 법정비공개 정보 차단 가동
                </p>
              </div>
            </label>
          </div>

          {uploadError && (
            <div className="p-3.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4.5 h-4.5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-[11px]">원서 판독 대기열 오류 알림</h5>
                <p className="text-[10.5px] leading-relaxed mt-0.5 whitespace-pre-line">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Uploaded Files Queue View */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold text-slate-500 font-sans">
                  📄 실시간 분석 대기열 및 결과 ({uploadedFiles.length}개 서류)
                </span>
                <button
                  type="button"
                  onClick={() => setUploadedFiles([])}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  대기열 전체 비우기
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {uploadedFiles.map((fileItem) => {
                  return (
                    <div
                      key={fileItem.id}
                      className={`border rounded-2xl p-4 transition-all duration-200 bg-white shadow-sm flex flex-col md:flex-row justify-between gap-4 ${
                        fileItem.status === "processing"
                          ? "border-blue-200 bg-blue-50/10"
                          : fileItem.status === "success"
                          ? fileItem.registerSuccess
                            ? "border-emerald-300 bg-emerald-50/10"
                            : "border-slate-100 bg-white"
                          : fileItem.status === "error"
                          ? "border-rose-200 bg-rose-50/5"
                          : "border-slate-200 bg-slate-50/40"
                      }`}
                    >
                      {/* Left: Metadata & Status */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FileIcon className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 break-all">{fileItem.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            ({(fileItem.size / 1024).toFixed(1)} KB)
                          </span>

                          {/* Status Badge */}
                          {fileItem.status === "pending" && (
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans">
                              대기 중
                            </span>
                          )}
                          {fileItem.status === "processing" && (
                            <span className="bg-indigo-55 bg-indigo-50 text-indigo-650 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 font-sans animate-pulse">
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-600" />
                              정보 추출 중...
                            </span>
                          )}
                          {fileItem.status === "success" && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans ${
                              fileItem.registerSuccess
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-blue-50 text-blue-800 border border-blue-100"
                            }`}>
                              {fileItem.registerSuccess ? "✓ 정밀심사 등록완료" : "✓ 가추출 분석 완료"}
                            </span>
                          )}
                          {fileItem.status === "error" && (
                            <span className="bg-rose-50 text-rose-800 border border-rose-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans">
                              에러 발생
                            </span>
                          )}
                        </div>

                        {/* Processing Status Message */}
                        {fileItem.status === "processing" && (
                          <p className="text-[10.5px] text-blue-600 font-medium font-mono">
                            {fileItem.progressMsg}
                          </p>
                        )}

                        {/* Error Message */}
                        {fileItem.status === "error" && (
                          <p className="text-[10.5px] text-rose-600 font-sans font-medium">
                            🚨 {fileItem.errorMsg || "입사원서 정보 수집에 실패했습니다."}
                          </p>
                        )}

                        {/* Success Parsed Result Preview */}
                        {fileItem.status === "success" && fileItem.result && (
                          <div className="space-y-2 animate-fade-in mt-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-405 text-slate-500">추출 성명:</span>
                              <strong className="text-xs text-indigo-600 font-bold font-sans">
                                {fileItem.result.name ? `${fileItem.result.name} 구직자` : "(성명 미상)"}
                              </strong>
                            </div>

                            {/* Masking warning alarm */}
                            {fileItem.result.detectedPersonalInfo ? (
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[10.5px] text-amber-900 flex items-start gap-1.5 leading-relaxed font-sans font-medium">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <span className="font-bold text-slate-800">새일센터 공정 가이드 블라인드 필터링 적용:</span>{" "}
                                  <span className="text-amber-800">{fileItem.result.detectedPersonalInfo}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-emerald-700 font-medium">
                                ✓ 공정채용 안심 검열: 이력 정보 외 비정형 위배 개인정보가 전혀 감지되지 않았습니다.
                              </p>
                            )}

                            {/* Resume Summary Text snippet */}
                            <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-sans line-clamp-2 leading-relaxed">
                              <strong className="text-slate-700 text-[10px] block mb-0.5">📎 추출된 이력 프리뷰</strong>
                              {fileItem.result.resumeText || fileItem.result.selfIntroText || "내용 없음"}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row md:flex-col justify-end items-center gap-2 self-center shrink-0 min-w-[120px]">
                        {fileItem.status === "success" && (
                          <>
                            {!fileItem.registerSuccess ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleQuickRegister(fileItem)}
                                  disabled={fileItem.registerLoading}
                                  className="flex-1 md:w-full py-1.5 px-3 bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  {fileItem.registerLoading ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      채점 평가 중...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3" />
                                      즉시 심사 등록
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInspectAndEdit(fileItem)}
                                  disabled={fileItem.registerLoading}
                                  className="flex-1 md:w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] border border-slate-200/55 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  ✍️ 서류 내용 수정
                                </button>
                              </>
                            ) : (
                              <div className="w-full text-center py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] font-bold">
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                등록 성공
                              </div>
                            )}
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveFileItem(fileItem.id)}
                          className="py-1.5 px-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/50 rounded-lg transition text-[10.5px] cursor-pointer"
                          title="목록에서 제외"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl text-xs space-y-1 text-amber-900 leading-normal font-sans">
            <span className="font-bold flex items-center gap-1.5 mb-1 text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              여성새일센터 공정채용 서류 심사 원칙 준수 안내
            </span>
            <p className="text-[11px] text-slate-600">
              블라인드 규정(채용절차의 공정화에 관한 법률 제4조의3)에 따라, 지원자의 연령 정보, 신체 치수나 사적 인적 가족관계, 학별 교명 등의 개인 정보는 추출 과정에서 <strong className="text-orange-700">[민감/금지정보 마스킹]</strong> 로그로 분류 처리되어, 심사 평가 위원의 서류 채점 알고리즘에서 완전히 단절 처리됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Fast Mode Content */}
      {intakeMode === 'fast' && (
        <form onSubmit={handleFastSubmit} className="p-6 space-y-4" id="fast-mode-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">지원자 이름</label>
              <input
                type="text"
                value={fastName}
                onChange={(e) => setFastName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl h-9 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="예: 박은하"
                required
              />
            </div>
            
            {centerInfo.hasPolicyBonus ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 font-sans">보훈/장애 가점 대상여부</label>
                <select
                  value={fastBonus}
                  onChange={(e) => setFastBonus(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl h-9 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value={0}>대상 아님 (0점)</option>
                  <option value={centerInfo.policyBonusScore}>해당 우대조건 충족 (+{centerInfo.policyBonusScore}점)</option>
                </select>
              </div>
            ) : (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={autofillTemplate}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-sans font-semibold rounded-xl flex items-center justify-center gap-1.5 h-9"
                >
                  <FileText className="w-4 h-4" />
                  실제형 인재 양식 자동 채우기
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">이력 및 경력내용 (이력서 텍스트 붙여넣기)</label>
            <textarea
              value={fastResume}
              onChange={(e) => setFastResume(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
              placeholder="예: 자격사항 / 과거 근무 경력기술 등..."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">자기소개서 본문</label>
              <textarea
                value={fastIntro}
                onChange={(e) => setFastIntro(e.target.value)}
                className="w-full h-36 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                placeholder="인재 가치, 난제 해결 극복경험, 성실 소통 등..."
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">직무수행계획서 본문 (선택)</label>
              <textarea
                value={fastPlan}
                onChange={(e) => setFastPlan(e.target.value)}
                className="w-full h-36 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                placeholder="업무 계획 및 발굴 비전 등 (없을 경우 미제출로 무방)..."
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-orange-700 mb-1.5">모의 금지/검증 민감 개인정보 강제 기입 (선택 시 마스킹 검증 테스트)</label>
            <input
              type="text"
              value={detectedPersonal}
              onChange={(e) => setDetectedPersonal(e.target.value)}
              className="w-full px-3.5 py-2 border border-orange-200 rounded-xl bg-orange-50/10 text-xs text-orange-900 focus:outline-none"
              placeholder="예시: 대학서열: 한성대학교, 나이: 43세 기혼 자녀 양육비 긴급"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !fastName || !fastResume || !fastIntro}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI 스크리닝 진행 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  서류 종합 정밀분석 실행
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
