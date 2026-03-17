"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { ArrowLeft, Loader2, CheckCircle2, Mail } from "lucide-react";

interface OtpVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function OtpVerification({ email, onBack, onSuccess }: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function focusNext(index: number) {
    inputRefs.current[index + 1]?.focus();
    setActiveIndex(index + 1);
  }

  function focusPrev(index: number) {
    inputRefs.current[index - 1]?.focus();
    setActiveIndex(index - 1);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;
    const newOtp = [...otp];
    newOtp[index] = value[value.length - 1];
    setOtp(newOtp);
    setError(null);
    if (newOtp.every((v) => v !== "") && index === 5) {
      verifyOtp(newOtp);
    } else {
      focusNext(index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        focusPrev(index);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusPrev(index);
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusNext(index);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);
    if (pasted.length === 6) verifyOtp(newOtp);
  };

  const verifyOtp = async (otpValue?: string[]) => {
    const code = (otpValue ?? otp).join('');
    setIsLoading(true);
    setError(null);
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    setIsLoading(false);
    if (!res.ok) {
      setError('Invalid or expired code. Please try again.');
      setOtp(Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return;
    }
    setIsSuccess(true);
    setTimeout(onSuccess, 1200);
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setOtp(Array(6).fill(""));
    await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    setCountdown(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="rounded-full bg-green-50 p-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">Verified!</p>
          <p className="text-sm text-gray-400 mt-0.5">Redirecting you now…</p>
        </div>
      </div>
    );
  }

  const filled = otp.filter((v) => v !== "").length;

  return (
    <div className="flex flex-col gap-5">

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Icon + heading */}
      <div className="flex flex-col items-center text-center gap-3 pt-1 pb-2">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
          <Mail className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Check your email</h3>
          <p className="text-sm text-gray-400 mt-1">
            Code sent to{" "}
            <span className="font-medium text-gray-700 break-all">{email}</span>
          </p>
        </div>
      </div>

      {/* OTP inputs */}
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            className={`
              w-11 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all duration-150 outline-none caret-transparent
              ${error
                ? 'border-red-300 bg-red-50 text-red-600'
                : activeIndex === index
                  ? 'border-gray-900 bg-white ring-1 ring-gray-900'
                  : digit
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
              }
            `}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 text-center -mt-1">{error}</p>
      )}

      {/* Progress hint */}
      {!error && filled > 0 && filled < 6 && (
        <p className="text-xs text-gray-400 text-center -mt-1">{6 - filled} digit{6 - filled !== 1 ? 's' : ''} remaining</p>
      )}

      {/* Verify button */}
      <button
        onClick={() => verifyOtp()}
        disabled={filled < 6 || isLoading}
        className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify and continue"}
      </button>

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-xs text-gray-400">
            Resend code in <span className="text-gray-600 font-medium tabular-nums">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-semibold text-gray-700 hover:text-black underline underline-offset-2 disabled:opacity-50 transition-colors"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>

    </div>
  );
}
