import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import noPic from "./assets/No-Image-Placeholder.svg";

import "./App.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const RECENT_KEY = "rep:recentShows";
const SUGGESTIONS = ["Breaking Bad", "The Office", "Friends", "Avatar"];

const readRecent = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const yearOf = (date) => (date ? String(date).slice(0, 4) : "");

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [recent, setRecent] = useState(readRecent);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (!debounced) {
      setSearchResults([]);
      setLoading(false);
      setErrored(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setErrored(false);

    const run = async () => {
      try {
        const query = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
          debounced
        )}&with_original_language=en`;
        const response = await fetch(query, { signal: controller.signal });
        if (!response.ok) throw new Error("Network response was not ok");
        const json = await response.json();
        if (cancelled) return;
        setSearchResults(json.results || []);
      } catch (error) {
        if (error.name === "AbortError") return;
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debounced]);

  const showInitialState = useMemo(
    () => debounced.length === 0,
    [debounced]
  );

  return (
    <div className="app">
      <header className="hero">
        <span className="hero-eyebrow">Random Episode Picker</span>
        <h1 className="hero-title">
          Can&apos;t pick what to <span className="grad-text">rewatch?</span>
        </h1>
        <p className="hero-sub">
          Search any TV show, and we&apos;ll spin the wheel for you. One tap,
          one episode, no decision fatigue.
        </p>
      </header>

      <div className="search-wrap">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            className="search-input"
            placeholder="Search for a TV show..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for a TV show"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      <main className="main">
        {showInitialState ? (
          <InitialState
            recent={recent}
            onClearRecent={() => {
              localStorage.removeItem(RECENT_KEY);
              setRecent([]);
            }}
            onSuggestion={(s) => setSearchTerm(s)}
          />
        ) : loading ? (
          <PosterGrid>
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </PosterGrid>
        ) : errored ? (
          <EmptyBlock
            title="Something went wrong"
            sub="We couldn't reach the search service. Try again in a moment."
          />
        ) : searchResults.length === 0 ? (
          <EmptyBlock
            title="No matches"
            sub={`We couldn't find any shows for "${debounced}".`}
          />
        ) : (
          <PosterGrid>
            {searchResults.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </PosterGrid>
        )}
      </main>
    </div>
  );
}

const ShowCard = ({ show }) => (
  <Link to={`/show/${show.id}`} className="show-card">
    <div className="show-card-poster">
      <img
        src={
          show.poster_path
            ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
            : noPic
        }
        alt={show.name}
        loading="lazy"
      />
    </div>
    <div className="show-card-meta">
      <span className="show-card-title">{show.name}</span>
      {yearOf(show.first_air_date) && (
        <span className="show-card-year">{yearOf(show.first_air_date)}</span>
      )}
    </div>
  </Link>
);

const PosterGrid = ({ children }) => (
  <div className="poster-grid">{children}</div>
);

const SkeletonCard = () => (
  <div className="show-card skeleton-card" aria-hidden="true">
    <div className="show-card-poster shimmer" />
    <div className="show-card-meta">
      <div className="shimmer skeleton-line" style={{ width: "70%" }} />
      <div
        className="shimmer skeleton-line"
        style={{ width: "30%", height: 10 }}
      />
    </div>
  </div>
);

const InitialState = ({ recent, onClearRecent, onSuggestion }) => (
  <div className="initial">
    {recent.length > 0 && (
      <section className="rail">
        <div className="rail-header">
          <h2 className="section-title">Recently viewed</h2>
          <button className="link-button" onClick={onClearRecent}>
            Clear
          </button>
        </div>
        <div className="rail-track">
          {recent.map((show) => (
            <Link
              key={show.id}
              to={`/show/${show.id}`}
              className="rail-card"
            >
              <img
                src={
                  show.poster_path
                    ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
                    : noPic
                }
                alt={show.name}
                loading="lazy"
              />
              <div className="rail-card-meta">
                <span className="rail-card-title">{show.name}</span>
                {yearOf(show.first_air_date) && (
                  <span className="rail-card-year">
                    {yearOf(show.first_air_date)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    )}

    <section className="suggestions">
      <h2 className="section-title">Try searching for...</h2>
      <div className="chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => onSuggestion(s)}>
            {s}
          </button>
        ))}
      </div>
    </section>
  </div>
);

const EmptyBlock = ({ title, sub }) => (
  <div className="empty-block">
    <h3>{title}</h3>
    <p>{sub}</p>
  </div>
);

const SearchIcon = () => (
  <svg
    className="search-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default App;
