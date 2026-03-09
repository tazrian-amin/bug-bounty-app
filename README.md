# Mining Sentry - Bug Report

Bug reporting and tracking app for Mining Sentry. This project replaces manual doc-based bug reporting with a web app that supports authentication, bug lifecycle management, comments, and password reset.

## Stack

- Next.js 16 (App Router)
- TypeScript
- MUI + Tailwind CSS
- NextAuth (credentials provider)
- Prisma + PostgreSQL (`@prisma/adapter-pg`)
- React Hook Form + Zod

## Features

- Email/password auth with signup + login.
- Bug reporting with severity, environment details, and attachments.
- Dashboard with filters, search, status cards, and pagination.
- Bug details with status transitions (`new`, `in_progress`, `resolved`, `verified`, `closed`).
- Bug comments.
- Forgot/reset password flow (SMTP or Resend).

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local env file:

   ```bash
   cp .env.local.example .env.local
   ```

3. Generate `NEXTAUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

4. Set required values in `.env.local`:

   ```env
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/bug_report?schema=public"
   NEXTAUTH_SECRET="<paste-generated-secret>"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. Create database (if missing):

   ```bash
   createdb -U <user> bug_report
   ```

6. Apply Prisma migrations:

   ```bash
   npx prisma migrate deploy
   ```

   If Prisma cannot resolve `DATABASE_URL` from your shell, run:

   ```bash
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/bug_report?schema=public" npx prisma migrate deploy
   ```

7. Start dev server:

   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000), then create an account on `/signup`.

## Email Provider Setup (Password Reset)

Set one provider in `.env.local`:

### Option A: Resend

```env
EMAIL_PROVIDER="resend"
EMAIL_FROM="verified@your-domain.com"
RESEND_API_KEY="re_..."
```

### Option B: SMTP

```env
EMAIL_PROVIDER="smtp"
EMAIL_FROM="no-reply@your-domain.com"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="smtp-user"
SMTP_PASS="smtp-password-or-app-password"
```

If you do not want to send real emails during local dev, leave `EMAIL_PROVIDER` empty. In non-production, reset links are logged on the server.

## Project Layout

- `app/` - App Router pages and API routes
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/auth/register/route.ts` - signup API
- `app/api/auth/forgot-password/route.ts` - request reset token
- `app/api/auth/reset-password/route.ts` - complete password reset
- `app/api/bugs/` - list/create bugs (+ stats)
- `app/api/bugs/[id]/` - bug detail/update
- `app/api/bugs/[id]/comments/` - comments API
- `lib/auth.ts` - NextAuth options
- `lib/prisma.ts` - Prisma client/adapter wiring
- `lib/bugs.ts` - bug data access helpers
- `prisma/schema.prisma` - DB schema

## Common Troubleshooting

- `database "bug_report" does not exist`  
  Create it first with `createdb -U <user> bug_report`.

- `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`  
  Ensure `.env.local` exists at project root and run command from project root. If needed, prefix command with `DATABASE_URL=...`.

- `CALLBACK_CREDENTIALS_JWT_ERROR` (NextAuth)  
  Credentials auth requires JWT session strategy in `lib/auth.ts`.

- Forgot password returns `500` with `"Failed to process request"`  
  Configure email provider vars (`EMAIL_PROVIDER` + SMTP/Resend keys).
