import { FormEvent, useState } from "react";
import { Alert, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { askAssistant } from "../api";
import FormattedList from "../components/FormattedList";

export default function ChatAssistantPage() {
  const [question, setQuestion] = useState("Generate 5 SQL interview questions for senior data engineers");
  const [topic, setTopic] = useState("SQL");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await askAssistant("demo-user", question, topic);
      setAnswer(response.answer);
    } catch {
      setError("Failed to get a response. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">AI Chat Assistant</Typography>
      <Paper sx={{ p: 2 }} component="form" onSubmit={onSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <TextField
            label="Ask anything"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            multiline
            minRows={3}
            placeholder="Example: Generate 5 hard SQL interview questions as a numbered list"
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Generating..." : "Ask Assistant"}
          </Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Assistant Response
        </Typography>
        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography color="text.secondary">Generating response...</Typography>
          </Stack>
        ) : (
          <FormattedList text={answer} />
        )}
      </Paper>
    </Stack>
  );
}
