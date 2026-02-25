// ─── Mock Data for Ready360 ───

export const mockUser = {
  name: 'Arjun Mehta',
  email: 'arjun.mehta@college.edu',
  college: 'VIT Vellore',
  year: '3rd Year',
  branch: 'Computer Science',
  avatar: '',
  level: 12,
  xp: 2840,
  xpToNext: 3500,
  streak: 14,
  totalBadges: 8,
  joinedDate: '2025-12-01',
};

// ─── LeetCode Mock ───
export const mockLeetCode = {
  username: 'arjun_mehta',
  totalSolved: 247,
  easy: 102,
  medium: 118,
  hard: 27,
  ranking: 89432,
  contestRating: 1687,
  contestsAttended: 12,
  streak: 23,
  topicBreakdown: [
    { topic: 'Arrays', solved: 45, total: 60, proficiency: 85 },
    { topic: 'Strings', solved: 32, total: 45, proficiency: 78 },
    { topic: 'Dynamic Programming', solved: 28, total: 50, proficiency: 62 },
    { topic: 'Trees', solved: 22, total: 35, proficiency: 70 },
    { topic: 'Graphs', solved: 18, total: 40, proficiency: 50 },
    { topic: 'Linked Lists', solved: 20, total: 25, proficiency: 88 },
    { topic: 'Binary Search', solved: 15, total: 20, proficiency: 82 },
    { topic: 'Stack/Queue', solved: 18, total: 22, proficiency: 90 },
    { topic: 'Backtracking', solved: 12, total: 25, proficiency: 55 },
    { topic: 'Greedy', solved: 22, total: 30, proficiency: 80 },
    { topic: 'Math', solved: 15, total: 20, proficiency: 75 },
  ],
  recentActivity: [
    { date: '2026-02-25', count: 3 },
    { date: '2026-02-24', count: 5 },
    { date: '2026-02-23', count: 2 },
    { date: '2026-02-22', count: 4 },
    { date: '2026-02-21', count: 1 },
    { date: '2026-02-20', count: 3 },
    { date: '2026-02-19', count: 6 },
    { date: '2026-02-18', count: 2 },
    { date: '2026-02-17', count: 4 },
    { date: '2026-02-16', count: 3 },
    { date: '2026-02-15', count: 5 },
    { date: '2026-02-14', count: 1 },
    { date: '2026-02-13', count: 0 },
    { date: '2026-02-12', count: 3 },
  ],
  difficultyTrend: [
    { month: 'Sep', easy: 8, medium: 5, hard: 1 },
    { month: 'Oct', easy: 12, medium: 10, hard: 2 },
    { month: 'Nov', easy: 15, medium: 14, hard: 3 },
    { month: 'Dec', easy: 18, medium: 20, hard: 5 },
    { month: 'Jan', easy: 22, medium: 30, hard: 7 },
    { month: 'Feb', easy: 27, medium: 39, hard: 9 },
  ],
  strengths: [
    'Strong foundation in data structures (Arrays, Linked Lists, Stack/Queue)',
    'Good problem-solving speed – averaging 85th percentile in contests',
    'Consistent daily practice with a 23-day streak',
    'Above-average medium difficulty completion rate',
  ],
  weaknesses: [
    'Graph algorithms need significant improvement (50% proficiency)',
    'Backtracking techniques are below par – practice more DFS-based problems',
    'Hard problems ratio is low (11%) – aim for 20%+ for top companies',
    'Dynamic Programming needs structured practice – currently 62%',
  ],
  summary: `Based on your LeetCode profile, you have a solid foundation in fundamental data structures with 247 problems solved. Your strongest areas are Stack/Queue (90%), Linked Lists (88%), and Arrays (85%). However, there are clear gaps in Graphs (50%) and Backtracking (55%) that need attention. Your contest rating of 1687 places you in the competitive range, but pushing past 1800 will require focused practice on DP and Graph problems. Your 23-day streak shows excellent consistency. For SDE roles at tier-1 companies, focus on increasing your hard problem percentage from 11% to at least 20%. You're naturally gravitating toward algorithmic problem-solving which aligns well with backend engineering and systems design roles.`,
  careerSignals: [
    { domain: 'Backend Engineering', score: 82 },
    { domain: 'Full-Stack Development', score: 75 },
    { domain: 'Systems Design', score: 68 },
    { domain: 'AI/ML Engineering', score: 45 },
    { domain: 'DevOps/SRE', score: 38 },
  ],
};

