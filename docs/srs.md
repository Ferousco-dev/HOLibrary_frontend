# Software Requirements Specification: HOL admin operations dashboard

| Field | Value |
| --- | --- |
| Document ID | SRS-HOL-ADMIN-v1 |
| Status | baselined |
| Author | analyst (conductor role rotation) |
| Baselined on | 2026-09-06 |

## Purpose and scope

Administrators need one place to understand collection pressure, see accountable activity, reach day-to-day workflows, and create authorised staff accounts. The dashboard extends the existing protected REST API; it does not become a separate permissions system.

## Users and constraints

An administrator uses this from a modern desktop or mobile browser during library operations. Counts come from `GET /admin/dashboard`, activity from `GET /admin/audit`, and account creation from `POST /members`. The client must not invent dashboard statistics or simulate an administrative write when the server refuses it.

## Out of scope

The dashboard does not expose saved titles, full borrowing histories, password recovery, removal of the final administrator, or client-side role changes. A server roster/role-management endpoint was not evidenced and remains a future change request.

## Requirements

The complete, testable register is in `.ilana/requirements.md`; its mapping to requirements, design, source and tests is in `.ilana/traceability.csv`.

## Approval

The stakeholder delegated unspecified decisions with “assume” and approved the FLEET plan on 2026-09-06.
