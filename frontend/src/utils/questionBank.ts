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

function saveBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
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

export async function downloadQuestionsWord(questions: GeneratedQuestion[]) {
  const titleDate = new Date().toLocaleString();
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Interview Questions</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; margin: 24px; line-height: 1.45; }
    h1 { margin-bottom: 4px; }
    .meta { color: #555; margin-bottom: 16px; }
    .q { margin: 14px 0 0; font-weight: 700; }
    .label { font-weight: 700; }
    ul { margin-top: 4px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>Data Engineer Interview Questions</h1>
  <div class="meta">Generated: ${escapeHtml(titleDate)} · Total: ${questions.length}</div>
  ${questions
    .map((question, index) => {
      const labels = [question.topic, question.difficulty, question.experienceLevel, question.questionType]
        .filter(Boolean)
        .join(" · ");

      const renderList = (title: string, items?: string[]) =>
        items?.length
          ? `<div class="label">${escapeHtml(title)}</div><ul>${items
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}</ul>`
          : "";

      const followUps = normalizeFollowUps(question.followUpQuestions);
      const followUpHtml = followUps.length
        ? `<div class="label">Follow-up Q&A</div><ul>${followUps
            .map((item) => `<li><strong>Q:</strong> ${escapeHtml(item.question)}${
              item.answer ? ` <strong>A:</strong> ${escapeHtml(item.answer)}` : ""
            }</li>`)
            .join("")}</ul>`
        : "";

      return `<div class="q">${index + 1}. ${escapeHtml(question.question ?? "Question unavailable")}</div>
<div>${escapeHtml(labels)}</div>
${question.expectedAnswer ? `<div><span class="label">Expected Answer:</span> ${escapeHtml(question.expectedAnswer)}</div>` : ""}
${renderList("Hints", question.hints)}
${renderList("Common Mistakes", question.commonMistakes)}
${followUpHtml}
${renderList("Approach Comparisons", question.approachComparisons)}
<hr />`;
    })
    .join("")}
</body>
</html>`;

  const blob = new Blob([`\ufeff${html}`], { type: "application/msword;charset=utf-8" });
  saveBlob(`interview-questions-${new Date().toISOString().slice(0, 10)}.doc`, blob);
}

function escapePdfText(text: string) {
  return text
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ");
}

function wrapText(text: string, maxCharsPerLine: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine) {
      if (current) {
        lines.push(current);
      }
      current = word;
    } else {
      current = next;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.length ? lines : [""];
}

export async function downloadQuestionsPdf(questions: GeneratedQuestion[]) {
  const lines: string[] = [];
  lines.push(`Data Engineer Interview Questions (${questions.length})`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const meta = [question.topic, question.difficulty, question.experienceLevel, question.questionType]
      .filter(Boolean)
      .join(" · ");
    lines.push(`${i + 1}. ${question.question ?? "Question unavailable"}`);
    if (meta) {
      lines.push(meta);
    }
    if (question.expectedAnswer) {
      lines.push(`Expected Answer: ${question.expectedAnswer}`);
    }
    if (question.hints?.length) {
      lines.push(`Hints: ${question.hints.join("; ")}`);
    }
    if (question.commonMistakes?.length) {
      lines.push(`Common Mistakes: ${question.commonMistakes.join("; ")}`);
    }
    const followUps = normalizeFollowUps(question.followUpQuestions);
    if (followUps.length) {
      lines.push(
        `Follow-up Q&A: ${followUps
          .map((item) => `Q: ${item.question}${item.answer ? ` | A: ${item.answer}` : ""}`)
          .join("; ")}`
      );
    }
    if (question.approachComparisons?.length) {
      lines.push(`Approach Comparisons: ${question.approachComparisons.join("; ")}`);
    }
    lines.push("");
  }

  const wrapped = lines.flatMap((line) => wrapText(line, 95));
  const maxLinesPerPage = 50;
  const pageChunks: string[][] = [];
  for (let i = 0; i < wrapped.length; i += maxLinesPerPage) {
    pageChunks.push(wrapped.slice(i, i + maxLinesPerPage));
  }

  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const fontObj = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageObjectIds: number[] = [];

  for (const pageLines of pageChunks) {
    const rebuilt: string[] = ["BT", "/F1 10 Tf", "40 800 Td", "14 TL"];
    pageLines.forEach((line, idx) => {
      if (idx > 0) {
        rebuilt.push("T*");
      }
      rebuilt.push(`(${escapePdfText(line.replace(/[^\x20-\x7E]/g, "?"))}) Tj`);
    });
    rebuilt.push("ET");
    const stream = rebuilt.join("\n");
    const contentObj = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageObj = addObject(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObj} 0 R >>`
    );
    pageObjectIds.push(pageObj);
  }

  const pagesObj = addObject(
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`
  );
  const catalogObj = addObject(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  objects.forEach((content, idx) => {
    if (pageObjectIds.includes(idx + 1)) {
      objects[idx] = content.replace("/Parent 0 0 R", `/Parent ${pagesObj} 0 R`);
    }
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  saveBlob(`interview-questions-${new Date().toISOString().slice(0, 10)}.pdf`, blob);
}
