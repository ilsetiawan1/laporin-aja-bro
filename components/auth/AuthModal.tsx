"use client";

import { useActionState, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { loginAction, registerAction } from "@/lib/actions/auth";
import type { AuthState } from "@/lib/actions/auth";
import RegisterWizard from "./RegisterWizard";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onLoginSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onLoginSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [loginState, loginFormAction, isLoginPending] = useActionState<
    AuthState,
    FormData
  >(loginAction, null);

  const [registerState, registerFormAction, isRegisterPending] =
    useActionState<AuthState, FormData>(registerAction, null);

  // Sync defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Close on ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  // Handle Login State Changes
  useEffect(() => {
    if (loginState) {
      if (loginState.error) {
        toast.error("Login Gagal", { description: loginState.error });
      } else {
        toast.success("Berhasil Login", { description: "Selamat datang kembali!" });
        router.refresh();
        onLoginSuccess?.();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState]);

  // Handle Register State Changes
  useEffect(() => {
    if (registerState) {
      if (registerState.error) {
        toast.error("Pendaftaran Gagal", { description: registerState.error });
      } else {
        toast.success("Berhasil Daftar", { description: "Akun Anda telah dibuat. Silakan login." });
        setActiveTab("login"); // Auto-switch to login tab on successful register
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerState]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const isPending = isLoginPending || isRegisterPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-100 bg-navy/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-101 flex items-center justify-center px-4 py-8 pointer-events-none">
            <motion.div
              key="auth-modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full max-w-md pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-label={activeTab === "login" ? "Form Masuk" : "Form Daftar"}
            >
              {/* Glow effects */}
              <div className="absolute -inset-1 bg-linear-to-br from-blue/20 via-transparent to-orange/20 rounded-2xl blur-xl opacity-70" />

              {/* Card */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-navy/30 border border-white/60 overflow-hidden">
                {/* Header */}
                <div className="relative bg-linear-to-br from-navy to-navy/90 px-6 pt-7 pb-6">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
                    aria-label="Tutup"
                    id="auth-modal-close"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Logo */}
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-blue/40">
                      <Image
                        src="/images/logo.png"
                        alt="Laporin Aja Bro"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <span className="text-white font-bold text-base">Laporin Aja Bro</span>
                  </div>

                  {/* Tab switcher */}
                  <div className="flex gap-1 bg-white/10 rounded-xl p-1">
                    <button
                      id="tab-login"
                      onClick={() => setActiveTab("login")}
                      className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === "login"
                          ? "bg-white text-navy shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Masuk
                    </button>
                    <button
                      id="tab-register"
                      onClick={() => setActiveTab("register")}
                      className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === "register"
                          ? "bg-white text-navy shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Daftar
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "login" ? (
                      <motion.div
  key="login-form"
  initial={{ opacity: 0, x: -12 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 12 }}
  transition={{ duration: 0.2 }}
>
  {/* Login Error */}
  {loginState?.error && (
    <div className="flex items-center gap-2.5 bg-red/10 border border-red/25 text-red rounded-xl px-4 py-3 mb-5 text-sm">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      {loginState.error}
    </div>
  )}

  {/* Forgot Password View */}
  {showForgot ? (
    <div>
      <button
        type="button"
        onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
        className="flex items-center gap-1.5 text-sm text-navy/50 hover:text-navy mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke login
      </button>

      {forgotSent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-navy mb-1">Email terkirim!</p>
          <p className="text-sm text-navy/55">
            Cek inbox <span className="font-medium text-navy">{forgotEmail}</span> untuk link reset password.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-navy/60 mb-4">
              Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password.
            </p>
            <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="nama@email.com"
              className="input-field"
              disabled={forgotLoading}
            />
          </div>
          <button
            type="button"
            disabled={forgotLoading || !forgotEmail}
            onClick={async () => {
              if (!forgotEmail) return;
              setForgotLoading(true);
              try {
                const { createClient } = await import("@supabase/supabase-js");
                const supabase = createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                await supabase.auth.resetPasswordForEmail(forgotEmail, {
                  redirectTo: `${window.location.origin}/auth/reset-password`,
                });
                setForgotSent(true);
              } finally {
                setForgotLoading(false);
              }
            }}
            className={`w-full btn-primary justify-center py-3 text-base ${
              forgotLoading || !forgotEmail ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {forgotLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Mengirim...
              </>
            ) : "Kirim Link Reset"}
          </button>
        </div>
      )}
    </div>
  ) : (
    /* Normal Login Form */
    <form action={loginFormAction} className="space-y-4">
      <div>
        <label htmlFor="modal-login-email" className="block text-sm font-semibold text-navy mb-1.5">Email</label>
        <input
          id="modal-login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
          className="input-field"
          disabled={isPending}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="modal-login-password" className="text-sm font-semibold text-navy">Password</label>
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-xs text-blue hover:underline font-medium"
          >
            Lupa password?
          </button>
        </div>
        <input
          id="modal-login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="input-field"
          disabled={isPending}
        />
      </div>

      <button
        id="modal-login-submit"
        type="submit"
        disabled={isPending}
        className={`w-full btn-primary justify-center py-3 text-base mt-2 ${
          isPending ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {isLoginPending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Masuk...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Masuk
          </>
        )}
      </button>
    </form>
  )}

  <p className="text-center text-navy/55 text-sm mt-5">
    Belum punya akun?{" "}
    <button onClick={() => setActiveTab("register")} className="text-blue font-semibold hover:underline">
      Daftar gratis
    </button>
  </p>
</motion.div>
                    ) : (
                      <motion.div
                        key="register-form"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.2 }}
                      >
                        <RegisterWizard
                          onGoToLogin={() => setActiveTab("login")}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
