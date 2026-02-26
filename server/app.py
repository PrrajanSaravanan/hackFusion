import os
import io
import json
import logging
import asyncio
from datetime import datetime
import math
import re

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import pypdf
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

# Load environment variables
load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_URL = os.getenv('OPENROUTER_URL', 'https://openrouter.ai/api/v1/chat/completions')
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'meta-llama/llama-3-8b-instruct')

app = Flask(__name__)
PORT = 3001
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── LeetCode GraphQL Queries ───
LEETCODE_API = 'https://leetcode.com/graphql'

USER_PROFILE_QUERY = """
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
      advanced { tagName tagSlug problemsSolved }
      intermediate { tagName tagSlug problemsSolved }
      fundamental { tagName tagSlug problemsSolved }
    }
    badges { name icon }
  }
}"""

CALENDAR_QUERY = """
query userCalendar($username: String!) {
  matchedUser(username: $username) {
    userCalendar {
      submissionCalendar
      streak
      totalActiveDays
    }
  }
}"""

CONTEST_QUERY = """
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
}"""

RECENT_SUBMISSIONS_QUERY = """
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    title
    titleSlug
    timestamp
    lang
  }
}"""

def query_leetcode(query, variables):
    headers = {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
    res = requests.post(LEETCODE_API, headers=headers, json={'query': query, 'variables': variables})
    if not res.ok:
        raise Exception(f"LeetCode API returned {res.status_code}")
    data = res.json()
    if 'errors' in data:
        raise Exception(data['errors'][0].get('message', 'Unknown Error'))
    return data.get('data')

def build_topic_breakdown(tag_problem_counts):
    all_tags = []
    if tag_problem_counts:
        all_tags.extend(tag_problem_counts.get('fundamental') or [])
        all_tags.extend(tag_problem_counts.get('intermediate') or [])
        all_tags.extend(tag_problem_counts.get('advanced') or [])
        
    tag_map = {}
    for tag in all_tags:
        name = tag.get('tagName')
        solved = tag.get('problemsSolved', 0)
        if name not in tag_map or solved > tag_map[name]['problemsSolved']:
            tag_map[name] = tag

    sorted_tags = sorted(tag_map.values(), key=lambda x: x.get('problemsSolved', 0), reverse=True)[:15]
    max_solved = sorted_tags[0].get('problemsSolved', 1) if sorted_tags else 1

    return [{
        'topic': tag['tagName'],
        'solved': tag['problemsSolved'],
        'total': max_solved,
        'proficiency': min(100, round((tag['problemsSolved'] / max_solved) * 100))
    } for tag in sorted_tags]

def build_recent_activity(submission_calendar):
    if not submission_calendar:
        return []
    try:
        calendar = json.loads(submission_calendar)
        entries = []
        for timestamp, count in calendar.items():
            date_str = datetime.fromtimestamp(int(timestamp)).strftime('%Y-%m-%d')
            entries.append({'date': date_str, 'count': int(count)})
        
        entries.sort(key=lambda x: x['date'], reverse=True)
        return entries[:30]
    except Exception:
        return []

def build_difficulty_trend(submission_calendar, easy, medium, hard):
    total = easy + medium + hard
    if total == 0: return []
    months = ['6mo ago', '5mo ago', '4mo ago', '3mo ago', '2mo ago', 'This mo']
    growth_factors = [0.3, 0.45, 0.6, 0.75, 0.9, 1.0]
    
    return [{
        'month': month,
        'easy': round(easy * factor),
        'medium': round(medium * factor),
        'hard': round(hard * factor)
    } for month, factor in zip(months, growth_factors)]

def generate_strengths(data):
    strengths = []
    total_solved = data.get('totalSolved', 0)
    easy = data.get('easy', 0)
    medium = data.get('medium', 0)
    hard = data.get('hard', 0)
    topic_breakdown = data.get('topicBreakdown', [])
    streak = data.get('streak', 0)
    contest_rating = data.get('contestRating', 0)

    if total_solved >= 200: strengths.append(f"Impressive problem count with {total_solved} problems solved")
    elif total_solved >= 100: strengths.append(f"Solid problem count with {total_solved} problems solved")
    elif total_solved >= 50: strengths.append(f"Growing problem base with {total_solved} problems solved")

    top_topics = [t['topic'] for t in topic_breakdown[:3]]
    if top_topics: strengths.append(f"Strong in {', '.join(top_topics)}")

    if medium > easy: strengths.append('Tackling more medium-difficulty problems than easy – shows growth')
    if hard >= 20: strengths.append(f"Solving hard problems consistently ({hard} solved)")
    if streak >= 14: strengths.append(f"Excellent consistency with a {streak}-day streak")
    if contest_rating > 1600: strengths.append(f"Competitive contest rating of {round(contest_rating)}")

    return strengths if strengths else ['Getting started on the LeetCode journey']

def generate_weaknesses(data):
    w = []
    total_solved = data.get('totalSolved', 0)
    hard = data.get('hard', 0)
    topic_breakdown = data.get('topicBreakdown', [])
    contest_rating = data.get('contestRating', 0)

    hard_percent = (hard / total_solved * 100) if total_solved > 0 else 0
    if hard_percent < 15: w.append(f"Hard problems ratio is low ({round(hard_percent)}%) – aim for 20%+ for top companies")

    weak_topics = [t for t in topic_breakdown if t.get('proficiency', 0) < 60][:3]
    for tag in weak_topics:
        w.append(f"{tag['topic']} needs improvement ({tag['proficiency']}% proficiency)")

    if total_solved < 100: w.append('Need to solve more problems – aim for 150+ for interview readiness')
    if contest_rating < 1500 and contest_rating > 0: w.append(f"Contest rating ({round(contest_rating)}) could be improved with regular practice")
    if contest_rating == 0: w.append('No contest participation yet – contests help build speed and accuracy')

    return w if w else ['Keep pushing to find your growth areas']

def generate_summary(data):
    username = data.get('username', '')
    total_solved = data.get('totalSolved', 0)
    hard = data.get('hard', 0)
    topic_breakdown = data.get('topicBreakdown', [])
    contest_rating = data.get('contestRating', 0)
    streak = data.get('streak', 0)

    top_topics = topic_breakdown[:3]
    weak_topics = [t for t in topic_breakdown if t.get('proficiency', 0) < 60][:2]
    hard_percent = round((hard / total_solved * 100)) if total_solved > 0 else 0

    summary = f"Based on {username}'s LeetCode profile, "

    if total_solved >= 200:
        summary += f"you have an impressive {total_solved} problems solved, showing strong dedication. "
    elif total_solved >= 100:
        summary += f"you have a solid foundation with {total_solved} problems solved. "
    else:
        summary += f"you're building your skills with {total_solved} problems solved so far. "

    if top_topics:
        td_str = ", ".join([f"{t['topic']} ({t['proficiency']}%)" for t in top_topics])
        summary += f"Your strongest areas are {td_str}. "

    if weak_topics:
        w_str = " and ".join([t['topic'] for t in weak_topics])
        summary += f"Areas needing attention include {w_str}. "

    if contest_rating > 0:
        comp_str = 'places you in the competitive range' if contest_rating > 1600 else 'shows room for growth'
        summary += f"Your contest rating of {round(contest_rating)} {comp_str}. "

    if streak > 0:
        c_str = 'excellent' if streak >= 14 else 'good'
        summary += f"Your {streak}-day streak shows {c_str} consistency. "

    if hard_percent < 20: 
        summary += f"For SDE roles at top companies, focus on increasing your hard problem percentage from {hard_percent}% to at least 20%."
    else: 
        summary += "For SDE roles at top companies, maintain your strong hard problem ratio."

    return summary

def generate_career_signals(data):
    total_solved = data.get('totalSolved', 0)
    hard = data.get('hard', 0)
    topic_breakdown = data.get('topicBreakdown', [])
    contest_rating = data.get('contestRating', 0)

    topic_map = {t['topic'].lower(): t['proficiency'] for t in topic_breakdown}

    dp_score = topic_map.get('dynamic programming', topic_map.get('memoization', 0))
    graph_score = topic_map.get('graph', topic_map.get('breadth-first search', topic_map.get('depth-first search', 0)))
    array_score = topic_map.get('array', 0)
    math_score = topic_map.get('math', 0)
    design_score = topic_map.get('design', topic_map.get('hash table', 0))

    base = min(100, total_solved / 3)
    hard_bonus = min(20, hard)
    contest_bonus = min(15, contest_rating / 200) if contest_rating > 0 else 0

    signals = [
        {'domain': 'Backend Engineering', 'score': min(100, round(base + dp_score * 0.3 + graph_score * 0.2 + hard_bonus + contest_bonus))},
        {'domain': 'Full-Stack Development', 'score': min(100, round(base + array_score * 0.3 + design_score * 0.2 + hard_bonus * 0.5))},
        {'domain': 'Systems Design', 'score': min(100, round(base * 0.8 + graph_score * 0.3 + dp_score * 0.2 + hard_bonus))},
        {'domain': 'AI/ML Engineering', 'score': min(100, round(base * 0.6 + math_score * 0.4 + dp_score * 0.2))},
        {'domain': 'DevOps/SRE', 'score': min(100, round(base * 0.4 + design_score * 0.3))}
    ]
    return sorted(signals, key=lambda x: x['score'], reverse=True)

@app.route('/api/leetcode/<username>', methods=['GET'])
def get_leetcode(username):
    try:
        profile_data = query_leetcode(USER_PROFILE_QUERY, {'username': username})
        
        try:
            contest_data = query_leetcode(CONTEST_QUERY, {'username': username})
        except: contest_data = None
        
        try:
            recent_data = query_leetcode(RECENT_SUBMISSIONS_QUERY, {'username': username, 'limit': 20})
        except: recent_data = None
        
        try:
            calendar_data = query_leetcode(CALENDAR_QUERY, {'username': username})
        except: calendar_data = None

        user = profile_data.get('matchedUser')
        if not user:
            return jsonify({'error': f'User "{username}" not found on LeetCode'}), 404

        ac_stats = user.get('submitStatsGlobal', {}).get('acSubmissionNum', [])
        
        def get_count(diff):
            for s in ac_stats:
                if s.get('difficulty') == diff:
                    return s.get('count', 0)
            return 0

        total_solved = get_count('All')
        easy = get_count('Easy')
        medium = get_count('Medium')
        hard = get_count('Hard')

        contest_rating = 0
        contests_attended = 0
        if contest_data and contest_data.get('userContestRanking'):
             contest_rating = contest_data['userContestRanking'].get('rating', 0)
             contests_attended = contest_data['userContestRanking'].get('attendedContestsCount', 0)

        topic_breakdown = build_topic_breakdown(user.get('tagProblemCounts'))

        recent_activity = []
        difficulty_trend = []
        streak = 0
        
        if calendar_data and calendar_data.get('matchedUser'):
            cal_user = calendar_data['matchedUser']
            user_cal = cal_user.get('userCalendar', {})
            recent_activity = build_recent_activity(user_cal.get('submissionCalendar'))
            difficulty_trend = build_difficulty_trend(user_cal.get('submissionCalendar'), easy, medium, hard)
            streak = user_cal.get('streak', 0)

        ranking = user.get('profile', {}).get('ranking', 0)

        response_data = {
            'username': user.get('username'),
            'totalSolved': total_solved,
            'easy': easy,
            'medium': medium,
            'hard': hard,
            'ranking': ranking,
            'contestRating': contest_rating,
            'contestsAttended': contests_attended,
            'streak': streak,
            'topicBreakdown': topic_breakdown,
            'recentActivity': recent_activity,
            'difficultyTrend': difficulty_trend,
        }

        response_data['strengths'] = generate_strengths(response_data)
        response_data['weaknesses'] = generate_weaknesses(response_data)
        response_data['summary'] = generate_summary(response_data)
        response_data['careerSignals'] = generate_career_signals(response_data)

        return jsonify(response_data)

    except Exception as e:
        logger.error(f'LeetCode API error: {str(e)}')
        return jsonify({'error': str(e) or 'Failed to fetch LeetCode data'}), 500

# ─── GitHub API Route ───
GITHUB_API = 'https://api.github.com'

LANG_COLORS = {
  'JavaScript': '#F7DF1E', 'TypeScript': '#3178C6', 'Python': '#3776AB',
  'Java': '#ED8B00', 'C++': '#00599C', 'C': '#555555', 'C#': '#239120',
  'Go': '#00ADD8', 'Rust': '#DEA584', 'Ruby': '#CC342D', 'PHP': '#777BB4',
  'Swift': '#FA7343', 'Kotlin': '#7F52FF', 'Dart': '#0175C2', 'Scala': '#DC322F',
  'R': '#276DC3', 'MATLAB': '#e16737', 'Shell': '#89e051', 'HTML': '#E34C26',
  'CSS': '#563D7C', 'Solidity': '#363636', 'Jupyter Notebook': '#F37626',
  'Vue': '#4FC08D', 'Svelte': '#FF3E00',
}

DOMAIN_COLORS = {
  'AI/ML': '#7c4dff', 'Web Dev': '#448aff', 'Mobile': '#18ffff',
  'DevOps/Cloud': '#69f0ae', 'Blockchain': '#ffab40', 'Data Science': '#ea80fc',
  'IoT/Embedded': '#ff8a65', 'Game Dev': '#ffd740', 'Security': '#ff5252', 'Other': '#6c757d',
}

def classify_repo_domain(repo):
    text = f"{repo.get('name', '')} {repo.get('description', '')} {repo.get('language', '')}".lower()

    if re.search(r'\b(ml|machine.?learn|deep.?learn|neural|ai|nlp|bert|gpt|tensor|pytorch|keras|model|predict)\b', text): return 'AI/ML'
    if re.search(r'\b(web|react|next|vue|angular|frontend|full.?stack|express|node|django|flask|api|rest|graphql)\b', text): return 'Web Dev'
    if re.search(r'\b(mobile|android|ios|flutter|react.?native|swift|kotlin)\b', text): return 'Mobile'
    if re.search(r'\b(devops|docker|kubernetes|k8s|ci.?cd|terraform|aws|azure|cloud|deploy)\b', text): return 'DevOps/Cloud'
    if re.search(r'\b(blockchain|crypto|solidity|ethereum|web3|smart.?contract|defi)\b', text): return 'Blockchain'
    if re.search(r'\b(data|analy|pandas|numpy|visualization|dashboard|etl|sql|database)\b', text): return 'Data Science'
    if re.search(r'\b(iot|embedded|arduino|raspberry|sensor|hardware)\b', text): return 'IoT/Embedded'
    if re.search(r'\b(game|unity|unreal|godot|pygame)\b', text): return 'Game Dev'
    if re.search(r'\b(security|cyber|hack|ctf|pentest|crypt)\b', text): return 'Security'
    return 'Other'

def query_github(path):
    url = f"{GITHUB_API}{path}"
    headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
    res = requests.get(url, headers=headers)
    if res.status_code == 404: raise Exception(f"User not found on GitHub: {path}")
    if res.status_code == 403: raise Exception('GitHub API rate limit exceeded. Try again in a few minutes.')
    if not res.ok: raise Exception(f"GitHub API returned {res.status_code}")
    return res.json()

def gh_generate_strengths(data):
    s = []
    total_repos = data.get('totalRepos', 0)
    total_stars = data.get('totalStars', 0)
    total_commits = data.get('totalCommits', 0)
    followers = data.get('followers', 0)
    tech_stack = data.get('techStack', [])
    repositories = data.get('repositories', [])

    if total_repos >= 20: s.append(f"Prolific developer with {total_repos} public repositories")
    elif total_repos >= 10: s.append(f"Active developer with {total_repos} public repositories")

    if total_stars >= 50: s.append(f"Projects are well-received with {total_stars} total stars")
    elif total_stars >= 10: s.append(f"Growing community recognition with {total_stars} stars")

    if len(tech_stack) >= 4: s.append(f"Diverse tech stack spanning {', '.join(t['name'] for t in tech_stack[:4])}")

    starred_repos = [r for r in repositories if r.get('stars', 0) > 0]
    if len(starred_repos) > 0: s.append(f"{len(starred_repos)} repositories have earned community stars")

    if followers >= 50: s.append(f"Strong developer network with {followers} followers")
    if total_commits >= 500: s.append(f"High commit velocity with {total_commits}+ contributions")

    return s if s else ['Getting started on GitHub – keep building!']

def gh_generate_weaknesses(data):
    w = []
    total_repos = data.get('totalRepos', 0)
    total_stars = data.get('totalStars', 0)
    total_commits = data.get('totalCommits', 0)
    repositories = data.get('repositories', [])

    if total_repos < 5: w.append('Low repository count – consider publishing more projects')
    if total_stars < 5: w.append('Few stars – improve README quality and share projects in communities')

    no_desc = len([r for r in repositories if not r.get('description')])
    if len(repositories) > 0 and no_desc > len(repositories) * 0.3:
        w.append(f"{no_desc} repos lack descriptions – add clear descriptions to all projects")

    langs = set([r.get('language') for r in repositories if r.get('language')])
    if len(langs) <= 1: w.append('Limited language diversity – try exploring new technologies')

    if total_commits < 200: w.append('Commit count is below average – aim for consistent daily contributions')

    return w if w else ['Looking good! Keep pushing to grow your portfolio']

def gh_generate_summary(data):
    username = data.get('username')
    total_repos = data.get('totalRepos', 0)
    total_stars = data.get('totalStars', 0)
    total_commits = data.get('totalCommits', 0)
    followers = data.get('followers', 0)
    tech_stack = data.get('techStack', [])
    domain_distribution = data.get('domainDistribution', [])

    top_lang = tech_stack[0]['name'] if tech_stack else 'various languages'
    top_domain = domain_distribution[0]['domain'] if domain_distribution else 'software development'
    
    summary = f"{username}'s GitHub profile shows "
    if total_repos >= 15: summary += f"an active developer with {total_repos} public repositories and {total_commits} total contributions. "
    elif total_repos >= 5: summary += f"a growing developer with {total_repos} repositories. "
    else: summary += f"an emerging developer with {total_repos} repositories so far. "

    summary += f"Primary expertise is in {top_lang}, with strongest signals in {top_domain}. "

    if total_stars > 0: summary += f"Projects have earned {total_stars} stars, showing community interest. "
    if followers > 10: summary += f"A network of {followers} followers indicates growing developer presence. "

    if len(tech_stack) >= 3:
        summary += f"Tech diversity across {', '.join([t['name'] for t in tech_stack[:3]])} suggests versatility. "

    summary += "Focus on contributing to open-source, adding tests, and improving documentation to strengthen the profile further."
    
    return summary

def gh_generate_career_signals(data):
    tech_stack = data.get('techStack', [])
    domain_distribution = data.get('domainDistribution', [])
    total_repos = data.get('totalRepos', 0)
    total_stars = data.get('totalStars', 0)

    lang_map = {t['name'].lower(): t['percentage'] for t in tech_stack}
    domain_map = {d['domain']: d['value'] for d in domain_distribution}

    base = min(40, total_repos * 2)
    star_bonus = min(15, total_stars)

    signals = [
        {'domain': 'Full-Stack Development', 'score': min(100, round(base + lang_map.get('javascript', 0) * 0.8 + lang_map.get('typescript', 0) * 0.8 + domain_map.get('Web Dev', 0) * 0.5 + star_bonus))},
        {'domain': 'AI/ML Engineering', 'score': min(100, round(base * 0.7 + lang_map.get('python', 0) * 0.8 + lang_map.get('jupyter notebook', 0) * 0.5 + domain_map.get('AI/ML', 0) * 0.6 + star_bonus * 0.5))},
        {'domain': 'Backend Engineering', 'score': min(100, round(base + lang_map.get('python', 0) * 0.5 + lang_map.get('java', 0) * 0.6 + lang_map.get('go', 0) * 0.8 + star_bonus))},
        {'domain': 'DevOps/Cloud', 'score': min(100, round(base * 0.5 + lang_map.get('shell', 0) * 0.6 + domain_map.get('DevOps/Cloud', 0) * 0.8))},
        {'domain': 'Mobile Development', 'score': min(100, round(base * 0.5 + lang_map.get('dart', 0) * 0.8 + lang_map.get('kotlin', 0) * 0.8 + lang_map.get('swift', 0) * 0.8 + domain_map.get('Mobile', 0) * 0.6))},
    ]
    return sorted(signals, key=lambda x: x['score'], reverse=True)

@app.route('/api/github/<username>', methods=['GET'])
def get_github(username):
    try:
        profile = query_github(f'/users/{username}')
        repos = query_github(f'/users/{username}/repos?per_page=100&sort=updated&type=owner')
        try:
            events = query_github(f'/users/{username}/events/public?per_page=100')
        except: events = []

        total_repos = profile.get('public_repos') or len(repos)
        followers = profile.get('followers', 0)
        following = profile.get('following', 0)
        
        total_stars = sum(r.get('stargazers_count', 0) for r in repos)
        total_forks = sum(r.get('forks_count', 0) for r in repos)

        push_events = [e for e in events if e.get('type') == 'PushEvent']
        total_commits_events = sum(len(e.get('payload', {}).get('commits', [])) for e in push_events)
        total_commits = max(total_commits_events, (profile.get('public_repos', 0) * 15))

        non_forks = [r for r in repos if not r.get('fork')]
        non_forks_sorted = sorted(non_forks, key=lambda x: (x.get('stargazers_count',0) + x.get('forks_count',0)*2), reverse=True)
        top_repos = []
        for r in non_forks_sorted[:6]:
            top_repos.append({
                'name': r.get('name'),
                'language': r.get('language') or 'N/A',
                'stars': r.get('stargazers_count', 0),
                'forks': r.get('forks_count', 0),
                'description': r.get('description') or 'No description',
                'domain': classify_repo_domain(r),
                'url': r.get('html_url')
            })

        lang_bytes = {}
        for r in non_forks:
            lang = r.get('language')
            if lang:
                weight = (r.get('stargazers_count', 0)) + 1 + math.log2(max(1, r.get('size', 1)))
                lang_bytes[lang] = lang_bytes.get(lang, 0) + weight

        total_weight = sum(lang_bytes.values()) or 1
        tech_stack = []
        for name, weight in sorted(lang_bytes.items(), key=lambda x: x[1], reverse=True)[:8]:
            tech_stack.append({
                'name': name,
                'percentage': round((weight / total_weight) * 100),
                'color': LANG_COLORS.get(name, '#6c757d')
            })

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        now = datetime.now()
        commits_by_month = {}
        for i in range(5, -1, -1):
            m = (now.month - i - 1) % 12
            commits_by_month[month_names[m]] = 0

        for ev in push_events:
            d = datetime.strptime(ev['created_at'], "%Y-%m-%dT%H:%M:%SZ")
            key = month_names[d.month - 1]
            if key in commits_by_month:
                commits_by_month[key] += len(ev.get('payload', {}).get('commits', []))
        
        commit_velocity = [{'month': k, 'commits': v} for k, v in commits_by_month.items()]

        domain_counts = {}
        for r in non_forks:
            d = classify_repo_domain(r)
            domain_counts[d] = domain_counts.get(d, 0) + 1
        
        total_domain_repos = sum(domain_counts.values()) or 1
        domain_distribution = []
        for domain, count in sorted(domain_counts.items(), key=lambda x: x[1], reverse=True):
            domain_distribution.append({
                'domain': domain,
                'value': round((count / total_domain_repos) * 100),
                'color': DOMAIN_COLORS.get(domain, '#6c757d')
            })

        has_readme = len([r for r in non_forks if r.get('description')])
        readme_ratio = has_readme / len(non_forks) if len(non_forks) > 0 else 0
        voluntary_effort_score = min(100, round(
            readme_ratio * 30 +
            min(25, total_stars * 2) +
            min(20, len(tech_stack) * 4) +
            min(25, total_repos * 1.5)
        ))

        response_data = {
            'username': profile.get('login'),
            'avatarUrl': profile.get('avatar_url'),
            'bio': profile.get('bio'),
            'totalRepos': total_repos,
            'totalStars': total_stars,
            'totalForks': total_forks,
            'totalCommits': total_commits,
            'followers': followers,
            'following': following,
            'voluntaryEffortScore': voluntary_effort_score,
            'repositories': top_repos,
            'techStack': tech_stack,
            'commitVelocity': commit_velocity,
            'domainDistribution': domain_distribution,
        }

        response_data['strengths'] = gh_generate_strengths(response_data)
        response_data['weaknesses'] = gh_generate_weaknesses(response_data)
        response_data['summary'] = gh_generate_summary(response_data)
        response_data['careerSignals'] = gh_generate_career_signals(response_data)

        return jsonify(response_data)
    except Exception as e:
        logger.error(f'GitHub API error: {str(e)}')
        status = 404 if 'not found' in str(e).lower() else 500
        return jsonify({'error': str(e)}), status

# ─── Resume Analysis Route (OpenRouter AI) ───
RESUME_ANALYSIS_PROMPT = """You are an expert ATS (Applicant Tracking System) resume analyzer and career advisor.

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
"""

@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume():
    try:
        if not OPENROUTER_API_KEY:
            return jsonify({'error': 'OpenRouter API key not configured.'}), 500
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        filename_lower = file.filename.lower()
        if not (filename_lower.endswith('.pdf') or filename_lower.endswith('.png') or filename_lower.endswith('.jpg') or filename_lower.endswith('.jpeg')):
            return jsonify({'error': 'Only PDF, PNG, or JPG files are accepted'}), 400

        file_bytes = file.read()
        if len(file_bytes) > 10 * 1024 * 1024:
            return jsonify({'error': 'File too large. Maximum size is 10 MB.'}), 400

        resume_text = ""
        if filename_lower.endswith('.pdf'):
            # Extract text using PyPDF
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\n"
        else:
            # Extract text using EasyOCR
            if not EASYOCR_AVAILABLE:
                return jsonify({'error': 'EasyOCR not installed. Please upload a PDF file instead.'}), 400
            if 'ocr_reader' not in globals() or globals()['ocr_reader'] is None:
                globals()['ocr_reader'] = easyocr.Reader(['en'], gpu=False)
            results = globals()['ocr_reader'].readtext(file_bytes)
            resume_text = " ".join([result[1] for result in results])
        
        resume_text = resume_text.strip()
        
        if not resume_text or len(resume_text) < 50:
            return jsonify({'error': 'Could not extract enough text from the PDF. Ensure it is not scanned/image-based.'}), 400

        logger.info(f"📄 Resume received: {file.filename} ({len(resume_text)} chars extracted)")

        # Call OpenRouter
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'HackFusion',
        }
        
        payload = {
            'model': OPENROUTER_MODEL,
            'messages': [
                {
                    'role': 'user',
                    'content': f"{RESUME_ANALYSIS_PROMPT}\n\nRESUME TEXT:\n{resume_text}"
                }
            ],
            'response_format': { 'type': 'json_object' }
        }

        res = requests.post(OPENROUTER_URL, headers=headers, json=payload)
        
        if not res.ok:
            error_data = res.json()
            raise Exception(f"OpenRouter API error: {error_data.get('error', {}).get('message', res.text)}")
            
        data = res.json()
        response_text = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        if not response_text:
            raise Exception('AI returned an empty response')
            
        cleaned = response_text.strip()
        if cleaned.startswith('```'):
            cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
            cleaned = re.sub(r'```\s*$', '', cleaned).strip()

        try:
            analysis = json.loads(cleaned)
        except json.JSONDecodeError as parseErr:
            logger.error(f"Failed to parse OpenRouter response: {cleaned[:200]}")
            return jsonify({'error': 'AI returned invalid response format. Please try again.'}), 500

        required_fields = ['atsScore', 'sections', 'roleLikelihood', 'improvements', 'keywords', 'summary']
        for field in required_fields:
            if field not in analysis:
                return jsonify({'error': f'AI response missing field: {field}. Please try again.'}), 500

        logger.info(f"✅ Resume analyzed: ATS Score = {analysis['atsScore']}")
        return jsonify(analysis)

    except Exception as e:
        logger.error(f"Resume analysis error: {str(e)}")
        return jsonify({'error': str(e) or 'Failed to analyze resume'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)
