import { useState, useEffect } from "react";
import "./App.css";

import showPic from "./assets/pic.jpg";
import searchPic from "./assets/searchPic.png";

import { Link } from "react-router-dom";

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
          <h1>Welcome to this Episode Generator.</h1>
          <h2>
            This website randomly picks episodes from all your favorite TV
            Shows.
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
                        src={`https://image.tmdb.org/t/p/original${show.poster_path}`}
                        className="show-pic"
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
