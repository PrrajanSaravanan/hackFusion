import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
// OpenRouter config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = process.env.OPENROUTER_URL || "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3-8b-instruct";


const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ─── Multer config for PDF uploads (max 10 MB) ───
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are accepted'));
  },
});

// OpenRouter initialization handled via fetch in the route


// ─── LeetCode GraphQL Queries ───

const LEETCODE_API = 'https://leetcode.com/graphql';

const USER_PROFILE_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      ranking
      userAvatar
      reputation
      starRating
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    tagProblemCounts {
      advanced {
        tagName
        tagSlug
        problemsSolved
      }
      intermediate {
        tagName
        tagSlug
        problemsSolved
      }
      fundamental {
        tagName
        tagSlug
        problemsSolved
      }
    }
    badges {
      name
      icon
    }
  }
}`;

const CALENDAR_QUERY = `
query userCalendar($username: String!) {
  matchedUser(username: $username) {
    userCalendar {
      submissionCalendar
      streak
      totalActiveDays
    }
  }
}`;

const CONTEST_QUERY = `
query userContestRankingInfo($username: String!) {
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    topPercentage
  }
  userContestRankingHistory(username: $username) {
    attended
    rating
    ranking
    contest {
      title
      startTime
    }
  }
}`;

const RECENT_SUBMISSIONS_QUERY = `
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    title
    titleSlug
    timestamp
    lang
  }
}`;

const SKILL_STATS_QUERY = `
query skillStats($username: String!) {
  matchedUser(username: $username) {
    tagProblemCounts {
      advanced {
        tagName
        problemsSolved
      }
      intermediate {
        tagName
        problemsSolved
      }
      fundamental {
        tagName
        problemsSolved
      }
    }
  }
}`;

// ─── Helper: fetch from LeetCode GraphQL ───

async function queryLeetCode(query, variables) {
  const res = await fetch(LEETCODE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API returned ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

// ─── Transform API data → our shape ───

function buildTopicBreakdown(tagProblemCounts) {
  // Merge all tag categories into a single sorted list
  const allTags = [
    ...(tagProblemCounts.fundamental || []),
    ...(tagProblemCounts.intermediate || []),
    ...(tagProblemCounts.advanced || []),
  ];

  // Deduplicate and keep highest count
  const tagMap = new Map();
  for (const tag of allTags) {
    const existing = tagMap.get(tag.tagName);
    if (!existing || tag.problemsSolved > existing.problemsSolved) {
      tagMap.set(tag.tagName, tag);
    }
  }

  // Sort by problems solved, take top 15
  const sorted = Array.from(tagMap.values())
    .sort((a, b) => b.problemsSolved - a.problemsSolved)
    .slice(0, 15);

  // Proficiency = relative to the user's strongest topic
  const maxSolved = sorted.length > 0 ? sorted[0].problemsSolved : 1;

  return sorted.map(tag => ({
    topic: tag.tagName,
    solved: tag.problemsSolved,
    total: maxSolved, // use top topic as the benchmark
    proficiency: Math.min(100, Math.round((tag.problemsSolved / maxSolved) * 100)),
  }));
}

function buildRecentActivity(submissionCalendar) {
  if (!submissionCalendar) return [];

  try {
    const calendar = JSON.parse(submissionCalendar);
    const entries = Object.entries(calendar)
      .map(([timestamp, count]) => ({
        date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
        count: Number(count),
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // last 30 days of activity

    return entries;
  } catch {
    return [];
  }
}

function buildDifficultyTrend(submissionCalendar, easy, medium, hard) {
  // Calculate monthly distribution based on total counts
  // Since we can't get per-month difficulty breakdown from API,
  // we simulate growth curves based on total counts
  const total = easy + medium + hard;
  if (total === 0) return [];

  const months = ['6mo ago', '5mo ago', '4mo ago', '3mo ago', '2mo ago', 'This mo'];
  const growthFactors = [0.3, 0.45, 0.6, 0.75, 0.9, 1.0];

  return months.map((month, i) => ({
    month,
    easy: Math.round(easy * growthFactors[i]),
    medium: Math.round(medium * growthFactors[i]),
    hard: Math.round(hard * growthFactors[i]),
  }));
}

function generateStrengths(data) {
  const strengths = [];
  const { totalSolved, easy, medium, hard, topicBreakdown, streak, contestRating } = data;

  if (totalSolved >= 200) strengths.push(`Impressive problem count with ${totalSolved} problems solved`);
  else if (totalSolved >= 100) strengths.push(`Solid problem count with ${totalSolved} problems solved`);
  else if (totalSolved >= 50) strengths.push(`Growing problem base with ${totalSolved} problems solved`);

  const topTopics = topicBreakdown.slice(0, 3).map(t => t.topic);
  if (topTopics.length > 0) strengths.push(`Strong in ${topTopics.join(', ')}`);

  if (medium > easy) strengths.push('Tackling more medium-difficulty problems than easy – shows growth');
  if (hard >= 20) strengths.push(`Solving hard problems consistently (${hard} solved)`);
  if (streak >= 14) strengths.push(`Excellent consistency with a ${streak}-day streak`);
  if (contestRating > 1600) strengths.push(`Competitive contest rating of ${Math.round(contestRating)}`);

  return strengths.length > 0 ? strengths : ['Getting started on the LeetCode journey'];
}

function generateWeaknesses(data) {
  const weaknesses = [];
  const { totalSolved, easy, medium, hard, topicBreakdown, contestRating } = data;

  const hardPercent = totalSolved > 0 ? (hard / totalSolved * 100) : 0;
  if (hardPercent < 15) weaknesses.push(`Hard problems ratio is low (${Math.round(hardPercent)}%) – aim for 20%+ for top companies`);

  // Find weak topics (bottom 3 by proficiency)
  const weakTopics = topicBreakdown
    .filter(t => t.proficiency < 60)
    .slice(0, 3);
  for (const topic of weakTopics) {
    weaknesses.push(`${topic.topic} needs improvement (${topic.proficiency}% proficiency)`);
  }

  if (totalSolved < 100) weaknesses.push('Need to solve more problems – aim for 150+ for interview readiness');
  if (contestRating < 1500 && contestRating > 0) weaknesses.push(`Contest rating (${Math.round(contestRating)}) could be improved with regular practice`);
  if (contestRating === 0) weaknesses.push('No contest participation yet – contests help build speed and accuracy');

  return weaknesses.length > 0 ? weaknesses : ['Keep pushing to find your growth areas'];
}

function generateSummary(data) {
  const { username, totalSolved, easy, medium, hard, topicBreakdown, contestRating, streak } = data;
  const topTopics = topicBreakdown.slice(0, 3);
  const weakTopics = topicBreakdown.filter(t => t.proficiency < 60).slice(0, 2);
  const hardPercent = totalSolved > 0 ? Math.round(hard / totalSolved * 100) : 0;

  let summary = `Based on ${username}'s LeetCode profile, `;

  if (totalSolved >= 200) {
    summary += `you have an impressive ${totalSolved} problems solved, showing strong dedication. `;
  } else if (totalSolved >= 100) {
    summary += `you have a solid foundation with ${totalSolved} problems solved. `;
  } else {
    summary += `you're building your skills with ${totalSolved} problems solved so far. `;
  }

  if (topTopics.length > 0) {
    summary += `Your strongest areas are ${topTopics.map(t => `${t.topic} (${t.proficiency}%)`).join(', ')}. `;
  }

  if (weakTopics.length > 0) {
    summary += `Areas needing attention include ${weakTopics.map(t => t.topic).join(' and ')}. `;
  }

  if (contestRating > 0) {
    summary += `Your contest rating of ${Math.round(contestRating)} ${contestRating > 1600 ? 'places you in the competitive range' : 'shows room for growth'}. `;
  }

  if (streak > 0) {
    summary += `Your ${streak}-day streak shows ${streak >= 14 ? 'excellent' : 'good'} consistency. `;
  }

  summary += `For SDE roles at top companies, ${hardPercent < 20 ? `focus on increasing your hard problem percentage from ${hardPercent}% to at least 20%` : 'maintain your strong hard problem ratio'}.`;

  return summary;
}

