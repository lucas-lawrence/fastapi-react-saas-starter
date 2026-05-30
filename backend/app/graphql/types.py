import strawberry


@strawberry.type(description="A registered user account.")
class UserType:
    id: int = strawberry.field(description="Unique identifier.")
    email: str = strawberry.field(description="Email address used to sign in.")
    is_active: bool = strawberry.field(description="Whether the account is active.")


@strawberry.type(description="Access and refresh token pair returned after a successful login or token refresh.")
class TokenPair:
    access_token: str = strawberry.field(description="Short-lived JWT used to authenticate API requests. Valid for 15 minutes. Pass as `Authorization: Bearer <token>`.")
    refresh_token: str = strawberry.field(description="Long-lived opaque token used to obtain a new token pair. Valid for 7 days. Rotated on every use.")
    token_type: str = strawberry.field(description="Token scheme. Always `bearer`.")
