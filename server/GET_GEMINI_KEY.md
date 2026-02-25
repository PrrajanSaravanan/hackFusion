# How to Get a Gemini API Key

## Steps

1. Go to **[Google AI Studio](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select a Google Cloud project (or create a new one)
5. Copy the generated API key

## Add It to Your Project

Open `server/.env` and replace the placeholder:

```
GEMINI_API_KEY=paste_your_key_here
```

## Verify It Works

```bash
cd server
node index.js
```

Then upload a PDF resume at http://localhost:5173/onboarding/resume

## Notes

- The free tier gives **15 requests/minute** — more than enough for development
- We use the `gemini-2.0-flash` model (fast + free tier eligible)
- **Never commit your `.env` file** — it's already in `.gitignore`
