# HOL administrative workflows

**Status:** workflow definitions for the approved admin-dashboard change request.
**Scope:** current operation visibility and proposed administrator-management behaviour.
**Control boundary:** workflows that change access are conditional on a verified, server-authorised API contract. No browser-only workflow may grant, revoke, or simulate an administrator role.

## Workflow: WFL-01 — view administrative operations

| Field | Value |
| --- | --- |
| Purpose | Give an authorised administrator an accurate, actionable view of collection pressure and recent staff activity. |
| Owner | Library administrator; frontend renders and API authorises. |
| Trigger | Administrator opens the Dashboard page or requests a refresh. |
| Service level | Render each successfully returned module as soon as its request settles; a failed module must not block an independent module. |

### Activities

| # | Activity | Role | Input | Output | Duration | Exit condition |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Open dashboard with an authenticated session | Administrator | Session | Dashboard request | Immediate | Page is loaded. |
| 2 | Request collection counts | Frontend | `GET /admin/dashboard` | Counts or refusal | API dependent | Response settles. |
| 3 | Request audit activity in parallel | Frontend | `GET /admin/audit` | Entries or refusal | API dependent | Response settles. |
| 4 | Render available overview, alert modules, and direct actions | Frontend | Settled responses | Operational dashboard | Immediate | Each module has a visible state. |
| 5 | Select a follow-up workflow | Administrator | Dashboard insight | Contextual route | User-paced | Administrator opens staff work or audit detail. |

### Roles

| Role | Responsible for | Must not |
| --- | --- | --- |
| Administrator | Interpret metrics and decide the appropriate operational follow-up | Treat a dashboard count as permission to bypass circulation or member controls. |
| Frontend | Request, render, announce, and link truthful state | Invent statistics, roles, or audit events. |
| Library API | Return only data allowed to the caller | Rely on hidden navigation as access control. |

### Decision points

| Decision | Condition | Path if yes | Path if no | Decided by |
| --- | --- | --- | --- | --- |
| Is the dashboard request authorised? | API returns successful response | Render overview | Render sign-in or access-refusal state | API |
| Is audit activity authorised and available? | Audit request returns usable entries | Render audit table | Retain overview; show module-specific refusal or unavailable state | API/frontend |
| Does an item require intervention? | Administrator identifies overdue, member, circulation, or reservation concern | Route to dedicated staff workflow | Continue monitoring | Administrator |

### Handoffs

| From | To | What is handed over | How it is confirmed |
| --- | --- | --- | --- |
| Frontend | Library API | Authenticated read request | HTTP response with status and body |
| Dashboard | Staff workflow | Entity or filter context without credentials | Destination page loads and independently authorises its request |
| Library API | Audit service | Committed staff action, where audit is implemented | Audit event becomes readable to authorised users |

### Exceptions

| Exception | Detection | Handling | Escalation |
| --- | --- | --- | --- |
| Session expired | `401` | Show sign-in state and clear protected page state | Administrator signs in again |
| Role denied | `403` | Explain required access; provide safe route | Library manager if access is expected |
| One module fails | Request error | Keep independent successful module; provide retry | API support if persistent |
| Stale or unexpected data | Timestamp absent, malformed, or inconsistent response | Mark module unavailable; do not calculate a substitute | Library API/audit owner |

### Metrics

| Metric | Target | Current |
| --- | --- | --- |
| Overview module availability | To be set from production telemetry | Not measured |
| Audit module availability | To be set from production telemetry | Not measured |
| Time from observation to routed staff workflow | To be baselined during usability verification | Not measured |

## Workflow: WFL-02 — investigate and act on an operational signal

| Field | Value |
| --- | --- |
| Purpose | Turn an operational indicator into a controlled desk, member, overdue, or reservation action. |
| Owner | Library administrator or librarian, according to the destination workflow. |
| Trigger | Dashboard indicates a concern or the administrator selects a management area. |
| Service level | The destination workflow owns validation and commit timing; the dashboard only passes safe context. |

### Activities

| # | Activity | Role | Input | Output | Duration | Exit condition |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Select signal or operational area | Administrator | Dashboard card or audit record | Destination intent | User-paced | A task is selected. |
| 2 | Open the dedicated staff page | Frontend | Safe filter/entity context | Staff page | Immediate | Page loads. |
| 3 | Re-authorise and load target data | Destination frontend/API | Authenticated request | Current entity state | API dependent | Data or refusal returns. |
| 4 | Perform the specialised action | Authorised staff member | Validated current state | Server commit or refusal | User-paced | Result returns. |
| 5 | Record and review effect | API/audit service and administrator | Committed action | Audit event and refreshed state | API dependent | Outcome is visible or discrepancy is raised. |

