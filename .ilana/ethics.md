# Ethics register — HOL admin operations dashboard

| Field | Value |
| --- | --- |
| Review | ETH-001 |
| Date | 2026-09-06 |
| Reviewer | ethics-officer |
| Phase | 01 Requirements; continuous ethics review |
| Trigger | Approved expansion of the administrator dashboard into an operational control centre |
| Disposition | No halt. Three major controls are required before implementation advances. |

## The two questions

**Who is harmed if this is wrong?**

Library members could be wrongly suspended, prevented from borrowing, or have their borrowing
history exposed. Library staff and administrators could lose legitimate access or be falsely
attributed in an activity record. The library could lose accountability for circulation and
privileged account changes.

**What data does this hold, and what happens to a person if it leaks?**

The existing application exposes names, matric or staff identifiers, email addresses, faculty,
department, level, account status, current loans, and loan history to appropriate staff roles.
It also displays audit entries identifying staff actors and actions. Disclosure can expose a
person's reading and borrowing history, institutional affiliation, and contact details; it can
also reveal staff work patterns. Saved titles remain outside staff and administrator views under
the published privacy policy and must remain so.

## Exposure scan

| Dimension | Present | Detail | Rigour implication |
| --- | --- | --- | --- |
| Personal data | Yes | Identity, contact, academic affiliation, account status, circulation history | 3 is appropriate only with strict least privilege and server enforcement |
| Medical or health data | No | None identified | — |
| Financial data or transactions | No | None identified | — |
| Children's data | Unverified | User age is not represented in the inspected client | Treat as personal data regardless; no age-specific capability is proposed |
| Physical safety | No | No direct physical-safety function | — |
| Legal or regulatory obligation | Unverified | No formal compliance regime was supplied | Maintain the existing privacy promises and obtain institutional review before wider deployment |
| Automated decisions affecting people | Yes | Account suspension changes a person's ability to sign in and borrow | Human confirmation, server authorization, and auditability are required |
| Public infrastructure | No | Library operations only | — |

## Findings

| ID | Finding | Severity | Required action | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| ETH-001 | Administrator management can create, elevate, or deactivate powerful accounts. The browser must never be the authority for a role change. | major | Only render a successful result after a protected server endpoint confirms the change. Require re-authentication or equivalent server-side step-up protection for role creation, promotion, demotion, or removal; record actor, target, before/after role, timestamp, and outcome in the immutable audit trail. | architect / constructor | Open |
| ETH-002 | The dashboard's activity and member controls can expose more circulation data than an operational decision needs. | major | Apply least privilege by role and data minimisation by view. Keep saved titles inaccessible to staff and admins. Use aggregate counts for overview cards; show named member or loan data only in an intentional operational view already protected by the server. Do not add exports, bulk downloads, or client-side caching of audit/member data without an approved requirement and retention policy. | architect / interaction-designer / constructor | Open |
| ETH-003 | Suspending an account and changing administrator access affect a person's service access and require accountable human review. | major | Provide a clear consequence statement and confirmation before a suspension, demotion, deactivation, or removal. Require a reason where the server supports it; otherwise show that no reason was recorded. Make audit events readable and include both success and refusal outcomes where the API provides them. Avoid self-lockout and removal of the final active administrator at the server layer. | analyst / architect / constructor | Open |
| ETH-004 | Existing client-side role checks only shape navigation; they cannot secure the dashboard. | observation | Preserve server authorization for every read and write. Treat a 401/403 as an honest refusal with no partial privileged data left rendered. Do not claim a capability exists when the API contract lacks it. | constructor / verifier | Open |
| ETH-005 | Session tokens and temporary passwords are sensitive in shared desk environments. | minor | Preserve current short-lived in-memory access-token handling, rotated refresh token, server logout, and one-time temporary-password display. New admin workflows must not log, display after navigation, download, or transmit credentials. | constructor / verifier | Open |

## Control baseline for the approved scope

1. **Role management:** Admin addition, promotion, demotion, deactivation, and restoration require server-authorized endpoints. The dashboard may link to or explain an unavailable function, but may not simulate it.
2. **Separation of powers:** Do not allow the current administrator to remove their own final access or silently modify their own privilege. The API must protect the last active administrator and record all attempts.
3. **Audit:** The activity stream must identify the authenticated actor, action, target type and identifier, timestamp, and outcome. It is an accountability record, not a general staff-surveillance feed. Limit it to authorized administrators and paginate it rather than loading the full history.
4. **Privacy:** Keep saved titles exclusively member-visible. Do not place email addresses, full loan history, or member identity inside summary cards or a general activity feed unless needed for the specific operation.
5. **Security:** Client-side checks, hidden buttons, and static links are presentation only. The API must authorize every operation; the UI must handle refusal without implying success.
6. **Transparency:** Where a requested capability lacks a documented protected endpoint, say so plainly and provide a legitimate route such as contacting the system owner. Do not use a client-only workaround.

## ACM/IEEE assessment

| Principle | Assessment | Evidence or concern |
| --- | --- | --- |
| Public interest | Conditional | The scope controls access to educational-library services; findings ETH-001 through ETH-003 must be resolved before privileged-write delivery. |
| Client and employer responsibilities | Conditional | The stated intent is legitimate operations control. Current repository decision DEC-005 rejects client-only privilege changes. |
| Product quality | Conditional | Existing destructive member suspension has a confirmation flow. New privileged management must receive equivalent design review and verification. |
| Professional competence | Conditional | The client can safely implement presentation and protected API calls; server-side authorization, audit immutability, and last-admin protection need confirmation from the API owner. |

## Halt record

No halt raised. The request is a legitimate administrative feature. A halt is required if implementation proposes client-only role assignment, disables/suppresses audit logging, exposes saved titles, or represents an unverified administrator operation as complete.

## Closure disposition

All open findings must be resolved, accepted by a named human with a documented compensating control, or carried forward with owner and date at G8.

HANDOFF
  from:     ethics-officer
  to:       conductor
  gate:     G1
  produced: .ilana/ethics.md, docs/reviews/ethics-admin-dashboard.md
  ids:      ETH-001..ETH-005
  open:     ETH-001, ETH-002, ETH-003, ETH-004, ETH-005
  assumed:  The API remains the authority for authentication, authorization, role changes, and audit records; no protected admin-management write endpoint has been evidenced in the inspected frontend.
  next:     Carry ETH-001 through ETH-003 into requirements and architecture. Obtain or explicitly mark the server contract for administrator creation and privilege changes before construction.
