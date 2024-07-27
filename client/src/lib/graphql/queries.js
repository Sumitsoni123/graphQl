import { GraphQLClient } from "graphql-request";
import { getAccessToken } from "../auth";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  concat,
  createHttpLink,
  gql,
} from "@apollo/client";

// const client = new GraphQLClient("http://localhost:8000/graphql", {
//   headers: () => {
//     const accessToken = getAccessToken();
//     if (accessToken) {
//       return { Authorization: `Bearer ${accessToken}` };
//     }
//     return {};
//   },
// });

const httpLink = createHttpLink({ uri: "http://localhost:8000/graphql" });

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  // defaultOptions: {
  //   query: {
  //     fetchPolicy: "network-only",
  //   },
  //   watchQuery: {
  //     fetchPolicy: "network-only",
  //   },
  // },
});

export const JobsQuery = gql`
  query Jobs($limit: Int, $offset: Int) {
    jobs(limit: $limit, offset: $offset) {
      items {
        id
        date
        title
        company {
          id
          name
        }
        description
      }
      totalCount
    }
  }
`;

export const getJobs = async (limit, offset) => {
  // ---- using grapgql client -------
  // const { jobs } = await client.request(query);
  // return jobs;

  // --- apollo client -------
  const { data } = await apolloClient.query({
    query: JobsQuery,
    variables: { limit, offset },
    fetchPolicy: "network-only", // fetching policy specific to this query only
  });
  return data.jobs;
};

const jobDetailFragment = gql`
  fragment Jobdetail on Job {
    id
    date
    title
    company {
      id
      name
    }
    description
  }
`;

export const JobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...Jobdetail
    }
  }
  ${jobDetailFragment}
`;

export const getJobById = async (id) => {
  // ---- using grapgql client -------
  // const { job } = await client.request(query, { id });
  // return job;

  // --- apollo client -------
  const { data } = await apolloClient.query({
    query: JobByIdQuery,
    variables: { id },
  });
  return data.job;
};

export const CompanyByIdQuery = gql`
  query CompanyById($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        date
        title
      }
    }
  }
`;

export const getCompanyById = async (id) => {
  // const { company } = await client.request(query, { id });
  // return company;

  const { data } = await apolloClient.query({
    query: CompanyByIdQuery,
    variables: { id },
  });
  return data.company;
};

export const createJobMutation = gql`
  mutation CreateJob($input: createJobInput!) {
    job(input: $input) {
      # id
      # # this fields later added to avoid network call and get data from cache instead
      # date
      # title
      # company {
      #   id
      #   name
      # }
      # description
      ...Jobdetail
    }
  }
  ${jobDetailFragment}
`;

export const createJob = async ({ title, description }) => {
  // const { job } = await client.request(mutation, {
  //   input: { title, description },
  // });
  // return job;
  const { data } = await apolloClient.mutate({
    mutation: createJobMutation,
    variables: { input: { title, description } },
    // this update fn will be called after query returns response
    update: (cache, { data }) => {
      cache.writeQuery({
        query: JobByIdQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return data.job;
};

export const deleteJob = async ({ id }) => {
  const mutation = gql`
    mutation DeleteJob($input: deleteJobInput!) {
      dJob(input: $input) {
        id
      }
    }
  `;

  // const { dJob } = await client.request(mutation, {
  //   input: { id },
  // });
  // return dJob;
  const { data } = await apolloClient.mutate({
    mutation,
    variables: { input: { id } },
  });
  return data.dJob;
};
