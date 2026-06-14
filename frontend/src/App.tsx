import { useMemo, useState } from "react";
import { Route, Routes, Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  createTheme,
  ThemeProvider
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import DashboardPage from "./pages/DashboardPage";
import QuestionGeneratorPage from "./pages/QuestionGeneratorPage";
import ChatAssistantPage from "./pages/ChatAssistantPage";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? "dark" : "light" },
        shape: { borderRadius: 12 }
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Data Engineer Interview Master
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/questions">
            Questions
          </Button>
          <Button color="inherit" component={Link} to="/assistant">
            AI Assistant
          </Button>
          <IconButton color="inherit" onClick={() => setDarkMode((d) => !d)}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Box>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/questions" element={<QuestionGeneratorPage />} />
            <Route path="/assistant" element={<ChatAssistantPage />} />
          </Routes>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