### Decision points

| Decision | Condition | Path if yes | Path if no | Decided by |
| --- | --- | --- | --- | --- |
| Is the destination action permitted? | API authorises staff role and target state | Show actionable flow | Show refusal | API |
| Is the target state still valid? | Copy/member/reservation meets server rules | Commit action | Return policy refusal | API |
| Did the operation commit? | Success response and refreshed state | Review audit event | Preserve failure reason and allow corrected retry | API/frontend |

### Handoffs

| From | To | What is handed over | How it is confirmed |
| --- | --- | --- | --- |
| Dashboard | Desk/member/overdue workflow | Safe context, such as an entity identifier or category | Target page reads and validates current server state |
| Staff workflow | Audit service | Server-committed action | Event includes actor, action, target, and timestamp |
| Audit service | Administrator | Evidence of action | Audit row is visible to authorised reader |

### Exceptions

| Exception | Detection | Handling | Escalation |
| --- | --- | --- | --- |
| Target changed after dashboard view | Destination API shows current state differs | Use current server state; do not execute based on stale dashboard display | None unless discrepancy suggests misuse |
| Policy refusal | API response | Show the server’s reason and return to safe state | Library manager for policy dispute |
| Audit delay | Commit succeeds but event is not immediately present | State that audit verification is pending; retry read without inventing an event | Audit/API owner if persistent |

### Metrics

| Metric | Target | Current |
| --- | --- | --- |
| Stale-context refusal rate | Baseline first | Not measured |
| Completed actions with matching audit entry | 100%; verify against production capabilities | Not measured |
| Median time from signal to resolution | Baseline first | Not measured |

## Workflow: WFL-03 — manage administrator access (proposed, API-gated)

| Field | Value |
| --- | --- |
| Purpose | Add, change, deactivate, or restore privileged administrative access through a policy-enforced and auditable server operation. |
| Owner | Authorised administrator; library API owns final policy and persistence. |
| Trigger | Administrator chooses “Manage administrators” from the dashboard. |
| Service level | No write control is enabled until the roster and protected endpoint contract are verified. After submission, display a final result only after state and audit verification. |

### Preconditions

- The API contract for listing administrators and changing a role or status is documented, implemented, and protected.
- The acting session has the server-recognised authority required for the requested change.
- The target is uniquely identified; the target’s role and active status are read from the server immediately before submission.
- The API prevents self-removal of final administrative access and protects against leaving the system with no active administrator.

### Activities

| # | Activity | Role | Input | Output | Duration | Exit condition |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Open access-management module | Administrator | Admin dashboard | Roster request | Immediate | API capability is checked. |
| 2 | Load roster and available actions | Frontend/API | Authenticated read | Current roles and statuses | API dependent | Read succeeds or unavailable state shows. |
| 3 | Select target and requested change | Administrator | Current roster | Explicit proposed change | User-paced | Target and action are selected. |
| 4 | Review consequence and confirm | Frontend/administrator | Target, action, policy notice | Confirmed request | User-paced | Administrator confirms or cancels. |
| 5 | Validate authority and policy | API | Authenticated write | Commit or reasoned refusal | API dependent | API decides. |
| 6 | Persist approved change and audit it | API/audit service | Approved request | Updated access state and audit event | API dependent | Commit completes. |
| 7 | Re-read roster and audit activity | Frontend | Follow-up reads | Verified outcome | API dependent | Both reads settle; discrepancies are explicit. |

### Decision points

| Decision | Condition | Path if yes | Path if no | Decided by |
| --- | --- | --- | --- | --- |
| Is role management available? | Verified protected endpoints exist and API advertises/accepts them | Show roster and controls | Show unavailable state and approved escalation route | Product/API capability |
| Is requester authorised? | API recognises required administrator authority | Validate requested change | Refuse and retain no local changes | API |
| Is target change valid? | Target exists, policy allows change, final-admin safety holds | Commit and audit | Return exact refusal | API |
| Is outcome verified? | Updated roster and matching audit event are readable | Show completed status | Show “outcome needs verification”; prevent duplicate action | Frontend/API |

### Handoffs

| From | To | What is handed over | How it is confirmed |
| --- | --- | --- | --- |
| Administrator | Frontend | Explicit target and requested role/status | Review screen names target and effect |
| Frontend | Library API | Authenticated, confirmed role-change request | API response states acceptance or refusal |
| Library API | Audit service | Committed access change | Immutable event with actor, target, action, timestamp |
| API/audit service | Frontend | Updated roster and audit entry | Read-after-write results match request |
| Frontend | Library manager | Unavailable capability, policy refusal, or verification discrepancy | Approved escalation record/reference |

