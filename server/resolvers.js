import { companyLoader, getCompany } from "./db/companies.js";
import {
  countJobs,
  createJob,
  deleteJob,
  getJob,
  getJobByCompany,
  getJobs,
  updateJob,
} from "./db/jobs.js";
import { GraphQLError } from "graphql";

export const resolvers = {
  // for read operation
  Query: {
    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const total = await countJobs();
      return { items, totalCount: total };
    },
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        return notFoundError("no job found with id" + id);
      }
      return job;
    },
    company: (_root, { id }) => getCompany(id),
  },

  Company: {
    jobs: (company) => getJobByCompany(company.id),
  },

  Job: {
    // title: () => "title", // this overrides title
    date: (job) => job.createdAt.slice(0, "yyyy-mm-dd".length),
    // company: (job) => getCompany(job.companyId),
    company: (job) => companyLoader.load(job.companyId),
  },

  // for post, put operation
  Mutation: {
    job: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      return createJob({ companyId: user.companyId, title, description });
    },
    dJob: async (_root, { input: { id } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        return notFoundError("no job found with id" + id);
      }
      return job;
    },
    uJob: async (_root, { input: { id, title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authorization");
      }
      const updatedJob = await updateJob({
        id,
        title,
        description,
        companyId: user.companyId,
      });
      if (!updatedJob) {
        return notFoundError("no Job found with id" + id);
      }
      return updatedJob;
    },
  },
};

const notFoundError = (message) => {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
};

const unauthorizedError = (message) => {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
};
