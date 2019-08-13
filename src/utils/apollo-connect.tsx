import React from 'react';
import ApolloClient from 'apollo-client';
import stateNs from './state-namespace';
// import { useApolloClient } from '@apollo/react-hooks';

let g_models: ApolloConnectModel[] = []
let g_client: ApolloClient<object>
let g_stateLoaders: object
/*
 * @template T the type of the action's `type` tag.
 */
export interface Action<T = any> {
 type: T
}
/**
 * An Action type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `Action` itself to prevent types that extend `Action` from
 * having an index signature.
 */
export interface AnyAction extends Action {
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any
}
/* @template S The type of state consumed and produced by this reducer.
 * @template A The type of actions the reducer can potentially respond to.
 */
export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A
) => S

// /**
//  * @type P: Type of payload
//  * @type C: Type of callback
//  */
export type Dispatch = <P = any, C = (payload: P) => void>(action: {
  type: string;
  payload?: P;
  callback?: C;
  [key: string]: any;
}, client: ApolloClient<object>) => any;

type DispatchProp = {
  dispatch: Dispatch
}


// export type Updater = (
//   payload: any,
//   client: ApolloClient<object>,
// ) => void

export type ApolloConnectModel = {
  namespace: string,
  state: object,
  reducers: Reducer,
  stateGql: any,
  cacheToState: (data: object) => object,
  stateToCache: (state: object) => object,
}

const dispatchFunc: Dispatch = ({type, payload, callback, key}) => {
  if (type.indexOf('/') === -1) {
    console.error(`no namespace for action: ${type}`)
    return
  }
  const [namespace, reducer]  = type.split('/')
  if (!namespace) {
    console.error(`no namespace for action: ${type}`)
    return
  }
  const model = g_models.filter(model => model.namespace === namespace)[0]
  if (!model) {
    console.error(`can not find namespace: ${namespace}`)
    return
  }
  const reducerNames = model.reducers && Object.keys(model.reducers);
  const reducerFind = reducerNames.filter(reducerName => reducerName === reducer)[0]
  if (!reducerFind) {
    console.error(`can not find reducer: ${reducer} in namespace: ${namespace}`)
    return
  }

  const reducerFunc = model.reducers[reducer];
  if (typeof reducerFunc !== 'function') {
    console.error(`can not find reducer: ${reducer} in namespace: ${namespace}`)
    return
  }
  // console.log("g_client === client ? ", g_client === client)
  // Update the state.
  console.log('dispath action', namespace, reducerFind);
  const queryResult = g_client.readQuery({query: model.stateGql});
  let state = model.cacheToState(queryResult);
  console.log("before State:", state);
  state = reducerFunc(state, {payload});
  console.log("after State:", state);
  g_client.writeData(model.stateToCache(state));
}

export default (model?: ApolloConnectModel) => {
  g_models = model ? [model] : []
  return {
    model(model: ApolloConnectModel): void {
      g_models.push(model)
    },
  
    unmodel(namespace: string): void {
      g_models = g_models.filter(model => model.namespace !== namespace)
    },
  
    start(client: ApolloClient<object>) {
      g_client = client;
      let initialState = g_models.map(model => {
        return [stateNs`${model.namespace}`, model.state]
      })
  
      let stateLoaders = g_models.map(model => [model.namespace, {gql: model.stateGql, mapper: model.cacheToState}]);
      g_stateLoaders = Object.fromEntries(stateLoaders)

      initialState = Object.fromEntries(initialState)
  
      client.cache.writeData({ data: initialState })
      // Sometimes you may need to reset the store in your application,
      // when a user logs out for example. If you call client.resetStore
      // anywhere in your application, you will likely want to initialize
      // your cache again. You can do this using the client.onResetStore
      // method to register a callback that will call cache.writeData again.
      client.onResetStore(() => client.cache.writeData({ data: initialState }));
    },
  }
}


export const connect = (cacheToProps: Function) => {
  return (WrappedComponent: React.Component|Function) => {
    return (props: object) => {
      // const client = useApolloClient();
      
      const addProps = cacheToProps(g_stateLoaders);
      const dispatch: DispatchProp = {
        dispatch: dispatchFunc
        // dispatch: (args) => {dispatchFunc(args, client)}
      }
      return <WrappedComponent {...props} {...addProps} {...dispatch} />;
    }
  }
}