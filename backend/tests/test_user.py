from .helpers import LOGIN, ME, gql, login_user, register_user, update_user


# ── update name / country ─────────────────────────────────────────────────────

async def test_update_first_and_last_name(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(client, tokens["accessToken"], first_name="Jane", last_name="Doe")
    user = data["data"]["updateUser"]
    assert user["firstName"] == "Jane"
    assert user["lastName"] == "Doe"
    assert user["email"] == "test@example.com"  # unchanged


async def test_update_country(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(client, tokens["accessToken"], country="MY")
    assert data["data"]["updateUser"]["country"] == "MY"


async def test_update_partial_does_not_clear_other_fields(client):
    await register_user(client, first_name="Alice", last_name="Smith")
    tokens = await login_user(client)
    # update only country — first/last name must remain
    data = await update_user(client, tokens["accessToken"], country="MY")
    user = data["data"]["updateUser"]
    assert user["firstName"] == "Alice"
    assert user["lastName"] == "Smith"


# ── update email ──────────────────────────────────────────────────────────────

async def test_update_email_success(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(client, tokens["accessToken"], email="new@example.com")
    assert data["data"]["updateUser"]["email"] == "new@example.com"


async def test_update_email_duplicate(client):
    await register_user(client, email="first@example.com")
    await register_user(client, email="second@example.com")
    tokens = await login_user(client, email="first@example.com")
    data = await update_user(client, tokens["accessToken"], email="second@example.com")
    assert data["errors"][0]["message"] == "Email already in use"


async def test_update_email_invalid_format(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(client, tokens["accessToken"], email="bademail")
    assert data["errors"]


# ── update password ───────────────────────────────────────────────────────────

async def test_update_password_success(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(
        client, tokens["accessToken"],
        current_password="password123",
        new_password="newpassword456",
    )
    assert not data.get("errors")
    # verify login with new password works
    login_data = await gql(client, LOGIN, {"email": "test@example.com", "password": "newpassword456"})
    assert login_data["data"]["login"]["accessToken"]


async def test_update_password_old_password_rejected(client):
    await register_user(client)
    tokens = await login_user(client)
    await update_user(
        client, tokens["accessToken"],
        current_password="password123",
        new_password="newpassword456",
    )
    login_data = await gql(client, LOGIN, {"email": "test@example.com", "password": "password123"})
    assert login_data["errors"][0]["message"] == "Invalid credentials"


async def test_update_password_wrong_current(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(
        client, tokens["accessToken"],
        current_password="wrongpassword",
        new_password="newpassword456",
    )
    assert data["errors"][0]["message"] == "Current password is incorrect"


async def test_update_password_too_short(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(
        client, tokens["accessToken"],
        current_password="password123",
        new_password="short",
    )
    assert data["errors"]


async def test_update_password_requires_current(client):
    await register_user(client)
    tokens = await login_user(client)
    data = await update_user(client, tokens["accessToken"], new_password="newpassword456")
    assert data["errors"][0]["message"] == "Current password is required to set a new password"


# ── auth guards ───────────────────────────────────────────────────────────────

async def test_update_no_auth_header(client):
    data = await update_user(client, token="", first_name="Jane")
    assert data["errors"]


async def test_update_invalid_token(client):
    data = await update_user(client, token="invalid.token.here", first_name="Jane")
    assert data["errors"]


# ── me reflects updates ───────────────────────────────────────────────────────

async def test_me_reflects_profile_update(client):
    await register_user(client)
    tokens = await login_user(client)
    await update_user(client, tokens["accessToken"], first_name="Updated", country="AU")
    me_data = await gql(client, ME, token=tokens["accessToken"])
    me = me_data["data"]["me"]
    assert me["firstName"] == "Updated"
    assert me["country"] == "AU"
