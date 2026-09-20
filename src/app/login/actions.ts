"use server";

import { loginSurveyor } from "@/src/lib/auth";

export async function surveyorLogin(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  return loginSurveyor(email, password);
}