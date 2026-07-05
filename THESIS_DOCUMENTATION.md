# Habit Rabbit: Comprehensive Technical Documentation
## A Full-Stack Habit Tracking Application with Cross-Platform Mobile Deployment

**Version:** 1.0.0  
**Date:** 2026-06-02  
**Project Type:** Full-stack mobile and web application  
**Lead Developer:** Gokulpure  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Local Development Setup](#local-development-setup)
6. [Feature Documentation](#feature-documentation)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Supabase Integration](#supabase-integration)
10. [Mobile Development (Capacitor)](#mobile-development)
11. [Deployment Guide](#deployment-guide)
12. [App Store & Play Store Submission](#app-store-and-play-store)
13. [Developer Onboarding](#developer-onboarding)
14. [Troubleshooting & FAQ](#troubleshooting)

---

## Executive Summary

Habit Rabbit is a comprehensive habit tracking application designed to help users build and maintain positive daily habits. The application features:

- **Multi-platform support**: Web (responsive design), iOS, and Android
- **Backend-agnostic data storage**: Supabase for real-time database and authentication
- **Gamification elements**: Carrot rewards system and streak tracking
- **Flexible habit management**: Skip habits, cheat days, and customizable settings
- **User authentication**: Email-based sign up/sign in with password reset functionality
- **Real-time synchronization**: Automatic data sync across all devices

The application is built with modern web technologies (Next.js 16, React 19) and packaged for native mobile deployment using Capacitor.

---

## Project Overview

### Purpose and Goals

Habit Rabbit was created to solve the common problem of habit tracking consistency. Users often struggle to:
- Build sustainable habits
- Track progress effectively
- Stay motivated without flexibility
- Access their data across devices

### Target Users

- Health-conscious individuals (fitness, nutrition)
- Students building study habits
- Professionals managing productivity habits
- Anyone seeking behavioral change

### Key Features

1. **Habit Management**
   - Create custom habits with emoji icons
   - Edit habit names and icons
   - Delete habits with confirmation
   - Automatic streak calculation

2. **Daily Tracking**
   - Mark habits complete each day
   - Visual weekly progress display
   - Automatic carrot reward on perfect weeks
   - Real-time synchronization

3. **Flexibility Features**
   - Cheat days (2 per week by default)
   - Skip habits (1 per day by default)
   - Customizable settings per user
   - Configurable periods (daily/weekly/monthly)

4. **Gamification**
   - Weekly carrot rewards for consistency
   - Celebration animations
   - Streak tracking
   - Visual progress indicators

5. **Authentication**
   - Email/password sign up
   - Sign in
   - Password reset via email
   - Session management

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Device Layer                         │
├──────────────────────┬──────────────────────┬────────────────┤
│  Web Browser         │  iOS App             │  Android App   │
│  (Desktop/Mobile)    │  (via Capacitor)     │  (via Capacitor)│
└──────────────────────┴──────────────────────┴────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
┌───────────────────▼─────────────────────────────────────────┐
│          Presentation Layer (Next.js Frontend)              │
├─────────────────────────────────────────────────────────────┤
│ - React Components (TSX)                                    │
│ - Context API (State Management)                            │
│ - Tailwind CSS (Styling)                                    │
│ - Modal Components                                          │
│ - Animations & Interactions                                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌───────────────────▼─────────────────────────────────────────┐
│         Data Layer (Supabase & Capacitor)                   │
├─────────────────────────────────────────────────────────────┤
│ - Supabase Client Library                                   │
│ - REST API Integration                                      │
│ - Real-time Subscriptions                                   │
│ - Authentication Service                                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌───────────────────▼─────────────────────────────────────────┐
│    Backend Services (Supabase Cloud)                        │
├─────────────────────────────────────────────────────────────┤
│ - PostgreSQL Database                                       │
│ - Authentication (JWT)                                      │
│ - Row-Level Security (RLS)                                  │
│ - Real-time Subscriptions (Postgres Notify)                 │
│ - File Storage (for future features)                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Interaction (UI Event)
    │
    ▼
Component Event Handler
    │
    ▼
useHabitData() Context Function
    │
    ▼
Supabase Client Operation
    │
    ├─► Authentication Service (sign up, sign in, logout)
    │
    ├─► Database Query (habits, logs, settings)
    │
    └─► Real-time Listener (subscription updates)
    │
    ▼
Supabase Backend
    │
    ├─► JWT Token Validation
    │
    ├─► Row-Level Security Check
    │
    ├─► PostgreSQL Query Execution
    │
    └─► Real-time Event Broadcast
    │
    ▼
Context State Update
    │
    ▼
React Re-render
    │
    ▼
Updated UI Display
```

### Component Hierarchy

```
RootLayout
├─ ThemeProvider
├─ HabitDataProvider
│  └─ PreferencesProvider
│     └─ Router Outlets
│        ├─ AuthPage
│        │  ├─ SignInForm
│        │  ├─ SignUpForm
│        │  ├─ ForgotPasswordForm
│        │  └─ ResetPasswordForm
│        │
│        └─ AppPage (protected)
│           ├─ StatsBar
│           ├─ HabitCard (repeating)
│           │  └─ HabitCard (weekly logs display)
│           ├─ AddHabitModal
│           ├─ IconModal
│           ├─ HabitDetailModal
│           ├─ ConfirmationModal
│           ├─ CarrotCelebration
│           └─ BottomNavBar
```

---

## Technology Stack

### Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.2.6 | Server-side rendering & static generation |
| **Runtime** | React | 19.2.4 | UI library & component framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 4.3.0 | Utility-first CSS framework |
| **State** | React Context | Native | Global state management |
| **Animations** | CSS/Framer** | Native | Visual effects and transitions |

### Backend & Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **Database** | Supabase (PostgreSQL) | Data persistence & real-time updates |
| **Authentication** | Supabase Auth (JWT) | User sign up, sign in, password reset |
| **File Storage** | Supabase Storage | Future media attachments |
| **Hosting** | Vercel | Web application deployment |

### Mobile Development Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Capacitor** | 7.6.5 (CLI), 8.3.4 (Core/iOS/Android) | Native bridge & build system |
| **iOS Target** | 15.0+ | Apple device support |
| **Android Target** | API 26+ | Android device support |
| **Xcode** | Latest | iOS development environment |
| **Android Studio** | Latest | Android development environment |
| **CocoaPods** | 1.16.2+ | iOS dependency manager |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **npm** | Latest | Package management |
| **Git** | Latest | Version control |
| **Prettier** | (included) | Code formatting |
| **TypeScript Compiler** | 5.x | Type checking |

---

## Local Development Setup

### Prerequisites

Before starting, ensure you have:

- **macOS/Linux/Windows** with a terminal
- **Node.js 20.x** or higher
- **npm** (comes with Node.js)
- **Git** installed
- **Supabase account** (free tier available at supabase.com)
- **Xcode** (for iOS development on Mac)
- **Android Studio** (for Android development)

### Step 1: Clone the Repository

```bash
git clone https://github.com/stutie-gokulpure/habit-rabbit-next.git
cd habit-rabbit-next
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Next.js and React
- Tailwind CSS
- Supabase client library
- Capacitor CLI and core packages
- TypeScript and dev dependencies

### Step 3: Set Up Supabase Project

#### 3.1 Create a Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Choose project name and region (e.g., "habit-rabbit")
5. Create a strong password for postgres user
6. Wait for project initialization (2-3 minutes)

#### 3.2 Create Database Schema

In Supabase SQL Editor, run the following commands:

**Create users table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

**Create habits table:**
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color_idx INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX habits_user_id_idx ON habits(user_id);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);
```

**Create habit_logs table:**
```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, logged_date)
);

CREATE INDEX habit_logs_user_id_idx ON habit_logs(user_id);
CREATE INDEX habit_logs_habit_id_idx ON habit_logs(habit_id);
CREATE INDEX habit_logs_logged_date_idx ON habit_logs(logged_date);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);
```

**Create carrots table (rewards):**
```sql
CREATE TABLE carrots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_key)
);

CREATE INDEX carrots_user_id_idx ON carrots(user_id);

ALTER TABLE carrots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own carrots" ON carrots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create carrots" ON carrots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Create cheat_days_usage table:**
```sql
CREATE TABLE cheat_days_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, used_date)
);

CREATE INDEX cheat_days_usage_user_id_idx ON cheat_days_usage(user_id);

ALTER TABLE cheat_days_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cheat days" ON cheat_days_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create cheat days" ON cheat_days_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cheat days" ON cheat_days_usage
  FOR DELETE USING (auth.uid() = user_id);
```

**Create skipped_habits table:**
```sql
CREATE TABLE skipped_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date_skipped DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, date_skipped)
);

CREATE INDEX skipped_habits_user_id_idx ON skipped_habits(user_id);

ALTER TABLE skipped_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own skips" ON skipped_habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create skips" ON skipped_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skips" ON skipped_habits
  FOR DELETE USING (auth.uid() = user_id);
```

#### 3.3 Configure Supabase Auth

1. Go to Authentication > Providers
2. Enable "Email" provider
3. Go to Authentication > Email Templates
4. Customize sign-up confirmation and password reset emails (optional)

#### 3.4 Get API Keys

1. Go to Settings > API
2. Copy **Project URL** and **anon (public) key**

### Step 4: Configure Environment Variables

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase credentials from Step 3.4.

### Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Web**: http://localhost:3000
- **API**: http://localhost:3000/api

### Step 6: Test the Application

1. Open http://localhost:3000
2. Click "Sign Up"
3. Enter email and password
4. Verify email (if configured)
5. Log in
6. Create your first habit
7. Test the features

---

## Feature Documentation

### 1. Authentication Features

#### Sign Up

**Route:** `/auth` (Sign Up tab)

**Process:**
```
User fills email/password
    ↓
Form validates (email format, password strength)
    ↓
Submit to Supabase Auth.signUp()
    ↓
Confirmation email sent
    ↓
User confirms email
    ↓
Account created
```

**Implementation:**
- File: `components/auth/SignUpForm.tsx`
- Uses: `supabase.auth.signUp()`
- Validation: Email format, password length

**Error Handling:**
- Duplicate email: "User already registered"
- Invalid email: "Invalid email format"
- Weak password: "Password must be at least 6 characters"

#### Sign In

**Route:** `/auth` (Sign In tab)

**Process:**
```
User fills email/password
    ↓
Submit to Supabase Auth.signInWithPassword()
    ↓
JWT token returned
    ↓
Session established
    ↓
Redirect to /app
```

**Implementation:**
- File: `components/auth/SignInForm.tsx`
- Uses: `supabase.auth.signInWithPassword()`
- Stores: Session in Supabase (browser storage)

**Security:**
- Passwords hashed with bcrypt (Supabase handles)
- JWT tokens with short expiration (15 minutes)
- Refresh token for long-term sessions

#### Password Reset

**Route:** `/auth` (Forgot Password tab)

**Process:**
```
User enters email
    ↓
Supabase generates reset token
    ↓
Email sent with reset link
    ↓
User clicks link
    ↓
Redirect to password reset page
    ↓
User sets new password
    ↓
Password updated
```

**Implementation:**
- File: `components/auth/ForgotPasswordForm.tsx`
- Uses: `supabase.auth.resetPasswordForEmail()`
- File: `components/auth/ResetPasswordForm.tsx`
- Uses: `supabase.auth.updateUser()`

#### Session Management

**Session Persistence:**
```
Browser Local Storage
    ↓
Supabase Client reads session
    ↓
useEffect in HabitDataProvider checks session
    ↓
User data loaded or redirected to auth
```

**Auto-logout:**
- Session expires after 1 hour of inactivity
- Refresh token extends session
- Manual logout clears session

### 2. Habit Management Features

#### Creating Habits

**Modal Flow:**
```
User clicks "+" button
    ↓
AddHabitModal opens (name input)
    ↓
User enters habit name
    ↓
Click "Next"
    ↓
IconModal opens (emoji picker)
    ↓
User selects icon
    ↓
Click "Add Habit"
    ↓
Habit created in database
    ↓
Modal closes, list updates
```

**Database Operation:**
```javascript
await supabase.from('habits').insert({
  user_id: user.id,
  name: habitName,
  icon: selectedIcon,
  color_idx: habits.length % COLORS.length
}).select()
```

**Available Icons:**
🏃 🧘 💪 📚 💧 🥗 😴 ✍️ 🎸 🧠 🌿 🧹 💊 🚴 🧗 🏊 🎨 ☕ 🍎 🌅 🦷 🎯 🏋️ 🧃 🧺

**Color Assignment:**
- Automatically rotates through 6 colors: `['#E1F5EE', '#E6F1FB', '#FAEEDA', '#FAECE7', '#FBEAF0', '#EAF3DE']`
- Color resets when reaching number of habits

#### Editing Habits

**Modal Flow:**
```
User clicks habit card
    ↓
HabitDetailModal opens
    ↓
Shows habit name, icon, created date
    ↓
User can edit name or icon
    ↓
Click "Save"
    ↓
Habit updated in database
```

**Database Operation:**
```javascript
await supabase.from('habits').update({
  name: updated.name,
  icon: updated.icon,
  color_idx: updated.color_idx
}).eq('id', updated.id)
```

#### Deleting Habits

**Confirmation Flow:**
```
User clicks delete on habit card
    ↓
ConfirmationModal opens
    ↓
User confirms deletion
    ↓
Habit deleted from database
    ↓
All related logs deleted (cascade)
```

**Database Operation:**
```javascript
await supabase.from('habits').delete().eq('id', habitId)
```

**Cascade Behavior:**
- Deleting habit also deletes all habit_logs
- Skipped habits also deleted
- Clean removal guaranteed by foreign keys

### 3. Daily Tracking Features

#### Logging a Habit

**Single Click Toggle:**
```
User clicks habit card checkbox
    ↓
Check if today is cheat day
    ├─ YES: Show confirmation modal
    └─ NO: Toggle habit
    ↓
If already logged: Delete log entry
If not logged: Create log entry
    ↓
Database updated
    ↓
UI updates (card shows checkmark, streak updates)
    ↓
Check if week complete → Award carrot
```

**Database Operations:**
```javascript
// Add log
await supabase.from('habit_logs').insert({
  habit_id: habitId,
  user_id: user.id,
  logged_date: today
})

// Remove log
await supabase.from('habit_logs').delete()
  .eq('habit_id', habitId)
  .eq('logged_date', today)
```

#### Viewing Weekly Progress

**Display:**
- 7-day week display showing each day
- Green indicators for completed days
- Gray indicators for incomplete days
- Current day highlighted
- Streak counter at top

**Calculation:**
```javascript
weekKeys() // Returns 7-day period starting from weekStartDay
  .map(date => logs.some(log => log.habit_id === habitId && log.logged_date === date))
  // Shows visual indicators for each day
```

**Streak Calculation:**
```javascript
calcStreak(habitId, weekKeys()) {
  let streak = 0
  for (let i = wk.length - 1; i >= 0; i--) {
    if (logs.some(l => l.habit_id === habitId && l.logged_date === wk[i])) {
      streak++
    } else {
      break // Stop at first incomplete day
    }
  }
  return streak
}
```

### 4. Cheat Day Feature

**Purpose:** Allow users one day per week to skip all habits without breaking streak

**Default:** 2 cheat days per week

**Flow:**
```
User clicks "Cheat Day" button
    ↓
Check if cheat days remaining
    ├─ NO: Show "No cheat days available"
    └─ YES: Continue
    ↓
Insert today into cheat_days_usage
    ↓
All habits marked as complete
    ↓
Set isTodayCheatDay = true
    ↓
If user clicks habit toggle: Ask "Remove cheat day?"
    ↓
Clicking habit removes cheat day status
```

**Database Operations:**
```javascript
// Mark as cheat day
await supabase.from('cheat_days_usage').upsert(
  { user_id: user.id, used_date: today },
  { onConflict: 'user_id,used_date', ignoreDuplicates: true }
)

// Remove cheat day
await supabase.from('cheat_days_usage').delete()
  .eq('user_id', user.id)
  .eq('used_date', today)
```

**Remaining Calculation:**
```javascript
getCheatDaysRemaining() {
  const period = cheatDaysPeriod // 'weekly' or 'monthly'
  const used = getCheatDaysUsedThisPeriod()
  return Math.max(0, cheatDaysCount - used)
}
```

### 5. Skip Habits Feature

**Purpose:** Allow users to skip a specific habit on a specific day without marking as complete

**Default:** 1 skip per day

**Flow:**
```
User clicks skip button on habit
    ↓
Check if skips remaining
    ├─ NO: Show "No skips available"
    └─ YES: Continue
    ↓
Insert skip record
    ↓
Habit appears as skipped (visual indicator)
    ↓
Doesn't count as complete or incomplete
    ↓
Doesn't break streak calculation
```

**Database Operations:**
```javascript
// Skip habit
await supabase.from('skipped_habits').insert({
  user_id: user.id,
  habit_id: habitId,
  date_skipped: date
})

// Unskip habit
await supabase.from('skipped_habits').delete()
  .eq('habit_id', habitId)
  .eq('date_skipped', date)
```

**Remaining Calculation:**
```javascript
getSkipHabitsRemaining() {
  const period = skipHabitsPeriod // 'daily', 'weekly', or 'monthly'
  const used = getSkipHabitsUsedThisPeriod()
  return Math.max(0, skipHabitsCount - used)
}
```

### 6. Gamification Features

#### Carrot Rewards System

**Mechanism:**
```
Every day user completes ALL habits
    ↓
System checks if entire week is complete
    ↓
Week complete = Perfect week
    ↓
Award "carrot" (1 per week)
    ↓
Trigger celebration animation
    ↓
Show carrot count increment
```

**Perfect Week Definition:**
- All 7 days completed
- OR days marked as cheat days
- OR habits skipped don't count

**Database:**
```sql
-- Stored as week_key in carrots table
-- Week key format: "YYYY-MM-DD" (Sunday of that week)
```

#### Celebration Animation

**Trigger:** When carrot is earned

**Animation:**
```
Giant carrot emoji appears at center
    ↓
Flies to small carrot counter (top right)
    ↓
Counter increments
    ↓
Fade out animation
```

**Implementation:**
- File: `components/habits/CarrotCelebration.tsx`
- Uses: CSS animations + React state
- Duration: ~1.5 seconds
- Disabled if animations disabled in preferences

#### Statistics Display

**Top Bar Shows:**
- Today's completed habits (e.g., "3/5")
- Weekly carrots earned (e.g., "1 🥕")
- Weekly completion percentage (e.g., "60%")

**Calculation:**
```javascript
todayDone = habits.filter(h => logs.some(
  l => l.habit_id === h.id && l.logged_date === today
)).length

weeklyCarrots = getDailyCarrotsThisWeek()

weekPct = (daysComplete / (days × habits)) × 100
```

---

## API Reference

### Authentication Endpoints

All authentication is handled through Supabase Auth. The application never directly calls auth endpoints; instead uses the Supabase JavaScript client.

#### Sign Up
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123',
})
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "user_metadata": {}
  },
  "session": null
}
```

#### Sign In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePassword123',
})
```

