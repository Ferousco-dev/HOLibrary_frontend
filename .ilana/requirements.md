# Admin dashboard requirements register

- REQ-001 [must] Show collection and circulation counts from the authorised dashboard endpoint.
- REQ-002 [must] Show the latest authorised audit events in readable language.
- REQ-003 [must] Give an administrator direct routes to circulation, member and overdue work.
- REQ-004 [must] Let an administrator create a staff or administrator account through the protected member-creation endpoint.
- REQ-005 [must] Show a generated temporary password once only after a successful account creation.
- REQ-006 [must] Report server refusals beside the relevant operation and preserve the current dashboard.
- REQ-007 [must] Keep privileged actions server-authorized and audit-visible; never emulate a role change in the browser.
- NFR-001 [security] All administrative writes use the shared authenticated API client; verified by TC-004.
- NFR-002 [usability] Every dashboard control is keyboard reachable with a visible focus state; verified by TC-003.
- NFR-003 [responsive] Controls fit without horizontal scrolling at 390 CSS pixels; verified by TC-005.
- DOM-001 [privacy] The dashboard excludes borrowing-history and saved-title information not needed to operate the library.