function generateCareerSignals(data) {
  const { totalSolved, hard, topicBreakdown, contestRating } = data;
  const topicMap = {};
  for (const t of topicBreakdown) {
    topicMap[t.topic.toLowerCase()] = t.proficiency;
  }

  const dpScore = topicMap['dynamic programming'] || topicMap['memoization'] || 0;
  const graphScore = topicMap['graph'] || topicMap['breadth-first search'] || topicMap['depth-first search'] || 0;
  const arrayScore = topicMap['array'] || 0;
  const treeScore = topicMap['tree'] || topicMap['binary tree'] || 0;
  const mathScore = topicMap['math'] || 0;
  const designScore = topicMap['design'] || topicMap['hash table'] || 0;

  const base = Math.min(100, totalSolved / 3);
  const hardBonus = Math.min(20, hard);
  const contestBonus = contestRating > 0 ? Math.min(15, contestRating / 200) : 0;

  return [
    { domain: 'Backend Engineering', score: Math.min(100, Math.round(base + dpScore * 0.3 + graphScore * 0.2 + hardBonus + contestBonus)) },
    { domain: 'Full-Stack Development', score: Math.min(100, Math.round(base + arrayScore * 0.3 + designScore * 0.2 + hardBonus * 0.5)) },
    { domain: 'Systems Design', score: Math.min(100, Math.round(base * 0.8 + graphScore * 0.3 + dpScore * 0.2 + hardBonus)) },
    { domain: 'AI/ML Engineering', score: Math.min(100, Math.round(base * 0.6 + mathScore * 0.4 + dpScore * 0.2)) },
    { domain: 'DevOps/SRE', score: Math.min(100, Math.round(base * 0.4 + designScore * 0.3)) },
  ].sort((a, b) => b.score - a.score);
}

