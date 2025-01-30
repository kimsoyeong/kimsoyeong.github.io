import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Introduction from "./components/Main/Introduction";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Introduction />} />
        {/* <Route path="/info" element={< />} />
        <Route path="/signin" element={< />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