// ─── GitHub Mock ───
export const mockGitHub = {
  username: 'arjunmehta',
  totalRepos: 24,
  totalStars: 47,
  totalCommits: 842,
  followers: 89,
  following: 134,
  contributions: 648,
  voluntaryEffortScore: 78,
  repositories: [
    { name: 'smart-campus-iot', language: 'Python', stars: 12, forks: 3, description: 'IoT-based smart campus monitoring system', domain: 'IoT' },
    { name: 'ml-disease-predictor', language: 'Python', stars: 8, forks: 2, description: 'Machine learning model for disease prediction', domain: 'AI/ML' },
    { name: 'react-ecommerce', language: 'TypeScript', stars: 6, forks: 1, description: 'Full-stack e-commerce platform with React & Node', domain: 'Full-Stack' },
    { name: 'algo-visualizer', language: 'JavaScript', stars: 9, forks: 4, description: 'Interactive algorithm visualization tool', domain: 'Frontend' },
    { name: 'blockchain-voting', language: 'Solidity', stars: 5, forks: 2, description: 'Decentralized voting system using Ethereum', domain: 'Blockchain' },
    { name: 'chatbot-nlp', language: 'Python', stars: 7, forks: 1, description: 'NLP-based customer support chatbot', domain: 'AI/ML' },
  ],
  techStack: [
    { name: 'Python', percentage: 35, color: '#3776AB' },
    { name: 'TypeScript', percentage: 25, color: '#3178C6' },
    { name: 'JavaScript', percentage: 20, color: '#F7DF1E' },
    { name: 'Solidity', percentage: 8, color: '#363636' },
    { name: 'Java', percentage: 7, color: '#ED8B00' },
    { name: 'Other', percentage: 5, color: '#6c757d' },
  ],
  commitVelocity: [
    { month: 'Sep', commits: 45 },
    { month: 'Oct', commits: 78 },
    { month: 'Nov', commits: 92 },
    { month: 'Dec', commits: 120 },
    { month: 'Jan', commits: 156 },
    { month: 'Feb', commits: 134 },
  ],
  domainDistribution: [
    { domain: 'AI/ML', value: 35, color: '#7c4dff' },
    { domain: 'Full-Stack', value: 28, color: '#448aff' },
    { domain: 'IoT', value: 15, color: '#18ffff' },
    { domain: 'Frontend', value: 12, color: '#69f0ae' },
    { domain: 'Blockchain', value: 10, color: '#ffab40' },
  ],
  readmeQuality: 72,
  strengths: [
    'Strong project diversity – covering AI/ML, Full-Stack, IoT, and Blockchain',
    'Consistent commit velocity with an upward trend (+197% since September)',
    'Multiple starred repos showing community recognition',
    'Good README documentation in most repositories',
  ],
  weaknesses: [
    'No open-source contributions to established projects',
    'README quality inconsistent across repos (72% avg)',
    'Few collaborative projects – most repos are solo work',
    'No CI/CD or testing frameworks visible in most repos',
  ],
  summary: `Your GitHub profile reveals a curious, project-driven developer with genuine interest in diverse domains. With 24 repos and 842 total commits, your activity is well above average for a 3rd-year student. Your strongest signal is in AI/ML (35% of projects) and Full-Stack Development (28%). The smart-campus-iot project shows initiative beyond coursework, earning a voluntary effort score of 78/100. Your commit velocity has nearly tripled since September, indicating growing dedication. Key areas for improvement: contribute to open-source projects, add testing frameworks, and standardize README quality. Your passion signals strongly suggest you'd thrive in AI/ML or Full-Stack roles.`,
  careerSignals: [
    { domain: 'AI/ML Engineering', score: 85 },
    { domain: 'Full-Stack Development', score: 78 },
    { domain: 'IoT/Embedded', score: 62 },
    { domain: 'Frontend Engineering', score: 55 },
    { domain: 'Blockchain Dev', score: 40 },
  ],
};

