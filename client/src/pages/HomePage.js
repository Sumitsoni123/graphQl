import { useEffect, useState } from "react";
import JobList from "../components/JobList";
import { jobs } from "../lib/fake-data";
import { getJobs } from "../lib/graphql/queries";
import { useJob } from "../lib/graphql/hooks";
import PaginationBar from "../components/PaginationBar";

const JOB_PER_PAGE = 5;

function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { jobs, loading, error } = useJob(
    JOB_PER_PAGE,
    (currentPage - 1) * JOB_PER_PAGE
  );

  // const [jobs, setJobs] = useState([]);

  // useEffect(() => {
  //   getJobs().then((jobs) => setJobs(jobs));
  // }, []);
  if (loading) {
    return <h1>Loading....</h1>;
  }

  const totalPages = Math.ceil(jobs.totalCount / JOB_PER_PAGE);

  return (
    <div>
      <h1 className="title">Job Board</h1>
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {/* <div>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span> {`${currentPage} of ${totalPages}`} </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div> */}
      <JobList jobs={jobs.items} />
    </div>
  );
}

export default HomePage;
