/**
 * KisanAI API client — communicates with FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getToken = () => typeof window !== "undefined" ? localStorage.getItem("kisan_token") : null;
export const setToken = (token: string) => typeof window !== "undefined" && localStorage.setItem("kisan_token", token);
export const removeToken = () => typeof window !== "undefined" && localStorage.removeItem("kisan_token");

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Detection {
  disease: string;
  disease_key: string;
  crop: string;
  confidence: number;
  is_healthy: boolean;
  severity: string;
}

export interface Prediction {
  class_key: string;
  disease: string;
  crop: string;
  confidence: number;
  is_healthy: boolean;
}

export interface Recommendation {
  text: string;
  source: string;
  treatment_data: {
    chemical?: string;
    organic?: string;
    prevention?: string;
    urgency?: string;
    description_en?: string;
    description_hi?: string;
  };
}

export interface DetectResponse {
  id: string;
  detection: Detection;
  predictions: Prediction[];
  recommendation: Recommendation;
  model_version: string;
}

export interface HistoryItem {
  id: string;
  crop_type: string;
  disease_name: string;
  confidence: number;
  severity: string;
  created_at: string;
}

/**
 * Upload image for disease detection.
 */
export async function detectDisease(
  file: File,
  cropType: string = "",
  language: string = "en"
): Promise<DetectResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("crop_type", cropType);
  formData.append("language", language);

  const res = await fetch(`${API_BASE}/api/detect`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Detection failed" }));
    throw new Error(err.detail || "Detection failed");
  }

  return res.json();
}

/**
 * Get recommendation for a known disease.
 */
export async function getRecommendation(
  diseaseKey: string,
  language: string = "en",
  provider: string = "auto"
): Promise<{ recommendation: string; source: string }> {
  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      disease_key: diseaseKey,
      language,
      provider,
    }),
  });

  if (!res.ok) throw new Error("Failed to get recommendation");
  return res.json();
}

/**
 * Get detection history.
 */
export async function getHistory(
  limit = 20,
  offset = 0,
  crop?: string
): Promise<{ detections: HistoryItem[]; count: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (crop) params.set("crop", crop);

  const res = await fetch(`${API_BASE}/api/history?${params}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

/**
 * Get single detection detail.
 */
export async function getDetection(id: string) {
  const res = await fetch(`${API_BASE}/api/history/${id}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error("Detection not found");
  return res.json();
}

/**
 * Health check.
 */
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

/**
 * Authentication
 */
export async function registerUser(data: Record<string, string>) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function loginUser(data: Record<string, string>) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

/**
 * Advanced Vision Analysis (Grok/Gemini)
 */
export async function detectVision(file: File, cropType: string = "") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("crop_type", cropType);

  const res = await fetch(`${API_BASE}/api/detect/vision`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });

  if (!res.ok) throw new Error("Vision analysis failed");
  return res.json();
}

/**
 * Re-analyze a stored detection using Vision AI (Gemini/Grok).
 */
export async function reanalyzeDetection(detectionId: string): Promise<{ analysis: string; source: string }> {
  const res = await fetch(`${API_BASE}/api/history/${detectionId}/reanalyze`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Re-analysis failed" }));
    throw new Error(err.detail || "Re-analysis failed");
  }
  return res.json();
}
