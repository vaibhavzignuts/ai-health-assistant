# 🏥 Community Health Assistant

**Empowering underserved communities with accessible healthcare tools.**

This is a full-stack healthcare assistant web application built using **Next.js**, **Supabase**, **Tailwind CSS**, and deployed on **Vercel**. It offers tools like AI-powered symptom checking, local facility discovery, medicine reminders, emergency contact management, and personalized health tips — all in one platform.

---

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS (v3+)
- **Backend-as-a-Service:** Supabase (Auth, DB, Storage)
- **Database:** PostgreSQL (via Supabase)
- **AI Integration:** Gemini (for symptom checking)
- **Deployment:** Vercel

---

## ✅ Features

- 🔐 User Authentication (Email/Password via Supabase)
- 🧍 Onboarding with Health Info
- 🏠 Personalized Dashboard
- 💬 AI Symptom Checker (Gemini API)
- 🏥 Local Healthcare Facility Finder
- 💊 Medicine Reminder System
- 📋 Personalized Health Tips
- 🚨 Emergency Contact Management
- 📱 Responsive UI (mobile-friendly)
- 🌐 Deployed & publicly accessible

---

## 📁 Project Structure

/app
/dashboard # Private dashboard home
/login # Login page
/register # Signup page
/onboarding # Profile setup page
/symptom-checker # AI symptom checker
/find-facility # Facility finder
/reminders # Medicine reminder system
/health-tips # Personalized health advice
/emergency # Emergency contact section
/profile # Edit profile/settings
/public
/styles
/utils

yaml
Copy
Edit

---

## 🛠️ Local Development Setup

### 📋 Requirements

- Node.js **v20+**
- Supabase project with required tables & auth
- API key from Google Gemini (for symptom checker)

### 📦 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/community-health-assistant.git

# Navigate to the project directory
cd community-health-assistant

# Install dependencies
npm install