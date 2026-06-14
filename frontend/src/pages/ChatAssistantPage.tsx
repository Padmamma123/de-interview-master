import { FormEvent, useState } from "react";
import { Alert, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { askAssistant, type ChatResponse } from "../api";
import FormattedList from "../components/FormattedList";
import VisualLessonView from "../components/VisualLessonView";

export default function ChatAssistantPage() {
  const [question, setQuestion] = useState("Explain Spark shuffle like I am in 2nd grade");
  const [topic, setTopic] = useState("Spark");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await askAssistant("demo-user", question, topic);
      setResponse(data);
    } catch {
      setError(
        "Failed to get a response. The backend may be waking up (free tier takes up to 60s). Wait a moment and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">AI Visual Learning Assistant</Typography>
      <Alert severity="info">
        Learn with stories, picture-in-your-head analogies, and flow diagrams — not just text walls.
        Have PDFs or notes? Share them and we can plug them into RAG for smarter answers.
      </Alert>
      <Paper sx={{ p: 2 }} component="form" onSubmit={onSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <TextField
            label="What do you want to understand?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            multiline
            minRows={3}
            placeholder="Example: Explain Delta Lake like I am 8 years old"
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Building visual lesson..." : "Learn Visually"}
          </Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Your lesson
        </Typography>
        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography color="text.secondary">Creating picture story and diagram...</Typography>
          </Stack>
        ) : response?.lesson ? (
          <VisualLessonView lesson={response.lesson} />
        ) : response?.answer ? (
          <FormattedList text={response.answer} />
        ) : (
          <Typography color="text.secondary">Ask a question to start a visual lesson.</Typography>
        )}
      </Paper>
    </Stack>
  );
}
