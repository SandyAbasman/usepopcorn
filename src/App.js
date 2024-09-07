import { Children, useEffect, useState } from "react";
import StarRating from "./StarRating";

// Sample movie data used for testing
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

// Utility function to calculate the average of an array
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// API key for OMDB API
const KEY = `9e647cf1`;

// Main App component
export default function App() {
  // State variables to manage data and UI state
  const [watched, setWatched] = useState([]); // Stores watched movies
  const [movies, setMovies] = useState([]); // Stores fetched movies
  const [isLoading, setIsLoading] = useState([false]); // Loading state
  const [isError, setIsError] = useState(""); // Error state
  const [query, setQuery] = useState("silicon valley"); // Search query
  const [seletedId, setSelectedId] = useState(null); // Selected movie ID

  // Handles selecting a movie from the list
  function handleSelectMovie(id) {
    setSelectedId(seletedId === id ? null : id); // Toggle movie selection
  }

  // Handles closing the movie details view
  function handlecloseMovie() {
    setSelectedId(null); // Deselect movie
  }

  // Adds a movie to the watched list
  function handleAddwatched(movie) {
    setWatched((watched) => [...watched, movie]); // Add movie to watched array
  }

  // Deletes a movie from the watched list
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id)); // Remove movie by ID
  }

  //this function handles the close movie summary when we press esc key

  // Fetches movies from the OMDB API based on the search query
  useEffect(
    function () {
      const controller = new AbortController(); //the first step for using the about controller is to create one

      async function fetchMovies() {
        try {
          setIsLoading(true); // Set loading state
          setIsError(""); // Reset error state
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal } // Fetch movies
            //to connect the controller with the fecth function we pass in a second agurment were we define an object with the signal property
          );

          if (!res.ok) {
            throw new Error("Movie didn't fetch"); // Handle network errors
          }

          const data = await res.json(); // Parse response as JSON

          if (data.Response === "False") throw new Error("Movie not found"); // Handle API errors

          setMovies(data.Search); // Update movies state with fetched data
        } catch (err) {
          if (err.name !== "AbortError") {
            //the problem is that as soon as a request gets canceled  JAvascript sees it as an error
            // so immediatley the request gets cancelled it will show and error

            // so we use an if statement to ignore that
            setIsError(err.message); // Set error message
          }
        } finally {
          setIsLoading(false); // Stop loading
        }
      }

      if (query.length < 3) {
        setMovies([]); // Clear movies if query is too short
        setIsError(""); // Reset error state 
        return;
      }

      handlecloseMovie();
      fetchMovies(); // Fetch movies when the component mounts or query changes

      return function () {
        controller.abort(); // each time that there is a new keystroke the component gets re-rendered and the clean up function get's called  and the fetch aborts
      };
    },
    [query] // Dependency array: fetch when query changes
  );

  return (
    <>
      {/* Navigation bar with logo, search bar, and number of results */}
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        {/* Main content area with two boxes for movies and details */}
        <Box>
          {isLoading && <Loader />} {/* Show loader if data is loading */}
          {!isLoading && !isError && (
            <LeftMovie movies={movies} onSelectMovie={handleSelectMovie} />
          )}{" "}
          {/* Show movie list if no loading or error */}
          {isError && <ErrorMessage message={isError} />}{" "}
          {/* Show error if any */}
        </Box>

        <Box>
          {seletedId ? (
            <MovieDetails
              seletedId={seletedId}
              onCloseMovie={handlecloseMovie}
              onAddWatched={handleAddwatched}
              watched={watched}
            />
          ) : (
            <>
              <RightWatchMovieSummary watched={watched} />
              <RightMovie
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}{" "}
          {/* Show movie details or summary depending on selection */}
        </Box>
      </Main>
    </>
  );
}

// Component to display an error message ...
function ErrorMessage({ message }) {
  return (
    <p className="error">
      {message}
      <span>🤖</span>
    </p>
  );
}

//adding local storage

// Component to display a loading message
function Loader() {
  return <p className="loader">Loading...</p>;
}

// Navigation bar component
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

// Logo component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// Search bar component
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)} // Update query on input change
    />
  );
}

// Component to display the number of search results
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// Main content area component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// Box component to wrap content with toggle functionality
function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true); // State to track box open/close

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)} // Toggle box open/close state
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children} {/* Render children if box is open */}
    </div>
  );
}

// Component to display the list of movies on the left side
function LeftMovie({ movies, onSelectMovie, onCloseMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <li
          key={movie.imdbID}
          movie={movie}
          onClick={() => onSelectMovie(movie.imdbID)} // Select movie on click
        >
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>📑</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MovieDetails({ seletedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movies) => movies.imdbID).includes(seletedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === seletedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    imdbRating,
    Plot: plot,
    Released: realeased,
    Actors: actors,
    Director: director,
    Genre: genre,
    Runtime: runtime,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: seletedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener("keydown", callBack);

      return function () {
        document.removeEventListener("keydown", callBack); // this cleans up the key press done errors
      };
    },
    [onCloseMovie]
  );
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${seletedId}`
        );

        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [seletedId]
  );

  //chnaging the page broswer title on when we click on any movie
  useEffect(
    function () {
      if (!title) return; // if no title return
      document.title = `Movie | ${title} `;

      return function () {
        document.title = " usePopcorn"; // this is a cleanup function. it excute after the use effect is unmounted or before it re-excecutes
        // console.log(`Clean up effect for movie ${title}`); // the title still remains the old title even after the component unmounts because of it being a closure
        //so we say the function closed over the title virable and will therefore remember it even after the component has unmointed .
      };
    },
    [title] // dependency is title , as title changes the useEffect reruns
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {realeased} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span> {imdbRating} IMDb Rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  you rated this movie {watchedUserRating}
                  <span>⭐ </span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

// Component to display the watched movies summary on the right side
function RightWatchMovieSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating)); // Calculate average IMDb rating
  const avgUserRating = average(watched.map((movie) => movie.userRating)); // Calculate average user rating
  const avgRuntime = average(watched.map((movie) => movie.runtime)); // Calculate average runtime

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

// Component to display the list of watched movies on the right side
function RightMovie({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.poster} alt={`${movie.title} poster`} />
          <h3>{movie.title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>

            <button
              className="btn-delete"
              onClick={() => onDeleteWatched(movie.imdbID)} // Delete movie on click
            >
              X
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