// ─── API Route ───

app.get('/api/leetcode/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Fire all queries in parallel — calendar is separate so its permission error won't block everything
    const [profileData, contestData, recentData, calendarData] = await Promise.all([
      queryLeetCode(USER_PROFILE_QUERY, { username }),
      queryLeetCode(CONTEST_QUERY, { username }).catch(() => null),
      queryLeetCode(RECENT_SUBMISSIONS_QUERY, { username, limit: 20 }).catch(() => null),
      queryLeetCode(CALENDAR_QUERY, { username }).catch((err) => {
        console.log(`Calendar not accessible for ${username}: ${err.message}`);
        return null;
      }),
    ]);

    const user = profileData.matchedUser;
    if (!user) {
      return res.status(404).json({ error: `User "${username}" not found on LeetCode` });
    }

    // Extract difficulty counts
    const acStats = user.submitStatsGlobal.acSubmissionNum;
    const getCount = (diff) => acStats.find(s => s.difficulty === diff)?.count || 0;
    const totalSolved = getCount('All');
    const easy = getCount('Easy');
    const medium = getCount('Medium');
    const hard = getCount('Hard');

    // Contest info
    const contest = contestData?.userContestRanking;
    const contestRating = contest?.rating || 0;
    const contestsAttended = contest?.attendedContestsCount || 0;

    // Build topic breakdown
    const topicBreakdown = buildTopicBreakdown(user.tagProblemCounts);

    // Calendar data (may be null if permission denied)
    const calendarUser = calendarData?.matchedUser;
    const recentActivity = buildRecentActivity(calendarUser?.userCalendar?.submissionCalendar);
    const difficultyTrend = buildDifficultyTrend(calendarUser?.userCalendar?.submissionCalendar, easy, medium, hard);
    const streak = calendarUser?.userCalendar?.streak || 0;

    // Ranking
    const ranking = user.profile?.ranking || 0;

    // Construct full response
    const responseData = {
      username: user.username,
      totalSolved,
      easy,
      medium,
      hard,
      ranking,
      contestRating,
      contestsAttended,
      streak,
      topicBreakdown,
      recentActivity,
      difficultyTrend,
    };

    // Generate AI-like analysis from real data
    responseData.strengths = generateStrengths(responseData);
    responseData.weaknesses = generateWeaknesses(responseData);
    responseData.summary = generateSummary(responseData);
    responseData.careerSignals = generateCareerSignals(responseData);

    res.json(responseData);
  } catch (err) {
    console.error('LeetCode API error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch LeetCode data' });
  }
});

