import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Spin } from 'antd';

import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';

const TEST_QUERY = gql`
  {
    users {
      id
      name
    }
  }
`

const TEST_SUBSCRIPTION = gql`
  subscription {
    todos {
      id
      title
    }
  }
`

export default (): React.ReactNode => {
  const { loading, error, data } = useQuery(TEST_QUERY);

  const { data: dataS, loading: loadingS, error: errorS } = useSubscription(TEST_SUBSCRIPTION);

  if (error) {
    return <pre>Query Error: {JSON.stringify(error, null, 2)}</pre>
  }

  if (errorS) {
    return <pre>Subscription Error: {JSON.stringify(error, null, 2)}</pre>
  }

  return <PageHeaderWrapper>
    <div style={{ textAlign: 'center' }}>
      {
        loading ? <Spin></Spin> : data.users.map(({name, id}) => <p key={id}>{name}</p>)
      }
      <hr></hr>
      {
        loadingS ? <Spin></Spin> : dataS.todos.map(({title, id}) => <p key={id}>{title}</p>)
      }
      <p>
      This is a apollo Welcome page{' '}
      <a href="https://pro.ant.design/docs/block-cn" target="_blank" rel="noopener noreferrer">
        use block
      </a>
      。
      </p>
    </div>
  </PageHeaderWrapper>
};
