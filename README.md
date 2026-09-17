# 🎬 GSA Reels Studio

> **Official Compliance Checker & Coach for Google Student Ambassador Instagram Reels Submissions**  
> *Pillar #2 · Content Creation with Reels*

---

## 🌟 Overview

**GSA Reels Studio** is built for Google Student Ambassadors to inspect, refine, and verify their monthly Instagram Reels submissions against official GSA Playbook standards.

- **Live Production App:** [https://gsa-reels-studio.vercel.app](https://gsa-reels-studio.vercel.app)
- **Current Active Theme:** **Idea to Brand**
- **Designated Region:** **East-West India (ping)**
- **Regional Hashtag:** `#ping_mcn`
- **Powered by:** Gemini 2.5 Flash + Local Compliance Heuristic Engine

---

## 📋 The 8 Reel Requirements

1. **Gemini chat/build process is shown** (name, tagline, what's being sold, what's different) *(CRITICAL)*
2. **Nano Banana visual reveal included** (logo, poster, packaging, etc.) *(CRITICAL)*
3. **"Free for students" / Google AI Plus offer said out loud, not buried** *(CRITICAL)*
4. **A specific Gemini feature is identifiable**
5. **GID appears in the caption**
6. **Tags `@GoogleIndia`, `@Googlegemini`, `@GoogleGeminiIndia`**
7. **Hashtags `#GoogleStudentAmbassador` `#GSA2026` `#TeamGemini` present**
8. **Regional hashtag `#ping_mcn` present (East-West India)**

> 🚨 **Critical Fail Rule:**  
> *Mentioning Gemini or showing an AI output is not enough. Missing the Gemini build process, the Nano Banana reveal, or saying the 'free for students' line out loud = FAIL.*

---

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend / Serverless:** Express & Vercel Serverless Functions (`/api/analyze`, `/api/health`)
- **AI Model:** Google Gemini 2.5 Flash

---

## 🛠️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Itsmeaadeesh/analyzer.git
   cd analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```

4. **Start Development Servers:**
   ```bash
   npm run dev
   ```
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001](http://localhost:3001)

---

## 🔒 Proprietary + Confidential

Designed for the Google Student Ambassador Program 2026.