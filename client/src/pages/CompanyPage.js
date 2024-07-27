import { useParams } from "react-router";
import { companies } from "../lib/fake-data";
import { CompanyByIdQuery, getCompanyById } from "../lib/graphql/queries";
import { useEffect, useState } from "react";
import JobList from "../components/JobList";
import { useQuery } from "@apollo/client";
import { useCompany } from "../lib/graphql/hooks";

function CompanyPage() {
  const { companyId } = useParams();
  const { company, loading, error } = useCompany(companyId);
  // const [company, setCompany] = useState();

  // useEffect(() => {
  //   getCompanyById(companyId).then((company) => setCompany(company));
  // }, [companyId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="title">{company.name}</h1>
      <div className="box">{company.description}</div>
      <h2 className="title is-5">Jobs at {company.name}</h2>
      <JobList jobs={company.jobs} />
    </div>
  );
}

export default CompanyPage;