// ════════════════════════════════════════════════════
// ─── GitHub API Route ───
// ════════════════════════════════════════════════════

const GITHUB_API = 'https://api.github.com';

async function queryGitHub(path) {
  const url = `${GITHUB_API}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (res.status === 404) {
      throw new Error(`User not found on GitHub: ${path}`);
    }
    if (res.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Try again in a few minutes.');
    }
    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`);
    }

    return res.json();
  } catch (err) {
    throw err;
  }
}

// Language → Color mapping
const LANG_COLORS = {
  'JavaScript': '#F7DF1E', 'TypeScript': '#3178C6', 'Python': '#3776AB',
  'Java': '#ED8B00', 'C++': '#00599C', 'C': '#555555', 'C#': '#239120',
  'Go': '#00ADD8', 'Rust': '#DEA584', 'Ruby': '#CC342D', 'PHP': '#777BB4',
  'Swift': '#FA7343', 'Kotlin': '#7F52FF', 'Dart': '#0175C2', 'Scala': '#DC322F',
  'R': '#276DC3', 'MATLAB': '#e16737', 'Shell': '#89e051', 'HTML': '#E34C26',
  'CSS': '#563D7C', 'Solidity': '#363636', 'Jupyter Notebook': '#F37626',
  'Vue': '#4FC08D', 'Svelte': '#FF3E00',
};

