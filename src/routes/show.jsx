import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";

import noPic from "../assets/No-Image-Placeholder.svg";
import "./show.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const RECENT_KEY = "rep:recentShows";
const RECENT_CAP = 12;

const yearOf = (date) => (date ? String(date).slice(0, 4) : "????");
const formatDate = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
};

const pushRecent = (show) => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = Array.isArray(list)
      ? list.filter((s) => s.id !== show.id)
      : [];
    const next = [show, ...filtered].slice(0, RECENT_CAP);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
};

const Show = () => {
  const { showId } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [season, setSeason] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [showEpisode, setShowEpisode] = useState(false);
  const [randomEpisodeDetails, setRandomEpisodeDetails] = useState(null);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [episodeError, setEpisodeError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    const getShowDetails = async () => {
      try {
        const query = `https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}`;
        const response = await fetch(query, { signal: controller.signal });
        if (!response.ok) throw new Error("Network response was not ok");
        const json = await response.json();
        if (cancelled) return;
        setDetails(json);
        pushRecent({
          id: json.id,
          name: json.name,
          poster_path: json.poster_path,
          first_air_date: json.first_air_date,
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getShowDetails();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [showId]);

  useEffect(() => {
    if (!showEpisode || season == null || episode == null) return;

    let cancelled = false;
    const controller = new AbortController();
    setEpisodeLoading(true);
    setEpisodeError(false);

    const getEpisodeDetails = async () => {
      try {
        const query = `https://api.themoviedb.org/3/tv/${showId}/season/${season}/episode/${episode}?api_key=${API_KEY}`;
        const response = await fetch(query, { signal: controller.signal });
        if (!response.ok) throw new Error("Network response was not ok");
        const json = await response.json();
        if (cancelled) return;
        setRandomEpisodeDetails(json);
      } catch (err) {
        if (err.name === "AbortError") return;
        if (!cancelled) setEpisodeError(true);
      } finally {
        if (!cancelled) setEpisodeLoading(false);
      }
    };

    getEpisodeDetails();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [showId, season, episode, showEpisode]);

  const validSeasons = useMemo(
    () =>
      (details?.seasons ?? []).filter(
        (s) => s.season_number > 0 && s.episode_count > 0
      ),
    [details]
  );

  const getRandomEpisode = () => {
    if (validSeasons.length === 0) return;
    const picked =
      validSeasons[Math.floor(Math.random() * validSeasons.length)];
    const seasonNumber = picked.season_number;
    const episodeNumber = Math.floor(Math.random() * picked.episode_count) + 1;
    setSeason(seasonNumber);
    setEpisode(episodeNumber);
    setShowEpisode(true);
  };

  if (loading) {
    return <ShowSkeleton />;
  }

  if (error || !details) {
    return (
      <div className="show-app error-state">
        <Link to="/" className="back-button">
          <BackIcon /> Back
        </Link>
        <div className="error-card">
          <h2>We couldn&apos;t load this show</h2>
          <p>Try again, or go back and pick another one.</p>
        </div>
      </div>
    );
  }

  const backdrop = details.backdrop_path
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
    : null;
  const poster = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : noPic;

  return (
    <div className="show-app">
      <section
        className="hero-section"
        style={
          backdrop
            ? { backgroundImage: `url(${backdrop})` }
            : undefined
        }
      >
        <div className="hero-overlay" />
        <Link to="/" className="back-button">
          <BackIcon /> Back
        </Link>

        <div className="hero-inner">
          <div className="hero-poster">
            <img src={poster} alt={details.name} />
          </div>
          <div className="hero-meta">
            <h1 className="show-title">{details.name || "Unknown Show"}</h1>
            {details.tagline && (
              <p className="show-tagline">&ldquo;{details.tagline}&rdquo;</p>
            )}
            <div className="meta-row">
              <span className="meta-pill">
                {yearOf(details.first_air_date)} – {yearOf(details.last_air_date)}
              </span>
              {details.vote_average ? (
                <span className="meta-pill rating-pill">
                  <StarIcon /> {details.vote_average.toFixed(1)}
                </span>
              ) : null}
              <span className="meta-pill">
                {details.number_of_seasons || 0} seasons
              </span>
              <span className="meta-pill">
                {details.number_of_episodes || 0} episodes
              </span>
            </div>
            {details.genres?.length > 0 && (
              <div className="genre-row">
                {details.genres.map((g) => (
                  <span key={g.id} className="genre-chip">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <p className="show-overview">
              {details.overview || "No overview available."}
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <button
          className="generate-btn"
          onClick={getRandomEpisode}
          disabled={validSeasons.length === 0}
        >
          <SparkIcon />
          {showEpisode ? "Pick another episode" : "Pick a random episode"}
        </button>
        {validSeasons.length === 0 && (
          <p className="cta-note">No regular seasons available for this show.</p>
        )}
      </section>

      {showEpisode && (
        <section className="episode-section">
          {episodeLoading ? (
            <EpisodeSkeleton />
          ) : episodeError ? (
            <div className="error-card">
              <h2>Couldn&apos;t load that episode</h2>
              <p>Try picking another one.</p>
            </div>
          ) : (
            randomEpisodeDetails && (
              <EpisodeCard
                data={randomEpisodeDetails}
                season={season}
                episode={episode}
                fallbackPoster={poster}
                onPickAnother={getRandomEpisode}
              />
            )
          )}
        </section>
      )}
    </div>
  );
};

const EpisodeCard = ({
  data,
  season,
  episode,
  fallbackPoster,
  onPickAnother,
}) => {
  const still = data.still_path
    ? `https://image.tmdb.org/t/p/w780${data.still_path}`
    : fallbackPoster;
  const aired = formatDate(data.air_date);

  return (
    <article className="episode-card" key={`${season}-${episode}`}>
      <div className="episode-still">
        <img src={still} alt={data.name || `S${season} E${episode}`} />
      </div>
      <div className="episode-body">
        <div className="episode-tag">
          S{season} &middot; E{episode}
        </div>
        <h2 className="episode-title">
          {data.name || `Season ${season}, Episode ${episode}`}
        </h2>
        <div className="episode-row">
          {aired && <span className="episode-meta">{aired}</span>}
          {data.vote_average ? (
            <span className="episode-meta rating-pill">
              <StarIcon /> {Number(data.vote_average).toFixed(1)}
            </span>
          ) : null}
          {data.runtime ? (
            <span className="episode-meta">{data.runtime} min</span>
          ) : null}
        </div>
        <p className="episode-overview">
          {data.overview || "No overview available."}
        </p>
        <button
          className="generate-btn generate-btn--secondary"
          onClick={onPickAnother}
        >
          <SparkIcon />
          Pick another
        </button>
      </div>
    </article>
  );
};

const ShowSkeleton = () => (
  <div className="show-app">
    <section className="hero-section hero-section--skeleton">
      <div className="hero-overlay" />
      <div className="hero-inner">
        <div className="hero-poster shimmer" />
        <div className="hero-meta">
          <div className="shimmer skeleton-block" style={{ width: "60%", height: 40 }} />
          <div className="shimmer skeleton-block" style={{ width: "40%", height: 18 }} />
          <div className="shimmer skeleton-block" style={{ width: "80%", height: 14 }} />
          <div className="shimmer skeleton-block" style={{ width: "70%", height: 14 }} />
        </div>
      </div>
    </section>
  </div>
);

const EpisodeSkeleton = () => (
  <div className="episode-card">
    <div className="episode-still shimmer" />
    <div className="episode-body">
      <div className="shimmer skeleton-block" style={{ width: "20%", height: 14 }} />
      <div className="shimmer skeleton-block" style={{ width: "60%", height: 28 }} />
      <div className="shimmer skeleton-block" style={{ width: "90%", height: 14 }} />
      <div className="shimmer skeleton-block" style={{ width: "85%", height: 14 }} />
    </div>
  </div>
);

const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.77l-5.84 3.07 1.11-6.5L2.55 9.37l6.53-.95L12 2.5z" />
  </svg>
);

const SparkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="m5.6 5.6 2.8 2.8" />
    <path d="m15.6 15.6 2.8 2.8" />
    <path d="m18.4 5.6-2.8 2.8" />
    <path d="m8.4 15.6-2.8 2.8" />
  </svg>
);

export default Show;