**Response:**
```json
{
  "user": { /* user object */ },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_in": 3600
  }
}
```

#### Get Current Session
```javascript
const { data: { session } } = await supabase.auth.getSession()
```

#### Sign Out
```javascript
await supabase.auth.signOut()
```

#### Password Reset
```javascript
await supabase.auth.resetPasswordForEmail('user@example.com')
```

### Database API

**Base URL:** `https://your-project.supabase.co`

All database operations go through Supabase client with auto-authentication via JWT.

#### Habits Operations

**GET all habits for user:**
```javascript
const { data, error } = await supabase
  .from('habits')
  .select('*')
  .eq('user_id', userId)
```

**POST create habit:**
```javascript
const { data, error } = await supabase
  .from('habits')
  .insert({
    user_id: userId,
    name: 'Exercise',
    icon: '💪',
    color_idx: 0
  })
  .select()
```

**PUT update habit:**
```javascript
const { data, error } = await supabase
  .from('habits')
  .update({
    name: 'Workout',
    icon: '🏃',
    color_idx: 1
  })
  .eq('id', habitId)
```

**DELETE habit:**
```javascript
const { data, error } = await supabase
  .from('habits')
  .delete()
  .eq('id', habitId)
```

#### Habit Logs Operations

**GET all logs for user:**
```javascript
const { data, error } = await supabase
  .from('habit_logs')
  .select('*')
  .eq('user_id', userId)
```

