import DataLoader from "dataloader";
import { connection } from "./connection.js";

const getCompanyTable = () => connection.table("company");

export async function getCompany(id) {
  return await getCompanyTable().first().where({ id });
}

// data loader is used to batch the server req so as to reduce netwrk calls
export const companyLoader = new DataLoader(async (ids) => {
  const companies = await getCompanyTable().select().whereIn("id", ids);
  // now to return companies in same order as ids
  return ids.map((id) => companies.find((company) => company.id === id));
});