// Classify repo into a domain based on description + language + name
function classifyRepoDomain(repo) {
  const text = `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase();

  if (/\b(ml|machine.?learn|deep.?learn|neural|ai|nlp|bert|gpt|tensor|pytorch|keras|model|predict)\b/.test(text)) return 'AI/ML';
  if (/\b(web|react|next|vue|angular|frontend|full.?stack|express|node|django|flask|api|rest|graphql)\b/.test(text)) return 'Web Dev';
  if (/\b(mobile|android|ios|flutter|react.?native|swift|kotlin)\b/.test(text)) return 'Mobile';
  if (/\b(devops|docker|kubernetes|k8s|ci.?cd|terraform|aws|azure|cloud|deploy)\b/.test(text)) return 'DevOps/Cloud';
  if (/\b(blockchain|crypto|solidity|ethereum|web3|smart.?contract|defi)\b/.test(text)) return 'Blockchain';
  if (/\b(data|analy|pandas|numpy|visualization|dashboard|etl|sql|database)\b/.test(text)) return 'Data Science';
  if (/\b(iot|embedded|arduino|raspberry|sensor|hardware)\b/.test(text)) return 'IoT/Embedded';
  if (/\b(game|unity|unreal|godot|pygame)\b/.test(text)) return 'Game Dev';
  if (/\b(security|cyber|hack|ctf|pentest|crypt)\b/.test(text)) return 'Security';
  return 'Other';
}

const DOMAIN_COLORS = {
  'AI/ML': '#7c4dff', 'Web Dev': '#448aff', 'Mobile': '#18ffff',
  'DevOps/Cloud': '#69f0ae', 'Blockchain': '#ffab40', 'Data Science': '#ea80fc',
  'IoT/Embedded': '#ff8a65', 'Game Dev': '#ffd740', 'Security': '#ff5252', 'Other': '#6c757d',
};

function ghGenerateStrengths(data) {
  const s = [];
  const { totalRepos, totalStars, totalCommits, followers, repositories, techStack } = data;

  if (totalRepos >= 20) s.push(`Prolific developer with ${totalRepos} public repositories`);
  else if (totalRepos >= 10) s.push(`Active developer with ${totalRepos} public repositories`);

  if (totalStars >= 50) s.push(`Projects are well-received with ${totalStars} total stars`);
  else if (totalStars >= 10) s.push(`Growing community recognition with ${totalStars} stars`);

  if (techStack.length >= 4) s.push(`Diverse tech stack spanning ${techStack.slice(0, 4).map(t => t.name).join(', ')}`);

  const starredRepos = repositories.filter(r => r.stars > 0);
  if (starredRepos.length > 0) s.push(`${starredRepos.length} repositories have earned community stars`);

  if (followers >= 50) s.push(`Strong developer network with ${followers} followers`);
  if (totalCommits >= 500) s.push(`High commit velocity with ${totalCommits}+ contributions`);

  return s.length > 0 ? s : ['Getting started on GitHub – keep building!'];
}

function ghGenerateWeaknesses(data) {
  const w = [];
  const { totalRepos, totalStars, totalCommits, repositories } = data;

  if (totalRepos < 5) w.push('Low repository count – consider publishing more projects');
  if (totalStars < 5) w.push('Few stars – improve README quality and share projects in communities');

  const noDescRepos = repositories.filter(r => !r.description).length;
  if (noDescRepos > repositories.length * 0.3) w.push(`${noDescRepos} repos lack descriptions – add clear descriptions to all projects`);

  const languages = new Set(repositories.map(r => r.language).filter(Boolean));
  if (languages.size <= 1) w.push('Limited language diversity – try exploring new technologies');

  const forkedRepos = repositories.filter(r => r.forks === 0).length;
  if (totalCommits < 200) w.push('Commit count is below average – aim for consistent daily contributions');

  return w.length > 0 ? w : ['Looking good! Keep pushing to grow your portfolio'];
}

function ghGenerateSummary(data) {
  const { username, totalRepos, totalStars, totalCommits, followers, techStack, domainDistribution, repositories } = data;
  const topLang = techStack[0]?.name || 'various languages';
  const topDomain = domainDistribution[0]?.domain || 'software development';
  const hasStars = totalStars > 0;

  let summary = `${username}'s GitHub profile shows `;

  if (totalRepos >= 15) summary += `an active developer with ${totalRepos} public repositories and ${totalCommits} total contributions. `;
  else if (totalRepos >= 5) summary += `a growing developer with ${totalRepos} repositories. `;
  else summary += `an emerging developer with ${totalRepos} repositories so far. `;

  summary += `Primary expertise is in ${topLang}, with strongest signals in ${topDomain}. `;

  if (hasStars) summary += `Projects have earned ${totalStars} stars, showing community interest. `;
  if (followers > 10) summary += `A network of ${followers} followers indicates growing developer presence. `;

  if (techStack.length >= 3) {
    summary += `Tech diversity across ${techStack.slice(0, 3).map(t => t.name).join(', ')} suggests versatility. `;
  }

  summary += `Focus on contributing to open-source, adding tests, and improving documentation to strengthen the profile further.`;

  return summary;
}

function ghGenerateCareerSignals(data) {
  const { techStack, domainDistribution, totalRepos, totalStars } = data;
  const langMap = {};
  for (const t of techStack) langMap[t.name.toLowerCase()] = t.percentage;
  const domainMap = {};
  for (const d of domainDistribution) domainMap[d.domain] = d.value;

  const base = Math.min(40, totalRepos * 2);
  const starBonus = Math.min(15, totalStars);

  return [
    { domain: 'Full-Stack Development', score: Math.min(100, Math.round(base + (langMap['javascript'] || 0) * 0.8 + (langMap['typescript'] || 0) * 0.8 + (domainMap['Web Dev'] || 0) * 0.5 + starBonus)) },
    { domain: 'AI/ML Engineering', score: Math.min(100, Math.round(base * 0.7 + (langMap['python'] || 0) * 0.8 + (langMap['jupyter notebook'] || 0) * 0.5 + (domainMap['AI/ML'] || 0) * 0.6 + starBonus * 0.5)) },
    { domain: 'Backend Engineering', score: Math.min(100, Math.round(base + (langMap['python'] || 0) * 0.5 + (langMap['java'] || 0) * 0.6 + (langMap['go'] || 0) * 0.8 + starBonus)) },
    { domain: 'DevOps/Cloud', score: Math.min(100, Math.round(base * 0.5 + (langMap['shell'] || 0) * 0.6 + (domainMap['DevOps/Cloud'] || 0) * 0.8)) },
    { domain: 'Mobile Development', score: Math.min(100, Math.round(base * 0.5 + (langMap['dart'] || 0) * 0.8 + (langMap['kotlin'] || 0) * 0.8 + (langMap['swift'] || 0) * 0.8 + (domainMap['Mobile'] || 0) * 0.6)) },
  ].sort((a, b) => b.score - a.score);
}

