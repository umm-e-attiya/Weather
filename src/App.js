import React, { useState } from "react";
import './App.css'

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // 1. Geocode city to get latitude & longitude
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );

      if (!geoRes.ok) throw new Error("Failed to get location data");

      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2. Fetch current weather using Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");

      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData.current_weather, name, country });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🌤️ Weather Info Dashboard</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Search</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>
            {weather.name}, {weather.country}
          </h2>
          <p>🌡 Temperature: {weather.temperature_2m}°C</p>
          <p>💨 Wind Speed: {weather.windspeed} km/h</p>
          <p> Time: {weather.time}</p>
        </div>
      )}
    </div>
  );
}

export default App;
