from .helpers import (
    DELETE_ORGANIZATION, GET_ORGANIZATION, MY_ORGANIZATIONS, UPDATE_ORGANIZATION,
    create_organization, delete_organization, gql, login_user, register_user, update_organization,
)


async def _tokens(client) -> dict:
    await register_user(client)
    return await login_user(client)


# ── createOrganization ────────────────────────────────────────────────────────

async def test_create_organization_success(client):
    tokens = await _tokens(client)
    data = await create_organization(client, tokens["accessToken"])
    org = data["data"]["createOrganization"]
    assert org["name"] == "Acme Corp"
    assert org["slug"] == "acme"
    assert org["id"]


async def test_create_organization_normalises_slug_to_lowercase(client):
    tokens = await _tokens(client)
    data = await create_organization(client, tokens["accessToken"], slug="AcmeCorp")
    assert data["data"]["createOrganization"]["slug"] == "acmecorp"


async def test_create_organization_slug_already_taken(client):
    tokens = await _tokens(client)
    await create_organization(client, tokens["accessToken"])
    data = await create_organization(client, tokens["accessToken"], name="Other", slug="acme")
    assert data["errors"][0]["message"] == "'acme' is already taken."


async def test_create_organization_reserved_slug(client):
    tokens = await _tokens(client)
    data = await create_organization(client, tokens["accessToken"], slug="admin")
    assert data["errors"][0]["message"] == "'admin' is reserved and cannot be used as a subdomain."


async def test_create_organization_invalid_slug_starts_with_hyphen(client):
    tokens = await _tokens(client)
    data = await create_organization(client, tokens["accessToken"], slug="-acme")
    assert data["errors"]


async def test_create_organization_invalid_slug_too_short(client):
    tokens = await _tokens(client)
    data = await create_organization(client, tokens["accessToken"], slug="ab")
    assert data["errors"]


async def test_create_organization_requires_auth(client):
    data = await create_organization(client, token="")
    assert data["errors"]


# ── myOrganizations ───────────────────────────────────────────────────────────

async def test_my_organizations_returns_created_org(client):
    tokens = await _tokens(client)
    await create_organization(client, tokens["accessToken"])
    data = await gql(client, MY_ORGANIZATIONS, token=tokens["accessToken"])
    orgs = data["data"]["myOrganizations"]
    assert len(orgs) == 1
    assert orgs[0]["slug"] == "acme"


async def test_my_organizations_empty_for_non_member(client):
    await register_user(client, email="alice@example.com")
    tokens_alice = await login_user(client, email="alice@example.com")
    await create_organization(client, tokens_alice["accessToken"])

    await register_user(client, email="bob@example.com")
    tokens_bob = await login_user(client, email="bob@example.com")
    data = await gql(client, MY_ORGANIZATIONS, token=tokens_bob["accessToken"])
    assert data["data"]["myOrganizations"] == []


async def test_my_organizations_unauthenticated_returns_empty(client):
    data = await gql(client, MY_ORGANIZATIONS)
    assert data["data"]["myOrganizations"] == []


# ── organization (Read) ───────────────────────────────────────────────────────

async def test_get_organization_success(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    data = await gql(client, GET_ORGANIZATION, {"id": created["id"]}, token=tokens["accessToken"])
    org = data["data"]["organization"]
    assert org["id"] == created["id"]
    assert org["slug"] == "acme"


async def test_get_organization_not_found_returns_null(client):
    tokens = await _tokens(client)
    import uuid
    data = await gql(client, GET_ORGANIZATION, {"id": str(uuid.uuid4())}, token=tokens["accessToken"])
    assert data["data"]["organization"] is None


async def test_get_organization_non_member_returns_null(client):
    await register_user(client, email="alice@example.com")
    tokens_alice = await login_user(client, email="alice@example.com")
    created = (await create_organization(client, tokens_alice["accessToken"]))["data"]["createOrganization"]

    await register_user(client, email="bob@example.com")
    tokens_bob = await login_user(client, email="bob@example.com")
    data = await gql(client, GET_ORGANIZATION, {"id": created["id"]}, token=tokens_bob["accessToken"])
    assert data["data"]["organization"] is None


async def test_get_organization_unauthenticated_returns_null(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    data = await gql(client, GET_ORGANIZATION, {"id": created["id"]})
    assert data["data"]["organization"] is None


async def test_get_organization_soft_deleted_returns_null(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    await delete_organization(client, tokens["accessToken"], created["id"])
    data = await gql(client, GET_ORGANIZATION, {"id": created["id"]}, token=tokens["accessToken"])
    assert data["data"]["organization"] is None


# ── updateOrganization ────────────────────────────────────────────────────────

async def test_update_organization_success(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    data = await update_organization(client, tokens["accessToken"], created["id"], "New Name")
    org = data["data"]["updateOrganization"]
    assert org["name"] == "New Name"
    assert org["slug"] == "acme"  # slug unchanged


async def test_update_organization_slug_unchanged(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    await update_organization(client, tokens["accessToken"], created["id"], "Renamed")
    data = await gql(client, GET_ORGANIZATION, {"id": created["id"]}, token=tokens["accessToken"])
    assert data["data"]["organization"]["slug"] == "acme"


async def test_update_organization_non_member_cannot_update(client):
    await register_user(client, email="alice@example.com")
    tokens_alice = await login_user(client, email="alice@example.com")
    created = (await create_organization(client, tokens_alice["accessToken"]))["data"]["createOrganization"]

    await register_user(client, email="bob@example.com")
    tokens_bob = await login_user(client, email="bob@example.com")
    data = await update_organization(client, tokens_bob["accessToken"], created["id"], "Hijacked")
    assert data["errors"]


async def test_update_organization_requires_auth(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    data = await update_organization(client, "", created["id"], "No Auth")
    assert data["errors"]


# ── deleteOrganization ────────────────────────────────────────────────────────

async def test_delete_organization_success(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    data = await delete_organization(client, tokens["accessToken"], created["id"])
    assert data["data"]["deleteOrganization"] is True


async def test_delete_organization_excluded_from_list(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    await delete_organization(client, tokens["accessToken"], created["id"])
    data = await gql(client, MY_ORGANIZATIONS, token=tokens["accessToken"])
    assert data["data"]["myOrganizations"] == []


async def test_delete_organization_non_owner_cannot_delete(client):
    await register_user(client, email="alice@example.com")
    tokens_alice = await login_user(client, email="alice@example.com")
    created = (await create_organization(client, tokens_alice["accessToken"]))["data"]["createOrganization"]

    await register_user(client, email="bob@example.com")
    tokens_bob = await login_user(client, email="bob@example.com")
    data = await delete_organization(client, tokens_bob["accessToken"], created["id"])
    assert data["errors"]


async def test_delete_organization_requires_auth(client):
    tokens = await _tokens(client)
    created = (await create_organization(client, tokens["accessToken"]))["data"]["createOrganization"]
    data = await delete_organization(client, "", created["id"])
    assert data["errors"]