**POST create log:**
```javascript
const { data, error } = await supabase
  .from('habit_logs')
  .insert({
    user_id: userId,
    habit_id: habitId,
    logged_date: '2026-06-02'
  })
```

**DELETE log:**
```javascript
const { data, error } = await supabase
  .from('habit_logs')
  .delete()
  .eq('habit_id', habitId)
  .eq('logged_date', '2026-06-02')
```

#### Carrots Operations

**GET carrots for user:**
```javascript
const { data, error } = await supabase
  .from('carrots')
  .select('*')
  .eq('user_id', userId)
```

**POST create carrot:**
```javascript
const { data, error } = await supabase
  .from('carrots')
  .insert({
    user_id: userId,
    week_key: '2026-05-31'
  })
```

#### Cheat Days Operations

**GET cheat days:**
```javascript
const { data, error } = await supabase
  .from('cheat_days_usage')
  .select('*')
  .eq('user_id', userId)
```

**POST use cheat day:**
```javascript
const { data, error } = await supabase
  .from('cheat_days_usage')
  .insert({
    user_id: userId,
    used_date: '2026-06-02'
  })
```

#### Skipped Habits Operations

**GET skipped habits:**
```javascript
const { data, error } = await supabase
  .from('skipped_habits')
  .select('*')
  .eq('user_id', userId)
```