### Exceptions

| Exception | Detection | Handling | Escalation |
| --- | --- | --- | --- |
| Endpoint absent or undocumented | Capability check cannot establish a safe contract | Hide/disable write operation; explain that the dashboard cannot make the change | Library manager/product owner defines approved process and API contract |
| Duplicate or ambiguous target | Roster search finds none or more than one | Require unique selection; do not submit | Administrator corrects search |
| Last-admin or self-lockout attempt | API policy response | Display server explanation; no local mutation | Library manager if policy exception is sought |
| Network timeout after submit | Transport failure after transmission begins | Mark outcome unknown; refresh roster/audit before any retry | API support if outcome remains unknown |
| Audit record absent after commit | Read-after-write mismatch | Flag verification discrepancy; do not claim full completion | Audit/API owner |
| Session expires during operation | `401` | Stop operation; request new sign-in; clear sensitive form data | Administrator signs in again |

### Metrics

| Metric | Target | Current |
| --- | --- | --- |
| Access changes with verified matching audit event | 100% | Not measured |
| Unknown-outcome resolution time | Set after support process is defined | Not measured |
| Rejected unsafe access changes | Monitor; no target until baseline exists | Not measured |

## Workflow: WFL-04 — review audit activity

| Field | Value |
| --- | --- |
| Purpose | Let an authorised administrator trace operational and access-changing activity to an actor, action, target, and timestamp. |
| Owner | Library administrator; audit service owns the record. |
| Trigger | Dashboard load, refresh, filter, or investigation. |
| Service level | Present records in readable language and preserve server timestamps through the shared Lagos-time formatter. |

### Activities

| # | Activity | Role | Input | Output | Duration | Exit condition |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Request recent or filtered audit records | Frontend | Authorised session and supported query | Audit response | API dependent | Response settles. |
| 2 | Render actor, action, target, and time | Frontend | Audit data | Readable activity table | Immediate | Entries or empty state visible. |
| 3 | Identify an anomaly or select related work | Administrator | Activity entry | Investigation context | User-paced | No action, or a staff workflow begins. |
| 4 | Escalate suspected misuse | Administrator/library manager | Record identifiers and timestamps | Incident record/process | Policy dependent | Responsible owner accepts case. |

### Decision points

| Decision | Condition | Path if yes | Path if no | Decided by |
| --- | --- | --- | --- | --- |
| May caller view audit records? | API authorises request | Render records | Show access refusal | API |
| Are there entries? | Response contains records | Render table | Render “nothing recorded” state | Frontend |
| Does an entry require investigation? | Administrator identifies inconsistency | Preserve context and enter approved investigation route | Continue monitoring | Administrator |

### Handoffs

| From | To | What is handed over | How it is confirmed |
| --- | --- | --- | --- |
| Audit service | Administrator | Readable operational record | Table row includes actor, action, target, time |
| Administrator | Library manager/API owner | Suspected anomaly with minimum necessary identifiers | Case or support acknowledgement |

### Exceptions

| Exception | Detection | Handling | Escalation |
| --- | --- | --- | --- |
| Audit access denied | `403` | Explain access limitation; do not show fabricated empty state | Library manager if access should exist |
| Malformed event | Missing actor, action, or timestamp | Mark record incomplete and avoid guessing missing facts | Audit/API owner |
| Sensitive information in an event | Review identifies credentials or unnecessary personal data | Do not reproduce/export it in the frontend; raise privacy defect | Privacy/API owner |

### Metrics

| Metric | Target | Current |
| --- | --- | --- |
| Audit records with required readable fields | 100% | Not measured |
| Audit-review requests denied unexpectedly | Baseline first | Not measured |
| Time from anomaly observation to accepted escalation | Baseline first | Not measured |

## Handoff to documentarian and conductor

```text
HANDOFF
  from:     process-modeler
  to:       documentarian / conductor
  gate:     continuous
  produced: docs/process-model.md, docs/workflows.md
  ids:      WFL-01..WFL-04
  open:     The protected administrator-management API contract, roster data shape, offline escalation owner, and audit-filter capability remain unverified.
  assumed:  Existing dashboard reads and the staff operational pages remain separate workflows; any future access change is server-authorised and audit-verified.
  next:     Translate workflows into requirements and test cases, then resolve API gaps before releasing access-management write controls.
```
