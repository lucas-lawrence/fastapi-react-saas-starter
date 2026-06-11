from .helpers import MY_ORGANIZATIONS, create_organization, gql, login_user, register_user


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
