# Change request: member self-checkout

## Requested outcome
A signed-in member selects an available physical copy on a title page, confirms the loan, and sees the assigned due date without visiting the circulation desk.

## Why this is a backend change
The deployed API documents `POST /loans` as **librarian only** and requires both `copy_id` and `member_id`. A member browser must not be allowed to choose a different member ID or bypass the server's circulation checks. The frontend cannot safely create this feature by itself.

## Proposed API
`POST /me/loans`

Request body:
```json
{ "copy_id": "uuid" }
```

The server must derive the member from the access token and atomically check: authenticated active account, password changed, entitlement limit, copy availability, copy loan policy, reservation queue, and final-copy retention. On success, it records an audit event and returns the created loan including `due_at`.

## Frontend follow-up
Once this endpoint is deployed, the title page can replace “See collection details” with “Borrow this copy”, show a confirmation dialog, call `POST /me/loans`, and link to “Books you have out”.
