const { execFile } = require("child_process");
const path = require("path");const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const VEHICLES = {
  heavyTruck: {
    name: "Heavy Truck",
    mileage: 4,
    fuelPrice: 95,
    driverCostPerHour: 250,
  },

  mediumTruck: {
    name: "Medium Truck",
    mileage: 6,
    fuelPrice: 95,
    driverCostPerHour: 200,
  },

  deliveryVan: {
    name: "Delivery Van",
    mileage: 10,
    fuelPrice: 95,
    driverCostPerHour: 150,
  },
};
app.get("/api/ml-risk", (req, res) => {
  const { state, district } = req.query;

  if (!state || !district) {
    return res.status(400).json({
      error: "State and district are required",
    });
  }
/* =======================================================
   REAL VEHICLE GPS
======================================================= */

let vehicleLocation = null;

app.post("/api/vehicle-location", (req, res) => {
  const { vehicleId, latitude, longitude, accuracy } = req.body;

  if (
    !vehicleId ||
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return res.status(400).json({
      error: "vehicleId, latitude and longitude are required",
    });
  }

  vehicleLocation = {
    vehicleId,
    latitude,
    longitude,
    accuracy: Number(accuracy || 0),
    updatedAt: new Date().toISOString(),
  };

  console.log("Vehicle GPS updated:", vehicleLocation);

  res.json({
    success: true,
    vehicle: vehicleLocation,
  });
});

app.get("/api/vehicle-location", (req, res) => {
  if (!vehicleLocation) {
    return res.json({
      success: true,
      vehicle: null,
    });
  }

  res.json({
    success: true,
    vehicle: vehicleLocation,
  });
});
  const scriptPath = path.join(
    process.env.USERPROFILE || "",
    "Downloads",
    "NER-ML-Starter",
    "NER-ML-Starter",
    "predict_risk.py"
  );

  execFile(
    "python",
    [scriptPath, state, district],
    { timeout: 15000 },
    (error, stdout, stderr) => {
      if (error) {
        console.error("ML error:", stderr || error.message);

        return res.status(404).json({
          error: stderr?.trim() || "ML prediction failed",
        });
      }

      try {
        const result = JSON.parse(stdout.trim());
        return res.json(result);
      } catch {
        return res.status(500).json({
          error: "Invalid ML response",
          raw: stdout,
        });
      }
    }
  );
});
app.get("/", (req, res) => {
  res.json({
    message: "NER Logistics Backend is running",
  });
});

app.get("/api/route", async (req, res) => {
  try {
    const {
      source,
      destination,
      vehicle = "mediumTruck",
    } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        error: "Source and destination are required",
      });
    }

    const selectedVehicle = VEHICLES[vehicle];

    if (!selectedVehicle) {
      return res.status(400).json({
        error: "Invalid vehicle type",
      });
    }

    const sourceResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        source
      )}`,
      {
        headers: {
          "User-Agent": "NER-Logistics-Demo/1.0",
        },
      }
    );

    const sourceData = await sourceResponse.json();

    const destinationResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        destination
      )}`,
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

    const routeResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${sourceLon},${sourceLat};${destinationLon},${destinationLat}?overview=full&geometries=geojson&alternatives=true`
    );

    const routeData = await routeResponse.json();

    if (!routeData.routes || !routeData.routes.length) {
      return res.status(404).json({
        error: "Route could not be calculated",
      });
    }

    const routes = routeData.routes.map((route, index) => {
      const distanceKm = route.distance / 1000;
      const durationMinutes = Math.round(route.duration / 60);

      // Fuel calculation
      const fuelLitres =
        distanceKm / selectedVehicle.mileage;

      const fuelCost =
        fuelLitres * selectedVehicle.fuelPrice;

      // Driver calculation
      const durationHours = durationMinutes / 60;

      const driverCost =
        durationHours * selectedVehicle.driverCostPerHour;

      // Demo toll estimate
      const tollCost = distanceKm * 1.5;

      // Total delivery cost
      const totalDeliveryCost =
        fuelCost + driverCost + tollCost;

      return {
        id: index + 1,

        distanceKm: Number(
          distanceKm.toFixed(2)
        ),

        durationMinutes,

        fuelLitres: Number(
          fuelLitres.toFixed(2)
        ),

        fuelCost: Math.round(fuelCost),

        driverCost: Math.round(driverCost),

        tollCost: Math.round(tollCost),

        totalDeliveryCost: Math.round(
          totalDeliveryCost
        ),

        geometry: route.geometry,
      };
    });

    // Calculate logistics score

    const shortestDistance = Math.min(
      ...routes.map((route) => route.distanceKm)
    );

    const fastestTime = Math.min(
      ...routes.map((route) => route.durationMinutes)
    );

    const cheapestDeliveryCost = Math.min(
      ...routes.map(
        (route) => route.totalDeliveryCost
      )
    );

    routes.forEach((route) => {
      const distanceScore =
        (shortestDistance / route.distanceKm) * 40;

      const timeScore =
        (fastestTime /
          route.durationMinutes) *
        30;

      const costScore =
        (cheapestDeliveryCost /
          route.totalDeliveryCost) *
        30;

      route.score = Math.round(
        distanceScore +
          timeScore +
          costScore
      );
    });

    // Highest score = recommended route

    routes.sort(
      (a, b) => b.score - a.score
    );

    const recommendedRoute = routes[0];

    res.json({
      source,
      destination,

      vehicle: selectedVehicle,

      routes,

      recommendedRoute,
    });
  } catch (error) {
    console.error(
      "Route error:",
      error
    );

    res.status(500).json({
      error:
        "Server error while calculating route",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `NER Logistics Backend running on http://localhost:${PORT}`
  );
});