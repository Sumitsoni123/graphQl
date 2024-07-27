import { useMutation, useQuery } from "@apollo/client";
import {
  CompanyByIdQuery,
  createJobMutation,
  JobByIdQuery,
  JobsQuery,
} from "./queries";

export const useCompany = (id) => {
  const { data, loading, error } = useQuery(CompanyByIdQuery, {
    variables: { id },
  });
  return { company: data?.company, loading, error: Boolean(error) };
};

export const useJob = (limit, offset) => {
  const { data, loading, error } = useQuery(JobsQuery, {
    variables: { limit, offset },
    fetchPolicy: "network-only",
  });
  return { jobs: data?.jobs, loading, error: Boolean(error) };
};

export const useJobById = (id) => {
  const { data, loading, error } = useQuery(JobByIdQuery, {
    variables: { id },
  });
  return { job: data?.job, loading, error: Boolean(error) };
};

export const useCreateJob = () => {
  const [mutate, { loading }] = useMutation(createJobMutation);

  const createJob = async (title, description) => {
    const {
      data: { job },
    } = await mutate({
      variables: { input: { title, description } },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: JobByIdQuery,
          variables: { id: data.job.id },
          data,
        });
      },
    });
    return job;
  };

  return {
    loading,
    createJob,
  };
};
