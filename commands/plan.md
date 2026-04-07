---
description: Create comprehensive implementation plan before coding. Wait for user confirmation before proceeding.
agents: ["orchestrator-tech-lead", "ecc-plan"]
---

# Plan Command

**Activates:** `ecc-plan` skill

## Usage
```
/plan "Add user authentication with OAuth2"
```

## ⚠️ Important

This command will **WAIT** for your explicit confirmation before any code is written.

## What Happens

1. **Restate Requirements** - Clarify what you need
2. **Identify Risks** - Surface potential issues
3. **Create Step Plan** - Break into phases
4. **WAIT** - Requires your "yes" to proceed

## Plan Format

```markdown
# Implementation Plan: [Feature]

## Overview
[2-3 sentence summary]

## Architecture Changes
- [File/path and description]

## Implementation Steps

### Phase 1: Foundation
1. **[Step]** (File: path/to/file.ts)
   - Action: What to do
   - Dependencies: None/Requires X
   - Risk: Low/Medium/High

### Phase 2: Implementation
...

## Testing Strategy
- Unit tests: [what]
- Integration tests: [what]
- E2E tests: [what]

## Risks & Mitigations
- **Risk**: Description → Mitigation: Solution

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

## When to Use

✅ New feature development
✅ Architectural changes  
✅ Complex refactoring
✅ Multiple files affected
✅ Unclear requirements

❌ Simple bug fixes
❌ One-line changes
❌ Obvious implementations

## Example

```
User: /plan "Add real-time notifications for market resolution"

Agent (planner):
# Implementation Plan: Real-Time Notifications

## Requirements Restatement
- Send notifications when markets resolve
- Support in-app, email, webhook channels
- Include market outcome and user position

## Implementation Phases

### Phase 1: Database Schema
1. **Create notifications table** (File: supabase/migrations/005_notifications.sql)
   - Columns: id, user_id, market_id, type, status, created_at
   - Indexes on user_id, market_id

### Phase 2: Notification Service
2. **Create service** (File: src/lib/notifications.ts)
   - Queue using BullMQ/Redis
   - Retry logic for failures

### Phase 3: Frontend
3. **Create components** (File: src/components/NotificationBell.tsx)
   - Bell icon in header
   - Notification list modal

## Dependencies
- Redis (queue)
- Email service (SendGrid)

## Risks
- HIGH: Email deliverability → Mitigation: SPF/DKIM setup
- MEDIUM: Performance at scale → Mitigation: Batch processing

**WAITING FOR CONFIRMATION**: Proceed? (yes/no/modify)
```

## Related Commands
- `/tdd` - Implement after plan approved
- `/architect` - Deep architecture review
- `/deploy` - Deployment planning