**POST skip habit:**
```javascript
const { data, error } = await supabase
  .from('skipped_habits')
  .insert({
    user_id: userId,
    habit_id: habitId,
    date_skipped: '2026-06-02'
  })
```

---

## Database Schema

### Tables

#### `users`
Primary table for user accounts.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users | User ID (from Supabase Auth) |
| email | TEXT | NOT NULL | User email |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |

**RLS Policies:**
- SELECT: Only own records
- UPDATE: Only own records
- INSERT: System only

---

#### `habits`
User's habit definitions.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Unique habit ID |
| user_id | UUID | FOREIGN KEY | Owner of habit |
| name | TEXT | NOT NULL | Habit name |
| icon | TEXT | NOT NULL | Emoji icon |
| color_idx | INTEGER | DEFAULT 0 | Color palette index |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:**
- `habits_user_id_idx` on user_id (for fast filtering)

**RLS Policies:**
- SELECT: Where user_id = auth.uid()
- INSERT: Where user_id = auth.uid()
- UPDATE: Where user_id = auth.uid()
- DELETE: Where user_id = auth.uid()

---

#### `habit_logs`
Daily completion records.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Log ID |
| user_id | UUID | FOREIGN KEY | Record owner |
| habit_id | UUID | FOREIGN KEY | Associated habit |
| logged_date | DATE | NOT NULL | Date completed |
| created_at | TIMESTAMP | DEFAULT NOW() | Log time |

**Constraints:**
- UNIQUE(habit_id, logged_date) - One log per habit per day

**Indexes:**
- user_id, habit_id, logged_date

**RLS Policies:**
- SELECT/INSERT/DELETE: Where user_id = auth.uid()

---

#### `carrots`
Weekly reward tracking.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Carrot ID |
| user_id | UUID | FOREIGN KEY | User |
| week_key | TEXT | NOT NULL | Week identifier (YYYY-MM-DD) |
| created_at | TIMESTAMP | DEFAULT NOW() | Award time |

**Constraints:**
- UNIQUE(user_id, week_key) - One carrot per week

**RLS Policies:**
- SELECT/INSERT: Where user_id = auth.uid()

---

#### `cheat_days_usage`
Tracks cheat day usage.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Record ID |
| user_id | UUID | FOREIGN KEY | User |
| used_date | DATE | NOT NULL | Date used |
| created_at | TIMESTAMP | DEFAULT NOW() | Usage time |

**Constraints:**
- UNIQUE(user_id, used_date) - One cheat per day

**RLS Policies:**
- SELECT/INSERT/DELETE: Where user_id = auth.uid()

---

#### `skipped_habits`
Tracks habit skips.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Skip ID |
| user_id | UUID | FOREIGN KEY | User |
| habit_id | UUID | FOREIGN KEY | Skipped habit |
| date_skipped | DATE | NOT NULL | Skip date |
| created_at | TIMESTAMP | DEFAULT NOW() | Skip time |