// ─── Resume Mock ───
export const mockResume = {
  atsScore: 74,
  sections: [
    { name: 'Contact Information', score: 95, feedback: 'Complete and well-formatted. LinkedIn URL included.' },
    { name: 'Education', score: 90, feedback: 'GPA included, relevant coursework listed. Good.' },
    { name: 'Experience', score: 65, feedback: 'Only 1 internship listed. Quantify achievements with numbers. Use action verbs.' },
    { name: 'Projects', score: 80, feedback: '4 projects listed with tech stacks. Add links and quantify impact.' },
    { name: 'Skills', score: 70, feedback: 'Good technical skills but missing soft skills and certifications.' },
    { name: 'Format & Structure', score: 68, feedback: 'Slightly dense layout. Increase white space. Use consistent bullet formatting.' },
  ],
  roleLikelihood: [
    { role: 'Full-Stack Developer', score: 82 },
    { role: 'ML Engineer', score: 76 },
    { role: 'Backend Developer', score: 74 },
    { role: 'Data Analyst', score: 58 },
    { role: 'DevOps Engineer', score: 42 },
  ],
  improvements: [
    { priority: 'high', text: 'Add 2-3 more quantified bullet points under Experience (e.g., "Reduced load time by 40%")' },
    { priority: 'high', text: 'Include links to GitHub repos and live project demos' },
    { priority: 'medium', text: 'Add a professional summary/objective at the top (2-3 lines)' },
    { priority: 'medium', text: 'Include relevant certifications (AWS, Google Cloud, etc.)' },
    { priority: 'low', text: 'Optimize ATS keywords – add terms like "Agile", "REST API", "CI/CD"' },
    { priority: 'low', text: 'Reduce overall length to fit within 1 page' },
  ],
  keywords: {
    present: ['Python', 'React', 'Node.js', 'Machine Learning', 'Git', 'SQL'],
    missing: ['Agile', 'REST API', 'CI/CD', 'Docker', 'AWS', 'System Design', 'TDD'],
  },
  summary: `Your resume scores 74/100 on ATS compatibility. Strong areas include education and contact formatting. The biggest gap is in Experience – with only one internship, you need to compensate with detailed project descriptions and quantified achievements. Your skills section is good but missing industry-standard keywords like "CI/CD", "Docker", and "Agile" that ATS systems look for. Your resume naturally aligns with Full-Stack Developer (82%) and ML Engineer (76%) roles. To reach 85+ ATS score: add a professional summary, quantify all achievements, include live project links, and optimize keyword density.`,
};

// ─── AURA Behavioral Mock ───
export const mockAura = {
  overallScore: 72,
  dimensions: [
    { name: 'Confidence', score: 78, color: '#7c4dff' },
    { name: 'Clarity', score: 74, color: '#448aff' },
    { name: 'Empathy', score: 82, color: '#18ffff' },
    { name: 'Communication', score: 70, color: '#69f0ae' },
    { name: 'Problem Solving', score: 68, color: '#ffab40' },
    { name: 'Leadership', score: 65, color: '#ff4081' },
  ],
  spikes: [
    { label: 'High empathy during healthcare project discussions', icon: '💚' },
    { label: 'Strong communication when explaining technical concepts', icon: '🗣️' },
    { label: 'Confident body language in team settings', icon: '💪' },
  ],
};

// ─── Interest Engine Mock ───
export const mockInterestEngine = {
  topDomains: [
    {
      rank: 1,
      name: 'AI/ML Engineering',
      confidence: 89,
      color: '#7c4dff',
      gradient: 'linear-gradient(135deg, #7c4dff, #b388ff)',
      icon: '🧠',
      explanation: 'Strong computer vision and NLP projects on GitHub, combined with growing algorithmic skills on LeetCode. Your Python-dominant tech stack and consistent ML project activity show genuine passion. High empathy scores suggest you\'d excel in AI applications for social good.',
      sources: ['GitHub: 35% AI/ML repos', 'LeetCode: Strong DP skills', 'Resume: ML internship', 'AURA: High empathy spike'],
    },
    {
      rank: 2,
      name: 'Full-Stack Development',
      confidence: 76,
      color: '#448aff',
      gradient: 'linear-gradient(135deg, #448aff, #82b1ff)',
      icon: '🌐',
      explanation: 'Your react-ecommerce project and TypeScript proficiency show full-stack capability. LeetCode data structure strengths align well with API design. Good communication skills support client-facing development roles.',
      sources: ['GitHub: 28% Full-Stack repos', 'LeetCode: Arrays/Strings strong', 'Resume: React + Node.js', 'AURA: Good communication'],
    },
    {
      rank: 3,
      name: 'IoT/Embedded Systems',
      confidence: 58,
      color: '#18ffff',
      gradient: 'linear-gradient(135deg, #18ffff, #84ffff)',
      icon: '📡',
      explanation: 'Your smart-campus-iot project is one of your most starred repos, showing genuine interest. However, limited depth in embedded programming and hardware skills. This domain could grow with focused effort.',
      sources: ['GitHub: smart-campus-iot (12 stars)', 'LeetCode: Systems thinking', 'Resume: IoT project listed'],
    },
  ],
  roadmap: [
    { week: 'Week 1-2', tasks: ['Complete 10 ML algorithm problems on LeetCode', 'Start Andrew Ng\'s ML Specialization', 'Add unit tests to ml-disease-predictor repo'], category: 'Foundation' },
    { week: 'Week 3-4', tasks: ['Build a computer vision mini-project', 'Contribute to an open-source ML library', 'Practice system design for ML pipelines'], category: 'Building' },
    { week: 'Week 5-6', tasks: ['Prepare 3 ML project deep-dives for interviews', 'Mock technical interview practice', 'Update resume with new projects/certifications'], category: 'Interview Prep' },
    { week: 'Week 7-8', tasks: ['Apply to 5 AI/ML internships/jobs', 'Complete at least 1 Kaggle competition', 'Attend ML community meetups/webinars'], category: 'Launch' },
  ],
};

