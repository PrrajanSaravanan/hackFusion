// ─── Resume Analysis Service ───
// Sends PDF to our Express server for Gemini-powered analysis

export interface ResumeSection {
    name: string;
    score: number;
    feedback: string;
}

export interface ResumeImprovement {
    priority: 'high' | 'medium' | 'low';
    text: string;
}

export interface ResumeData {
    atsScore: number;
    sections: ResumeSection[];
    roleLikelihood: { role: string; score: number }[];
    improvements: ResumeImprovement[];
    keywords: { present: string[]; missing: string[] };
    summary: string;
}

const API_BASE = '/api';

export async function analyzeResume(file: File): Promise<ResumeData> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/resume/analyze`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Analysis failed (${response.status})`);
    }

    return response.json();
}
