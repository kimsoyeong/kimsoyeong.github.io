import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import CosmosPage from "./components/Cosmos/CosmosPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CosmosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
