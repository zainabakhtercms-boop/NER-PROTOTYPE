const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "NER Logistics Backend is running",
  });
});

app.get("/api/route", async (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        error: "Source and destination are required",
      });
    }

    // Geocode source
    const sourceResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(source)}`,
      {
        headers: {
          "User-Agent": "NER-Logistics-Demo/1.0",
        },
      }
    );

    const sourceData = await sourceResponse.json();

    // Geocode destination
    const destinationResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(destination)}`,
      {
        headers: {
          "User-Agent": "NER-Logistics-Demo/1.0",
        },
      }
    );

    const destinationData = await destinationResponse.json();

    if (!sourceData.length || !destinationData.length) {
      return res.status(404).json({
        error: "Could not find one or both locations",
      });
    }

    const sourceLat = sourceData[0].lat;
    const sourceLon = sourceData[0].lon;

    const destinationLat = destinationData[0].lat;
    const destinationLon = destinationData[0].lon;

    // Get road route
    const routeResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${sourceLon},${sourceLat};${destinationLon},${destinationLat}?overview=full&geometries=geojson`
    );

    const routeData = await routeResponse.json();

    if (!routeData.routes || !routeData.routes.length) {
      return res.status(404).json({
        error: "Route could not be calculated",
      });
    }

    const route = routeData.routes[0];

    res.json({
      source,
      destination,
      distanceKm: (route.distance / 1000).toFixed(2),
      durationMinutes: Math.round(route.duration / 60),
      geometry: route.geometry,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error while calculating route",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`NER Logistics Backend running on http://localhost:${PORT}`);
});