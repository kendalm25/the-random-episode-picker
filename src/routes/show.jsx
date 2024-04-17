import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import "./show.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Show = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  let { showId } = useParams();

  useEffect(() => {
    const getShowDetails = async () => {
      try {
        const query = `https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}`;
        const response = await fetch(query);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const json = await response.json();
        setDetails(json);
        console.log(json);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching show details:", error);
        setError(true);
        setLoading(false);
      }
    };

    getShowDetails();
  }, [showId]); // Dependency on showId ensures that effect runs if the showId changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading the show details.</div>;
  }

  return (
    <div className="show-app">
      <div className="show-header">
        <h1>{details?.name || "Unknown Show"}</h1>
        <h2>
          {details?.first_air_date
            ? details.first_air_date.slice(0, 4)
            : "????"}{" "}
          -{details?.last_air_date ? details.last_air_date.slice(0, 4) : "????"}
        </h2>
      </div>

      <div className="show-contents">
        <div className="show-pic-container">
          <img
            src={`https://image.tmdb.org/t/p/original${details?.poster_path}`}
            alt="Show Poster"
            className="show-poster"
          />
        </div>

        <div className="show-details">
          <h3>{details?.overview || "No overview available."}</h3>
          <h3>Number of seasons:</h3>
          <h3>{details?.seasons?.length || 0}</h3>
          {details?.seasons?.map((season, index) => (
            <div key={index}>
              <h4>
                {season.name} - Episodes: {season.episode_count}
              </h4>
              <p>{season.overview || "No overview for this season."}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Show;
