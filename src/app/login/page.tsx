"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
type LoginRole = "VIEWER" | "SURVEYOR";

export default function LoginPage() {
  const router = useRouter();

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
        setError(data.error || "Login failed.");
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
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#081a12] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid lg:grid-cols-[1.15fr_0.85fr]">

        {/* LEFT — 3D GIS Visual */}
        <section className="relative hidden min-h-[720px] overflow-hidden bg-[#0f2d21] lg:block">

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
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

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

            {/* Building Illustration */}
            <div className="relative flex flex-1 items-center justify-center">

              <div className="relative mt-8 h-[360px] w-[300px]">

                {/* Ground plane */}
                <div className="absolute bottom-4 left-1/2 h-20 w-72 -translate-x-1/2 rotate-[-8deg] rounded-xl border border-emerald-400/20 bg-emerald-400/5" />

                {/* Building */}
                <div className="absolute bottom-16 left-1/2 h-[280px] w-48 -translate-x-1/2 rounded-sm border border-emerald-300/30 bg-[#1b4332]/90 shadow-[0_0_50px_rgba(45,106,79,0.2)]">

                  {/* Floors */}
                  {[0, 1, 2, 3, 4, 5].map((floor) => (
                    <div
                      key={floor}
                      className="absolute left-0 right-0 border-t border-emerald-400/25"
                      style={{
                        bottom: `${floor * 16.66}%`,
                      }}
                    >
                      <div className="absolute -left-12 -top-2 text-[9px] text-emerald-300/80">
                        F{floor + 1}
                      </div>
                    </div>
                  ))}

                  {/* Windows */}
                  <div className="grid h-full grid-cols-3 gap-3 p-5">
                    {Array.from({ length: 18 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-sm border border-amber-300/10 bg-amber-300/5"
                      />
                    ))}
                  </div>

                  {/* Vertical parcel line */}
                  <div className="absolute -right-12 top-0 h-full border-r border-dashed border-emerald-400/40" />
                </div>

                {/* Elevation marker */}
                <div className="absolute right-0 top-10 text-[10px] text-emerald-200">
                  +18.40 m
                </div>

                {/* Coordinate markers */}
                <div className="absolute bottom-0 left-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-emerald-100 backdrop-blur">
                  18.4418° N
                  <br />
                  73.8317° E
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a059]">
                Ministry of Rural Development
              </p>

              <h2 className="text-3xl font-semibold leading-tight text-white xl:text-4xl">
                Visualize property in
                <span className="text-[#52b788]"> three dimensions.</span>
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#a8c3b5]">
                Government-grade cadastral governance platform for visualizing buildings, vertical parcels, floors, and 3D land records.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT — Login */}
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
              <p className="mb-1 text-xs font-semibold text-[#1b4332] uppercase tracking-wider">
                Portal Access
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#162a21]">
                Sign in to BhuVista
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#3d5a4c]">
                Access the national 3D land intelligence & cadastral registry.
              </p>
            </div>

            {/* Login Role Toggle */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Sign in as
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f0ebe1] p-1 border border-[#e2dad0]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("VIEWER");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    loginRole === "VIEWER"
                      ? "bg-white text-[#1b4332] shadow-sm"
                      : "text-[#6b887a] hover:text-[#162a21]"
                  }`}
                >
                  Viewer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("SURVEYOR");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    loginRole === "SURVEYOR"
                      ? "bg-white text-[#1b4332] shadow-sm"
                      : "text-[#6b887a] hover:text-[#162a21]"
                  }`}
                >
                  Surveyor
                </button>
              </div>

              <p className="mt-2 text-xs text-[#6b887a]">
                {loginRole === "VIEWER"
                  ? "For registered public & agency users."
                  : "For authorized government cadastral surveyors."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#162a21]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="official@domain.gov.in"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-3 text-sm text-[#162a21] outline-none transition placeholder:text-slate-400 focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#d8f3dc]"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#162a21]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-[#1b4332] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
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

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1b4332] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2d21] focus:outline-none focus:ring-4 focus:ring-[#d8f3dc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Authenticating..." : "Sign in"}
              </button>
            </form>

            {/* Signup */}
            <div className="mt-8 text-center text-sm text-[#6b887a]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="font-semibold text-[#1b4332] hover:underline"
              >
                Register viewer account
              </button>
            </div>

            {/* Surveyor notice */}
            <div className="mt-6 border-t border-[#e2dad0] pt-6 space-y-3">
              <div className="rounded-xl bg-[#f0ebe1] px-4 py-3.5 border border-[#e2dad0]">
                <p className="text-xs font-semibold text-[#162a21]">
                  Government Surveyor & Official Credentialing
                </p>

                <p className="mt-1 text-xs leading-5 text-[#3d5a4c]">
                  Authorized surveyor and government officer accounts are issued by department administrators.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-[#6b887a]">
              BhuVista • Government of India 3D Land Intelligence Platform
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}
