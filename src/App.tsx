import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SignUp from './pages/SignUp';
import LeetCodeSetup from './pages/LeetCodeSetup';
import GitHubSetup from './pages/GitHubSetup';
import ResumeSetup from './pages/ResumeSetup';
import Dashboard from './pages/Dashboard';
import InterestEngine from './pages/InterestEngine';
import DailyTasks from './pages/DailyTasks';
import JobTracker from './pages/JobTracker';
import AuraBehavioral from './pages/AuraBehavioral';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import './App.css';

function App() {


  return (
    <Router>
      <Routes>
        {/* Onboarding Flow */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/onboarding/leetcode" element={<LeetCodeSetup />} />
        <Route path="/onboarding/github" element={<GitHubSetup />} />
        <Route path="/onboarding/resume" element={<ResumeSetup />} />

        {/* Main App (post-onboarding) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interest-engine" element={<InterestEngine />} />
          <Route path="/daily-tasks" element={<DailyTasks />} />
          <Route path="/job-tracker" element={<JobTracker />} />
          <Route path="/aura" element={<AuraBehavioral />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
