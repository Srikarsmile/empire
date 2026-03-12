"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/lib/AuthContext";
import { X } from "lucide-react";
import AuthForm from "./AuthForm";
import OtpVerification from "./OtpVerification";

export default function LoginModal() {
  const { isOpen, closeAuth, login } = useAuth();
  const router = useRouter();
  
  // flow states: 'auth' -> 'otp'
  const [view, setView] = useState<'auth' | 'otp'>('auth');
  const [phoneToVerify, setPhoneToVerify] = useState("");

  // Reset modal state when it closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView('auth');
        setPhoneToVerify("");
      }, 300); // Wait for exit animation
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handlePhoneSubmit = (phone: string) => {
    setPhoneToVerify(phone);
    setView('otp');
  };

  const handleOtpSuccess = async () => {
    await login(phoneToVerify);
    closeAuth();
    
    // Re-check from context after login completes
    // The login function now calls the server to check admin status
    try {
      const res = await fetch("/api/auth/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneToVerify }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isAdmin) {
          router.push("/admin");
        }
      }
    } catch {
      // Non-critical, just skip admin redirect
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuth}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              layoutId="auth-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-full max-w-[400px] overflow-hidden rounded-[24px] bg-white shadow-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                  {view === 'auth' ? 'Log in or sign up' : 'Check your phone'}
                </h2>
                <button
                  onClick={closeAuth}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Content Area with smooth height transitions */}
              <div className="relative">
                <AnimatePresence mode="wait" initial={false}>
                  {view === 'auth' ? (
                    <motion.div
                      key="auth"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="p-6"
                    >
                      <AuthForm onPhoneSubmit={handlePhoneSubmit} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="p-6"
                    >
                      <OtpVerification 
                        phone={phoneToVerify} 
                        onBack={() => setView('auth')}
                        onSuccess={handleOtpSuccess}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
