"use client";

import React, { useEffect, useState, useCallback } from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import { SessionUser } from "@/src/lib/auth";
import { translations, type Language } from "@/src/lib/translations";
import { useRouter } from "next/navigation";

export default function GovernmentSettingsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("EN");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    verificationAlerts: true,
    submissionUpdates: true,
    qualityValidationAlerts: true,
  });

  // Load User Profile
  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Preferences on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("bhuvista_lang") as Language;
      if (savedLang === "EN" || savedLang === "HI") {
        setLang(savedLang);
      }

      const savedNotifs = localStorage.getItem("bhuvista_notif_prefs");
      if (savedNotifs) {
        try {
          setNotifPrefs(JSON.parse(savedNotifs));
        } catch {
          // Fallback to default
        }
      }
    }
    loadUser();
  }, [loadUser]);

  // Handle Save
  const handleSave = () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("bhuvista_lang", lang);
        localStorage.setItem("bhuvista_notif_prefs", JSON.stringify(notifPrefs));
        window.dispatchEvent(new Event("storage"));
      }

      setTimeout(() => {
        setSaving(false);
        setSaveMessage({
          type: "success",
          text: translations[lang].settingsSavedSuccess,
        });

        // Clear toast after 4 seconds
        setTimeout(() => setSaveMessage(null), 4000);
      }, 400);
    } catch {
      setSaving(false);
      setSaveMessage({
        type: "error",
        text: translations[lang].settingsSaveError,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const t = translations[lang];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto font-sans text-[#162a21]">
      {/* PAGE HEADER */}
      <GovernmentPageHeader
        title={t.settingsTitle}
        description={t.settingsDesc}
      />

      {/* TOAST MESSAGE */}
      {saveMessage && (
        <div
          className={`rounded-2xl p-4 text-xs font-bold flex items-center justify-between shadow-sm transition ${
            saveMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{saveMessage.type === "success" ? "✓" : "⚠️"}</span>
            <span>{saveMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveMessage(null)}
            className="text-xs hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-12 text-center shadow-sm">
          <div className="inline-flex items-center gap-3 rounded-full bg-[#2d6a4f]/10 px-5 py-2 text-xs font-bold text-[#2d6a4f]">
            <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
            {t.loading}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: AUTHENTICATED USER PROFILE */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-[#e2dad0]/60 pb-3">
              <h2 className="text-base font-extrabold text-[#162a21]">
                {t.profileSectionTitle}
              </h2>
              <p className="text-xs text-[#6b887a] mt-0.5">
                {t.profileSectionDesc}
              </p>
            </div>

            {user && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1b4332] text-xl font-black text-white shadow-sm shrink-0">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-[#6b887a] uppercase">{t.fullName}</span>
                    <span className="font-bold text-sm text-[#162a21]">{user.name}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-[#6b887a] uppercase">{t.emailAddress}</span>
                    <span className="font-bold text-sm text-[#162a21]">{user.email}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-[#6b887a] uppercase">{t.userRole}</span>
                    <span className="inline-block mt-0.5 rounded bg-[#2d6a4f]/10 px-2.5 py-0.5 text-xs font-extrabold text-[#2d6a4f]">
                      {user.role}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-[#6b887a] uppercase">{t.userId}</span>
                    <span className="font-mono text-xs font-semibold text-[#6b887a]">{user.id}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: LANGUAGE & LOCALIZATION */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-[#e2dad0]/60 pb-3">
              <h2 className="text-base font-extrabold text-[#162a21]">
                {t.languagePreferencesTitle}
              </h2>
              <p className="text-xs text-[#6b887a] mt-0.5">
                {t.languagePreferencesDesc}
              </p>
            </div>

            <div className="space-y-2 max-w-sm">
              <label className="block text-xs font-bold text-[#162a21]">
                {t.selectLanguage}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLang("EN")}
                  className={`rounded-xl border p-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    lang === "EN"
                      ? "border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f] ring-1 ring-[#2d6a4f]"
                      : "border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#f3efe6]"
                  }`}
                >
                  <span>🌐</span>
                  <span>{t.english}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLang("HI")}
                  className={`rounded-xl border p-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    lang === "HI"
                      ? "border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f] ring-1 ring-[#2d6a4f]"
                      : "border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#f3efe6]"
                  }`}
                >
                  <span>🌐</span>
                  <span>{t.hindi}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: NOTIFICATION PREFERENCES */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-[#e2dad0]/60 pb-3">
              <h2 className="text-base font-extrabold text-[#162a21]">
                {t.notificationPreferencesTitle}
              </h2>
              <p className="text-xs text-[#6b887a] mt-0.5">
                {t.notificationPreferencesDesc}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] hover:bg-[#f8f5ee] transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.verificationAlerts}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, verificationAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#e2dad0] text-[#2d6a4f] focus:ring-[#2d6a4f] cursor-pointer"
                />
                <span className="font-semibold text-[#162a21]">
                  {t.optVerificationQueueAlerts}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] hover:bg-[#f8f5ee] transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.submissionUpdates}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, submissionUpdates: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#e2dad0] text-[#2d6a4f] focus:ring-[#2d6a4f] cursor-pointer"
                />
                <span className="font-semibold text-[#162a21]">
                  {t.optSubmissionStatusAlerts}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] hover:bg-[#f8f5ee] transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.qualityValidationAlerts}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, qualityValidationAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#e2dad0] text-[#2d6a4f] focus:ring-[#2d6a4f] cursor-pointer"
                />
                <span className="font-semibold text-[#162a21]">
                  {t.optQualityValidationAlerts}
                </span>
              </label>
            </div>
          </div>

          {/* SECTION 4: ACCOUNT & SECURITY */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-[#e2dad0]/60 pb-3">
              <h2 className="text-base font-extrabold text-[#162a21]">
                {t.accountSecurityTitle}
              </h2>
              <p className="text-xs text-[#6b887a] mt-0.5">
                {t.accountSecurityDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-3.5 space-y-1">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase">{t.sessionStatus}</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-bold text-[#2d6a4f]">{t.sessionActive}</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-3.5 space-y-1">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Security Level</span>
                <span className="font-bold text-[#162a21]">{t.authBoundary}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
              >
                {t.signOut}
              </button>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-[#2d6a4f] px-6 py-3 text-xs font-bold text-white hover:bg-[#1b4332] disabled:opacity-50 transition shadow-sm cursor-pointer"
            >
              {saving ? t.savingSettings : t.saveSettings}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
