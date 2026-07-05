# Security Hardening Guide
## Comprehensive Security Implementation for Habit Rabbit

**Version:** 1.0.0  
**Created:** 2026-06-02  
**Audience:** Security Engineers, DevSecOps, Backend Developers

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Frontend Security](#frontend-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Dependency Management](#dependency-management)
8. [Security Testing](#security-testing)
9. [Incident Response](#incident-response)

---

## Security Overview

### Security Layers

```
┌──────────────────────────────────────┐
│   Application Layer                  │
│  - Input validation                  │
│  - XSS/CSRF protection               │
│  - Rate limiting                     │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│   Authentication Layer               │
│  - JWT tokens                        │
│  - Session management                │
│  - MFA (future)                      │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│   Data Layer                         │
│  - Encryption at rest                │
│  - Row-level security                │
│  - Audit logging                     │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│   Infrastructure Layer               │
│  - HTTPS/TLS 1.3                     │
│  - DDoS protection                   │
│  - WAF rules                         │
│  - Intrusion detection               │
└──────────────────────────────────────┘
```

### Security Checklist

- [ ] HTTPS enforced everywhere
- [ ] HSTS headers configured
- [ ] CSP (Content Security Policy) implemented
- [ ] CORS properly configured
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (input validation, output encoding)
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured
- [ ] Authentication secure (bcrypt hashing)
- [ ] Authorization enforced (RLS policies)
- [ ] Secrets never committed
- [ ] Dependencies regularly updated
- [ ] Security scanning in CI/CD
- [ ] Error messages don't leak information
- [ ] Logging secure (no passwords)
- [ ] Backup encryption configured
- [ ] Incident response plan created

---

## Authentication Security

### Password Requirements

**Enforce Strong Passwords:**

```typescript
// lib/validation.ts
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSpecial: 1,
  specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain number')
  }

  if (!PASSWORD_REQUIREMENTS.specialChars.test(password)) {
    errors.push('Password must contain special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### Bcrypt Hashing (Handled by Supabase)

**Supabase Password Storage:**

```
User password
    ↓
Supabase Auth Service
    ↓
bcrypt hashing (cost factor 11)
    ↓
Stored in PostgreSQL
```

**Never** store passwords in plain text or use weak hashing:

```typescript
// ❌ NEVER do this
const password = userInput
await db.users.update({ password })

// ✓ Supabase handles hashing
const { data, error } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword, // Hashed by Supabase
})
```

### JWT Token Security

**Token Structure:**

```
Header.Payload.Signature

Header: { alg: "HS256", typ: "JWT" }
Payload: { sub: user-id, email, iat, exp }
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload))
```

**Token Validation:**

```typescript
// lib/jwt.ts
import * as jwt from 'jsonwebtoken'

export function verifyToken(token: string): {
  valid: boolean
  payload?: any
  error?: string
} {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    )
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { valid: false, error: 'Token expired' }
    }

    return { valid: true, payload }
  } catch (error) {
    return { valid: false, error: 'Invalid token' }
  }
}
```

**Token Storage (Secure):**

```typescript
// ✓ Good: HttpOnly cookie (default in Supabase)
// Browser cannot access via JavaScript
// Automatically sent with requests
// Protected against XSS

// ❌ Avoid: LocalStorage
// Vulnerable to XSS attacks
// Can be stolen by malicious scripts

// ❌ Avoid: SessionStorage  
// Vulnerable to XSS attacks
```

### Session Management

**Auto-logout on Inactivity:**

```typescript
// lib/session-timeout.ts
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

let inactivityTimeout: NodeJS.Timeout

export function resetInactivityTimer() {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout)
  }

  inactivityTimeout = setTimeout(() => {
    // Force logout
    supabase.auth.signOut()
    window.location.href = '/auth?reason=session_expired'
  }, INACTIVITY_TIMEOUT)
}