**Constraints:**
- UNIQUE(habit_id, date_skipped) - One skip per habit per day

**RLS Policies:**
- SELECT/INSERT/DELETE: Where user_id = auth.uid()

---

### Row-Level Security (RLS)

**RLS Enforcement:**
- All tables have RLS enabled
- Policies restrict access to own data
- Postgres evaluates policies before returning/modifying data
- JWT token must be valid (checked by Supabase middleware)

**Security Flow:**
```
Request from client
    ↓
Supabase extracts JWT from Authorization header
    ↓
Validates JWT signature and expiration
    ↓
Extracts auth.uid() from JWT
    ↓
Applies RLS policies
    ↓
Only rows matching policies returned/modified
```

---

## Supabase Integration

### Supabase Overview

Supabase is an open-source Firebase alternative providing:
- PostgreSQL database
- Email/password authentication
- Real-time subscriptions
- File storage
- REST API

### Client Setup

**File:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** Keys are prefixed with `NEXT_PUBLIC_` so they're exposed to browser (safe because anon key has limited permissions via RLS)

### Real-time Subscriptions

Currently implemented through periodic data fetching. Supabase supports real-time updates:

```javascript
const subscription = supabase
  .from('habit_logs')
  .on('*', payload => {
    console.log('Change:', payload)
    // Update UI
  })
  .subscribe()
```

### Authentication Flow

**Architecture:**
```
Client (React)
    ↓ calls signUp/signIn
    ↓
Supabase Auth Service
    ↓ validates credentials
    ↓ generates JWT
    ↓
Client stores JWT in localStorage
    ↓
Client sends JWT in Authorization header
    ↓
Supabase RLS checks JWT
```

**JWT Structure:**
```json
{
  "iss": "https://project.supabase.co",
  "sub": "user-uuid",
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567800,
  "email": "user@example.com"
}
```

### Error Handling

**Common Errors:**

1. **Unauthorized (401)**
   - Cause: Invalid/expired JWT
   - Solution: Prompt user to sign in again

2. **Forbidden (403)**
   - Cause: RLS policy denied access
   - Solution: Verify user owns the data

3. **Not Found (404)**
   - Cause: Record doesn't exist
   - Solution: Handle gracefully in UI

4. **Duplicate Key (409)**
   - Cause: Unique constraint violated
   - Solution: Prevent duplicate submissions

**Error Handler Pattern:**
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*')
  
  if (error) {
    console.error('Error:', error.message)
    // Handle specific error codes
    switch (error.code) {
      case 'PGRST116': // Not found
        break
      case 'PGRST204': // No content
        break
      default:
        alert('Error: ' + error.message)
    }
  }
} catch (err) {
  console.error('Unexpected error:', err)
}
```

---

## Mobile Development

### Capacitor Overview

Capacitor is a cross-platform framework that wraps web apps in native shells, allowing deployment to iOS and Android.

**How It Works:**
```
Web App (HTML/CSS/JS)
    ↓
Capacitor Bridge
    ↓
├─ iOS: UIWebView + Swift
└─ Android: WebView + Kotlin

Result: Native app running web code
```

**Advantages:**
- Single codebase for web, iOS, and Android
- Access to native APIs (camera, geolocation, etc.)
- App Store/Play Store compatible
- Faster development than pure native

### Project Structure

```
habit-rabbit-next/
├── app/                      # Next.js app
├── public/                   # Static assets
├── out/                      # Build output (exported Next.js)
│
├── capacitor.config.ts       # Capacitor configuration
├── ios/                      # iOS project (Xcode)
│   └── App/
│       ├── App.xcodeproj     # Xcode project
│       ├── App.xcworkspace   # Xcode workspace
│       ├── App/              # iOS source code
│       └── Pods/             # CocoaPods dependencies
│
└── android/                  # Android project (Gradle)
    └── app/
        ├── src/
        └── build.gradle      # Gradle build config
```

### Building for iOS

#### Prerequisites

- macOS with Xcode 13+
- CocoaPods installed (`brew install cocoapods`)
- iOS 15+ deployment target

#### Step 1: Build Web Assets

```bash
npm run build
```

This creates `out/` directory with static Next.js export.

#### Step 2: Copy Assets to iOS

```bash
npx cap copy ios
```

Copies web assets to `ios/App/App/public/`

#### Step 3: Sync Dependencies

```bash
npx cap sync ios
```

Updates iOS native dependencies and generates config files.

#### Step 4: Open in Xcode

```bash
npx cap open ios
```

Or manually: `open ios/App/App.xcworkspace`

**Important:** Always open `.xcworkspace`, not `.xcodeproj` (CocoaPods requirement)

#### Step 5: Configure Signing

In Xcode:
1. Select "App" target
2. Go to Signing & Capabilities
3. Set Team to your Apple Developer account
4. Set Bundle Identifier (e.g., com.sg.habitrabbit)
5. Select provisioning profile

#### Step 6: Run on Simulator or Device

**Simulator:**
```bash
# From Xcode: Cmd+R
# Or from terminal:
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -destination generic/platform=iOS\ Simulator
```

**Physical Device:**
1. Connect iPhone via USB
2. Select device in Xcode
3. Click Run (Cmd+R)
4. Trust developer on device when prompted

#### Step 7: Configure Minimum Deployment Target

In Xcode:
1. Select "App" target
2. Go to Build Settings
3. Search "Deployment Target"
4. Set to iOS 15.0

### Building for Android

#### Prerequisites

- Android Studio 4.1+
- JDK 11+
- SDK API level 26+ (Android 8+)
- Android SDK Platform Tools

#### Step 1: Build Web Assets

```bash
npm run build
```

#### Step 2: Copy Assets to Android

```bash
npx cap copy android
```

#### Step 3: Sync Dependencies

```bash
npx cap sync android
```

#### Step 4: Open in Android Studio

```bash
npx cap open android
```

Or manually: Open `android/` folder in Android Studio

#### Step 5: Configure App Details

In `android/app/build.gradle`:

```gradle
android {
  compileSdkVersion 34
  
  defaultConfig {
    applicationId "com.sg.habitrabbit"
    minSdkVersion 26
    targetSdkVersion 34
    versionCode 1
    versionName "1.0.0"
  }
}
```

#### Step 6: Run on Emulator or Device

**Emulator:**
1. In Android Studio: Tools > Device Manager
2. Create virtual device (Pixel 4, API 30+)
3. Click Run (Shift+F10)
4. Select emulator

**Physical Device:**
1. Enable USB Debugging: Settings > Developer Options
2. Connect via USB
3. Click Run
4. Select device

### Web App (Browser Testing)

```bash
npm run dev
```

Runs on `http://localhost:3000`

