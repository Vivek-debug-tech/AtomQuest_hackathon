# Demo Prep Guide

## Demo Story

1. Employee creates a goal.
2. Manager reviews and approves it.
3. The goal locks automatically.
4. Employee submits achievement check-ins against the locked goal.
5. Admin reviews analytics, audit logs, and unlocks if needed.

## Suggested Walkthrough

- Start on the employee goal creation screen.
- Show the validation and multi-goal planning experience.
- Move to the manager dashboard and approve a goal.
- Show the locked badge and explain the lock behavior.
- Open the check-in page and submit an achievement update.
- Finish on the admin dashboard with analytics, CSV export, and audit trail.

## Callouts For Judges

- Loading states and error boundaries are in place for a production-style experience.
- Toast notifications confirm key actions instantly.
- The analytics section uses responsive charts with an enterprise HRMS look.
- Audit logs capture approvals, lock changes, unlocks, and check-ins.

## Backup Talking Points

- The architecture is split into reusable UI components, API route handlers, and Supabase services.
- The portal is built to scale from mock data to live persistence without changing the UX patterns.
- The design uses a consistent slate and blue system to keep the product polished and readable.
