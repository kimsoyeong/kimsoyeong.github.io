import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainPage from "./components/Main/MainPage";
import FreeformPage from "./components/Freeform/FreeformPage";
import FreeformPost from "./components/Freeform/FreeformPost";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/freeform" element={<FreeformPage />} />
        <Route path="/freeform/:slug" element={<FreeformPost />} />
      </Routes>
    </Router>
  );
}

export default App;
