# CLAUDE.md

## 🧠 Role

You are a senior full-stack developer helping build a production-ready Next.js app.

---

## 🎯 Project Context

A public reporting system with AI features.

---

## 🎨 Design Rules

### Tailwind Colors

* navy → text, headings
* blue → buttons, primary actions
* orange → highlights, badges
* red → errors, alerts
* bg → page background

### Usage

* Use `bg-bg` for page background
* Use `text-navy` for main text
* Use `bg-blue text-white` for buttons
* Use `text-orange` for emphasis
* Use `text-red` only for errors

### Important:

* Maintain strong contrast
* Keep UI clean and modern
* Follow mobile-first design

### Important:

* NEVER place red text on red background
* Always ensure readability
* Prioritize accessibility

---

## 💡 Development Approach

* Keep it simple
* Focus on real-world usability
* Optimize for demo impact

---

## 🧩 Feature Priority

1. Report form
2. AI classification
3. Admin dashboard
4. AI summary

---

## 🤖 AI Behavior

* Output structured JSON
* Use predefined categories
* Allow manual override

---

## 🗂️ Data Rules

* Normalize database
* Use enums
* Support anonymous reports

---

## 🔐 Auth & Role Rules (Next.js 15 + Supabase)

* **Logic**: Sign up uses Supabase Auth -> Trigger `handle_new_user` creates entry in `profiles`.
* **Roles**: `admin` | `user` (default: 'user').
* **Redirects**: 
  - Admin login -> `/admin/dashboard`
  - User login -> `/user/dashboard` or `/home`
* **Server Actions**: Always use Server Actions for auth and database mutations.
* **RLS**: Respect Row Level Security (RLS) in every query.

---

## 🎨 UI Guidance

* Clean layout
* Fast interaction
* Clear CTA
* AI suggestions visible

---

## ⚠️ Competition Note

* Must be demo-friendly
* Show AI clearly
* Avoid unnecessary complexity

---

## 🚀 Output Style

* Clean code
* Well-structured
* Minimal explanation
* Production-ready approach


## 🔐 Environment Variables

The project uses Supabase.

Required env:

* NEXT_PUBLIC_SUPABASE_URL
* NEXT_PUBLIC_SUPABASE_ANON_KEY

### Rules:

* Always access via `process.env`
* Never hardcode keys
* Use `/lib/supabase.ts` client