// Add listeners for user activity
document.addEventListener('click', resetInactivityTimer)
document.addEventListener('keypress', resetInactivityTimer)
window.addEventListener('scroll', resetInactivityTimer)
```

---

## Data Protection

### Encryption at Rest

**Supabase Database Encryption:**

```sql
-- PostgreSQL encryption (built-in)
-- All data encrypted with AES-256

-- Verify encryption
SELECT * FROM pg_crypto;

-- For sensitive data, add application-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt user notes (future feature)
UPDATE users 
SET notes = pgp_sym_encrypt(notes, 'encryption_key')
WHERE id = user_id;

-- Decrypt
SELECT pgp_sym_decrypt(notes, 'encryption_key') 
FROM users 
WHERE id = user_id;
```

### Encryption in Transit

**HTTPS/TLS Configuration:**

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**TLS 1.3 Requirement:**

```bash
# Verify minimum TLS version
curl -I --tlsv1.3 https://habitrabbit.app

# Should succeed with TLS 1.3 or higher
# HTTP/2 200
```

### Data Minimization

**Collect Only What's Needed:**

```typescript
// ✓ Good: Minimal data collection
const userProfile = {
  id: userId,
  email: userEmail,
  // No password, no IP address, no location tracking
}

// ❌ Bad: Unnecessary data collection
const userProfile = {
  id: userId,
  email: userEmail,
  password: hashedPassword, // Never store here
  ipAddress: req.ip, // Unnecessary
  location: userLocation, // Not needed
  browser: userAgent, // Not needed
}
```

### PII Handling

**Personally Identifiable Information:**

```typescript
// Define what's PII in your app
const PII_FIELDS = [
  'email',
  'phone_number', // If added in future
  'full_name', // If added in future
  'payment_info', // If added in future
]

// Mask PII in logs
function sanitizeForLogging(data: any) {
  const sanitized = { ...data }
  PII_FIELDS.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***'
    }
  })
  return sanitized
}

// Usage
logger.info('User action', sanitizeForLogging(userData))
```

---

## API Security

### CORS Configuration

**Restrict Origins:**

```typescript
// next.config.ts with CORS headers
{
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'https://habitrabbit.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ]
  },
}
```

### Rate Limiting

**Implement Rate Limiting:**

```typescript
// lib/rate-limit.ts
import Ratelimit from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: process.env.REDIS_URL,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}
```

**API Route with Rate Limiting:**

```typescript
// app/api/habits/route.ts
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const identifier = request.headers.get('x-real-ip') || 'unknown'
  
  if (!(await checkRateLimit(identifier))) {
    return new Response('Too many requests', { status: 429 })
  }

  // Process request
  const data = await request.json()
  // ...
  return Response.json({ success: true })
}
```

### Input Validation

**Validate All Inputs:**

```typescript
// lib/validators.ts
import { z } from 'zod'

const CreateHabitSchema = z.object({
  name: z
    .string()
    .min(1, 'Habit name required')
    .max(100, 'Habit name too long')
    .trim(),
  icon: z
    .string()
    .emoji('Must be valid emoji')
    .optional(),
})

export function validateCreateHabit(data: unknown) {
  try {
    return CreateHabitSchema.parse(data)
  } catch (error) {
    return null
  }
}

// API usage
export async function POST(request: Request) {
  const data = await request.json()
  
  const validated = validateCreateHabit(data)
  if (!validated) {
    return Response.json(
      { error: 'Invalid input' },
      { status: 400 }
    )
  }

  // Process validated data
  // ...
}
```

### SQL Injection Prevention

**Always Use Parameterized Queries:**

```typescript
// ❌ NEVER do this
const query = `SELECT * FROM habits WHERE user_id = '${userId}'`
// Vulnerable to SQL injection

// ✓ Good: Use Supabase client (parameterized)
const { data } = await supabase
  .from('habits')
  .select('*')
  .eq('user_id', userId) // Parameterized

