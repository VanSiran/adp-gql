import gql  from "graphql-tag";

export const GET_CURRENT_USER = gql`
  {
    antdp_sys_user {
      name
      avatar
      userid: id
      email
      signature
      title
      group
      tags
      country
      geographic
      address
      phone
      notifications_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`