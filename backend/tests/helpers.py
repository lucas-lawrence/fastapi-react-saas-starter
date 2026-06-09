from httpx import AsyncClient

GQL_URL = "/graphql"

REGISTER = """
mutation Register(
  $email: String!, $password: String!,
  $firstName: String, $lastName: String, $country: String
) {
  register(
    email: $email, password: $password,
    firstName: $firstName, lastName: $lastName, country: $country
  ) {
    id email firstName lastName country isActive
  }
}
"""

LOGIN = """
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken refreshToken
  }
}
"""

ME = """
query Me {
  me { id email firstName lastName country }
}
"""

REFRESH = """
mutation Refresh($refreshToken: String!) {
  refresh(refreshToken: $refreshToken) {
    accessToken refreshToken
  }
}
"""

LOGOUT = """
mutation Logout($refreshToken: String!) {
  logout(refreshToken: $refreshToken)
}
"""


async def gql(
    client: AsyncClient,
    query: str,
    variables: dict | None = None,
    token: str | None = None,
) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    resp = await client.post(
        GQL_URL,
        json={"query": query, "variables": variables or {}},
        headers=headers,
    )
    return resp.json()


async def register_user(
    client: AsyncClient,
    email: str = "test@example.com",
    password: str = "password123",
    first_name: str = "Test",
    last_name: str = "User",
    country: str = "SG",
) -> dict:
    data = await gql(client, REGISTER, {
        "email": email,
        "password": password,
        "firstName": first_name,
        "lastName": last_name,
        "country": country,
    })
    return data["data"]["register"]


async def login_user(
    client: AsyncClient,
    email: str = "test@example.com",
    password: str = "password123",
) -> dict:
    data = await gql(client, LOGIN, {"email": email, "password": password})
    return data["data"]["login"]


# Only includes fields that are explicitly passed — critical for strawberry.UNSET
# to work correctly (missing fields must be absent from the mutation, not null).
async def update_user(client: AsyncClient, token: str, **fields) -> dict:
    FIELD_MAP = [
        ("first_name", "firstName", "String"),
        ("last_name", "lastName", "String"),
        ("email", "email", "String"),
        ("country", "country", "String"),
        ("current_password", "currentPassword", "String"),
        ("new_password", "newPassword", "String"),
    ]
    vars_decl, args, variables = [], [], {}
    for py_key, gql_key, gql_type in FIELD_MAP:
        if py_key in fields:
            vars_decl.append(f"${gql_key}: {gql_type}")
            args.append(f"{gql_key}: ${gql_key}")
            variables[gql_key] = fields[py_key]

    mutation = f"""
    mutation UpdateUser({", ".join(vars_decl)}) {{
      updateUser({", ".join(args)}) {{
        id email firstName lastName country
      }}
    }}
    """
    return await gql(client, mutation, variables, token=token)
