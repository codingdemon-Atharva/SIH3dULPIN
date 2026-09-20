"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/context/LanguageContext";

type LoginRole = "VIEWER" | "SURVEYOR";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  const [loginRole, setLoginRole] = useState<LoginRole>("VIEWER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const labels = lang === "HI" ? {
    headerTitle: "3D भूमि बुद्धिमत्ता मंच",
    welcome: "भू-विस्टा में आपका स्वागत है",
    subWelcome: "राष्ट्रीय 3D भूमि बुद्धिमत्ता और कैडस्ट्रल रजिस्ट्री तक पहुंचें।",
    signInAs: "के रूप में साइन इन करें",
    viewer: "दर्शक (Viewer)",
    surveyor: "सर्वेक्षक (Surveyor)",
    viewerNotice: "पंजीकृत सार्वजनिक और एजेंसी उपयोगकर्ताओं के लिए।",
    surveyorNotice: "अधिकृत सरकारी कैडस्ट्रल सर्वेक्षकों के लिए।",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "official@domain.gov.in",
    passwordLabel: "पासवर्ड",
    forgotPassword: "पासवर्ड भूल गए?",
    show: "दिखाएं",
    hide: "छिपाएं",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    signInBtn: "साइन इन करें",
    authenticating: "प्रमाणीकरण हो रहा है...",
    noAccount: "खाता नहीं है?",
    registerViewer: "दर्शक खाता पंजीकृत करें",
    govNoticeTitle: "सरकारी सर्वेक्षक एवं अधिकारी क्रेडेंशियलिंग",
    govNoticeBody: "अधिकृत सर्वेक्षक और सरकारी अधिकारी खाते विभाग के प्रशासकों द्वारा जारी किए जाते हैं।",
    slogan: "Digital India  |  Transparent Land Records  |  Empowering Citizens"
  } : {
    headerTitle: "3D LAND INTELLIGENCE PLATFORM",
    welcome: "Welcome to BhuVista",
    subWelcome: "Access the national 3D land intelligence & cadastral registry.",
    signInAs: "Sign in as",
    viewer: "Viewer",
    surveyor: "Surveyor",
    viewerNotice: "For registered public & agency users.",
    surveyorNotice: "For authorized government cadastral surveyors.",
    emailLabel: "Email address",
    emailPlaceholder: "official@domain.gov.in",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    show: "Show",
    hide: "Hide",
    passwordPlaceholder: "Enter your password",
    signInBtn: "Sign in",
    authenticating: "Authenticating...",
    noAccount: "Don't have an account?",
    registerViewer: "Register viewer account",
    govNoticeTitle: "Government Surveyor & Official Credentialing",
    govNoticeBody: "Authorized surveyor and government officer accounts are issued by department administrators.",
    slogan: "Digital India  |  Transparent Land Records  |  Empowering Citizens"
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-gradient-to-b from-[#edf4f8] via-[#e4edf3] to-[#dbe6ee] text-[#162a21]">

      {/* BACKGROUND CITY SKYLINE (Subtle monotone neutral silhouettes) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#c5d8e6]/40 via-transparent to-transparent" />

        {/* Monotone Building Silhouettes SVG Vector */}
        <div className="absolute bottom-0 left-0 right-0 h-56 w-full opacity-35 sm:h-72 md:h-80">
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Far background buildings layer (Light Neutral Slate) */}
            <path
              fill="#94a3b8"
              opacity="0.35"
              d="M0,320 L0,210 L30,210 L30,180 L60,180 L60,210 L90,210 L90,250 L120,250 L120,160 L150,160 L150,140 L180,140 L180,160 L200,160 L200,250 L240,250 L240,190 L270,190 L270,130 L310,130 L310,190 L340,190 L340,260 L380,260 L380,110 L410,110 L410,90 L430,90 L430,110 L450,110 L450,260 L490,260 L490,170 L520,170 L520,260 L570,260 L570,150 L600,150 L600,120 L620,120 L620,150 L640,150 L640,260 L680,260 L680,180 L720,180 L720,260 L770,260 L770,140 L800,140 L800,100 L820,100 L820,140 L840,140 L840,260 L890,260 L890,160 L930,160 L930,260 L980,260 L980,130 L1010,130 L1010,80 L1030,80 L1030,130 L1060,130 L1060,260 L1110,260 L1110,190 L1150,190 L1150,260 L1200,260 L1200,150 L1240,150 L1240,260 L1300,260 L1300,170 L1340,170 L1340,210 L1380,210 L1380,260 L1440,260 L1440,320 Z"
            />
            {/* Midground buildings layer (Soft Neutral Blue-Gray) */}
            <path
              fill="#64748b"
              opacity="0.3"
              d="M0,320 L0,240 L40,240 L40,190 L70,190 L70,240 L110,240 L110,170 L140,170 L140,240 L190,240 L190,150 L220,150 L220,130 L235,130 L235,150 L250,150 L250,240 L300,240 L300,200 L330,200 L330,240 L370,240 L370,160 L400,160 L400,240 L460,240 L460,180 L490,180 L490,140 L510,140 L510,180 L530,180 L530,240 L590,240 L590,190 L630,190 L630,240 L690,240 L690,160 L730,160 L730,240 L780,240 L780,180 L810,180 L810,240 L860,240 L860,150 L890,150 L890,120 L910,120 L910,150 L930,150 L930,240 L990,240 L990,190 L1030,190 L1030,240 L1090,240 L1090,170 L1130,170 L1130,240 L1180,240 L1180,180 L1220,180 L1220,240 L1280,240 L1280,200 L1320,200 L1320,240 L1380,240 L1380,210 L1440,210 L1440,320 Z"
            />
            {/* Foreground subtle building outline layer */}
            <path
              fill="#475569"
              opacity="0.2"
              d="M0,320 L0,270 L50,270 L50,220 L90,220 L90,270 L150,270 L150,210 L180,210 L180,270 L240,270 L240,230 L280,230 L280,270 L350,270 L350,190 L390,190 L390,270 L470,270 L470,220 L520,220 L520,270 L600,270 L600,200 L650,200 L650,270 L730,270 L730,230 L780,230 L780,270 L850,270 L850,190 L900,190 L900,270 L970,270 L970,220 L1020,220 L1020,270 L1100,270 L1100,200 L1150,200 L1150,270 L1230,270 L1230,240 L1290,240 L1290,270 L1360,270 L1360,230 L1440,230 L1440,320 Z"
            />
          </svg>
        </div>
      </div>

      {/* TOP HEADER SECTION */}
      <header className="relative z-20 flex w-full items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        {/* TOP LEFT: Ministry of Rural Development Logo */}
        <div className="flex items-center">
          <img
            src="/mord-logo.png"
            alt="Ministry of Rural Development - Government of India"
            className="h-10 w-auto object-contain sm:h-12 md:h-14 max-w-[160px] sm:max-w-[220px]"
          />
        </div>

        {/* TOP CENTER: Main Heading */}
        <div className="hidden text-center md:block px-4">
          <h1 className="text-base font-extrabold tracking-widest text-[#153a2a] uppercase lg:text-lg xl:text-xl drop-shadow-sm">
            {labels.headerTitle}
          </h1>
        </div>

        {/* TOP RIGHT: BhuVista Logo */}
        <div className="flex items-center justify-end">
          <img
            src="/bhuvista-logo.png"
            alt="BhuVista 3D Land Intelligence Platform"
            className="h-10 w-auto object-contain sm:h-12 md:h-14 max-w-[140px] sm:max-w-[200px]"
          />
        </div>
      </header>

      {/* MOBILE CENTER TITLE (Only visible on small screens) */}
      <div className="relative z-20 px-4 text-center md:hidden mb-1">
        <h1 className="text-xs font-extrabold tracking-wider text-[#153a2a] uppercase">
          {labels.headerTitle}
        </h1>
      </div>

      {/* MAIN CONTENT AREA — CENTERED LOGIN BOX */}
      <main className="relative z-20 flex flex-1 items-center justify-center px-4 py-3 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-xl backdrop-blur-md sm:p-7 sm:rounded-3xl">

          {/* CARD TOP ROW: Language Selector INSIDE the login box */}
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="inline-block rounded-md bg-[#e8f5e9] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#1b4332] uppercase">
                {lang === "HI" ? "सरकारी पोर्टल" : "GOVERNMENT PORTAL"}
              </span>
            </div>

            {/* Language dropdown switcher INSIDE the login box */}
            <div className="relative flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-[#1b4332]">
              <span className="text-sm">🌐</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "EN" | "HI")}
                aria-label="Select Interface Language"
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="EN">English</option>
                <option value="HI">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          {/* WELCOME HEADING */}
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-[#162a21] sm:text-2xl">
              {labels.welcome}
            </h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {labels.subWelcome}
            </p>
          </div>

          {/* ROLE SELECTOR ("Viewer" vs "Surveyor") */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              {labels.signInAs}
            </label>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setLoginRole("VIEWER");
                  setError("");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  loginRole === "VIEWER"
                    ? "bg-white text-[#1b4332] shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-[#162a21]"
                }`}
              >
                {labels.viewer}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginRole("SURVEYOR");
                  setError("");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  loginRole === "SURVEYOR"
                    ? "bg-white text-[#1b4332] shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-[#162a21]"
                }`}
              >
                {labels.surveyor}
              </button>
            </div>

            <p className="mt-1.5 text-[10px] text-slate-500">
              {loginRole === "VIEWER" ? labels.viewerNotice : labels.surveyorNotice}
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-[11px] font-semibold text-slate-700 uppercase tracking-wider"
              >
                {labels.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={labels.emailPlaceholder}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#162a21] outline-none transition placeholder:text-slate-400 focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider"
                >
                  {labels.passwordLabel}
                </label>

                <button
                  type="button"
                  className="text-[11px] font-semibold text-[#1b4332] hover:underline"
                >
                  {labels.forgotPassword}
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={labels.passwordPlaceholder}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-14 text-xs sm:text-sm text-[#162a21] outline-none transition placeholder:text-slate-400 focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-[#162a21]"
                >
                  {showPassword ? labels.hide : labels.show}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-[#1b4332] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? labels.authenticating : labels.signInBtn}
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="mt-4 text-center text-xs text-slate-600">
            {labels.noAccount}{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-bold text-[#1b4332] hover:underline cursor-pointer"
            >
              {labels.registerViewer}
            </button>
          </div>

          {/* OFFICIAL NOTICE */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <p className="text-[11px] font-bold text-[#162a21]">
                {labels.govNoticeTitle}
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                {labels.govNoticeBody}
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* BOTTOM CENTER PLATFORM VALUES SLOGAN */}
      <footer className="relative z-20 w-full py-3 px-4 text-center">
        <p className="text-xs font-semibold tracking-wider text-slate-600 uppercase sm:text-sm drop-shadow-sm">
          {labels.slogan}
        </p>
      </footer>

    </div>
  );
}
