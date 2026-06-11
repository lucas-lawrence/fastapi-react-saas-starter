Add a new SQLAlchemy model with GraphQL support. Follow every step in order.

## Gather context first

Before writing any code, read these files to understand existing patterns:

- `backend/app/models/user.py` — model structure and mixin usage
- `backend/app/models/__init__.py` — how models are registered
- `backend/app/graphql/types.py` — how GraphQL types are defined
- `backend/app/graphql/schema.py` — how queries and mutations are wired in
- `backend/app/graphql/queries/user.py` — example query
- `backend/app/graphql/mutations/user.py` — example mutation

## Steps

1. **Create the model** at `backend/app/models/<model>.py`
   - Inherit `TimestampMixin, Base` (provides `created_at`, `updated_at`, `deleted_at`)
   - Use `uuid6.uuid7` as the primary key default
   - Use `DateTime(timezone=True)` for all timestamp columns
   - Example:
     ```python
     class MyModel(TimestampMixin, Base):
         __tablename__ = "my_models"
         id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid6.uuid7)
     ```

2. **Register the model** in `backend/app/models/__init__.py` so Alembic detects it:
   ```python
   from app.models.my_model import MyModel  # noqa: F401
   ```

3. **Create the GraphQL type** in `backend/app/graphql/types.py`
   - Expose `id` as `strawberry.ID`
   - Nullable DB columns → `str | None` in the type

4. **Add queries and/or mutations** as needed:
   - Queries → `backend/app/graphql/queries/<model>.py`
   - Mutations → `backend/app/graphql/mutations/<model>.py`
   - All list queries **must** filter `WHERE deleted_at IS NULL`
   - Single record lookups must return 404 if `deleted_at IS NOT NULL`

5. **Wire into the schema** in `backend/app/graphql/schema.py`

6. **Generate and apply the migration** (always inside Docker):
   ```bash
   docker compose exec backend uv run alembic revision --autogenerate -m "add <model> table"
   docker compose exec backend uv run alembic upgrade head
   ```
   > After running, verify with: `docker compose exec db psql -U postgres -d app -c "\d <table>"`

7. **Update the ER diagram** at `backend/docs/data/erd.md` — add the new entity and its relationships

8. **Commit** all changed files together
