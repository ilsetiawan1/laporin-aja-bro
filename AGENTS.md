# AGENTS.md

## 🎯 Project Overview

This project is a web-based public reporting system called **"Laporin Aja Bro"**.

---

## 🎨 Design System

### Colors (Tailwind Custom)

* navy: #0F172A → Text & Heading
* blue: #1E40AF → Buttons & Primary UI
* orange: #F97316 → Accent / Highlight / Status
* red: #EF4444 → Alerts / Errors
* bg: #F8FAFC → Background

### Usage Rules

* Use `bg-bg` for main background
* Use `text-navy` for main text
* Use `bg-blue` for buttons
* Use `text-orange` for highlights
* Use `text-red` for errors only

* Always maintain contrast
* Prefer clean and modern look

### Usage Rules

* Do NOT use red text on red background
* Use white text on primary background
* Maintain contrast for readability
* Buttons use primary color with white text

---

## ⚙️ Tech Stack

* Next.js (App Router)
* pnpm
* Tailwind CSS

---

## 🗂️ Database Context (Sync with schema.sql)
- **Tables**: `profiles`, `categories`, `cities`, `districts`, `reports`, `ai_analysis`.
- **RBAC**: Role is stored in `profiles.role` ('admin' | 'user').
- **Location Logic**: DIY focus. `districts` belongs to `cities`.
- **Flow**: User creates `reports` -> AI analyzes and inserts into `ai_analysis`.

---

## 🧠 AI Responsibilities

### User Flow:
- Help users fill the report form.
- **Location Mapping**: Match user description to the correct `city_id` and `district_id`.
- **Auto-Classify**: Map report to existing `categories`.

### Admin Flow:
- **Summarization**: Use `ai_analysis` table to store insights.
- **Actionable Advice**: Suggest which government agency should handle the report.
---

## 🧩 Coding Guidelines

* Use TypeScript
* Use functional components
* Prefer Server Actions
* Keep components reusable

---

## 🎨 UI/UX Rules

* Single page scroll layout
* Hero → Form → Features
* Minimal and modern
* Mobile-first

---

## 🔐 Security

* Validate all input
* Handle anonymous reports safely
* Role-based access

---

## 📂 Folder Structure

/app
/components
/lib
/hooks
/services
/types

---

## 🚫 Avoid

* Overengineering
* Poor contrast UI
* Mixing logic in UI

---

## ✅ Goal

Build a smart public reporting system with strong UX and AI integration.
