import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  timeout: 120000
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

export const askAssistant = (userId: string, question: string, topic: string) =>
  api.post("/chat", { userId, question, topic }).then((r) => r.data);

export const getDashboard = () => api.get("/analytics/dashboard").then((r) => r.data);