app.get('/api/github/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch user profile and repos in parallel
    const [profile, repos, events] = await Promise.all([
      queryGitHub(`/users/${username}`),
      queryGitHub(`/users/${username}/repos?per_page=100&sort=updated&type=owner`),
      queryGitHub(`/users/${username}/events/public?per_page=100`).catch(() => []),
    ]);

    // ── Basic stats ──
    const totalRepos = profile.public_repos || repos.length;
    const followers = profile.followers || 0;
    const following = profile.following || 0;
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    // ── Commit count from events ──
    const pushEvents = events.filter(e => e.type === 'PushEvent');
    const totalCommitsFromEvents = pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);
    // Estimate total commits (events only go back ~90 days)
    const totalCommits = Math.max(totalCommitsFromEvents, profile.public_repos * 15);

    // ── Top Repositories ──
    const topRepos = repos
      .filter(r => !r.fork)
      .sort((a, b) => (b.stargazers_count + b.forks_count * 2) - (a.stargazers_count + a.forks_count * 2))
      .slice(0, 6)
      .map(r => ({
        name: r.name,
        language: r.language || 'N/A',
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        description: r.description || 'No description',
        domain: classifyRepoDomain(r),
        url: r.html_url,
      }));

    // ── Tech Stack Distribution ──
    const langBytes = {};
    for (const repo of repos.filter(r => !r.fork && r.language)) {
      const lang = repo.language;
      // Weight by stars + size
      const weight = (repo.stargazers_count || 0) + 1 + Math.log2(Math.max(1, repo.size));
      langBytes[lang] = (langBytes[lang] || 0) + weight;
    }
    const totalWeight = Object.values(langBytes).reduce((s, v) => s + v, 0) || 1;
    const techStack = Object.entries(langBytes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, weight]) => ({
        name,
        percentage: Math.round((weight / totalWeight) * 100),
        color: LANG_COLORS[name] || '#6c757d',
      }));

    // ── Commit Velocity (from push events, last 6 months approximated) ──
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const commitsByMonth = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthNames[d.getMonth()];
      commitsByMonth[key] = 0;
    }
    for (const ev of pushEvents) {
      const d = new Date(ev.created_at);
      const key = monthNames[d.getMonth()];
      if (key in commitsByMonth) {
        commitsByMonth[key] += ev.payload?.commits?.length || 0;
      }
    }
    const commitVelocity = Object.entries(commitsByMonth).map(([month, commits]) => ({ month, commits }));

    // ── Domain Distribution ──
    const domainCounts = {};
    for (const repo of repos.filter(r => !r.fork)) {
      const domain = classifyRepoDomain(repo);
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
    const totalDomainRepos = Object.values(domainCounts).reduce((s, v) => s + v, 0) || 1;
    const domainDistribution = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([domain, count]) => ({
        domain,
        value: Math.round((count / totalDomainRepos) * 100),
        color: DOMAIN_COLORS[domain] || '#6c757d',
      }));

    // ── Voluntary Effort Score ──
    const hasReadme = repos.filter(r => !r.fork && r.description).length;
    const readmeRatio = repos.filter(r => !r.fork).length > 0 ? hasReadme / repos.filter(r => !r.fork).length : 0;
    const voluntaryEffortScore = Math.min(100, Math.round(
      readmeRatio * 30 +
      Math.min(25, totalStars * 2) +
      Math.min(20, techStack.length * 4) +
      Math.min(25, totalRepos * 1.5)
    ));

    // ── Build response ──
    const responseData = {
      username: profile.login,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      totalRepos,
      totalStars,
      totalForks,
      totalCommits,
      followers,
      following,
      voluntaryEffortScore,
      repositories: topRepos,
      techStack,
      commitVelocity,
      domainDistribution,
    };

    responseData.strengths = ghGenerateStrengths(responseData);
    responseData.weaknesses = ghGenerateWeaknesses(responseData);
    responseData.summary = ghGenerateSummary(responseData);
    responseData.careerSignals = ghGenerateCareerSignals(responseData);

    res.json(responseData);
  } catch (err) {
    console.error('GitHub API error:', err.message);
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════
// ─── Resume Analysis Route (OpenRouter AI) ───

// ════════════════════════════════════════════════════

const RESUME_ANALYSIS_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer and career advisor.

Analyze the following resume text and return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):

