from .helpers import DELETE_USER, LOGIN, ME, REFRESH, gql, login_user, register_user


async def _registered_and_logged_in(client) -> dict:
    await register_user(client)
    return await login_user(client)


# ── deleteUser ────────────────────────────────────────────────────────────────

async def test_delete_user_success(client):
    tokens = await _registered_and_logged_in(client)
    data = await gql(client, DELETE_USER, token=tokens["accessToken"])
    assert data["data"]["deleteUser"] is True


async def test_delete_user_requires_auth(client):
    data = await gql(client, DELETE_USER)
    assert data["errors"]


# ── sessions killed immediately ───────────────────────────────────────────────

async def test_deleted_user_refresh_token_invalidated(client):
    tokens = await _registered_and_logged_in(client)
    await gql(client, DELETE_USER, token=tokens["accessToken"])
    data = await gql(client, REFRESH, {"refreshToken": tokens["refreshToken"]})
    assert data["errors"]


async def test_deleted_user_me_returns_null(client):
    tokens = await _registered_and_logged_in(client)
    await gql(client, DELETE_USER, token=tokens["accessToken"])
    data = await gql(client, ME, token=tokens["accessToken"])
    assert data["data"]["me"] is None


# ── cannot authenticate after deletion ───────────────────────────────────────

async def test_deleted_user_cannot_login(client):
    await register_user(client)
    tokens = await login_user(client)
    await gql(client, DELETE_USER, token=tokens["accessToken"])
    data = await gql(client, LOGIN, {"email": "test@example.com", "password": "password123"})
    assert data["errors"][0]["message"] == "Invalid credentials"


# ── email stays reserved during grace period ─────────────────────────────────

async def test_deleted_user_email_cannot_be_reregistered(client):
    await register_user(client)
    tokens = await login_user(client)
    await gql(client, DELETE_USER, token=tokens["accessToken"])
    data = await gql(client, """
        mutation { register(email: "test@example.com", password: "password123") { id } }
    """)
    assert data["errors"][0]["message"] == "Email already registered"
