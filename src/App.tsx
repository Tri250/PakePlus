import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Functions from "@/pages/Functions";
import Formula from "@/pages/Formula";
import Data from "@/pages/Data";
import Code from "@/pages/Code";
import Creative from "@/pages/Creative";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import History from "@/pages/History";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/functions" element={<Functions />} />
        <Route path="/formula" element={<Formula />} />
        <Route path="/data" element={<Data />} />
        <Route path="/code" element={<Code />} />
        <Route path="/creative" element={<Creative />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}