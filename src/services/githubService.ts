// ─── GitHub API Service ───
// Fetches real GitHub profile data from our Express proxy server

export interface GitHubRepo {
    name: string;
    language: string;
    stars: number;
    forks: number;
    description: string;
    domain: string;
    url: string;
}

export interface GitHubData {
    username: string;
    avatarUrl: string;
    bio: string | null;
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    totalCommits: number;
    followers: number;
    following: number;
    voluntaryEffortScore: number;
    repositories: GitHubRepo[];
    techStack: { name: string; percentage: number; color: string }[];
    commitVelocity: { month: string; commits: number }[];
    domainDistribution: { domain: string; value: number; color: string }[];
    strengths: string[];
    weaknesses: string[];
    summary: string;
    careerSignals: { domain: string; score: number }[];
}

const API_BASE = '/api';

export async function fetchGitHubProfile(username: string): Promise<GitHubData> {
    const response = await fetch(`${API_BASE}/github/${encodeURIComponent(username)}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Failed to fetch data (${response.status})`);
    }

    return response.json();
}
