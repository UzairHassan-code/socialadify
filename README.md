# SocialAdify

**SocialAdify** is an AI-driven platform to simplify the process of creating, managing, and optimizing ads on **Facebook**, **Instagram**, and **Google**. Whether you're a solo creator or a business marketer, SocialAdify makes ad management smarter, faster, and easier.

---

## Completed Features

### AI-Powered Caption Generator
- Generates ad/post captions using AI based on user questionnaire.
- Supports different tones, emojis, hashtags, and post categories.
- Leverages image understanding via **BLIP** and **Gemini API** for smart captioning.

### Insight Ad AI (Analytics Module)
- Visualizes ad performance using mock data (Meta & Google).
- Provide AI suggestion to user based on metrics.
- Metrics include **CTR, ROI, CPC, Engagement Rate**, and more.
- Offers time-based trend graphs and exportable reports (**PDF/CSV**).
- Supports early-stage **AI-driven suggestions** for ad improvement.

---

## In Progress

### Post Scheduling Module
- Scheduling Facebook/Instagram posts via platform APIs.
- Suggest best time to post using an AI model.
- Includes post preview, edit, and delete functionality.
- Calendar-style UI for visual post planning.

---

## Roadmap

- [ ] **Real Ad API Integration** (Meta & Google Ads)
- [ ] **AI-Powered Ad Placement Engine**
  - Audience targeting, budget suggestion, real-time preview
- [ ] **Post/Ad generation System**
  - generate socialmedia post or ad base on questionnire
- [ ] **Admin Dashboard**
  - User management and platform monitoring
- [ ] ****
  - Team-based ad management with access roles

---

## Tech Stack

| Layer        | Technology             |
|--------------|------------------------|
| Frontend     | Next.js, Tailwind CSS  |
| Backend      | FastAPI (Python)       |
| Database     | MongoDB                |
| AI Models    | BLIP (image → text), Gemini API (text generation) |
| Authentication | Google OAuth, JWT    |

---

##  Local Setup to run

##  Note entire work till now is now on branch feature/insight-ad-ai 

```bash
# Clone the repo
git clone --branch feature/insigh-ad-ai --single-branch https://github.com/uzair-hassan003/SocialAdify.git
cd socialAdify

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload
