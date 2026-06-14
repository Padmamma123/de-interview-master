import { useState } from "react";
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

const topics = [
  "SQL", "Databricks", "GitHub", "Azure Data Factory", "Microsoft Fabric", "GenAI", "Vector Databases", "LangChain",
  "Azure OpenAI", "RAG", "Prompt Engineering", "DevOps", "Terraform", "Bicep", "Azure DevOps", "CI/CD",
  "Delta Lake", "Spark", "PySpark", "Lakehouse", "OneLake", "Unity Catalog", "Data Modeling", "Data Warehousing",
  "Capstone Projects", "System Design", "Certifications"
];

const difficulty = ["Easy", "Medium", "Hard", "Architect"];
const experience = ["Fresher", "2-4 Years", "5-8 Years", "8-12 Years", "12+ Years"];
const types = ["Conceptual", "Coding", "Scenario Based", "Real Time Production", "Troubleshooting", "Optimization", "Architecture", "Leadership"];

type GeneratedQuestion = {
  id?: string;
  question?: string;
  expectedAnswer?: string;
  hints?: string[];
  commonMistakes?: string[];
  followUpQuestions?: string[];
  realWorldUseCases?: string[];
  references?: string[];
  approachComparisons?: string[];
};

export default function QuestionGeneratorPage() {
  const [topic, setTopic] = useState("SQL");
  const [level, setLevel] = useState("12+ Years");
  const [diff, setDiff] = useState("Hard");
  const [qType, setQType] = useState("Real Time Production");
  const [result, setResult] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await generateQuestions({
        topic,
        difficulty: diff,
        experienceLevel: level,
        questionType: qType,
        count: 5
      });
      setResult(Array.isArray(data) ? data : []);
    } catch {
      setError(
        "Failed to generate questions. The backend may be waking up (free tier takes up to 60s). Wait a moment and try again."
      );
      setResult([]);
    } finally {
      setLoading(false);
    }
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
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
        </Box>
      </Paper>

      {loading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">Generating questions with AI...</Typography>
        </Stack>
      )}

      {!loading && result.length === 0 && (
        <Alert severity="info">Click Generate Questions to see AI-generated interview questions here.</Alert>
      )}

      {!loading && result.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Generated Questions ({result.length})
          </Typography>
          <List component="ol" sx={{ pl: 2, listStyleType: "decimal", "& > .MuiListItem-root": { display: "list-item" } }}>
            {result.map((q, idx) => (
              <ListItem key={q.id ?? idx} alignItems="flex-start" sx={{ flexDirection: "column", alignItems: "stretch", py: 2 }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {q.question || "Question unavailable"}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
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
                {idx < result.length - 1 && <Divider sx={{ mt: 2, width: "100%" }} />}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Stack>
  );
}
