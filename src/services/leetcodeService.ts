// ─── LeetCode API Service ───
// Fetches real LeetCode profile data from our Express proxy server

export interface LeetCodeData {
    username: string;
    totalSolved: number;
    easy: number;
    medium: number;
    hard: number;
    ranking: number;
    contestRating: number;
    contestsAttended: number;
    streak: number;
    topicBreakdown: { topic: string; solved: number; total: number; proficiency: number }[];
    recentActivity: { date: string; count: number }[];
    difficultyTrend: { month: string; easy: number; medium: number; hard: number }[];
    strengths: string[];
    weaknesses: string[];
    summary: string;
    careerSignals: { domain: string; score: number }[];
}

const API_BASE = '/api';

export async function fetchLeetCodeProfile(username: string): Promise<LeetCodeData> {
    const response = await fetch(`${API_BASE}/leetcode/${encodeURIComponent(username)}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Failed to fetch data (${response.status})`);
    }

    return response.json();
}
