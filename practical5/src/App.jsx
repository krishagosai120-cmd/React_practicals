
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [countryError, setCountryError] = useState('');
  const [postError, setPostError] = useState('');

  // Fetch API: Get country information
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,capital,region,flags,population'
        );

        if (!response.ok) {
          throw new Error('Unable to load countries. Please try again.');
        }

        const data = await response.json();

        setCountries(
          data
            .filter((country) => country.name?.common && country.flags?.png)
            .sort((a, b) =>
              a.name.common.localeCompare(b.name.common)
            )
            .slice(0, 12)
        );
      } catch (error) {
        setCountryError(
          'Could not load countries. Check your internet connection and try again.'
        );
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Axios: Get sample posts from a REST API
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(
          'https://jsonplaceholder.typicode.com/posts?_limit=3'
        );

        setPosts(response.data);
      } catch (error) {
        setPostError('Could not load stories. Please try again later.');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🌍 Global Explorer</h1>
        <p>Discover countries and explore stories from around the world.</p>
      </header>

      <main className="main-content">
        <section>
          <h2>✈️ Featured Destinations</h2>

          {loadingCountries && <p>Loading destinations...</p>}

          {countryError && (
            <p className="error">
              {countryError}
              <button onClick={() => window.location.reload()}>
                Retry
              </button>
            </p>
          )}

          {!loadingCountries && !countryError && (
            <div className="country-grid">
              {countries.map((country) => (
                <article
                  className="country-card"
                  key={country.name.common}
                >
                  <img
                    src={country.flags.png}
                    alt={country.flags.alt || country.name.common}
                  />

                  <div className="country-info">
                    <h3>{country.name.common}</h3>
                    <p>
                      <strong>Capital:</strong>{' '}
                      {country.capital?.[0] || 'Not available'}
                    </p>
                    <p>
                      <strong>Region:</strong>{' '}
                      {country.region || 'Not available'}
                    </p>
                    <p>
                      <strong>Population:</strong>{' '}
                      {country.population?.toLocaleString() || 'Not available'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="stories-section">
          <h2>📰 Explore Global Stories</h2>

          {loadingPosts && <p>Loading stories...</p>}

          {postError && <p className="error">{postError}</p>}

          {!loadingPosts && !postError && (
            <div className="story-grid">
              {posts.map((post) => (
                <article className="story-card" key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <small>Story #{post.id}</small>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Global Explorer | React Practical 5</p>
      </footer>
    </div>
  );
}

export default App;