import strawberry


@strawberry.type(description="A registered user account.")
class UserType:
    id: strawberry.ID = strawberry.field(description="Unique identifier (UUID v7).")
    email: str = strawberry.field(description="Email address used to sign in.")
    first_name: str | None = strawberry.field(description="First name. Null until the user sets it.")
    last_name: str | None = strawberry.field(description="Last name. Null until the user sets it.")
    country: str | None = strawberry.field(description="ISO 3166-1 alpha-2 country code (e.g. 'SG', 'MY'). Null until the user sets it.")
    is_active: bool = strawberry.field(description="Whether the account is active.")


@strawberry.type(description="Access and refresh token pair returned after a successful login or token refresh.")
class TokenPair:
    access_token: str = strawberry.field(description="Short-lived JWT used to authenticate API requests. Valid for 60 minutes. Pass as `Authorization: Bearer <token>`.")
    refresh_token: str = strawberry.field(description="Long-lived opaque token used to obtain a new token pair. Valid for 7 days. Rotated on every use.")
    token_type: str = strawberry.field(default="bearer", description="Token scheme. Always `bearer`.")