Test in:
- Desktop browser (Chrome, Safari, Firefox)
- Browser DevTools mobile emulation
- Responsive design view

---

## Deployment Guide

### Web Deployment (Vercel)

Vercel is the recommended hosting platform (created by Next.js authors).

#### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/habit-rabbit-next.git
git push -u origin main
```

#### Step 2: Create Vercel Project

1. Go to https://vercel.com
2. Sign up/log in with GitHub
3. Click "New Project"
4. Select your repository
5. Click "Import"

#### Step 3: Configure Environment Variables

In Vercel dashboard:
1. Go to Settings > Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

#### Step 4: Deploy

Click "Deploy"

Deployment takes ~5-10 minutes. Your app will be live at:
```
https://habit-rabbit-next.vercel.app
```

#### Step 5: Configure Custom Domain (Optional)

In Vercel dashboard:
1. Go to Domains
2. Enter your domain (e.g., habitrabbit.app)
3. Add DNS records per instructions
4. Wait for DNS propagation (up to 48 hours)

#### Automatic Deployments

Any push to main branch automatically triggers deployment:
```
Push to GitHub
    ↓
Vercel webhook triggered
    ↓
npm run build executes
    ↓
Next.js generates static export in out/
    ↓
Files deployed to CDN
    ↓
URL: https://habit-rabbit-next.vercel.app
```

### Environment-Specific Builds

Create environment-specific env files:

**Production (.env.production):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

**Staging (.env.staging):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key
```

Next.js automatically uses appropriate file during build.

---

## App Store & Play Store Submission

### iOS App Store Submission

#### Step 1: Create Apple Developer Account

1. Go to https://developer.apple.com
2. Enroll ($99/year)
3. Set up Apple ID and verify payment

#### Step 2: Create App ID

In Apple Developer Portal:
1. Certificates, Identifiers & Profiles > Identifiers
2. Click "+"
3. Select "App IDs"
4. Bundle ID: com.sg.habitrabbit
5. Capabilities: Enable required ones (e.g., HealthKit if tracking health)
6. Register

#### Step 3: Create Certificates & Provisioning Profiles

**Distribution Certificate:**
1. Certificates > Create new
2. Select "Apple Distribution"
3. Upload CSR (created from Keychain)
4. Download certificate
5. Double-click to install in Keychain

**Provisioning Profile:**
1. Provisioning Profiles > Create new
2. Select "App Store"
3. Select App ID created in Step 2
4. Select certificate from Step 3
5. Download and open in Xcode

#### Step 4: Configure Xcode Project

In Xcode project settings:
1. Select "App" target
2. Signing & Capabilities tab
3. Team: Select your team
4. Bundle Identifier: com.sg.habitrabbit
5. Version: 1.0.0
6. Build: 1

#### Step 5: Create Archive for Upload

```bash
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  archive -archivePath build/App.xcarchive
```

Or in Xcode:
1. Product > Archive
2. Validate (check for errors)
3. Distribute App > App Store Connect

#### Step 6: Create App Store Connect Record

1. Go to https://appstoreconnect.apple.com
2. My Apps > "+"
3. Create New App
4. Fill details:
   - Name: Habit Rabbit
   - Bundle ID: com.sg.habitrabbit
   - SKU: unique identifier
   - User Access: Full Access

#### Step 7: Fill App Information

In App Store Connect:
1. Go to App Information
2. Category: Health & Fitness
3. Privacy Policy URL
4. App Support Contact
5. App Review Contact

#### Step 8: Fill Version Information

1. Go to Version Info (1.0)
2. Description: "Build and track daily habits with Habit Rabbit. Complete your daily tasks, earn rewards, and maintain consistent streaks."
3. Keywords: habits, productivity, tracking, wellness
4. Support URL
5. Marketing URL (optional)

#### Step 9: Add Screenshots & Previews

Required for each device family:
- iPhone 6.7" (2 minimum)
- iPhone 6.1" (2 minimum)
- iPad Pro 12.9" (optional)

Tools for screenshots:
- Simulator: Cmd+S in simulator
- Device: Screenshots folder in Files app

#### Step 10: Configure App Privacy

1. Go to App Privacy
2. Fill Privacy Policy details
3. Indicate what data is collected
4. Note: Habit Rabbit collects minimal data (email, habit data - all synced with Supabase)

**Privacy Statement Template:**
```
Habit Rabbit collects:
- Email address (for authentication)
- Habit data and logs (stored in Supabase)
- User preferences (stored locally and on server)

Data is encrypted in transit (TLS/SSL).
Users can delete accounts anytime.
No third-party tracking or ads.
```

#### Step 11: Submit for Review

1. Build Status > Ready for Upload
2. Upload build from Xcode
3. Return to App Store Connect
4. Version Release > Submit for Review
5. Fill Review Notes (if needed)
6. Select Review Information
7. Click Submit for Review

**Review Timeline:** 24-48 hours typically

#### Step 12: Manage Release

Once approved:
1. Version Release > Release This Version
2. Choose release date (Automatic or Scheduled)
3. Click Release

---

### Android Play Store Submission

#### Step 1: Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with Google account
3. Pay one-time fee ($25)
4. Accept agreements
5. Complete account setup

#### Step 2: Create Application in Play Console

1. All Apps > Create App
2. App name: Habit Rabbit
3. Default language: English
4. App type: Apps
5. Category: Health & Fitness
6. Create

#### Step 3: Generate Signing Key

In Android Studio:
1. Build > Generate Signed Bundle/APK
2. Select "Android App Bundle"
3. Create new keystore:
   - Path: `android/app/habit-rabbit-key.jks`
   - Password: secure password
   - Alias: habit-rabbit
   - Key password: same as keystore
4. Key details:
   - CN (Common Name): com.sg.habitrabbit
   - Organizational Unit: Engineering
   - Organization: Your Company
   - Country: US (or your country)
