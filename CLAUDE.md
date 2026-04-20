# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Free resume building platform inspired by WonderCV (超级简历). Monorepo with separate frontend and backend.

## Development Commands

```bash
# Frontend (port 5173)
cd frontend && npm run dev

# Backend (port 3001)
cd backend && npm run dev

# Build
cd frontend && npm run build   # Vite production build
cd backend && npm run build    # TypeScript compile

# Type check
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

## Architecture

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4 + Zustand
- **Backend**: Express + TypeScript + Puppeteer
- **Storage**: localStorage (MySQL planned later)
- **PDF**: Frontend serializes React templates to HTML via `renderToStaticMarkup`, sends to backend `/api/pdf/generate`, Puppeteer renders to PDF

## Key Patterns

- **Templates use inline styles** (not Tailwind) because they get serialized via `renderToStaticMarkup` for PDF generation. Tailwind classes don't survive serialization.
- **Single Zustand store** (`useResumeStore`) manages all resume state with localStorage auto-persist via middleware.
- **Data model**: `frontend/src/types/resume.ts` is the single source of truth. `ResumeSection` is a discriminated union type.
- **Vite proxy**: `/api` requests proxy to `http://localhost:3001` in development.

## Directory Layout

```
frontend/src/
  types/resume.ts          # Data model (shared contract)
  store/useResumeStore.ts  # Zustand store with all actions
  data/                    # Default data, template registry
  components/
    layout/                # Header, SplitEditor, EditorPanel
    editor/                # Form components for each section type
    preview/templates/     # Resume templates (Classic, Minimal, Intern, FreshGrad)
    common/                # Button, Input, TextArea
  utils/                   # htmlSerializer, pdfClient
  hooks/                   # usePdfExport
  pages/                   # LandingPage, EditorPage

backend/src/
  index.ts                 # Express server entry
  routes/pdf.ts            # POST /api/pdf/generate
  services/pdfGenerator.ts # Puppeteer singleton + PDF generation
```
