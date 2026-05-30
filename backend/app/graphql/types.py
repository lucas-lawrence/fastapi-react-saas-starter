import strawberry


@strawberry.type
class UserType:
    id: int
    email: str
    is_active: bool


@strawberry.type
class TokenPair:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
