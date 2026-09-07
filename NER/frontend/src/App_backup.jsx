import { useState } from "react";

function App() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState("");

  const findRoute = () => {
    if (!source || !destination) {
      setResult("Please enter both source and destination.");
      return;
    }

    setResult(
      `Best route from ${source} to ${destination} has been calculated successfully.`
    );
  };

  return (
    <div className="app">
      <header>
        <h1>NER Logistics Intelligence Platform</h1>
        <p>Smart Route Planning & Logistics Management</p>
      </header>

      <div className="dashboard">
        <div className="panel">
          <h2>Route Planner</h2>

          <label>Source</label>
          <input
            type="text"
            placeholder="Enter source location"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />

          <label>Destination</label>
          <input
            type="text"
            placeholder="Enter destination location"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />

          <button onClick={findRoute}>
            Find Best Route
          </button>

          {result && (
            <div className="result">
              <h3>Route Result</h3>
              <p>{result}</p>
            </div>
          )}
        </div>

        <div className="map">
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#dcecff",
              fontSize: "24px",
              color: "#123b6d",
            }}
          >
            🗺️ Route Map
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;