5. Create Keystore

**Important:** Backup this keystore file. Losing it means unable to update app.

#### Step 4: Build Release Bundle

```bash
cd android
./gradlew bundleRelease
```

Creates: `android/app/build/outputs/bundle/release/app-release.aab`

Or in Android Studio:
1. Build > Build Bundle(s)
2. Select "Release"
3. Review signing configuration
4. Click Finish

#### Step 5: Test Release Build

Optionally test before submitting:

```bash
./gradlew installRelease
```

#### Step 6: Fill App Details in Play Console

1. All apps > Habit Rabbit > App details
2. App name: Habit Rabbit
3. Description: "Build and track daily habits with Habit Rabbit. Complete your daily tasks, earn rewards, and maintain consistent streaks. Features include: daily tracking, weekly rewards, cheat days, and habit skips."
4. Short description: "Track and build lasting habits"
5. Category: Health & Fitness
6. Content rating: Everyone

#### Step 7: Create Store Listing

1. Store listing > Required info
2. Fill out all fields:
   - Title
   - Short description
   - Full description
   - Screenshots (4-8 images)
   - Feature image
   - Icon (512x512)
   - Banner (1024x500)

**Screenshots Requirements:**
- 2-8 images per language
- Landscape or portrait
- Phone (max 1080 × 1920)
- Tablet (max 1200 × 1920)

Tools:
- Emulator: Right-click > Screenshot
- Device: ADB shell screencap

#### Step 8: Set Up Content Rating

1. All apps > Habit Rabbit > Content rating
2. Fill questionnaire
3. Submit for rating
4. Get rating certificate (usually instantly)

#### Step 9: Set Up Privacy Policy

1. All apps > Habit Rabbit > App content
2. Provide privacy policy URL
3. Indicate data types:
   - Personal info (email)
   - Activity (habit logs, preferences)
   - Data security: encryption in transit

#### Step 10: Set Up Pricing & Distribution

1. All apps > Habit Rabbit > Pricing & distribution
2. App access: Free or Paid (choose Free)
3. Countries: Select countries to distribute
4. Consent: Accept agreements

#### Step 11: Upload Release Bundle

1. Release > Production > Create new release
2. Upload AAB file (app-release.aab)
3. Release notes: "Initial release - build and track habits"
4. Review and rollout percentage (start at 5%)
5. Review

**Note:** Google processes releases within 2-3 hours. Can immediately start rollout.

#### Step 12: Monitor After Release

1. Check Play Console dashboard for crash rates
2. Monitor reviews and ratings
3. Respond to user feedback
4. Deploy updates when needed

---

## Developer Onboarding

### For New Team Members

#### 1. Get Access

- Repository access (GitHub)
- Supabase project access
- Vercel project access (optional)
- Apple Developer account (for iOS signing)
- Google Play Developer account (for Android signing)

#### 2. Environment Setup (macOS)

```bash
# Install Node 20
brew install node@20
brew link node@20

# Install Git
brew install git

# Install Xcode (for iOS)
xcode-select --install

# Install Android SDK (for Android)
# Download Android Studio from https://developer.android.com/studio

# Install CocoaPods (for iOS dependencies)
sudo gem install cocoapods
```

#### 3. Repository Setup

```bash
git clone <repository-url>
cd habit-rabbit-next
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

#### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

#### 5. Understanding the Codebase

**Directory Structure:**
```
app/                 # Next.js App Router (routes & pages)
  ├── page.tsx      # Home page (requires auth)
  ├── layout.tsx    # Root layout with providers
  ├── auth/         # Auth routes
  └── app/          # Protected app routes

components/          # React components
  ├── auth/         # Auth-related (SignUp, SignIn, etc.)
  ├── habits/       # Habit features (Card, Modal, etc.)
  ├── ui/           # Reusable UI (Button, Input, etc.)
  └── layout/       # Layout (Navigation, etc.)

context/            # React Context (state management)
  ├── HabitDataContext.tsx    # Main business logic
  ├── PreferencesContext.tsx  # User preferences
  └── ThemeContext.tsx        # Theme (light/dark)

lib/               # Utilities and configurations
  └── supabase.ts  # Supabase client setup

public/            # Static assets

.env.local         # Environment variables (local)
capacitor.config.ts # Capacitor configuration
next.config.ts      # Next.js configuration
tsconfig.json       # TypeScript configuration
```

**Key Concepts:**

1. **React Context API** - Global state management
   - `useHabitData()` - Entire app state
   - `usePreferences()` - User preferences
   - `useTheme()` - Theme mode

2. **Supabase Client** - Backend integration
   - Handles auth, database queries, real-time updates
   - All operations through `lib/supabase.ts`

3. **Component Structure** - Functional components with hooks
   - Server/Client components (App Router)
   - Custom hooks for logic reuse
   - TypeScript for type safety

4. **Styling** - Tailwind CSS utility classes
   - Responsive design built in
   - Dark mode support via CSS variables

#### 6. Making Your First Change

Example: Add new habit icon

**File:** `app/page.tsx`

```diff
- const ICONS = ['🏃','🧘','💪','📚','💧','🥗','😴','✍️','🎸','🧠','🌿','🧹','💊','🚴','🧗','🏊','🎨','☕','🍎','🌅','🦷','🎯','🏋️','🧃','🧺']
+ const ICONS = ['🏃','🧘','💪','📚','💧','🥗','😴','✍️','🎸','🧠','🌿','🧹','💊','🚴','🧗','🏊','🎨','☕','🍎','🌅','🦷','🎯','🏋️','🧃','🧺','🚀']
```

Then:
```bash
git add app/page.tsx
git commit -m "Add rocket emoji to habit icons"
git push origin main
```

#### 7. Development Workflow

**Daily Workflow:**
```
1. Pull latest: git pull origin main
2. Create branch: git checkout -b feature/description
3. Make changes + test locally: npm run dev
4. Commit: git add . && git commit -m "message"
5. Push: git push origin feature/description
6. Create PR on GitHub
7. Wait for review
8. Merge to main
9. Vercel auto-deploys
```

#### 8. Debugging Tips

**Browser Console Errors:**
```javascript
// Check Supabase errors
console.error('Supabase error:', error.message)

