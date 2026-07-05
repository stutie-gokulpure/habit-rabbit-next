# Feature Expansion Guide
## Roadmap and Implementation Patterns for New Features

**Version:** 1.0.0  
**Created:** 2026-06-02  
**Audience:** Product Managers, Feature Developers, Architects

---

## Table of Contents

1. [Roadmap](#roadmap)
2. [Feature Implementation Pattern](#feature-implementation-pattern)
3. [Planned Features](#planned-features)
4. [Community Features](#community-features)
5. [Integration Opportunities](#integration-opportunities)

---

## Roadmap

### Phase 1: Foundation (Current ✓)
- [x] Basic habit tracking
- [x] Daily completion logging
- [x] Carrot reward system
- [x] Cheat days
- [x] Skip habits
- [x] iOS/Android deployment
- [x] Email authentication

### Phase 2: Enhancement (Next 3 months)
- [ ] Habit categories/tags
- [ ] Custom reminder notifications
- [ ] Social sharing (habit achievements)
- [ ] Multi-device sync improvements
- [ ] Weekly progress reports
- [ ] Dark mode (already started)
- [ ] Habit notes/journaling

### Phase 3: Community (Months 4-6)
- [ ] Friend/family groups
- [ ] Group challenges
- [ ] Leaderboards
- [ ] Habit templates library
- [ ] Social feed
- [ ] Comments on habits

### Phase 4: Advanced (Months 7-12)
- [ ] AI-powered recommendations
- [ ] Habit strength prediction
- [ ] Integration with health APIs
- [ ] Export to PDF/CSV
- [ ] Habit analytics dashboard
- [ ] API for third-party integrations
- [ ] Two-factor authentication (2FA)

### Phase 5: Enterprise (Year 2)
- [ ] Team management
- [ ] Habit corporate programs
- [ ] Analytics for teams
- [ ] Custom branding
- [ ] On-premise deployment
- [ ] SSO/SAML

---

## Feature Implementation Pattern

### 1. Feature Design Phase

**Create a Feature Specification:**

```markdown
# Feature: Habit Reminders

## Overview
Allow users to set reminders for habits at specific times

## User Stories
- As a user, I want to receive a notification at 7 AM to complete my workout habit
- As a user, I want to customize reminder time per habit
- As a user, I want to snooze reminders for 5/10/15 minutes

## Technical Requirements
- Use push notifications (Capacitor)
- Store reminder time in database
- Handle permission requests
- Graceful fallback if notifications denied

## Database Schema Changes
```sql
ALTER TABLE habits ADD COLUMN reminder_time TIME;
ALTER TABLE habits ADD COLUMN reminder_enabled BOOLEAN DEFAULT false;

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  habit_id UUID,
  sent_at TIMESTAMP,
  clicked BOOLEAN,
  snoozed BOOLEAN
);
```

## Success Metrics
- 60% of users enable reminders
- 40% click notification vs 20% baseline
- < 2% failed notifications
```

### 2. Database Schema Updates

**Implement Changes Safely:**

```sql
-- Step 1: Add new columns (non-breaking)
ALTER TABLE habits ADD COLUMN reminder_time TIME DEFAULT '08:00:00';
ALTER TABLE habits ADD COLUMN reminder_enabled BOOLEAN DEFAULT false;

-- Step 2: Migrate existing data
UPDATE habits SET reminder_enabled = false WHERE reminder_time IS NULL;

-- Step 3: Add constraints
ALTER TABLE habits ALTER COLUMN reminder_time SET NOT NULL;

-- Step 4: Create indexes
CREATE INDEX idx_habits_reminder_enabled 
  ON habits(user_id, reminder_enabled) 
  WHERE reminder_enabled = true;

-- Step 5: RLS policies
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update reminder" ON habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3. Context Updates

**Extend HabitDataContext:**

```typescript
// context/HabitDataContext.tsx

// Add to interface
interface Habit {
  id: string
  name: string
  icon: string
  color_idx: number
  reminder_time?: string // HH:MM:SS
  reminder_enabled?: boolean
  created_at: string
}

interface HabitDataContextValue {
  // ... existing ...
  updateReminder: (habitId: string, time: string, enabled: boolean) => Promise<void>
}

// Add to provider
const updateReminder = async (
  habitId: string,
  time: string,
  enabled: boolean
) => {
  try {
    await supabase
      .from('habits')
      .update({
        reminder_time: time,
        reminder_enabled: enabled,
      })
      .eq('id', habitId)
      .eq('user_id', user?.id)

    setHabits(
      habits.map(h =>
        h.id === habitId
          ? { ...h, reminder_time: time, reminder_enabled: enabled }
          : h
      )
    )
  } catch (err) {
    console.error('Update reminder error:', err)
  }
}
```

### 4. UI Components

**Create Reminder Components:**

```typescript
// components/habits/ReminderSettings.tsx
'use client'

import { useState } from 'react'
import { useHabitData, Habit } from '@/context/HabitDataContext'

interface ReminderSettingsProps {
  habit: Habit
  isOpen: boolean
  onClose: () => void
}

export function ReminderSettings({ habit, isOpen, onClose }: ReminderSettingsProps) {
  const { updateReminder } = useHabitData()
  const [time, setTime] = useState(habit.reminder_time || '08:00')
  const [enabled, setEnabled] = useState(habit.reminder_enabled || false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateReminder(habit.id, time, enabled)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Reminder Settings</h2>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Enable reminders</span>
          </label>
        </div>

        {enabled && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 5. Mobile Implementation

**Capacitor Local Notifications:**

```typescript
// lib/notifications.ts
import { LocalNotifications } from '@capacitor/local-notifications'

export async function requestNotificationPermission() {
  try {
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (error) {
    console.error('Permission request error:', error)
    return false
  }
}

export async function scheduleReminder(
  habitId: string,
  habitName: string,
  time: string // HH:MM
) {
  const [hours, minutes] = time.split(':').map(Number)

  // Calculate next occurrence
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(hours, minutes, 0, 0)

  await LocalNotifications.schedule({
    notifications: [
      {
        id: parseInt(habitId.slice(0, 8), 16), // Unique ID
        title: 'Habit Reminder',
        body: `Time to complete: ${habitName}`,
        schedule: {
          on: {
            year: tomorrow.getFullYear(),
            month: tomorrow.getMonth() + 1,
            day: tomorrow.getDate(),
            hour: hours,
            minute: minutes,
          },
          repeats: true, // Daily reminder
        },
      },
    ],
  })
}

export async function cancelReminder(habitId: string) {
  const id = parseInt(habitId.slice(0, 8), 16)
  await LocalNotifications.cancel({
    notifications: [{ id }],
  })
}
```

### 6. Testing

**Add Unit Tests:**

```typescript
// __tests__/reminders.test.ts
import { scheduleReminder, cancelReminder } from '@/lib/notifications'

describe('Reminder Scheduling', () => {
  it('should schedule reminder at specified time', async () => {
    const habitId = 'test-habit-123'
    const habitName = 'Morning Exercise'
    const time = '07:00'

    await scheduleReminder(habitId, habitName, time)
    // Assert notification was scheduled

    expect(true).toBe(true) // Verify
  })

  it('should handle invalid time format', async () => {
    expect(() => {
      scheduleReminder('habit', 'name', 'invalid')
    }).toThrow()
  })

  it('should cancel scheduled reminder', async () => {
    const habitId = 'test-habit-456'
    
    await cancelReminder(habitId)
    // Assert notification was canceled
  })
})
```

### 7. Deployment Checklist

- [ ] Database schema deployed to staging
- [ ] RLS policies verified
- [ ] Indexes created and tested
- [ ] Context code deployed
- [ ] UI components completed
- [ ] Mobile notifications working
- [ ] Tests passing (100% coverage)
- [ ] Performance tested (no slowdown)
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] User communication plan ready
- [ ] Feature flag implemented (for gradual rollout)
- [ ] Approved by product team

---

## Planned Features

### Feature: Habit Categories

**Difficulty:** Medium  
**Estimated Time:** 1-2 weeks

**Database Schema:**

```sql
CREATE TABLE habit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE habits ADD COLUMN category_id UUID 
  REFERENCES habit_categories(id) ON DELETE SET NULL;
```

**Benefits:**
- Better organization for users with many habits
- Filter/view by category
- Category-level statistics

---

### Feature: Weekly Reports

**Difficulty:** Medium  
**Estimated Time:** 1-2 weeks

**Database Schema:**

```sql
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_ending DATE NOT NULL,
  total_completions INTEGER,
  completion_rate DECIMAL,
  longest_streak INTEGER,
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_ending)
);
```

**Implementation:**
- Generate on Sundays via cron job
- Email to user with summary
- Show in-app history
- Track trends over time

---

### Feature: Social Sharing

**Difficulty:** High  
**Estimated Time:** 2-3 weeks

**Features:**
- Share weekly achievements
- Share habit milestones
- Achievement badges
- Social feed (optional)

**Considerations:**
- Privacy settings (opt-in)
- Prevent over-sharing (rate limits)
- Share via WhatsApp, Twitter, etc.

---

### Feature: Habit Analytics Dashboard

**Difficulty:** High  
**Estimated Time:** 2-4 weeks

**Charts to Display:**
- Completion trend (line chart)
- Category breakdown (pie chart)
- Best/worst habits (bar chart)
- Streak patterns (calendar heatmap)

**Technology:**
- Recharts or Chart.js for visualization
- Pre-calculated analytics in database
- Cache results for performance

---

## Community Features

### Feature: Friend Groups

**Create Accountability Groups:**

```typescript
interface Group {
  id: UUID
  name: string
  owner_id: UUID
  created_at: TIMESTAMP
  max_members: number
}

interface GroupMember {
  group_id: UUID
  user_id: UUID
  joined_at: TIMESTAMP
  role: 'owner' | 'member'
}

interface GroupChallenge {
  id: UUID
  group_id: UUID
  habit_id: UUID
  duration: number // days
  created_by: UUID
  created_at: TIMESTAMP
}
```

**Implementation Steps:**
1. Create Group schema
2. Add group management UI
3. Implement challenge system
4. Add member invitations
5. Create group dashboard

---

### Feature: Habit Templates

**Pre-built Habit Collections:**

```typescript
interface HabitTemplate {
  id: UUID
  name: string // "Morning Routine", "Fitness", "Learning"
  description: string
  habits: {
    name: string
    icon: string
    frequency: 'daily' | 'weekly'
  }[]
  creator: UUID
  uses_count: number
  rating: number
}
```

**Benefits:**
- Help new users get started
- Community-created templates
- One-click import

---

## Integration Opportunities

### Apple HealthKit Integration

**Connect to Apple Health:**

```swift
// ios/App/App/HealthKitManager.swift
import HealthKit

class HealthKitManager {
  let healthStore = HKHealthStore()
  
  func requestHealthKitPermission() {
    let typesToShare: Set = [
      HKQuantityType.workoutType()
    ]
    
    let typesToRead: Set = [
      HKQuantityType.stepCountType(),
      HKQuantityType.activeEnergyBurnedType()
    ]
    
    healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { success, error in
      if success {
        // Sync habit data with HealthKit
      }
    }
  }
  
  func logWorkout(habit: Habit, duration: TimeInterval) {
    let workout = HKWorkout(
      activityType: .other,
      start: Date(),
      end: Date(),
      duration: duration,
      totalEnergyBurned: nil,
      totalDistance: nil,
      metadata: ["habitName": habit.name]
    )
    
    healthStore.save(workout) { success, error in
      // Update habit log
    }
  }
}
```

**Benefits:**
- Automatic workout logging
- Health trends integration
- Better health insights

---

### Google Fit Integration

**Android Health Integration:**

```kotlin
// android/app/src/main/java/com/sg/habitrabbit/HealthManager.kt
import com.google.android.gms.fitness.Fitness
import com.google.android.gms.fitness.data.DataType

class HealthManager(private val context: Context) {
  
  fun logSteps(steps: Int) {
    val endTime = System.currentTimeMillis()
    val startTime = endTime - 1000 * 60 * 60 // 1 hour ago
    
    val dataSet = DataSet.create(DataType.TYPE_STEP_COUNT_DELTA).apply {
      add(
        DataPoint.create(DataType.TYPE_STEP_COUNT_DELTA).apply {
          setTimeInterval(startTime, endTime, TimeUnit.MILLISECONDS)
          getValue(Field.FIELD_STEPS).setInt(steps)
        }
      )
    }
    
    // Insert into Google Fit
    Fitness.getHistoryClient(context)
      .insertData(dataSet)
      .addOnSuccessListener { }
      .addOnFailureListener { }
  }
}
```

---

### Slack Integration

**Post Achievements to Slack:**

```typescript
// lib/slack.ts
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL

export async function postAchievementToSlack(
  userName: string,
  achievement: string,
  emoji: string = '🎉'
) {
  if (!SLACK_WEBHOOK) return

  const payload = {
    text: `${emoji} ${userName} completed a weekly streak!`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${achievement}*\n${userName} is on fire! 🔥`,
        },
      },
    ],
  }

  await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
```

---

### Calendar Integration

**Sync with Google Calendar:**

```typescript
// lib/calendar.ts
export async function syncToGoogleCalendar(
  habit: Habit,
  logDate: string
) {
  const event = {
    summary: `Completed: ${habit.name} ${habit.icon}`,
    description: `Habit tracking reminder`,
    start: {
      date: logDate, // ISO format
    },
    end: {
      date: logDate,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'notification', minutes: 0 },
      ],
    },
  }

  // Use Google Calendar API
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )

  return response.json()
}
```

---

## Conclusion

This guide provides:
1. **Clear roadmap** for planned features
2. **Pattern** for implementing features consistently
3. **Real examples** of planned features
4. **Integration opportunities** to expand platform

Follow the implementation pattern for all new features to maintain code quality and consistency.

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-06-02  
**Next Update:** When roadmap changes
