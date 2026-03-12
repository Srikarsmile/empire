"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

interface OtpVerificationProps {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function OtpVerification({ phone, onBack, onSuccess }: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend button
  const [countdown, setCountdown] = useState(60);
  
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const focusNextInfo = (index: number) => {
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const focusPrevInfo = (index: number) => {
    if (index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[value.length - 1]; // Take only the last character entered
    setOtp(newOtp);

    // If all filled, trigger submit automatically
    if (newOtp.every((val) => val !== "") && index === 5) {
      verifyOtp(newOtp.join(""));
    } else {
      focusNextInfo(index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        // Current input has value, empty it
        newOtp[index] = "";
        setOtp(newOtp);
      } else {
        // Current input is empty, go previous and empty it
        if (index > 0) {
          newOtp[index - 1] = "";
          setOtp(newOtp);
          focusPrevInfo(index);
        }
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusPrevInfo(index);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusNextInfo(index);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);

    if (pastedData.length === 6) {
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    // Simulate API Verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSuccess(true);
    
    // Success animation before closing
    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  const verifyManually = () => {
    if (otp.every((val) => val !== "")) {
      verifyOtp(otp.join(""));
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="rounded-full bg-green-50 p-4 mb-2">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-gray-900">Verified Successfully</h3>
        <p className="text-sm text-gray-500">Redirecting to checkout...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Check your phone
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 pr-4">
            We sent a 6-digit code to <span className="font-semibold text-gray-900">{phone}</span>.
          </p>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 justify-center">
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
            className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold rounded-xl border transition-all duration-200 outline-none
              ${activeIndex === index 
                ? 'border-gray-900 bg-white ring-2 ring-gray-900 shadow-sm' 
                : digit 
                  ? 'border-gray-300 bg-white shadow-sm' 
                  : 'border-gray-200 bg-gray-50'
              }
            `}
          />
        ))}
      </div>

      <button
        onClick={verifyManually}
        disabled={!otp.every((val) => val !== "") || isLoading}
        className="relative flex w-full items-center justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Verify and continue"
        )}
      </button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-gray-500 font-medium">
            Resend code in <span className="text-gray-900">{countdown}s</span>
          </p>
        ) : (
          <button className="text-sm font-semibold text-black hover:underline underline-offset-4 decoration-2 focus:outline-none transition-all">
            Resend the code
          </button>
        )}
      </div>
    </div>
  );
}
