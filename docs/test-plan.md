# Test plan — HOL admin operations dashboard

| ID | Requirement | Test and expected result | Status |
| --- | --- | --- | --- |
| TC-001 | REQ-001 | Authenticated admin response renders all provided dashboard counts. | requires live admin session |
| TC-002 | REQ-002, DOM-001 | Audit rows show actor, action, entity, and formatted time; no saved-title data appears. | requires live admin session |
| TC-003 | REQ-003, NFR-002 | Tab through action links and form controls; every control is labelled and focus-visible. | pending manual authenticated review |
| TC-004 | REQ-004..007, NFR-001 | Submit a valid staff account and a server-refused account. Success shows temporary password once; refusal stays local and announces server message. | requires live admin session |
| TC-005 | NFR-003 | At 390px there is no horizontal overflow and form fields stack. | pending viewport review |
| TC-006 | failure path | Signed-out user gets the sign-in state and no privileged content. | passed locally 2026-09-06 |

## Automated evidence

- `python3 scripts/check.py`: passed on 2026-09-06.
- Local browser console: no error or warning entries while loading the signed-out dashboard on 2026-09-06.
