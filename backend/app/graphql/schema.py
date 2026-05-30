import strawberry
from strawberry.fastapi import GraphQLRouter

from app.graphql.context import get_context
from app.graphql.mutations.auth import AuthMutation
from app.graphql.queries.user import UserQuery


@strawberry.type
class Query(UserQuery):
    pass


@strawberry.type
class Mutation(AuthMutation):
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_router = GraphQLRouter(schema, context_getter=get_context)
