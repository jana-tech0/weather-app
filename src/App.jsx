import { useCallback, useEffect, useState } from 'react';
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import './App.css';
import { get5DaysForecast, getCityData } from "./Store/Slices/WeatherSlice.js";

function App() {
  const [city, setCity] = useState("karachi");
  const [searchTerm, setSearchTerm] = useState("karachi");
  const [unit, setUnit] = useState("metric");
  const [loadings, setLoadings] = useState(true);
  const [error, setError] = useState(null);

  // Redux state
  const {
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
  } = useSelector((state) => state.weather);

  const dispatch = useDispatch();

  // Fetch data function
  const fetchData = useCallback(() => {
    setError(null);
    dispatch(
      getCityData({
        city: searchTerm,
        unit,
      })
    ).then((res) => {
      if (res.payload && !res.payload.error) {
        dispatch(
          get5DaysForecast({
            lat: res.payload.data.coord.lat,
            lon: res.payload.data.coord.lon,
            unit,
          })
        );
      } else {
        setError(res.payload?.error || "Failed to fetch city data");
        setLoadings(false);
      }
    }).catch((err) => {
      setError("Failed to fetch weather data");
      setLoadings(false);
    });
  }, [searchTerm, unit, dispatch]);

  // Initial render and when unit changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check loading states
  useEffect(() => {
    if (!citySearchLoading && !forecastLoading) {
      setLoadings(false);
    }
  }, [citySearchLoading, forecastLoading]);

  // Handle city search
  const handleCity = (event) => {
    event.preventDefault();
    setSearchTerm(city);
    setLoadings(true);
  };

  // Toggle unit
  const toggleUnit = () => {
    setLoadings(true);
    setUnit(unit === "metric" ? "imperial" : "metric");
  };

  // Filter forecast data
  const filterForecastByFirstObjTime = (forecastData) => {
    if (!forecastData || !forecastData.length) {
      return [];
    }
    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

  return (
    <div className="background">
      <div className="box">
        {/* City search form */}
        <form autoComplete="off" onSubmit={handleCity}>
          <label>
            <FiSearch size={20} />
          </label>
          <input
            type="text"
            className="input-city"
            placeholder="Enter the city name"
            required
            value={city}
            onChange={(event) => setCity(event.target.value)}
            disabled={loadings}
          />
          <button type='submit' disabled={loadings}>GO</button>
        </form>

        {/* Weather details section */}
        <div className="current-weather-details-box">
          {/* Header with unit toggle */}
          <div className="details-box-header">
            <h4>Current Weather</h4>
            <div 
              className="switch" 
              onClick={toggleUnit}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleUnit()}
            >
              <div className={`switch-toggle ${unit === "metric" ? "c" : "f"}`}></div>
              <span className="c">C</span>
              <span className="f">F</span>
            </div>
          </div>

          {/* Loading state */}
          {loadings ? (
            <div className="loader">
              <div>Loading weather data...</div>
            </div>
          ) : (
            <>
              {/* Error states */}
              {error ? (
                <div className="error-msg">{error}</div>
              ) : citySearchData?.error ? (
                <div className="error-msg">{citySearchData.error}</div>
              ) : forecastError ? (
                <div className="error-msg">{forecastError}</div>
              ) : (
                <>
                  {/* Current weather data */}
                  {citySearchData && citySearchData.data ? (
                    <>
                      <div className="weather-details-container">
                        <div className="details">
                          <h4 className="city-name">{citySearchData.data.name}</h4>
                          <div className="icon-and-temp">
                            <img
                              src={`https://openweathermap.org/img/wn/${citySearchData.data.weather[0].icon}@2x.png`}
                              alt="weather icon"
                            />
                            <h1>{citySearchData.data.main.temp}&deg;</h1>
                          </div>
                          <h4 className="description">
                            {citySearchData.data.weather[0].description}
                          </h4>
                        </div>

                        <div className="metrices">
                          <h4>
                            Feels like {citySearchData.data.main.feels_like}
                            &deg;{unit === "metric" ? "C" : "F"}
                          </h4>

                          <div className="key-value-box">
                            <div className="key">
                              <span>↑</span>
                              <span className="value">
                                {citySearchData.data.main.temp_max}
                                &deg;{unit === "metric" ? "C" : "F"}
                              </span>
                            </div>
                            <div className="key">
                              <span>↓</span>
                              <span className="value">
                                {citySearchData.data.main.temp_min}
                                &deg;{unit === "metric" ? "C" : "F"}
                              </span>
                            </div>
                          </div>

                          <div className="key-value-box">
                            <div className="key">
                              <span>💧</span>
                              <span>Humidity</span>
                            </div>
                            <div className="value">
                              <span>{citySearchData.data.main.humidity}%</span>
                            </div>
                          </div>

                          <div className="key-value-box">
                            <div className="key">
                              <span>💨</span>
                              <span>Wind</span>
                            </div>
                            <div className="value">
                              <span>{citySearchData.data.wind.speed} {unit === "metric" ? "kph" : "mph"}</span>
                            </div>
                          </div>

                          <div className="key-value-box">
                            <div className="key">
                              <span>📊</span>
                              <span>Pressure</span>
                            </div>
                            <div className="value">
                              <span>{citySearchData.data.main.pressure} hPa</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Extended forecast */}
                      <h4 className="extended-forecast-heading">
                        Extended Forecast
                      </h4>
                      {filteredForecast.length > 0 ? (
                        <div className="extended-forecasts-container">
                          {filteredForecast.map((data, index) => {
                            const date = new Date(data.dt_txt);
                            const day = date.toLocaleDateString("en-US", {
                              weekday: "short",
                            });
                            return (
                              <div className="forecast-box" key={index}>
                                <h5>{day}</h5>
                                <img
                                  src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                                  alt="weather icon"
                                />
                                <h5>{data.weather[0].description}</h5>
                                <h5 className="min-max-temp">
                                  {data.main.temp_max}&deg; / {data.main.temp_min}&deg;
                                </h5>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="error-msg">No Forecast Data Found</div>
                      )}
                    </>
                  ) : (
                    <div className="error-msg">No Weather Data Found</div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;