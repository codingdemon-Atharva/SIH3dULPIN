"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create account.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#081a12] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1b4332] text-white text-xl font-bold mb-3 shadow-lg border border-[#2d6a4f]">
            BV
          </div>

          <h1 className="text-3xl font-bold text-white tracking-wide">
            BhuVista
          </h1>

          <p className="text-[11px] font-semibold text-[#b7e4c7] mt-1 tracking-wider uppercase">
            3D Land Intelligence Platform
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#fdfbf7] rounded-2xl shadow-2xl p-8 border border-[#e2dad0]">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#162a21]">
              Create Public Account
            </h2>

            <p className="text-[#3d5a4c] text-sm mt-1">
              Register to access 3D cadastral maps and land records on BhuVista
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#162a21] mb-1.5"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-2.5 text-[#162a21] outline-none transition focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#d8f3dc]"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#162a21] mb-1.5"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-2.5 text-[#162a21] outline-none transition focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#d8f3dc]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#162a21] mb-1.5"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                required
                minLength={8}
                className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-2.5 text-[#162a21] outline-none transition focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#d8f3dc]"
              />

              <p className="text-xs text-[#6b887a] mt-1.5">
                Password must be at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#162a21] mb-1.5"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-2.5 text-[#162a21] outline-none transition focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#d8f3dc]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#1b4332] px-4 py-3 font-semibold text-white transition hover:bg-[#0f2d21] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register Account"}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-[#6b887a] mt-6">
            Already registered?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-semibold text-[#1b4332] hover:underline"
            >
              Sign in
            </button>
          </p>

          {/* Surveyor information */}
          <div className="mt-6 pt-6 border-t border-[#e2dad0]">
            <p className="text-xs text-center text-[#6b887a]">
              Cadastral surveyor credentials are managed directly by government department administrators.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
