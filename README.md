# QuickNotes System Design

A small notes app front end plus the system design for the real QuickNotes backend. The client talks to the JSONPlaceholder fake API (GET, POST, DELETE) while the design documents describe the production API, database and architecture.

## How to run the API client

1. Clone the repository.
2. Open `index.html` in a browser (or run `python3 -m http.server` and visit `http://localhost:8000`).
3. Click **Load notes** to fetch 10 notes, use the form to add a note, and press **Delete** on a note to remove it.

Note: JSONPlaceholder does not really store created or deleted notes, so changes live only on the page (see the comment at the top of `api.js`).

## Documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- How to wrap `fetch` in one reusable `request()` helper that checks `response.ok` and throws, so every call handles errors the same way.
- Showing loading, success, error and empty states and disabling buttons during requests makes the UI honest and prevents double submits; `textContent` keeps user text safe from XSS.
- Designing a REST API, a normalised SQL schema (with a junction table for many-to-many) and an architecture with cache, replica and queue, and estimating load to justify each piece.
- Every component solves a specific problem, and every one adds a trade-off or a single point of failure that must be addressed.
