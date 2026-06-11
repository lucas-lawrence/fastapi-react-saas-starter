import strawberry
from strawberry.fastapi import GraphQLRouter

from app.graphql.context import get_context
from app.graphql.mutations.auth import AuthMutation
from app.graphql.mutations.organization import OrganizationMutation
from app.graphql.mutations.user import UserMutation
from app.graphql.queries.organization import OrganizationQuery
from app.graphql.queries.user import UserQuery


@strawberry.type
class Query(UserQuery, OrganizationQuery):
    pass


@strawberry.type
class Mutation(AuthMutation, UserMutation, OrganizationMutation):
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_router = GraphQLRouter(schema, context_getter=get_context)
