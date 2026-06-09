from .helpers import LOGOUT, ME, REFRESH, REGISTER, gql, login_user, register_user


# ── register ──────────────────────────────────────────────────────────────────

async def test_register_success(client):
    user = await register_user(client)
    assert user["email"] == "test@example.com"
    assert user["firstName"] == "Test"
    assert user["lastName"] == "User"
    assert user["country"] == "SG"
    assert user["isActive"] is True
    assert user["id"]


async def test_register_normalises_email(client):
    data = await gql(client, REGISTER, {"email": "Test@Example.COM", "password": "password123"})
    assert data["data"]["register"]["email"] == "test@example.com"


async def test_register_duplicate_email(client):
    await register_user(client)
    data = await gql(client, REGISTER, {"email": "test@example.com", "password": "password123"})
    assert data["errors"][0]["message"] == "Email already registered"


async def test_register_invalid_email(client):
    data = await gql(client, REGISTER, {"email": "notanemail", "password": "password123"})
    assert data["errors"]


async def test_register_email_no_tld(client):
    data = await gql(client, REGISTER, {"email": "user@nodot", "password": "password123"})
    assert data["errors"]


async def test_register_password_too_short(client):
    data = await gql(client, REGISTER, {"email": "test@example.com", "password": "short"})
    assert data["errors"]


# ── login ─────────────────────────────────────────────────────────────────────

async def test_login_success(client):
    await register_user(client)
    tokens = await login_user(client)
    assert tokens["accessToken"]
    assert tokens["refreshToken"]


async def test_login_wrong_password(client):
    await register_user(client)
    data = await gql(client, "mutation { login(email: \"test@example.com\", password: \"wrong\") { accessToken } }")
    assert data["errors"][0]["message"] == "Invalid credentials"


async def test_login_unknown_email(client):
    data = await gql(client, "mutation { login(email: \"nobody@example.com\", password: \"password123\") { accessToken } }")
    assert data["errors"][0]["message"] == "Invalid credentials"


# ── me ────────────────────────────────────────────────────────────────────────

async def test_me_authenticated(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await gql(client, ME, token=tokens["accessToken"])
    me = data["data"]["me"]
    assert me["email"] == "test@example.com"
    assert me["firstName"] == "Test"
    assert me["lastName"] == "User"


async def test_me_no_token(client):
    data = await gql(client, ME)
    assert data["data"]["me"] is None


async def test_me_invalid_token(client):
    data = await gql(client, ME, token="not.a.valid.token")
    assert data["data"]["me"] is None


# ── refresh ───────────────────────────────────────────────────────────────────

async def test_refresh_success(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await gql(client, REFRESH, {"refreshToken": tokens["refreshToken"]})
    new_tokens = data["data"]["refresh"]
    assert new_tokens["accessToken"]
    assert new_tokens["refreshToken"]
    assert new_tokens["refreshToken"] != tokens["refreshToken"]


async def test_refresh_rotates_token(client):
    await register_user(client)
    tokens = await login_user(client)
    await gql(client, REFRESH, {"refreshToken": tokens["refreshToken"]})
    # old token must no longer work
    data = await gql(client, REFRESH, {"refreshToken": tokens["refreshToken"]})
    assert data["errors"]


async def test_refresh_invalid_token(client):
    data = await gql(client, REFRESH, {"refreshToken": "invalidtoken"})
    assert data["errors"]


# ── logout ────────────────────────────────────────────────────────────────────

async def test_logout_success(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await gql(client, LOGOUT, {"refreshToken": tokens["refreshToken"]})
    assert data["data"]["logout"] is True


async def test_logout_invalidates_token(client):
    await register_user(client)
    tokens = await login_user(client)
    await gql(client, LOGOUT, {"refreshToken": tokens["refreshToken"]})
    data = await gql(client, REFRESH, {"refreshToken": tokens["refreshToken"]})
    assert data["errors"]


async def test_logout_already_invalid_is_safe(client):
    data = await gql(client, LOGOUT, {"refreshToken": "doesnotexist"})
    assert data["data"]["logout"] is True
