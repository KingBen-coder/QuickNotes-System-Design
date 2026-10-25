# QuickNotes Data Model

## Entities

**users**

| Column | Type | Key |
|--------|------|-----|
| id | BIGINT | PK |
| email | VARCHAR(255) UNIQUE NOT NULL | |
| password_hash | VARCHAR(255) NOT NULL | |
| created_at | TIMESTAMP NOT NULL | |

**notes**

| Column | Type | Key |
|--------|------|-----|
| id | BIGINT | PK |
| user_id | BIGINT NOT NULL | FK -> users.id |
| title | VARCHAR(100) NOT NULL | |
| body | TEXT | |
| created_at, updated_at | TIMESTAMP NOT NULL | |

**tags**

| Column | Type | Key |
|--------|------|-----|
| id | BIGINT | PK |
| user_id | BIGINT NOT NULL | FK -> users.id |
| name | VARCHAR(50) NOT NULL | UNIQUE (user_id, name) |

**note_tags**

| Column | Type | Key |
|--------|------|-----|
| note_id | BIGINT | PK (part), FK -> notes.id |
| tag_id | BIGINT | PK (part), FK -> tags.id |

## Relationships

- **One-to-many:** one user has many notes (`notes.user_id`); one user has many tags (`tags.user_id`).
- **Many-to-many:** a note can have many tags and a tag can label many notes. This is resolved by the junction table `note_tags`, whose composite primary key `(note_id, tag_id)` also prevents duplicate links.

## CREATE TABLE

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  body TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## Example queries

```sql
-- 1. Latest 10 notes of a user
SELECT id, title, created_at FROM notes
WHERE user_id = 7 ORDER BY created_at DESC LIMIT 10;

-- 2. JOIN: notes with a given tag
SELECT n.id, n.title
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t ON t.id = nt.tag_id
WHERE n.user_id = 7 AND t.name = 'work';

-- 3. Number of notes per tag
SELECT t.name, COUNT(*) AS note_count
FROM tags t JOIN note_tags nt ON nt.tag_id = t.id
WHERE t.user_id = 7 GROUP BY t.name ORDER BY note_count DESC;
```

## Index

```sql
CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
```

**Reason:** the most common query lists one user's newest notes. This composite index lets the database find them and return them already sorted, without scanning the whole table. (`note_tags` also needs an index on `tag_id` for "notes with tag X" lookups.)

## SQL or NoSQL?

I chose **SQL (PostgreSQL/MySQL)**. The data is clearly relational (users, notes, tags, many-to-many), we want foreign keys and transactions to keep it consistent, and queries such as the tag JOIN are natural in SQL. The load (a few hundred reads/s) fits a primary with read replicas; if it ever outgrows one machine, we can shard by `user_id`.
