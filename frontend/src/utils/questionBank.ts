export type FollowUpQa = {
  question: string;
  answer: string;
};

export type GeneratedQuestion = {
  id?: string;
  topic?: string;
  difficulty?: string;
  experienceLevel?: string;
  questionType?: string;
  question?: string;
  expectedAnswer?: string;
  hints?: string[];
  commonMistakes?: string[];
  followUpQuestions?: FollowUpQa[] | string[] | unknown[];
  approachComparisons?: string[];
  savedAt?: string;
};

const STORAGE_KEY = "deim-question-bank";

export function loadQuestionBank(): GeneratedQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQuestionBank(questions: GeneratedQuestion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

export function appendQuestions(
  existing: GeneratedQuestion[],
  incoming: GeneratedQuestion[]
): GeneratedQuestion[] {
  const seen = new Set(existing.map(questionKey));
  const merged = [...existing];

  for (const question of incoming) {
    const key = questionKey(question);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push({
      ...question,
      savedAt: new Date().toISOString()
    });
  }

  return merged;
}

function questionKey(question: GeneratedQuestion) {
  return `${question.id ?? ""}|${question.question ?? ""}`.toLowerCase();
}

function joinList(items?: string[]) {
  return items?.length ? items.join("; ") : "";
}

export function normalizeFollowUps(items?: GeneratedQuestion["followUpQuestions"]): FollowUpQa[] {
  if (!items?.length) {
    return [];
  }

  return items.flatMap((item) => {
    if (typeof item === "string") {
      return item.trim() ? [{ question: item, answer: "" }] : [];
    }

    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      const question = String(record.question ?? record.Question ?? "").trim();
      const answer = String(record.answer ?? record.Answer ?? "").trim();
      if (question) {
        return [{ question, answer }];
      }
    }

    return [];
  });
}

function joinFollowUps(items?: GeneratedQuestion["followUpQuestions"]) {
  const normalized = normalizeFollowUps(items);
  return normalized.length
    ? normalized.map((item) => `Q: ${item.question} | A: ${item.answer}`).join("\n")
    : "";
}

export async function downloadQuestionsExcel(questions: GeneratedQuestion[]) {
  const { utils, writeFile } = await import("xlsx");

  const rows = questions.map((question, index) => ({
    "#": index + 1,
    "Saved At": question.savedAt ? new Date(question.savedAt).toLocaleString() : "",
    Topic: question.topic ?? "",
    Difficulty: question.difficulty ?? "",
    Experience: question.experienceLevel ?? "",
    "Question Type": question.questionType ?? "",
    Question: question.question ?? "",
    "Expected Answer": question.expectedAnswer ?? "",
    Hints: joinList(question.hints),
    "Common Mistakes": joinList(question.commonMistakes),
    "Follow-up Q&A": joinFollowUps(question.followUpQuestions),
    "Approach Comparisons": joinList(question.approachComparisons)
  }));

  const sheet = utils.json_to_sheet(rows);
  sheet["!cols"] = [
    { wch: 4 },
    { wch: 20 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 50 },
    { wch: 50 },
    { wch: 30 },
    { wch: 30 },
    { wch: 50 },
    { wch: 40 }
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, "Questions");
  writeFile(workbook, `interview-questions-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
