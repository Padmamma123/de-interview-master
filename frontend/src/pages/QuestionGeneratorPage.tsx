import { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { generateQuestions } from "../api";
import { StringList } from "../components/FormattedList";
import {
  appendQuestions,
  downloadQuestionsExcel,
  loadQuestionBank,
  saveQuestionBank,
  type GeneratedQuestion
} from "../utils/questionBank";

const topics = [
  "SQL", "Python", "Data Modeling", "Data Warehousing",
  "Spark", "PySpark", "Databricks", "Delta Lake", "Unity Catalog", "Lakehouse",
  "Structured Streaming", "Kafka", "CDC", "Airflow", "dbt", "Data Quality", "Data Observability",
  "Azure Data Factory", "Azure Synapse", "Microsoft Fabric", "OneLake", "Event Hubs", "Azure OpenAI",
  "CI/CD", "GitHub", "DevOps", "Terraform", "Bicep", "Cost Optimization", "Data Governance",
  "RAG", "Vector Databases", "LangChain", "Prompt Engineering",
  "Apache Iceberg", "Apache Hudi", "System Design", "Capstone Projects", "Certifications"
];

const difficulty = ["Easy", "Medium", "Hard", "Architect"];
const experience = ["Fresher", "2-4 Years", "5-8 Years", "8-12 Years", "12+ Years"];
const types = ["Conceptual", "Coding", "Scenario Based", "Real Time Production", "Troubleshooting", "Optimization", "Architecture", "Leadership"];
const counts = [5, 10, 15, 20];
const MAX_COUNT = 20;

export default function QuestionGeneratorPage() {
  const [topic, setTopic] = useState("SQL");
  const [level, setLevel] = useState("12+ Years");
  const [diff, setDiff] = useState("Hard");
  const [qType, setQType] = useState("Real Time Production");
  const [count, setCount] = useState(MAX_COUNT);
  const [allQuestions, setAllQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAllQuestions(loadQuestionBank());
  }, []);

  useEffect(() => {
    saveQuestionBank(allQuestions);
  }, [allQuestions]);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await generateQuestions({
        topic,
        difficulty: diff,
        experienceLevel: level,
        questionType: qType,
        count
      });
      const incoming = Array.isArray(data) ? data : [];
      setAllQuestions((current) => appendQuestions(current, incoming));
    } catch {
      setError(
        "Failed to generate questions. The backend may be waking up (free tier takes up to 60s). Wait a moment and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (allQuestions.length === 0) {
      return;
    }
    await downloadQuestionsExcel(allQuestions);
  };

  const handleClear = () => {
    setAllQuestions([]);
    saveQuestionBank([]);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Dynamic Question Engine</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {topics.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Experience" value={level} onChange={(e) => setLevel(e.target.value)}>
              {experience.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Difficulty" value={diff} onChange={(e) => setDiff(e.target.value)}>
              {difficulty.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Question Type" value={qType} onChange={(e) => setQType(e.target.value)}>
              {types.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Number of Questions"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {counts.map((x) => (
                <MenuItem key={x} value={x}>
                  {x === MAX_COUNT ? `${x} (Maximum)` : x}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={allQuestions.length === 0 || loading}
          >
            Download Excel ({allQuestions.length})
          </Button>
          <Button
            variant="text"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleClear}
            disabled={allQuestions.length === 0 || loading}
          >
            Clear All
          </Button>
        </Stack>
      </Paper>

      {loading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">
            Generating {count} question{count > 1 ? "s" : ""} with AI... (larger batches can take up to a minute)
          </Typography>
        </Stack>
      )}

      {!loading && allQuestions.length === 0 && (
        <Alert severity="info">
          Click Generate Questions to build your question bank. Every new batch is saved here and included in the Excel download.
        </Alert>
      )}

      {!loading && allQuestions.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Question Bank ({allQuestions.length} total)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            New questions are added each time you click Generate. Download the full list anytime as an Excel file.
          </Typography>
          <List component="ol" sx={{ pl: 2, listStyleType: "decimal", "& > .MuiListItem-root": { display: "list-item" } }}>
            {[...allQuestions].reverse().map((q, idx) => (
              <ListItem key={`${q.id ?? q.question}-${idx}`} alignItems="flex-start" sx={{ flexDirection: "column", alignItems: "stretch", py: 2 }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {q.question || "Question unavailable"}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        {[q.topic, q.difficulty, q.experienceLevel, q.questionType].filter(Boolean).join(" · ")}
                        {q.savedAt ? ` · Saved ${new Date(q.savedAt).toLocaleString()}` : ""}
                      </Typography>
                      {q.expectedAnswer && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Expected Answer:</strong> {q.expectedAnswer}
                        </Typography>
                      )}
                      <StringList title="Hints" items={q.hints} />
                      <StringList title="Common Mistakes" items={q.commonMistakes} />
                      <StringList title="Follow-up Questions" items={q.followUpQuestions} />
                      <StringList title="Real-world Use Cases" items={q.realWorldUseCases} />
                      <StringList title="References" items={q.references} />
                      <StringList title="Approach Comparisons" items={q.approachComparisons} />
                    </Box>
                  }
                />
                {idx < allQuestions.length - 1 && <Divider sx={{ mt: 2, width: "100%" }} />}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Stack>
  );
}
