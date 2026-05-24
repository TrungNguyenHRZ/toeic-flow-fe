# TOEIC Flow (React + TypeScript + Vite)

## Project Overview

**TOEIC Flow** is an exam management platform for TOEIC practice. It provides a teacher-focused workflow to:

- authenticate teachers
- create and manage exams
- manage **TOEIC Reading Part 5** questions

The current MVP is **Part 5-only**, but the architecture is intentionally designed to scale to **Part 6 and Part 7**.

---

## Features

- Teacher authentication (Supabase Auth)
- Protected teacher dashboard
- Exam CRUD
- TOEIC Reading Part 5 question CRUD
- Soft delete for exams
- External `image_url` support for question images (no upload workflow in MVP)
- Future-ready structure for Part 6 / Part 7

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **State Management:** Zustand
- **UI:** Tailwind CSS
- **Forms & Validation:** React Hook Form + Zod
- **Backend / Auth / Database:** Supabase

---

## Project Structure

This project follows a layered architecture:

- **`services/` = Supabase access layer**  
  Contains Supabase queries/mutations and data-fetching logic.

- **`stores/` = Zustand business state**  
  Orchestrates app workflows and holds UI/business state.

- **`pages/` = UI / orchestration layer**  
  Route-level screens that render UI and call into stores.

Additional structure:

- **`routes/`**: route definitions and protected routing
- **`lib/`**: shared helpers (e.g., Supabase client wrapper)

---

## Environment Variables

This app uses Supabase. Create a `.env` file at the project root:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not commit `.env` to version control.

---

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal (commonly `http://localhost:5173`).

---

## Supabase Setup

1. Create a Supabase project.
2. Set up **authentication** for teachers.
3. Create the required tables (at minimum for):
   - exams
   - TOEIC Part 5 questions
4. Configure **Row Level Security (RLS)** policies so teacher-only access is enforced.
5. Add your credentials to `.env`:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`

---

## Authentication Flow

1. A teacher signs in using **Supabase Auth**.
2. Auth/session state is handled by the app and stored in **Zustand** (auth store).
3. Protected routes (e.g., teacher dashboard) ensure unauthenticated users cannot access teacher pages.
4. Authenticated teachers interact with exams and questions via:
   - `services/` (Supabase calls)
   - `stores/` (state + orchestration)
   - `pages/` (UI)

---

## Current Limitations

- **MVP scope:** **TOEIC Reading Part 5 only**
- **Question images:** uses external `image_url` values in the current MVP (no file upload/storage flow yet)
- Teacher workflow is implemented; other user flows/roles can be added later.

---

## Important Architecture Decisions

- **Soft delete for exams**  
  Exams are marked as deleted instead of being permanently removed. This preserves data and supports future history/recovery/audit needs.

- **External `image_url` for question images**  
  Questions rely on externally hosted images to keep the MVP lightweight and avoid upload/storage complexity.

- **Part 5-only MVP with future-ready design**  
  The current services/stores/pages approach is structured so adding Part 6/7 doesn’t require reworking the core architecture.

---

## Future Roadmap

Planned next steps aligned with the current architecture:

- Add **TOEIC Reading Part 6** (question CRUD + UI)
- Add **TOEIC Reading Part 7** (question CRUD + UI)
- Revisit media handling for questions (optionally evolve beyond `image_url`)
- Expand teacher dashboard workflows as new exam parts and features are added