{
  "atsScore": <number 0-100, overall ATS compatibility score>,
  "sections": [
    { "name": "Contact Information", "score": <0-100>, "feedback": "<1-2 sentence feedback>" },
    { "name": "Education", "score": <0-100>, "feedback": "<1-2 sentence feedback>" },
    { "name": "Experience", "score": <0-100>, "feedback": "<1-2 sentence feedback>" },
    { "name": "Projects", "score": <0-100>, "feedback": "<1-2 sentence feedback>" },
    { "name": "Skills", "score": <0-100>, "feedback": "<1-2 sentence feedback>" },
    { "name": "Format & Structure", "score": <0-100>, "feedback": "<1-2 sentence feedback>" }
  ],
  "roleLikelihood": [
    { "role": "<job role>", "score": <0-100> }
  ],
  "improvements": [
    { "priority": "high"|"medium"|"low", "text": "<actionable suggestion>" }
  ],
  "keywords": {
    "present": ["<keyword found in resume>", ...],
    "missing": ["<important keyword missing>", ...]
  },
  "summary": "<3-5 sentence overall analysis summary with specific advice>"
}

Rules:
- "sections" must have exactly 6 entries with those exact names.
- "roleLikelihood" should have 5 entries, sorted by score descending.
- "improvements" should have 5-7 entries with a mix of high/medium/low priorities.
- "keywords.present" should list 5-8 technical keywords found in the resume.
- "keywords.missing" should list 5-8 important keywords missing from the resume that ATS systems commonly look for.
- The "summary" should be personalized, mentioning specific details from the resume.
- Be honest and constructive in scoring. Do not inflate scores.
- Return ONLY the JSON object, nothing else.

RESUME TEXT:
`;

app.post('/api/resume/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured. Add your key to server/.env' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Extract text from PDF
    const pdfData = await pdf(req.file.buffer);
    const resumeText = pdfData.text?.trim();

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Could not extract enough text from the PDF. Ensure it is not scanned/image-based.' });
    }

    console.log(`📄 Resume received: ${req.file.originalname} (${resumeText.length} chars extracted)`);

    // Call OpenRouter
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173', // Optional, for OpenRouter rankings
        'X-Title': 'HackFusion', // Optional
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: `${RESUME_ANALYSIS_PROMPT}\n\nRESUME TEXT:\n${resumeText}`
          }
        ],
        response_format: { type: 'json_object' } // Request JSON if supported
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('AI returned an empty response');
    }

    // Parse JSON from response
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '').trim();
    }

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse OpenRouter response:', cleaned.substring(0, 200));
      return res.status(500).json({ error: 'AI returned invalid response format. Please try again.' });
    }

    // Validate required fields exist
    const required = ['atsScore', 'sections', 'roleLikelihood', 'improvements', 'keywords', 'summary'];
    for (const field of required) {
      if (!(field in analysis)) {
        return res.status(500).json({ error: `AI response missing field: ${field}. Please try again.` });
      }
    }

    console.log(`✅ Resume analyzed: ATS Score = ${analysis.atsScore}`);
    res.json(analysis);
  } catch (err) {
    console.error('Resume analysis error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to analyze resume' });
  }
});


// Multer error handler (file too large, wrong type)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Ready360 Server running on http://localhost:${PORT}`);
});
