import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Landing from "@/pages/Landing";
import QuizPage from "@/pages/QuizPage";
import ResultsPage from "@/pages/ResultsPage";
import ReportPage from "@/pages/ReportPage";
import RecoverPage from "@/pages/RecoverPage";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results/:sessionId" element={<ResultsPage />} />
          <Route path="/report/:sessionId" element={<ReportPage />} />
          <Route path="/recover" element={<RecoverPage />} />
        </Routes>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
