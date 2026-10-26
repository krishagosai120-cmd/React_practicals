import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Destinations from './pages/Destinations.jsx';
import Packages from './pages/Packages.jsx';
import About from './pages/About.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <h2>Wanderlust 🌍</h2>
        <div>
          <Link to="/">Home</Link>
          <Link to="/destinations">Destinations</Link>
          <Link to="/packages">Packages</Link>
          <Link to="/about">About</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;