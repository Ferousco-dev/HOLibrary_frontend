# Design description — HOL admin operations dashboard

## Components

| ID | Design | Responsibility |
| --- | --- | --- |
| DES-001 | Operations overview | Renders counts returned by `GET /admin/dashboard`. |
| DES-002 | Audit activity panel | Renders readable, time-formatted records from `GET /admin/audit`. |
| DES-003 | Operations launcher | Links to existing circulation, member, reservation, and overdue workflows. |
| DES-004 | Staff-account form | Validates fields then sends `POST /members` with staff role data. |
| DES-005 | Failure boundary | Uses `api.js`, `load()`, notices, and a live region for errors and outcomes. |

## Trust boundary

The browser reads API data and submits an account request. The API authenticates, authorizes, creates the account, determines temporary credentials, and records the audit event. No privileged state is stored or derived in the client.

## Open change request

CR-001: a dedicated administrator roster endpoint is needed before the UI can list, promote, demote, or remove administrators safely.
