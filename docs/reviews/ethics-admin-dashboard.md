# Ethics review: administrative operations dashboard

**Review ID:** ETH-001
**Date:** 6 September 2026
**Reviewer:** ethics-officer
**Scope:** The requested expansion of the HOL administrator dashboard into a site-wide operations and administrator-management interface.

## Decision

No halt is raised for the requested dashboard expansion. The request has a legitimate operational
purpose. Delivery is conditional on server-authorized administrator changes, least-privilege data
views, human confirmation for access-affecting actions, and an accountable audit trail. These are
major requirements, not optional interface polish.

## People and data affected

An incorrect operation can stop a library member from signing in or borrowing, expose their
borrowing history, or give an unauthorised person administrative power. Staff can also be harmed
if activity records attribute actions inaccurately or expose more work history than operationally
needed.

The inspected application handles members' names, identifiers, email addresses, faculty,
department, level, categories, account status, current loans, and loan history. The dashboard
also retrieves an administrator-only audit trail with staff actor names and timestamps. The
published privacy policy states that saved titles are visible only to the member; this expansion
must preserve that boundary.

## Required controls

| Area | Requirement | Verification evidence needed |
| --- | --- | --- |
| Authorization | The API, not `sessionStorage`, hidden controls, or client-side role checks, authorizes every dashboard read and write. | Protected endpoint tests return 401/403 without authorization and succeed only for authorized roles. |
| Admin lifecycle | Creating, promoting, demoting, deactivating, or restoring administrators uses documented protected endpoints. A missing endpoint is presented honestly. | API contract and tests covering allowed, denied, and invalid requests. |
| High-impact actions | Suspension and privileged-role changes state their effect and require explicit confirmation. The server protects against self-lockout and loss of the final active administrator. | Interface review plus server integration tests or API-owner confirmation. |
| Auditability | Role and account-status changes record actor, target, before/after state, timestamp, and outcome. Audit visibility is restricted to administrators and is paginated. | Recorded events after successful and refused operations; authorization test for audit endpoint. |
| Data minimisation | Operational overview cards use counts. Named members and circulation details appear only in purposeful, protected screens. No new bulk export or local cache of audit/member data is added. | UI inspection and network review. |
| Reading privacy | Saved titles stay unavailable to librarians and administrators. | API and UI review showing no staff/admin endpoint or panel exposes them. |
| Credentials | Temporary passwords are shown once only; role workflows do not log, export, retain, or display credentials after navigation. | UI inspection and test of registration/admin workflow. |
| Honest capability claims | The client does not pretend an admin action succeeded unless the server confirmed it. Refusals leave no stale success state. | Failure-path tests and visual review. |

## Current evidence

The existing client uses server calls for `/admin/dashboard` and `/admin/audit`, and it treats
client-side role inspection as navigation convenience rather than security. The existing member
status change uses a confirmation dialog and a protected `PATCH /members/{id}/status` call.
The repository decision record already rejects client-only administrative writes. These are good
foundations, but they do not prove a server contract for adding or changing administrators.

## Open findings

- **ETH-001 (major):** Confirm a protected, auditable server contract for administrator lifecycle changes before exposing a working admin-management form.
- **ETH-002 (major):** Specify the minimum data each dashboard operation needs; preserve saved-title privacy and do not turn the audit feed into a broad personal-data view.
- **ETH-003 (major):** Define confirmation, reason capture where available, self-lockout prevention, and final-administrator protection for high-impact account actions.
- **ETH-004 (observation):** Verify 401/403 responses leave no privileged partial data rendered.
- **ETH-005 (minor):** Recheck temporary-password and session behaviour in the resulting workflow.

## Halt threshold

Work must halt if an implementation attempts client-only administrator creation or role changes,
suppresses or bypasses audit logging, exposes members' saved titles, or claims a privileged action
succeeded without a server response. Those outcomes conflict with the privacy policy and the
project's recorded decision that administrative authority is server-backed and audit-visible.

HANDOFF
  from:     ethics-officer
  to:       conductor
  gate:     G1
  produced: .ilana/ethics.md, docs/reviews/ethics-admin-dashboard.md
  ids:      ETH-001..ETH-005
  open:     ETH-001..ETH-005
  assumed:  No documented administrator-management write endpoint is available in the inspected frontend.
  next:     Turn ETH-001 through ETH-003 into traceable requirements and architecture constraints; secure API-owner confirmation before implementation of administrator writes.