// ─── Dashboard Mock ───
export const mockDashboard = {
  todayTasks: [
    { id: 1, title: 'Solve 2 Medium DP problems on LeetCode', xp: 30, category: 'Coding', completed: false, icon: '💻' },
    { id: 2, title: 'Push 1 commit to ml-disease-predictor', xp: 20, category: 'GitHub', completed: true, icon: '🔗' },
    { id: 3, title: 'Add quantified metrics to resume Experience section', xp: 25, category: 'Resume', completed: false, icon: '📄' },
    { id: 4, title: 'Watch 1 system design video (30 min)', xp: 15, category: 'Learning', completed: false, icon: '🎓' },
  ],
  xpHistory: [
    { day: 'Mon', xp: 85 },
    { day: 'Tue', xp: 120 },
    { day: 'Wed', xp: 65 },
    { day: 'Thu', xp: 140 },
    { day: 'Fri', xp: 95 },
    { day: 'Sat', xp: 110 },
    { day: 'Sun', xp: 75 },
  ],
  domainReadiness: [
    { domain: 'AI/ML', readiness: 72, color: '#7c4dff' },
    { domain: 'Full-Stack', readiness: 68, color: '#448aff' },
    { domain: 'Backend', readiness: 65, color: '#18ffff' },
    { domain: 'IoT', readiness: 45, color: '#69f0ae' },
    { domain: 'DevOps', readiness: 30, color: '#ffab40' },
  ],
  badges: [
    { id: 1, name: 'First Login', icon: '🌟', earned: true, description: 'Welcome to Ready360!' },
    { id: 2, name: '7-Day Streak', icon: '🔥', earned: true, description: 'Maintained a 7-day streak' },
    { id: 3, name: '14-Day Streak', icon: '⚡', earned: true, description: 'Maintained a 14-day streak' },
    { id: 4, name: 'Resume Pro', icon: '📄', earned: true, description: 'Reached 70+ ATS score' },
    { id: 5, name: 'Code Warrior', icon: '⚔️', earned: true, description: 'Solved 200+ LeetCode problems' },
    { id: 6, name: 'Git Master', icon: '🐙', earned: true, description: '500+ total commits' },
    { id: 7, name: 'Domain Expert', icon: '🎯', earned: true, description: 'Reached 70%+ in a domain' },
    { id: 8, name: 'Social Butterfly', icon: '🦋', earned: true, description: 'Connected all profiles' },
    { id: 9, name: '30-Day Streak', icon: '👑', earned: false, description: 'Maintain a 30-day streak' },
    { id: 10, name: 'Interview Ready', icon: '🎤', earned: false, description: 'Complete all AURA assessments' },
    { id: 11, name: 'Perfect Resume', icon: '💎', earned: false, description: 'Reach 90+ ATS score' },
    { id: 12, name: 'Legendary', icon: '🏆', earned: false, description: 'Reach Level 25' },
  ],
  atsTrend: [
    { week: 'W1', score: 52 },
    { week: 'W2', score: 58 },
    { week: 'W3', score: 63 },
    { week: 'W4', score: 67 },
    { week: 'W5', score: 71 },
    { week: 'W6', score: 74 },
  ],
};

// ─── Job Tracker Mock ───
export const mockJobs = [
  { id: 1, company: 'Google', role: 'ML Engineer Intern', status: 'applied', date: '2026-02-20', logo: '🔵' },
  { id: 2, company: 'Microsoft', role: 'SDE Intern', status: 'interview', date: '2026-02-15', logo: '🟢' },
  { id: 3, company: 'Amazon', role: 'Full-Stack Developer', status: 'applied', date: '2026-02-18', logo: '🟠' },
  { id: 4, company: 'Flipkart', role: 'Backend Developer', status: 'rejected', date: '2026-02-10', logo: '🟡' },
  { id: 5, company: 'Razorpay', role: 'Product Engineer', status: 'offer', date: '2026-02-05', logo: '🔷' },
  { id: 6, company: 'Zomato', role: 'Data Analyst Intern', status: 'applied', date: '2026-02-22', logo: '🔴' },
];
