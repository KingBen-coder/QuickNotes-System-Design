# QuickNotes API Design

The real API the backend team should build (not JSONPlaceholder). Base path: `/api/v1`. JSON everywhere. Authentication: `Authorization: Bearer <token>`.

## Endpoints

| Method | Path | Description | Success status |
|--------|------|-------------|----------------|
| GET | `/notes?limit=10&cursor=...&tag=work` | List the current user's notes (paginated, optional tag filter) | 200 OK |
| POST | `/notes` | Create a note | 201 Created |
| GET | `/notes/{id}` | Get one note | 200 OK |
| PUT | `/notes/{id}` | Replace a note | 200 OK |
| PATCH | `/notes/{id}` | Partially update a note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List the user's tags | 200 OK |
| POST | `/notes/{id}/tags` | Attach a tag to a note | 201 Created |
| DELETE | `/notes/{id}/tags/{tagId}` | Remove a tag from a note | 204 No Content |
| POST | `/auth/login` | Exchange credentials for a token | 200 OK |

## Create a note

`POST /api/v1/notes`

```json
{
  "title": "Buy milk",
  "body": "2 litres, semi-skimmed",
  "tags": ["shopping"]
}
```

Response `201 Created` with header `Location: /api/v1/notes/42`:

```json
{
  "id": 42,
  "title": "Buy milk",
  "body": "2 litres, semi-skimmed",
  "tags": ["shopping"],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## List notes

`GET /api/v1/notes?limit=2`

Response `200 OK`:

```json
{
  "data": [
    { "id": 42, "title": "Buy milk", "body": "2 litres", "tags": ["shopping"], "created_at": "2025-01-15T10:30:00Z" },
    { "id": 41, "title": "Call Sam", "body": "About the invoice", "tags": [], "created_at": "2025-01-14T08:00:00Z" }
  ],
  "next_cursor": "eyJpZCI6NDF9"
}
```

## Error codes

| Status | Meaning |
|--------|---------|
| 400 Bad Request | Invalid JSON or failed validation (e.g. empty title, title over 100 characters) |
| 401 Unauthorized | Missing, expired or invalid token |
| 403 Forbidden | Authenticated but not allowed (e.g. another user's note) |
| 404 Not Found | Note or tag does not exist |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Unexpected server failure |

Example error body (same shape for every error):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title must be between 1 and 100 characters",
    "status": 400
  }
}
```
