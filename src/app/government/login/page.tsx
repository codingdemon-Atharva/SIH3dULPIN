"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserRoleType } from "@/src/lib/auth";

type GovernmentLoginRole = "GOVERNMENT_OFFICER" | "GOVERNMENT_ADMIN";

function GovernmentLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginRole, setLoginRole] =
    useState<GovernmentLoginRole>("GOVERNMENT_ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    searchParams?.get("error") === "unauthorized"
      ? "Government authorization required to access this portal."
      : ""
  );
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
        setError(data.error || "Government authentication failed.");
        return;
      }

      router.push("/government/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to government authentication server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#081a12] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT — Government Portal Visual */}
        <section className="relative hidden min-h-[720px] overflow-hidden bg-[#0a2318] lg:block">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          {/* Glow */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2d6a4f] text-sm font-bold text-white shadow-md">
                  BV
                </div>

                <div>
                  <p className="text-xl font-bold tracking-wide text-white">
                    BhuVista
                  </p>
                  <p className="text-[11px] font-semibold tracking-wider text-[#b7e4c7]">
                    3D LAND INTELLIGENCE PLATFORM
                  </p>
                </div>
              </div>
            </div>

            {/* Emblem / Shield Graphic */}
            <div className="relative flex flex-1 items-center justify-center">
              <div className="relative flex flex-col items-center justify-center rounded-2xl border border-amber-400/30 bg-[#163a2b]/80 p-8 shadow-2xl backdrop-blur-md max-w-sm text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2d6a4f] text-3xl shadow-lg border border-emerald-300/30">
                  🏛️
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-white">
                  Government Portal Access
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#b7e4c7]">
                  National Cadastral Governance & High-Precision 3D Land Record Management System
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-300 border border-amber-400/20">
                  🔒 Restricted Official Domain
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
                Ministry of Rural Development
              </p>

              <h2 className="text-3xl font-semibold leading-tight text-white xl:text-4xl">
                Government Cadastral
                <span className="text-[#52b788]"> Governance Portal.</span>
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#a8c3b5]">
                Secure administrative entry point for department administrators, land officers, and cadastral authorities.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT — Government Login Form */}
        <section className="flex min-h-[720px] items-center justify-center bg-[#fdfbf7] px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1b4332] text-sm font-bold text-white">
                  BV
                </div>

                <div>
                  <p className="font-bold text-[#162a21]">BhuVista</p>
                  <p className="text-[10px] font-semibold text-[#52b788]">
                    3D LAND INTELLIGENCE PLATFORM
                  </p>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-1 text-xs font-extrabold text-[#2d6a4f] uppercase tracking-wider flex items-center gap-1.5">
                <span>🏛️</span> Official Governance Portal
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#162a21]">
                Government Sign In
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#3d5a4c]">
                Sign in with authorized government official credentials.
              </p>
            </div>

            {/* Role Toggle */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Official Authorization Level
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f0ebe1] p-1 border border-[#e2dad0]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("GOVERNMENT_ADMIN");
                    setError("");
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    loginRole === "GOVERNMENT_ADMIN"
                      ? "bg-[#1b4332] text-white shadow-sm"
                      : "text-[#6b887a] hover:text-[#162a21]"
                  }`}
                >
                  Gov Administrator
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("GOVERNMENT_OFFICER");
                    setError("");
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    loginRole === "GOVERNMENT_OFFICER"
                      ? "bg-[#1b4332] text-white shadow-sm"
                      : "text-[#6b887a] hover:text-[#162a21]"
                  }`}
                >
                  Gov Officer
                </button>
              </div>

              <p className="mt-2 text-xs text-[#6b887a]">
                {loginRole === "GOVERNMENT_ADMIN"
                  ? "Full administrative access to national cadastral settings."
                  : "Authorized government officer portal for land records."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="gov-email"
                  className="mb-2 block text-sm font-medium text-[#162a21]"
                >
                  Government Official Email
                </label>

                <input
                  id="gov-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="gov.admin@ulpin.gov"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-3 text-sm text-[#162a21] outline-none transition placeholder:text-slate-400 focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#d8f3dc]"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="gov-password"
                    className="block text-sm font-medium text-[#162a21]"
                  >
                    Official Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="gov-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter official password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-3 pr-20 text-sm text-[#162a21] outline-none transition placeholder:text-slate-400 focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#d8f3dc]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6b887a] hover:text-[#162a21]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1b4332] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2d21] focus:outline-none focus:ring-4 focus:ring-[#d8f3dc] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Authenticating Official..." : "Sign In to Government Portal"}
              </button>
            </form>

            {/* Back to Public Portal */}
            <div className="mt-8 text-center text-sm text-[#6b887a]">
              Public citizen or surveyor?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1b4332] hover:underline"
              >
                Go to Public Sign In
              </Link>
            </div>

            {/* Footer Notice */}
            <div className="mt-6 border-t border-[#e2dad0] pt-6 text-center">
              <p className="text-[11px] text-[#6b887a]">
                BhuVista • Government of India 3D Land Intelligence Platform
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function GovernmentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#081a12] text-white text-xs font-bold">
          Loading Government Portal...
        </div>
      }
    >
      <GovernmentLoginFormContent />
    </Suspense>
  );
}
