Add a column to an existing model. Follow every step in order.

## Steps

1. **Update the SQLAlchemy model** in `backend/app/models/<model>.py`
   - Use `Mapped[str | None]` for nullable fields
   - Always use `DateTime(timezone=True)` for timestamps, never plain `DateTime`

2. **Update the GraphQL type** in `backend/app/graphql/types.py`
   - Match nullability — nullable DB column → `str | None` in the type

3. **Update every constructor call** for that type in:
   - `backend/app/graphql/mutations/` — all mutations that return this type
   - `backend/app/graphql/queries/` — all queries that return this type
   - Pass the new field in every `UserType(...)` / `<ModelType>(...)` call

4. **Generate and apply the migration** (always inside Docker):
   ```bash
   docker compose exec backend uv run alembic revision --autogenerate -m "add <column> to <table>"
   docker compose exec backend uv run alembic upgrade head
   ```
   > After running, verify with: `docker compose exec db psql -U postgres -d app -c "\d <table>"`

5. **Update the ER diagram** at `docs/data/erd.md`

6. **Commit** all changed files together
