import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import CosmosPage from "./components/Cosmos/CosmosPage";
const DailyReport = lazy(() => import("./pages/DailyReport"));

function Home() {
  const navigate = useNavigate();
  return <CosmosPage onDailyNavigate={() => navigate("/daily")} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<Suspense fallback={<p role="status">리포트 불러오는 중…</p>}><DailyReport /></Suspense>} />
        <Route path="/daily/:date" element={<Suspense fallback={<p role="status">리포트 불러오는 중…</p>}><DailyReport /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
