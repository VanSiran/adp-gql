import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';


// TODO: handle error and retry. using apollo-link-retry & apollo-link-error
// TODO: Env variable.

const GRAPHQL_ENDPOINT = 'kringraphql.herokuapp.com/v1/graphql';
// const HASURA_GRAPHQL_ADMIN_SECRET = 'jq8989002';
const AUTHORIZATION_HEADER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqaWFxaSIsImF1ZCI6Imhhc3VyYS1ncWwiLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsidXNlciIsImFkbWluIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS11c2VyLWlkIjoiMSJ9fQ.b6bay36us2nqOiSBhi1vX13ELI8p2QcSoEJ3gqZnNng';
const HASURA_ROLE = 'user';

const httpLink = new HttpLink({
  uri: `https://${GRAPHQL_ENDPOINT}`,
  headers: {
    // 'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET,
    Authorization: `Bearer ${AUTHORIZATION_HEADER}`,
    'x-hasura-role': HASURA_ROLE,
  },
})

const wsClient = new SubscriptionClient(
  `wss://${GRAPHQL_ENDPOINT}`,
  {
    reconnect: true,
    connectionParams: () => ({
      headers: {
        // 'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET,
        Authorization: `Bearer ${AUTHORIZATION_HEADER}`,
        'x-hasura-role': HASURA_ROLE,
      },
    }),
  },
)

const wsLink = new WebSocketLink(wsClient)

export default split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)