// Check auth status
const { data: { session } } = await supabase.auth.getSession()
console.log('Current user:', session?.user)

// Check context data
import { useHabitData } from '@/context/HabitDataContext'
const { habits, logs, user } = useHabitData()
console.log('App state:', { habits, logs, user })
```

**Common Issues:**

1. **"NEXT_PUBLIC_SUPABASE_URL is not defined"**
   - Add environment variables to `.env.local`
   - Restart dev server: `npm run dev`

2. **"useHabitData must be used within HabitDataProvider"**
   - Component using hook is not wrapped by provider
   - Check `app/layout.tsx` for provider wrapping

3. **"User does not have access to schema"**
   - Supabase RLS policy denying access
   - Check user authentication
   - Verify RLS policies in Supabase dashboard

4. **Build errors with Capacitor**
   - Run `npx cap sync ios/android` again
   - Verify iOS/Android SDK installed
   - Check build settings

#### 9. Code Standards

**TypeScript Usage:**
```typescript
// Always type function parameters and returns
async function addHabit(name: string, icon: string): Promise<Habit | null> {
  // Implementation
  return habit
}

// Use interfaces for data structures
interface Habit {
  id: string
  name: string
  icon: string
  color_idx: number
  created_at: string
}
```

**Component Structure:**
```typescript
// Use clear naming and organization
'use client'

import { useState } from 'react'
import { useHabitData } from '@/context/HabitDataContext'

export function MyComponent() {
  // Hooks at top
  const [open, setOpen] = useState(false)
  const { habits } = useHabitData()

  // Handlers
  const handleClick = () => {
    setOpen(true)
  }

  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

**Error Handling:**
```typescript
try {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
  
  if (error) throw error
  return data
} catch (err) {
  console.error('Error loading habits:', err)
  return null
}
```

---

## Troubleshooting & FAQ

### Common Issues and Solutions

#### Authentication Issues

**Q: "Invalid or expired JWT"**
A: Session expired or invalid. User needs to sign in again.
```javascript
// Clear invalid session
await supabase.auth.signOut()
// Redirect to auth
router.push('/auth')
```

**Q: "User not found"**
A: Email not registered. Prompt user to sign up instead.

**Q: "Email not confirmed"**
A: User hasn't clicked confirmation link in email. Resend:
```javascript
await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
})
```

#### Data Loading Issues

**Q: "Habits not loading"**
A: Check:
1. User authenticated: `useHabitData()` hook works
2. Supabase RLS policies: Allow SELECT
3. Network tab: Check API requests
4. Console: Check error messages
5. Try manual refresh: Pull down to reload

**Q: "Changes not saving"**
A: Check:
1. Network connection
2. Supabase RLS INSERT/UPDATE/DELETE policies
3. Console for error messages
4. User has permission (owns data)

#### Mobile Issues

**Q: "App won't build on iOS"**
A: Common fixes:
```bash
# Clean build
rm -rf ios/App/Pods
rm ios/App/Podfile.lock
npx cap sync ios

# Update CocoaPods
sudo gem install cocoapods
pod repo update

# Clear Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

**Q: "Blank white screen on iOS"**
A: Likely web assets not copied. Fix:
```bash
npm run build
npx cap copy ios
npx cap sync ios
```

**Q: "App crashes on Android"**
A: Check:
1. API level compatibility
2. Android Studio logs: Logcat view
3. ProGuard rules (if minifying)
4. Verify assets copied: `android/app/src/main/assets/public/`

#### Deployment Issues

**Q: "Vercel build fails"**
A: Common causes:
1. Missing environment variables (add in Vercel dashboard)
2. Type errors (check `npm run build` locally)
3. Node version (verify Node 20 in Vercel settings)
4. Check deploy logs in Vercel dashboard

**Q: "App Store rejected submission"**
A: Common reasons:
1. Missing privacy policy
2. Unclear app purpose
3. Crashes on iPad
4. Uses private APIs
5. Check rejection email for specific reason

**Q: "Play Store upload rejected"**
A: Common reasons:
1. Invalid APK/AAB
2. Missing privacy policy
3. Violates policies (e.g., no hidden ads)
4. Check Play Console messages

### Performance Optimization

**Slow Habit Loading:**
1. Check Supabase query limits
2. Add pagination if many habits
3. Optimize images
4. Check network throttling

**High Bundle Size:**
1. Check with: `npm run analyze`
2. Remove unused dependencies
3. Enable compression in Next.js
4. Lazy load components

### Security Checklist

- [ ] Environment variables never committed (use .env.local)
- [ ] Supabase RLS policies enforced
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Passwords hashed (done by Supabase)
- [ ] JWT tokens validated
- [ ] CORS configured correctly
- [ ] No console logs of sensitive data
- [ ] Input validation on forms
- [ ] Logout clears session

### Monitoring & Logging

**Check Supabase Logs:**
1. Supabase Dashboard > Logs
2. View all queries, errors, authentication events
3. Set up email alerts for errors

**Check Vercel Logs:**
1. Vercel Dashboard > Deployments
2. Click deployment to see build logs
3. Monitor > View analytics

**Client-Side Errors:**
1. Browser console (F12)
2. Network tab for API failures
3. Application tab for local storage

### Getting Help

**Resources:**
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Capacitor Docs: https://capacitorjs.com/docs
- Tailwind CSS: https://tailwindcss.com
- React: https://react.dev

**Debugging Steps:**
1. Check error message carefully
2. Search GitHub issues
3. Check Stack Overflow
4. Reproduce locally
5. Check git blame for context
6. Ask on team Slack

---

## Conclusion

Habit Rabbit is a comprehensive full-stack habit tracking application built with modern web technologies and deployed to multiple platforms. This documentation provides everything needed to understand the architecture, develop new features, and deploy to production.

**Key Takeaways:**
- Single codebase deployed across web, iOS, and Android
- Real-time synchronization powered by Supabase
- Type-safe development with TypeScript and React
- Enterprise-grade deployment infrastructure
- Flexible habit tracking with gamification elements

**Next Steps:**
1. Complete local setup
2. Create your first habit
3. Explore the codebase
4. Make your first contribution
5. Deploy to a test server
6. Submit to app stores

Good luck building and maintaining Habit Rabbit! 🐰🥕

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-06-02  
**Maintained by:** Development Team
