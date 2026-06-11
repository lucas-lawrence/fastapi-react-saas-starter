Implement and test all CRUDL operations for a model: Create, Read (single), Update, Delete, List.

Use this after `/add-model` to ensure the model is fully covered, or to audit an existing model.

## Gather context first

Before writing anything, read:

- `backend/app/models/<model>.py` — fields, relationships, soft-delete
- `backend/app/graphql/mutations/<model>.py` — existing mutations
- `backend/app/graphql/queries/<model>.py` — existing queries
- `backend/app/graphql/types.py` — the GraphQL type
- `backend/tests/test_<model>.py` — existing tests (if any)
- `backend/tests/helpers.py` — existing helpers
- `backend/tests/test_delete_user.py` + `backend/tests/test_user.py` — reference test files

Identify which operations are missing (not yet implemented) and which tests are missing (implemented but untested). Implement missing operations first, then write tests for all.

## Operations checklist

### C — Create (`create<Model>` mutation)
**Implement:**
- Validate required fields; raise `ValueError` on bad input
- Check uniqueness constraints where applicable
- Require authentication via `get_current_user`
- Return the created `<Model>Type`

**Tests:**
- [ ] Success — record created, correct fields returned
- [ ] Validation error — invalid input rejected
- [ ] Duplicate / conflict — if a unique constraint exists
- [ ] Auth guard — unauthenticated request raises error

---

### R — Read (`<model>(id: ID!)` query)
**Implement:**
- Look up by `id`
- Return `null` (or raise error) if not found
- Return `null` (or raise error) if `deleted_at IS NOT NULL`
- Auth guard if the record is user-scoped

**Tests:**
- [ ] Success — correct record returned
- [ ] Not found — returns `null` or error
- [ ] Soft-deleted — returns `null` or error, not the record
- [ ] Wrong owner — cannot read another user's record (if user-scoped)

---

### U — Update (`update<Model>` mutation)
**Implement:**
- Accept only the fields that can change; immutable fields (e.g. `slug`) must not be accepted
- Use `strawberry.UNSET` for optional fields so missing fields are not cleared
- Verify ownership before updating
- Return the updated `<Model>Type`

**Tests:**
- [ ] Success — fields updated correctly
- [ ] Partial update — unspecified fields unchanged
- [ ] Validation error — invalid input rejected
- [ ] Not found / wrong owner — error
- [ ] Auth guard — unauthenticated request raises error

---

### D — Delete (`delete<Model>` mutation)
**Implement:**
- Soft-delete: set `deleted_at = datetime.now(timezone.utc)`
- Hard-delete any dependent records that must not linger (e.g. sessions, tokens)
- Verify ownership before deleting
- Return `bool`

**Tests:**
- [ ] Success — returns `True`
- [ ] Record inaccessible after deletion (Read and List both exclude it)
- [ ] Cascades — dependent records are cleaned up
- [ ] Auth guard — unauthenticated request raises error
- [ ] Wrong owner — cannot delete another user's record

---

### L — List (`my<Models>` query)
**Implement:**
- Return only records belonging to / accessible by the current user
- **Always** filter `WHERE deleted_at IS NULL`
- Return an empty list `[]` when there are no results — never `null`, never an error
- Unauthenticated: return `[]` (not an error) unless the design requires it

**Tests:**
- [ ] Returns records the user owns / is a member of
- [ ] Soft-deleted records excluded from results
- [ ] Does not return other users' records
- [ ] Empty list when no records exist
- [ ] Unauthenticated — returns `[]`

---

## After implementing

1. Add any new query/mutation strings and helpers to `backend/tests/helpers.py`
2. Run the new tests: `docker compose exec backend uv run pytest tests/test_<model>.py -v`
3. Run the full suite to check for regressions: `docker compose exec backend uv run pytest -q`
4. Commit all changed files together
