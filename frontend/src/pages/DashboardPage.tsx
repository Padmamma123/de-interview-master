import { useEffect, useState } from "react";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import { getDashboard } from "../api";

type DashboardData = {
  questionsSolved: number;
  topicsCovered: number;
  weakAreas: string[];
  strongAreas: string[];
  studyStreak: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch(() => setData(null));
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Interview Analytics Dashboard</Typography>
      {!data && <Typography>Unable to load analytics.</Typography>}
      {data && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Questions Solved</Typography>
              <Typography variant="h3">{data.questionsSolved}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Topics Covered</Typography>
              <Typography variant="h3">{data.topicsCovered}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Study Streak</Typography>
              <Typography variant="h3">{data.studyStreak} days</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Weak Areas</Typography>
              <Typography>{data.weakAreas.join(", ")}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Strong Areas</Typography>
              <Typography>{data.strongAreas.join(", ")}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}