// ✓ Good: Raw query with parameters
const { data } = await supabase.rpc('get_habits', {
  p_user_id: userId // Parameter
})
```

---

## Frontend Security

### XSS Prevention

**Output Encoding:**

```typescript
// ❌ Bad: XSS vulnerability
function HabitCard({ habit }) {
  return (
    <div>
      <span dangerouslySetInnerHTML={{ __html: habit.name }} />
    </div>
  )
}

// ✓ Good: React auto-escapes
function HabitCard({ habit }) {
  return (
    <div>
      <span>{habit.name}</span>
    </div>
  )
}
```

### CSRF Protection

**Supabase Handles CSRF:**

```typescript
// Supabase automatically validates CSRF tokens
// Uses SameSite cookie attribute

// Verify headers
const headers = {
  'Content-Type': 'application/json',
  'X-CSRF-Token': getCsrfToken(), // If needed
}
```

### Content Security Policy (CSP)

**Configure CSP Headers:**

```javascript
// next.config.ts
{
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdn.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://project.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

### Dependency Security Scanning

**Frontend Dependencies:**

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check specific package
npm audit --package=lodash

# Update dependencies safely
npm update --save
```

---

## Infrastructure Security

### Vercel Security Settings

**Environment Variables:**

```bash
# Never commit .env.local
echo ".env.local" >> .gitignore

# Store in Vercel (encrypted)
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add SENTRY_TOKEN

# Restrict to specific environments
vercel env add --environment=production API_SECRET
vercel env add --environment=preview DEBUG_MODE
```

### Supabase Security

**Row-Level Security (RLS):**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Policies (already defined in setup)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Verify policies
SELECT * FROM pg_policies 
WHERE tablename = 'habits';
```

**Database Firewall:**

```sql
-- Supabase uses PostgreSQL native security
-- Connections require valid JWT token
-- Network isolated (no direct SQL connections)

-- Verify auth via JWT
SELECT current_user;
-- Should return: authenticated

-- Attempt unauthorized access
-- Would fail with 401 Unauthorized
```

---

## Dependency Management

### Secure Supply Chain

**Track Vulnerabilities:**

```bash
# Generate SBOM (Software Bill of Materials)
npm ls --json > sbom.json

# Check for vulnerabilities
npm audit --json > audit-report.json

# Track with Snyk
npm install -g snyk
snyk auth
snyk test

# Update dependencies
npm update
npm install --save-dev @latest
```

### Dependency Pinning

**Lock File Management:**

```json
// package-lock.json structure
{
  "name": "habit-rabbit-next",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "habit-rabbit-next",
      "version": "1.0.0",
      "dependencies": {
        "next": "16.2.6" // Pinned version
      }
    }
  }
}

// Never manually edit lock file
// Always use npm install/update
```

---

## Security Testing

### OWASP Top 10 Testing

**Test Checklist:**

```
1. Broken Access Control
   - [ ] Test unauthorized access attempts
   - [ ] Verify RLS policies
   - [ ] Check for privilege escalation

2. Cryptographic Failures
   - [ ] Verify TLS 1.3 enabled
   - [ ] Check password hashing (bcrypt)
   - [ ] Verify no plaintext PII

3. Injection
   - [ ] Test SQL injection
   - [ ] Test XSS attacks
   - [ ] Test command injection

4. Insecure Design
   - [ ] Review threat model
   - [ ] Verify security controls
   - [ ] Test error handling

5. Security Misconfiguration
   - [ ] Check headers
   - [ ] Verify CORS rules
   - [ ] Review env variables

6. Vulnerable and Outdated Components
   - [ ] npm audit
   - [ ] Check dependency versions
   - [ ] Update regularly

7. Authentication Failures
   - [ ] Test password reset
   - [ ] Verify session timeout
   - [ ] Check token expiration

8. Data Integrity Failures
   - [ ] Test data validation
   - [ ] Verify encryption
   - [ ] Check audit logs

9. Logging & Monitoring Failures
   - [ ] Verify error logging
   - [ ] Check security events
   - [ ] Test alerting

10. SSRF
    - [ ] Verify API requests
    - [ ] Check external services
    - [ ] Test webhooks
```

### Penetration Testing

**Run Local Penetration Tests:**

```bash
# Install testing tools
npm install --save-dev owasp-zap burp-suite

# Run OWASP ZAP scan
zaproxy -cmd -quickurl https://localhost:3000

# Generate report
zaproxy -cmd -report
```

---

## Incident Response

### Security Incident Template

```markdown
# Security Incident Report

**Date:** 2026-06-15  
**Severity:** High  
**Status:** Resolved  

## Incident Summary
[Description of what happened]

## Detection
- **Detected by:** [Alert/User/Scan]
- **Detection time:** 2026-06-15 14:32 UTC
- **Discovery time:** 2026-06-15 14:35 UTC

## Impact Assessment
- **Affected users:** [Number]
- **Data exposed:** [Type of data]
- **Business impact:** [Severity]

## Root Cause
[Technical analysis of how it happened]

## Containment
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Eradication
1. [Patch applied]
2. [Configuration changed]
3. [Code updated]

## Recovery
- Timeline to recovery
- Verification steps
- Rollback plan (if needed)

## Post-Incident Actions
- [ ] Update security policies
- [ ] Train team members
- [ ] Implement monitoring
- [ ] Document lessons learned

## Lessons Learned
- What went well
- What could be improved
- Process changes needed
```

### Security Response Plan

**24/7 On-Call Process:**

```
Security Alert
    ↓
Page on-call engineer
    ↓
Assess severity (P1-P4)
    ↓
If P1/P2:
  ├─ Page team lead
  ├─ Brief incident commander
  ├─ Disable affected feature (if needed)
  ├─ Isolate compromised data
  └─ Begin investigation
    ↓
Contain breach
    ↓
Eradicate vulnerability
    ↓
Recover from backup
    ↓
Post-incident review
```

---

## Security Metrics

### Track These KPIs

```
Mean Time To Detect (MTTD): < 1 hour
Mean Time To Respond (MTTR): < 4 hours
Mean Time To Resolve (MTTR): < 24 hours

Vulnerability Metrics:
- Critical: 0 (must fix immediately)
- High: < 5 (fix within 1 week)
- Medium: < 20 (fix within 1 month)
- Low: < 50 (fix within 3 months)

Security Test Coverage:
- OWASP Top 10: 100%
- API endpoints: 100%
- Authentication flows: 100%
- Database queries: 100%
```

---

## Compliance

### GDPR Compliance

**Data Subject Rights:**

```typescript
// Right to access (export)
export async function getDataExport(userId: string) {
  const [habits, logs, settings] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('habit_logs').select('*').eq('user_id', userId),
    supabase.from('users').select('*').eq('id', userId),
  ])
  
  return {
    habits: habits.data,
    logs: logs.data,
    settings: settings.data,
  }
}

// Right to deletion
export async function deleteAllUserData(userId: string) {
  // Delete in order (respect foreign keys)
  await supabase.from('habit_logs').delete().eq('user_id', userId)
  await supabase.from('habits').delete().eq('user_id', userId)
  await supabase.from('users').delete().eq('id', userId)
  
  // Confirm deletion
  const remaining = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
  
  return remaining.data?.length === 0
}
```

### Privacy Policy

**Template:**

```markdown
# Privacy Policy

Last updated: 2026-06-02

## Information We Collect
- Email address (for authentication)
- Habit data and logs (user-created)
- User preferences (stored locally)

## How We Use Information
- Enable core features (habit tracking)
- Improve user experience
- Send important notifications

## Data Security
- Encrypted in transit (TLS 1.3)
- Encrypted at rest (AES-256)
- Access controlled with RLS

## Your Rights
- Right to access your data
- Right to delete your account
- Right to data portability

## Contact
security@habitrabbit.app
```

---

## Conclusion

Security is an ongoing process. Regular:
- Vulnerability scanning
- Penetration testing
- Security training
- Incident simulations
- Policy reviews

Maintain this guide and update as threats evolve.

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-06-02  
**Next Review:** 2026-12-02
