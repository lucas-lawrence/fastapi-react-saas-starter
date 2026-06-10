# 0004 — UUID v7 Primary Keys

**Status:** Accepted

## Context

The initial schema used auto-increment integers as primary keys. For a SaaS product this has two problems:

1. **Information leakage** — sequential IDs expose business metrics. A new customer with `id=12` knows you have few users.
2. **Scalability** — integers are not globally unique, which creates friction if rows are ever synced across services or databases.

UUID v4 was considered but rejected: it is random with no ordering guarantee, which breaks cursor-based pagination (`WHERE id > $cursor ORDER BY id`) and creates index fragmentation in Postgres.

## Decision

Use **UUID v7** as the primary key type for all tables.

UUID v7 encodes a millisecond-precision timestamp in the first 48 bits, making it:
- **Time-ordered** — `ORDER BY id` is equivalent to `ORDER BY created_at` at ms precision
- **Non-guessable** — remaining bits are random; no information leakage
- **Cursor-safe** — `WHERE id > $cursor` works correctly for keyset pagination
- **Globally unique** — safe to merge rows across databases without collision

The `uuid6` library provides `uuid6.uuid7()` for Python 3.13. (`uuid.uuid7()` arrives in the standard library in Python 3.14.) The project runs Python 3.13 (latest stable as of mid-2026).

In SQLAlchemy, the column is declared as `Uuid` (generic type) with `default=uuid.uuid7`, so the value is generated in application code before the `INSERT`, making it available immediately without a DB round-trip.

In GraphQL, IDs are exposed as the `ID` scalar (a string), which is the GraphQL convention for opaque identifiers.

## Consequences

- All primary keys are 128-bit UUIDs stored as `uuid` in Postgres (16 bytes vs 4 for int)
- Index size is larger, but the ordering property keeps B-tree fragmentation minimal
- Client-facing IDs are strings — no arithmetic on IDs is possible (this is intentional)
- Cursor-based pagination is the correct approach; offset pagination (`page=3`) is discouraged
