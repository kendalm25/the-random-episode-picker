import { useParams, Link } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Show = () => {
  let { showId } = useParams();
  return (
    <>
      <h1> TV SHOW </h1>
      <h2> {showId}</h2>
    </>
  );
};

export default Show;
