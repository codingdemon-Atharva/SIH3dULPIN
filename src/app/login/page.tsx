"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/context/LanguageContext";

type LoginRole = "VIEWER" | "SURVEYOR";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  const [loginRole, setLoginRole] = useState<LoginRole>("SURVEYOR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: loginRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (lang === "HI" ? "लॉगिन में विफल।" : "Login failed."));
        return;
      }

      if (
        data.user?.role === "SURVEYOR" ||
        data.user?.role === "GOVERNMENT_OFFICER" ||
        data.user?.role === "GOVERNMENT_ADMIN"
      ) {
        router.push("/government/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError(
        lang === "HI"
          ? "सर्वर से कनेक्ट करने में असमर्थ।"
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  // UI labels based on language selection
  const labels =
    lang === "HI"
      ? {
          brandTitle: "भू-विस्टा",
          brandSubtitle: "3D भूमि बुद्धिमत्ता मंच",
          brandGov: "ग्रामीण विकास मंत्रालय",
          welcome: "वापसी पर स्वागत है",
          subWelcome: "भू-विस्टा प्लेटफॉर्म तक पहुंचने के लिए अपने खाते में साइन इन करें",
          surveyorTab: "सर्वेक्षक लॉगिन",
          viewerTab: "सार्वजनिक दर्शक",
          emailPlaceholder: "ईमेल पता",
          passwordPlaceholder: "पासवर्ड",
          rememberMe: "मुझे याद रखें",
          forgotPassword: "पासवर्ड भूल गए?",
          loginBtn: "लॉगिन",
          authenticating: "प्रमाणीकरण हो रहा है...",
          or: "या",
          registerBtn: loginRole === "SURVEYOR" ? "नया सर्वेक्षक पंजीकरण" : "दर्शक खाता पंजीकृत करें",
          secureAccess: "अधिकृत उपयोगकर्ताओं के लिए सुरक्षित पहुंच",
          govIndia: "भारत सरकार",
          slogan: "Digital India  |  Transparent Land Records  |  Empowering Citizens",
        }
      : {
          brandTitle: "BhuVista",
          brandSubtitle: "3D LAND INTELLIGENCE PLATFORM",
          brandGov: "MINISTRY OF RURAL DEVELOPMENT",
          welcome: "Welcome Back",
          subWelcome: "Sign in to your account to access the BhuVista platform",
          surveyorTab: "Surveyor Login",
          viewerTab: "Public Viewer",
          emailPlaceholder: "Email Address",
          passwordPlaceholder: "Password",
          rememberMe: "Remember me",
          forgotPassword: "Forgot password?",
          loginBtn: "Login",
          authenticating: "Authenticating...",
          or: "or",
          registerBtn: loginRole === "SURVEYOR" ? "New Surveyor Registration" : "Register Viewer Account",
          secureAccess: "Secure Access for Authorized Users",
          govIndia: "Government of India",
          slogan: "Digital India  |  Transparent Land Records  |  Empowering Citizens",
        };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-[#eef5f1] text-[#122e23] selection:bg-[#1b6a4a] selection:text-white font-sans">
      {/* NEW ATTACHED BACKGROUND IMAGE */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <img
          src="/bhuvista_background.png"
          alt="BhuVista Background"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* TOP HEADER SECTION */}
      <header className="relative z-20 flex w-full items-start justify-between px-6 pt-5 pb-2 sm:px-10 sm:pt-6">
        {/* TOP LEFT: Ministry of Rural Development / Govt of India Logo */}
        <div className="flex items-center">
          <img
            src="/mord-logo.png"
            alt="Ministry of Rural Development - Government of India"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </div>

        {/* TOP CENTER: BhuVista Brand Identity & Wordmark - Horizontally Centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-auto">
          <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-[#0d472a] font-serif leading-none">
            {labels.brandTitle}
          </h1>
          <p className="mt-1 text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#0d472a] uppercase">
            {labels.brandSubtitle}
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-semibold text-[#668878] uppercase tracking-widest">
            <span className="h-[1px] w-6 sm:w-10 bg-[#bcd4c8]" />
            <span>{labels.brandGov}</span>
            <span className="h-[1px] w-6 sm:w-10 bg-[#bcd4c8]" />
          </div>
        </div>

        {/* TOP RIGHT: Enlarged BhuVista Logo Asset */}
        <div className="flex items-center justify-end">
          <img
            src="/bhuvista-logo.png"
            alt="BhuVista Logo"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain max-w-[200px] sm:max-w-[260px] md:max-w-[300px]"
          />
        </div>
      </header>

      {/* MAIN CONTENT AREA — COMPACT CENTERED LOGIN CARD */}
      <main className="relative z-20 flex flex-1 items-center justify-center px-4 py-4 sm:py-6">
        <div className="w-full max-w-[400px] sm:max-w-[420px] rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-md transition-all">
          {/* CARD TOP ROW: Language Selector Dropdown (Top Right inside card) */}
          <div className="mb-2 flex items-center justify-end">
            <div className="relative inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
              <svg
                className="h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "EN" | "HI")}
                aria-label="Select Language"
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer text-xs pr-1"
              >
                <option value="EN">English</option>
                <option value="HI">हिंदी (Hindi)</option>
              </select>
              <svg
                className="h-3 w-3 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* CARD HEADING */}
          <div className="mb-5 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {labels.welcome}
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-normal">
              {labels.subWelcome}
            </p>
          </div>

          {/* ROLE SELECTOR (Segmented Control matching Reference 2) */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setLoginRole("SURVEYOR");
                  setError("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                  loginRole === "SURVEYOR"
                    ? "bg-[#1b6a4a] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{labels.surveyorTab}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginRole("VIEWER");
                  setError("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                  loginRole === "VIEWER"
                    ? "bg-[#1b6a4a] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4"
                  />
                </svg>
                <span>{labels.viewerTab}</span>
              </button>
            </div>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* EMAIL INPUT */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={labels.emailPlaceholder}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1b6a4a] focus:bg-white focus:ring-2 focus:ring-[#1b6a4a]/15"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={labels.passwordPlaceholder}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1b6a4a] focus:bg-white focus:ring-2 focus:ring-[#1b6a4a]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.858A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-0.469 0.469L3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <div className="flex items-center justify-between text-xs px-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#1b6a4a] focus:ring-[#1b6a4a]/20 cursor-pointer"
                />
                <span>{labels.rememberMe}</span>
              </label>

              <button
                type="button"
                className="font-medium text-[#1b6a4a] hover:underline cursor-pointer"
              >
                {labels.forgotPassword}
              </button>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b6a4a] py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-[#1b6a4a]/20 transition hover:bg-[#15563b] focus:outline-none focus:ring-2 focus:ring-[#1b6a4a]/40 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? labels.authenticating : labels.loginBtn}</span>
              {!loading && (
                <svg
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="my-3.5 flex items-center justify-center gap-3">
            <span className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium text-slate-400 lowercase">
              {labels.or}
            </span>
            <span className="h-[1px] flex-1 bg-slate-200" />
          </div>

          {/* REGISTRATION ACTION */}
          <div>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/60 py-2 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>{labels.registerBtn}</span>
            </button>
          </div>

          {/* SECURITY & OFFICIAL ACCESS BADGE */}
          <div className="mt-5 pt-3 border-t border-slate-100/80 flex items-center justify-center gap-2 text-center">
            <svg
              className="h-4 w-4 text-[#1b6a4a] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div className="text-[10px] leading-tight text-slate-500 font-medium">
              <span>{labels.secureAccess}</span>
              <br />
              <span className="text-slate-400">{labels.govIndia}</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER SECTION — Matches Reference 2 */}
      <footer className="relative z-20 w-full py-4 px-4 text-center">
        <p className="text-xs font-medium tracking-wide text-slate-600 sm:text-sm">
          {labels.slogan}
        </p>
      </footer>
    </div>
  );
}
