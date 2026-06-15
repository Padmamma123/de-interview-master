import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { normalizeFollowUps, type GeneratedQuestion } from "../utils/questionBank";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "unordered"; items: string[] }
  | { type: "ordered"; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let unordered: string[] = [];
  let ordered: string[] = [];

  const flushParagraph = () => {
    const content = paragraph.join(" ").trim();
    if (content) {
      blocks.push({ type: "paragraph", text: content });
    }
    paragraph = [];
  };

  const flushUnordered = () => {
    if (unordered.length > 0) {
      blocks.push({ type: "unordered", items: [...unordered] });
      unordered = [];
    }
  };

  const flushOrdered = () => {
    if (ordered.length > 0) {
      blocks.push({ type: "ordered", items: [...ordered] });
      ordered = [];
    }
  };

  const flushLists = () => {
    flushUnordered();
    flushOrdered();
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushLists();
      flushParagraph();
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);

    if (bulletMatch) {
      flushParagraph();
      flushOrdered();
      unordered.push(bulletMatch[1]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      flushUnordered();
      ordered.push(orderedMatch[1]);
      continue;
    }

    flushLists();
    paragraph.push(trimmed);
  }

  flushLists();
  flushParagraph();
  return blocks;
}

type FormattedListProps = {
  text: string;
  emptyLabel?: string;
};

export default function FormattedList({ text, emptyLabel = "No response yet." }: FormattedListProps) {
  if (!text.trim()) {
    return <Typography color="text.secondary">{emptyLabel}</Typography>;
  }

  const blocks = parseBlocks(text);

  return (
    <Box>
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <Typography key={index} sx={{ mb: 1.5 }}>
              {block.text}
            </Typography>
          );
        }

        const ListTag = block.type === "ordered" ? "ol" : "ul";
        return (
          <List
            key={index}
            component={ListTag}
            dense
            sx={{
              mb: 1.5,
              pl: 2,
              listStyleType: block.type === "ordered" ? "decimal" : "disc",
              "& .MuiListItem-root": { display: "list-item", py: 0.25 }
            }}
          >
            {block.items.map((item, itemIndex) => (
              <ListItem key={itemIndex} disablePadding>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        );
      })}
    </Box>
  );
}

function toDisplayString(item: unknown): string {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const question = String(record.question ?? record.Question ?? "").trim();
    const answer = String(record.answer ?? record.Answer ?? "").trim();
    if (question && answer) {
      return `${question} — ${answer}`;
    }
    if (question) {
      return question;
    }
  }

  return "";
}

export function StringList({ title, items }: { title: string; items?: unknown[] }) {
  const strings = (items ?? []).map(toDisplayString).filter(Boolean);
  if (!strings.length) {
    return null;
  }

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <List dense component="ul" sx={{ pl: 2, listStyleType: "disc", "& .MuiListItem-root": { display: "list-item", py: 0.25 } }}>
        {strings.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export function FollowUpList({ items }: { items?: GeneratedQuestion["followUpQuestions"] }) {
  const followUps = normalizeFollowUps(items);
  if (!followUps.length) {
    return null;
  }

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2" gutterBottom>
        Follow-up Questions & Answers
      </Typography>
      <List dense component="ol" sx={{ pl: 2, listStyleType: "decimal", "& .MuiListItem-root": { display: "list-item", py: 0.5 } }}>
        {followUps.map((item, index) => (
          <ListItem key={index} disablePadding alignItems="flex-start" sx={{ flexDirection: "column", alignItems: "stretch" }}>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={600}>
                  {item.question}
                </Typography>
              }
              secondary={
                item.answer ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Answer:</strong> {item.answer}
                  </Typography>
                ) : null
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
