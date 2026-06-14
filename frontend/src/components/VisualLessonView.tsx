import { useEffect, useRef, type ReactNode } from "react";
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ImageIcon from "@mui/icons-material/Image";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SchoolIcon from "@mui/icons-material/School";
import StepsIcon from "@mui/icons-material/Timeline";
import WorkIcon from "@mui/icons-material/Work";

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

type SectionProps = {
  icon: ReactNode;
  title: string;
  color: string;
  children: ReactNode;
  delay?: number;
};

function LessonSection({ icon, title, color, children, delay = 0 }: SectionProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderLeft: 4,
        borderColor: color,
        animation: "fadeSlideIn 0.5s ease forwards",
        animationDelay: `${delay}ms`,
        opacity: 0,
        "@keyframes fadeSlideIn": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" }
        }
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!chart.trim() || !containerRef.current) {
        return;
      }

      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose"
        });

        const renderId = `lesson-diagram-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(renderId, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = `<pre style="white-space:pre-wrap;font-size:12px">${chart}</pre>`;
        }
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <Box
      ref={containerRef}
      sx={{
        overflowX: "auto",
        p: 1,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.04)",
        "& svg": { maxWidth: "100%", height: "auto" }
      }}
    />
  );
}

export default function VisualLessonView({ lesson }: { lesson: VisualLesson }) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="h5" fontWeight={700}>
          {lesson.title}
        </Typography>
        <Chip icon={<SchoolIcon />} label="Visual learning mode" color="primary" size="small" />
      </Stack>

      <LessonSection icon={<LightbulbIcon color="warning" />} title="Big idea (super simple)" color="#ffb74d" delay={0}>
        <Typography variant="body1">{lesson.simpleIdea}</Typography>
      </LessonSection>

      <LessonSection icon={<AutoStoriesIcon color="secondary" />} title="Picture this in your head" color="#ce93d8" delay={100}>
        <Typography variant="body1" sx={{ lineHeight: 1.7, fontStyle: "italic" }}>
          {lesson.pictureStory}
        </Typography>
      </LessonSection>

      <LessonSection icon={<ImageIcon color="info" />} title="Visual map" color="#64b5f6" delay={200}>
        <MermaidDiagram chart={lesson.mermaidDiagram} />
      </LessonSection>

      <LessonSection icon={<StepsIcon color="success" />} title="Steps (tiny bites)" color="#81c784" delay={300}>
        <List dense component="ol" sx={{ pl: 2, listStyleType: "decimal", "& .MuiListItem-root": { display: "list-item" } }}>
          {(lesson.steps ?? []).map((step, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText primary={step} />
            </ListItem>
          ))}
        </List>
      </LessonSection>

      <LessonSection icon={<EmojiObjectsIcon color="warning" />} title="Memory trick (stick for days)" color="#ffd54f" delay={400}>
        <Typography variant="body1" fontWeight={600}>
          {lesson.memoryTrick}
        </Typography>
      </LessonSection>

      <LessonSection icon={<WorkIcon color="action" />} title="Real world" color="#90a4ae" delay={500}>
        <Typography variant="body2">{lesson.realWorldExample}</Typography>
      </LessonSection>

      <LessonSection icon={<SchoolIcon color="primary" />} title="Interview tip" color="#7986cb" delay={600}>
        <Typography variant="body2">{lesson.interviewTip}</Typography>
      </LessonSection>
    </Stack>
  );
}
