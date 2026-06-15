import axios from "axios";

function normalizeBackendHost(rawHost?: string) {
  const host = (rawHost || "deim-backend.onrender.com").trim();
  if (host.includes(".")) {
    return host;
  }
  return `${host}.onrender.com`;
}

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.includes(".onrender.com")) {
    return configured;
  }

  const backendHost = normalizeBackendHost(import.meta.env.BACKEND_HOST as string | undefined);
  if (import.meta.env.BACKEND_HOST || import.meta.env.PROD) {
    return `https://${backendHost}/api`;
  }

  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
    return "https://deim-backend.onrender.com/api";
  }

  return configured ?? "http://localhost:8080/api";
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 300000
});

export type GenerateRequest = {
  topic: string;
  difficulty: string;
  experienceLevel: string;
  questionType: string;
  count: number;
};

export const generateQuestions = (payload: GenerateRequest) =>
  api.post("/questions/generate", payload).then((r) => r.data);

export type VisualLesson = {
  title: string;
  simpleIdea: string;
  pictureStory: string;
  mermaidDiagram: string;
  steps: string[];
  memoryTrick: string;
  realWorldExample: string;
  interviewTip: string;
};

export type ChatResponse = {
  answer: string;
  sources: string[];
  lesson?: VisualLesson | null;
};

export const askAssistant = (userId: string, question: string, topic: string) =>
  api.post<ChatResponse>("/chat", { userId, question, topic }).then((r) => r.data);

export const getDashboard = () => api.get("/analytics/dashboard").then((r) => r.data);

