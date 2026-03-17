"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";

interface AuthFormProps {
  onEmailSubmit: (email: string) => void;
}

export default function AuthForm({ onEmailSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setIsLoading(false);

    if (!res.ok) {
      setError('Email not recognized. Please try again.');
      return;
    }

    onEmailSubmit(email);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 pb-4">
        <h3 className="text-2xl font-semibold text-gray-900 tracking-tight text-center">
          Welcome to Empire
        </h3>
        <p className="text-sm text-gray-500 text-center">
          Log in or create an account to manage your booking
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-colors bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm shadow-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center -mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={!email || isLoading}
          className="relative flex w-full items-center justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Continue with Email"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
        By continuing, you agree to Empire&apos;s <a href="#" className="underline font-medium hover:text-black transition-colors">Terms of Service</a> and <a href="#" className="underline font-medium hover:text-black transition-colors">Privacy Policy</a>.
      </p>
    </div>
  );
}
