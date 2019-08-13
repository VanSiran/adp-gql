// import dvaLogger from 'dva-logger';

import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';

import link from '@/utils/apollo-link-compose';
import apolloConnect from '@/utils/apollo-connect';


const acApp = apolloConnect();
acApp.model({ ...require('@/apollo-models/global').default })
acApp.model({ ...require('@/apollo-models/setting').default })


export function rootContainer(container: JSX.Element) {
  const cache = new InMemoryCache();
  const client = new ApolloClient({ link, cache });

  acApp.start(client);

  return <ApolloProvider client={client}>{container}</ApolloProvider>
}

// export const dva = {
//   config: {
//     onError(err) {
//       err.preventDefault();
//       // eslint-disable-next-line no-console
//       console.error(err.message);
//     },
//   },
//   plugins: [
//     dvaLogger(),
//   ],
// };
