import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import "./show.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Show = () => {
  const [details, setDetails] = useState(null);
  const [season, setSeason] = useState(0);
  const [episode, setEpisode] = useState(0);
  const [showEpisode, setShowEpisode] = useState(false);
  const [randomEpisodeDetails, setRandomEpisodeDetails] = useState({});

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

  useEffect(() => {
    const getEpisodeDetails = async () => {
      try {
        const query = `https://api.themoviedb.org/3/tv/${showId}/season/${
          season + 1
        }/episode/${episode + 1}?api_key=${API_KEY}`;
        const response = await fetch(query);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const json = await response.json();
        setRandomEpisodeDetails(json);
        console.log(randomEpisodeDetails);
      } catch (error) {
        console.error("Error fetching show details:", error);
        setError(true);
        setLoading(false);
      }
    };
    getEpisodeDetails();
  }, [episode]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading the show details.</div>;
  }

  const getRandomEpisode = () => {
    const numOfSeasons = details?.number_of_seasons;
    // season 0 = 1; epsiode 0 = 1
    const season = Math.floor(Math.random() * numOfSeasons);
    setSeason(season);
    const numOfEpisodes = details?.seasons[season].episode_count;
    const episode = Math.floor(Math.random() * numOfEpisodes);
    setEpisode(episode);
    setShowEpisode(true);
    console.log("season: " + season + " episode: " + episode);
  };

  return (
    <div className="show-app">
      <Link to={"/"} style={{ marginLeft: 10, textAlign: "left" }}>
        <button className="backBtn"> Back </button>
      </Link>
      <div className="show-header">
        <h1>{details?.name || "Unknown Show"}</h1>

        <h2>
          {details?.first_air_date
            ? details.first_air_date.slice(0, 4)
            : "????"}{" "}
          -{" "}
          {details?.last_air_date ? details.last_air_date.slice(0, 4) : "????"}
        </h2>
        <div className="genre-container">
          {details?.genres.map((genre, index) => (
            <div key={index} className="genre">
              <h3 className="genreName">{genre.name}</h3>
            </div>
          ))}
        </div>
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

          <div className="count-container">
            <div className="season-count-container">
              <h3>Number of seasons:</h3>
              <h3>{details?.number_of_seasons || 0}</h3>
            </div>

            <div className="season-count-container">
              <h3>Number of Episodes:</h3>
              <h3>{details?.number_of_episodes || 0}</h3>
            </div>
          </div>
          <div className="button-container">
            <button className="generateBtn" onClick={getRandomEpisode}>
              {" "}
              Generate Random Episode{" "}
            </button>
          </div>

          <div>
            {showEpisode && (
              <>
                <div className="episode-container">
                  <h3 className="episodeBigText">
                    {" "}
                    {randomEpisodeDetails.name}
                  </h3>
                  <div className="season-and-episode-container">
                    <h3 className="episodeBigText">Season: {season + 1}</h3>
                    <h3 className="episodeBigText"> Episode: {episode + 1}</h3>
                  </div>

                  <p className="episodeSmallText">
                    {" "}
                    {randomEpisodeDetails?.overview || "No overview available."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Show;
