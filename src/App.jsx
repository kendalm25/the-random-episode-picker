import { useState, useEffect } from "react";
import noPic from "./assets/No-Image-Placeholder.svg";
import { Link } from "react-router-dom";

import "./App.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const getSearchResults = async () => {
      try {
        const query = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
          searchTerm
        )}&with_original_language=en`;
        const response = await fetch(query);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const json = await response.json();
        let results = json.results;
        setSearchResults(results);
      } catch (error) {
        console.log("error: ", error);
      }
      console.log("search results: ", searchResults);
    };

    getSearchResults();
  }, [searchTerm]);

  useEffect(() => {
    console.log("Updated search results: ", searchResults);
  }, [searchResults]);

  return (
    <>
      <div className="app">
        <div className="header">
          <h1>Welcome to the Random Episode Generator!</h1>
          <h2>
            Perfect for when you want to rewatch your beloved series but can't
            choose an episode. Just select your show, and we'll find an episode
            for you to revisit instantly.
          </h2>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-box"
            placeholder="Search For Your TV Show..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="results-container">
          <div className="show-results">
            {searchResults &&
              searchResults.map((show, index) => {
                return (
                  <div key={index}>
                    <Link to={`/show/${show.id}`}>
                      <img
                        src={
                          show.poster_path
                            ? `https://image.tmdb.org/t/p/original${show.poster_path}`
                            : noPic
                        }
                        className="show-pic"
                        alt={show.name}
                      />
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
