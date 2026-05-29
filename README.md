# TOEICFlow

> A modern TOEIC exam management & practice platform (AI-assisted learning project)

## Overview

**TOEICFlow** is a TOEIC learning and exam management platform built for teachers and students, with a focus on the **TOEIC Reading Part 5 MVP** today and a structure meant to scale to other parts later.

This repository is a **personal, non-commercial learning project** created to explore modern frontend architecture and an AI-assisted development workflow.

## Features

### Authentication & Roles

- Supabase authentication
- Teacher role
- Admin role
- Role-protected routing

### Teacher

- Create TOEIC exams
- Manage questions (Part 5 in V1)
- Publish / unpublish exams
- Share public exam links
- Soft delete exams
- Restore soft-deleted exams

### Student

- Public exam experience
- Timer-based practice
- Sticky question palette/sidebar (UX designed for exams)
- Auto-submit when time runs out
- Instant result calculation

### Admin

- Admin dashboard
- Accounts overview
- Exams overview
- Deleted exams management
- Restore soft-deleted exams
- Exam detail view (read-only + restore)

### UI / UX polish

- Responsive layout
- Mobile bottom navigation
- Fixed admin shell layout + improved scroll behavior
- SaaS-style homepage
- Branding/logo integration
- Favicon integration

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Zustand
- React Hook Form
- Zod

### Backend / Infrastructure

- **Supabase**
  - Authentication
  - Database
  - Storage (reserved for future workflows)
  - RLS policies

### Deployment

- Vercel

## Architecture (high-level)

The codebase follows a clean, layered approach:

- **`services/`**  
  Supabase communication layer: queries, mutations, and data access.
- **`stores/`**  
  Zustand state and app orchestration: UI/business state and workflow logic.
- **`pages/`**  
  UI orchestration layer: route-level screens that render and coordinate stores/services.
- **`lib/`**  
  Shared helpers (e.g., Supabase client wrapper).
- **`routes/`**  
  Router definitions and route protection.

This layering keeps data access and state logic maintainable while ensuring pages remain focused on UI composition.

## Project Structure

Example layout:

```
src/
  pages/        # route-level screens (UI orchestration)
  routes/       # router + protected/role-based routes
  services/     # Supabase queries/mutations (communication layer)
  stores/       # Zustand state + workflow orchestration
  layouts/      # App layouts (public app layout + admin shell)
  components/   # UI components and shadcn/ui wrappers
  hooks/        # reusable hooks
  lib/          # shared utilities (e.g., supabase client)
  assets/       # static assets (branding/logos, etc.)
  constants/
  types/
  utils/
```

### Why this separation?

- **services =** Supabase I/O
- **stores =** state + workflow
- **pages =** screen composition

## Environment Variables

This app uses Supabase. Create a `.env` file at the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env` to version control.

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Run locally

```bash
npm run dev
```

Then open the local URL shown in your terminal (commonly `http://localhost:5173`).

## Supabase Setup (quick checklist)

1. Create a Supabase project.
2. Enable **authentication** for teachers (and admin role as needed).
3. Create the required tables (at minimum):
   - `exams`
   - TOEIC Part 5 questions (MVP)
   - (plus any supporting tables/columns used by the app)
4. Configure **RLS policies** so teacher/admin access is enforced.
5. Add credentials to `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Deployment

This project is designed to be deployable on **Vercel**.

1. Connect your GitHub repo to Vercel.
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy using your standard Vite+React build settings.

## AI-Assisted Development Disclaimer (Important)

This is a **personal/non-commercial learning project**.

Approximately **99% of the codebase** was developed with assistance from AI tools. AI tools used include:

- **ChatGPT**
- **Blackbox AI** (Kimi K2.6 model)

The project exists primarily for learning, experimentation, and practicing AI-assisted software development workflows.

## Notes / Limitations

- The current MVP focuses on **TOEIC Reading Part 5**.
- Teacher/admin routing and exam/question flows are implemented, while student experience uses public/shared exam links.
- Media handling for question images uses **external `image_url`** values in the MVP (no upload workflow yet).

## License

See repository license (if present). If no license is provided, assume **all rights reserved** by the author.
