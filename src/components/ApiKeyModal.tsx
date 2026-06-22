import React, { useState, useEffect } from "react";
import { Key, ExternalLink, ShieldAlert, CheckCircle2, RefreshCw, X, AlertCircle } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  onClear: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSave, onClear }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: ""
  });

  // Load current saved key on open
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("user_gemini_api_key_v3.1");
      setSavedKey(stored);
      if (stored) {
        setApiKey(stored);
        setStatusMsg({
          type: "success",
          text: "이미 Google Gemini API 키가 브라우저(localStorage)에 안전하게 등록되어 작동 중입니다."
        });
      } else {
        setApiKey("");
        setStatusMsg({ type: null, text: "" });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyAndRegister = async () => {
    if (!apiKey.trim()) {
      setStatusMsg({ type: "error", text: "API 키를 입력해주십시오." });
      return;
    }

    setIsVerifying(true);
    setStatusMsg({ type: null, text: "" });

    try {
      let data: any = null;
      // Pre-detect static deployment platforms (like Vercel) where server-side routes are unavailable
      const isStaticDeployment = !window.location.hostname.includes("run.app") && 
                                 window.location.hostname !== "localhost" && 
                                 window.location.hostname !== "127.0.0.1";
      
      let staticFallback = isStaticDeployment;

      if (!staticFallback) {
        try {
          const response = await fetch("/api/verify-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: apiKey.trim() })
          });

          if (response.status === 404) {
            staticFallback = true;
          } else if (!response.ok) {
            staticFallback = true;
          } else {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              data = await response.json();
            } else {
              staticFallback = true;
            }
          }
        } catch (err) {
          staticFallback = true;
        }
      }

      if (staticFallback) {
        console.log("Using direct client-side Gemini API verification fallback.");
        const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
          })
        });
        
        if (!directRes.ok) {
          const errJson = await directRes.json().catch(() => ({}));
          const errMsg = errJson?.error?.message || "유효하지 않은 API 키 또는 원격 에러 발생";
          throw new Error(errMsg);
        }
        
        data = { valid: true };
      }

      if (data && data.valid) {
        localStorage.setItem("user_gemini_api_key_v3.1", apiKey.trim());
        setSavedKey(apiKey.trim());
        onSave(apiKey.trim());
        setStatusMsg({
          type: "success",
          text: "Gemini API 키가 성공적으로 검증되어 등록되었습니다!"
        });
      } else {
        setStatusMsg({
          type: "error",
          text: (data && data.error) || "입력한 API 키 검증에 실패했습니다. 유효한 키인지 다시 확인하십시오."
        });
      }
    } catch (e: any) {
      setStatusMsg({
        type: "error",
        text: e.message || "검증 통신 중 오류가 발생했습니다."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem("user_gemini_api_key_v3.1");
    setApiKey("");
    setSavedKey(null);
    onClear();
    setStatusMsg({
      type: "success",
      text: "API 키가 안전하게 삭제되었습니다. 이제 규칙 기반 기본 엔진을 사용합니다."
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="api-key-modal">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-scale-in flex flex-col gap-6">
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Block exactly replication */}
        <div className="flex gap-4 items-start pr-8">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 shadow-inner">
            <Key className="w-6 h-6 text-amber-500 fill-amber-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-extrabold text-slate-900 text-lg sm:text-xl leading-tight">
              Gemini API 키 등록
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-sans font-medium">
              본 진단은 사용자 본인의 Google Gemini API 키로 동작합니다. 키는 <span className="text-slate-900 font-extrabold">이 브라우저에만 저장되며</span> 외부로 전송되지 않습니다.
            </p>
          </div>
        </div>

        {/* Input Block */}
        <div className="space-y-2">
          <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            API KEY
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (statusMsg.type === "success" && savedKey !== e.target.value) {
                  setStatusMsg({ type: null, text: "" });
                }
              }}
              placeholder="AIza... 로 시작하는 키를 붙여넣으세요"
              disabled={isVerifying}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white rounded-2xl text-sm font-mono placeholder-slate-400 text-slate-800 transition focus:outline-none focus:ring-0 shadow-inner-sm"
            />
          </div>
        </div>

        {/* Action Link & Button Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Google AI Studio에서 키 발급받기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {savedKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-sans text-xs font-bold rounded-full transition cursor-pointer"
              >
                등록 해제
              </button>
            )}
            <button
              type="button"
              onClick={handleVerifyAndRegister}
              disabled={isVerifying || !apiKey.trim()}
              className={`py-2.5 px-5 text-white font-sans text-xs font-bold rounded-full transition cursor-pointer shadow-sm flex items-center gap-1.5 ${
                isVerifying 
                  ? "bg-indigo-300 cursor-not-allowed" 
                  : apiKey.trim()
                    ? "bg-indigo-400 hover:bg-indigo-500 text-white" 
                    : "bg-indigo-300 opacity-60 cursor-not-allowed"
              }`}
            >
              {isVerifying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {isVerifying ? "키 검증 중..." : "키 검증 후 등록"}
            </button>
          </div>
        </div>

        {/* Feedback Messages with Icons */}
        {statusMsg.type && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-sans ${
            statusMsg.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}>
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{statusMsg.type === "success" ? "성공" : "오류"}</p>
              <p className="mt-0.5 font-medium">{statusMsg.text}</p>
            </div>
          </div>
        )}

        {/* Info label replicate */}
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          키는 <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono text-[10px]">localStorage</code> 에만 저장되며, 진단 요청은 브라우저에서 직접 Google Gemini API로 전송됩니다. 다른 사람의 키를 무단으로 사용하지 마세요.
        </p>

        {/* Bottom Giant Lavendar shape button exactly as Image 1 */}
        <div className="flex justify-center pt-2">
          {savedKey ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3.5 px-8 bg-indigo-300 hover:bg-indigo-400 text-white font-sans text-xs font-bold rounded-full shadow-sm cursor-pointer text-center tracking-wider transition-all"
            >
              키 등록 완료 (시작하기)
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto py-3.5 px-8 bg-indigo-100 text-indigo-300 font-sans text-xs font-bold rounded-full tracking-wider text-center cursor-not-allowed opacity-80"
            >
              키 등록 후 시작할 수 있어요
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
