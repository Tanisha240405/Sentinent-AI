import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ChatbotWidget from './components/chatbot';
import CommandPalette from './components/CommandPalette';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <ChatbotWidget />
      <CommandPalette />
    </Router>
  );
}

export default App;
