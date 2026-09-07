import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import jsPDF from "jspdf";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* =========================================================
   LEAFLET ICONS
========================================================= */

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const vehicleIcon = L.divIcon({
  className: "vehicle-marker",

  html: `
    <div style="
      width:42px;
      height:42px;
      border-radius:50%;
      background:#2563eb;
      border:3px solid white;
      box-shadow:0 6px 20px rgba(37,99,235,0.45);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:22px;
    ">
      🚚
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

/* =========================================================
   MAP VIEW
========================================================= */

function MapView({
  selectedRoute,
  trackingActive,
  trackingIndex,
  gpsPosition,
}) {
  const map = useMap();

  if (
    !selectedRoute?.geometry?.coordinates?.length
  ) {
    return null;
  }

  const points =
    selectedRoute.geometry.coordinates.map(
      ([lon, lat]) => [lat, lon]
    );

  const safeIndex = Math.min(
    trackingIndex,
    points.length - 1
  );

  const vehiclePosition =
    points[safeIndex];

  map.fitBounds(points, {
    padding: [40, 40],
  });

  return (
    <>
      {/* MAIN ROUTE */}

      <Polyline
        positions={points}
        color="#2563eb"
        weight={7}
        opacity={0.9}
      />

      {/* SOURCE */}

      <Marker
        position={points[0]}
        icon={defaultIcon}
      >
        <Popup>
          <strong>
            📍 Source
          </strong>
        </Popup>
      </Marker>

      {/* DESTINATION */}

      <Marker
        position={
          points[points.length - 1]
        }
        icon={defaultIcon}
      >
        <Popup>
          <strong>
            🏁 Destination
          </strong>
        </Popup>
      </Marker>


      {/* BROWSER GPS / FIELD OFFICIAL LOCATION */}

      {gpsPosition && (
        <CircleMarker
          center={[gpsPosition.lat, gpsPosition.lon]}
          radius={10}
          pathOptions={{
            color: "#7c3aed",
            fillColor: "#7c3aed",
            fillOpacity: 0.35,
            weight: 3,
          }}
        >
          <Popup>
            <strong>📍 Current GPS Position</strong>
            <br />
            Accuracy: {gpsPosition.accuracy} m
          </Popup>
        </CircleMarker>
      )}

      {/* LIVE VEHICLE */}

      {trackingActive && (
        <>
          <CircleMarker
            center={vehiclePosition}
            radius={22}
            pathOptions={{
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 0.22,
              weight: 3,
            }}
          />

          <Marker
            position={vehiclePosition}
            icon={vehicleIcon}
          >
            <Popup>
              <strong>
                🚚 Vehicle Live Location
              </strong>

              <br />

              Vehicle is currently in transit.
            </Popup>
          </Marker>
        </>
      )}
    </>
  );
}

/* =========================================================
   MAIN APP
========================================================= */


function App() {

  /* =======================================================
     NER SIH ACCESS + INTELLIGENCE LAYER
  ======================================================= */

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nerCurrentUser")) || null;
    } catch {
      return null;
    }
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("Logistics Manager");
  const [loginError, setLoginError] = useState("");

  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  const [gpsPosition, setGpsPosition] = useState(null);
  const [gpsError, setGpsError] = useState("");

  const [emergencyMode, setEmergencyMode] = useState(false);
  const [incidentType, setIncidentType] = useState("Flood");
  const [incidentSeverity, setIncidentSeverity] = useState("High");
  const [incidentNote, setIncidentNote] = useState("");
  const [incidentQueue, setIncidentQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nerIncidentQueue")) || [];
    } catch {
      return [];
    }
  });

  const [language, setLanguage] = useState("English");
  const [districtFilter, setDistrictFilter] = useState("All");

  const districtRows = [
    { district: "Imphal", state: "Manipur", connectivity: 88, risk: 34, status: "Open", bottleneck: "Normal" },
    { district: "Aizawl", state: "Mizoram", connectivity: 76, risk: 48, status: "Caution", bottleneck: "Terrain" },
    { district: "Gangtok", state: "Sikkim", connectivity: 71, risk: 62, status: "Caution", bottleneck: "Landslide" },
    { district: "Shillong", state: "Meghalaya", connectivity: 83, risk: 41, status: "Open", bottleneck: "Rainfall" },
    { district: "Kohima", state: "Nagaland", connectivity: 69, risk: 67, status: "Alert", bottleneck: "Road damage" },
    { district: "Agartala", state: "Tripura", connectivity: 91, risk: 29, status: "Open", bottleneck: "Normal" },
    { district: "Itanagar", state: "Arunachal Pradesh", connectivity: 63, risk: 73, status: "Alert", bottleneck: "Landslide" },
    { district: "Dispur", state: "Assam", connectivity: 94, risk: 31, status: "Open", bottleneck: "Traffic" },
  ];

  const activeDistricts =
    districtFilter === "All"
      ? districtRows
      : districtRows.filter((row) => row.district === districtFilter);

  const alertRows = [
    { level: "HIGH", title: "Landslide corridor watch", detail: "Eastern NER corridors require alternate-route readiness.", icon: "⛰️" },
    { level: "MEDIUM", title: "Heavy rainfall watch", detail: "Delivery ETA may increase on exposed mountain corridors.", icon: "🌧️" },
    { level: "MEDIUM", title: "Traffic congestion", detail: "Urban entry points can affect last-mile delivery windows.", icon: "🚦" },
  ];

  const handleLogin = (event) => {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Enter both email and password.");
      return;
    }

    const name = loginEmail
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const user = {
      name,
      email: loginEmail.trim(),
      role: loginRole,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("nerCurrentUser", JSON.stringify(user));
    setCurrentUser(user);
    setLoginError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("nerCurrentUser");
    setCurrentUser(null);
  };

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Browser GPS is not available.");
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0),
        });
        setGpsError("");
      },
      (error) => {
        setGpsError(error.message || "Unable to read GPS location.");
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const syncIncidentQueue = () => {
    if (!isOnline || incidentQueue.length === 0) return;

    localStorage.setItem("nerLastSync", new Date().toISOString());
    setIncidentQueue([]);
    localStorage.setItem("nerIncidentQueue", JSON.stringify([]));
  };

  const submitIncident = () => {
    const report = {
      id: Date.now(),
      type: incidentType,
      severity: incidentSeverity,
      note: incidentNote.trim() || "Field incident reported.",
      latitude: gpsPosition?.lat ?? null,
      longitude: gpsPosition?.lon ?? null,
      capturedAt: new Date().toISOString(),
      syncStatus: isOnline ? "Synced" : "Queued Offline",
      reporter: currentUser?.email || "unknown",
    };

    const next = [report, ...incidentQueue];
    setIncidentQueue(next);
    localStorage.setItem("nerIncidentQueue", JSON.stringify(next));
    setIncidentNote("");

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  };


  /* =======================================================
     ROUTE INPUT
  ======================================================= */

  const [source, setSource] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [vehicle, setVehicle] =
    useState("mediumTruck");


  /* =======================================================
     ROUTES
  ======================================================= */

  const [routes, setRoutes] =
    useState([]);

  const [selectedRoute, setSelectedRoute] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     SAVED TRIPS
  ======================================================= */

  const [savedTrips, setSavedTrips] =
    useState(() => {
      try {
        return (
          JSON.parse(
            localStorage.getItem(
              "nerTrips"
            )
          ) || []
        );
      } catch {
        return [];
      }
    });


  /* =======================================================
     TRACKING
  ======================================================= */

  const [trackingActive, setTrackingActive] =
    useState(false);

  const [trackingIndex, setTrackingIndex] =
    useState(0);


  /* =======================================================
     VEHICLE NAME
  ======================================================= */

  const vehicleName =
    vehicle === "heavyTruck"
      ? "Heavy Truck"
      : vehicle === "mediumTruck"
      ? "Medium Truck"
      : "Delivery Van";


  /* =======================================================
     FORMAT TIME
  ======================================================= */

  const formatTime = (minutes) => {
    const total =
      Number(minutes) || 0;

    const hours = Math.floor(
      total / 60
    );

    const mins = Math.round(
      total % 60
    );

    if (hours === 0) {
      return `${mins} min`;
    }

    return `${hours}h ${mins}m`;
  };


  /* =======================================================
     FIND ROUTE
  ======================================================= */

  const findRoute = async () => {

    if (
      !source.trim() ||
      !destination.trim()
    ) {
      setError(
        "Please enter both source and destination."
      );

      return;
    }

    setLoading(true);
    setError("");

    setRoutes([]);
    setSelectedRoute(null);

    setTrackingActive(false);
    setTrackingIndex(0);

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/route?source=${encodeURIComponent(
            source
          )}&destination=${encodeURIComponent(
            destination
          )}&vehicle=${vehicle}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Route calculation failed."
        );
      }

      const receivedRoutes =
        Array.isArray(data.routes)
          ? data.routes
          : [];

      setRoutes(receivedRoutes);

      if (data.recommendedRoute) {

        setSelectedRoute(
          data.recommendedRoute
        );

      } else if (
        receivedRoutes.length > 0
      ) {

        setSelectedRoute(
          receivedRoutes[0]
        );

      } else {

        setError(
          "No routes were returned by the server."
        );
      }

    } catch (err) {

      setError(
        err.message ||
          "Unable to calculate route."
      );

    } finally {

      setLoading(false);
    }
  };


  /* =======================================================
     SELECT ROUTE
  ======================================================= */

  const selectRoute = (route) => {

    setSelectedRoute(route);

    setTrackingActive(false);

    setTrackingIndex(0);

    setError("");
  };


  /* =======================================================
     START TRACKING
  ======================================================= */

  const startTracking = () => {

    if (!selectedRoute) {

      setError(
        "Please calculate a route first."
      );

      return;
    }

    const coordinates =
      selectedRoute?.geometry
        ?.coordinates;

    if (
      !coordinates ||
      coordinates.length === 0
    ) {

      setError(
        "Selected route does not contain map coordinates."
      );

      return;
    }

    setError("");

    setTrackingIndex(0);

    setTrackingActive(true);
  };


  /* =======================================================
     STOP TRACKING
  ======================================================= */

  const stopTracking = () => {

    setTrackingActive(false);
  };


  /* =======================================================
     LIVE TRACKING TIMER
  ======================================================= */

  useEffect(() => {

    if (!trackingActive) {
      return undefined;
    }

    const coordinates =
      selectedRoute?.geometry
        ?.coordinates;

    if (
      !coordinates ||
      coordinates.length === 0
    ) {
      return undefined;
    }

    const interval =
      setInterval(() => {

        setTrackingIndex(
          (current) => {

            if (
              current >=
              coordinates.length - 1
            ) {

              setTrackingActive(false);

              return current;
            }

            return current + 1;
          }
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [
    trackingActive,
    selectedRoute,
  ]);


  /* =======================================================
     TRACKING PROGRESS
  ======================================================= */

  const totalPoints =
    selectedRoute?.geometry
      ?.coordinates?.length || 0;

  const trackingProgress =
    totalPoints > 1
      ? Math.min(
          100,
          Math.round(
            (trackingIndex /
              (totalPoints - 1)) *
              100
          )
        )
      : 0;


  /* =======================================================
     TRACKING STATUS
  ======================================================= */

  let trackingStatus =
    "Not Started";

  if (
    !trackingActive &&
    trackingProgress >= 100
  ) {

    trackingStatus =
      "Delivered";

  } else if (
    trackingProgress >= 90
  ) {

    trackingStatus =
      "Arriving";

  } else if (
    trackingProgress >= 50
  ) {

    trackingStatus =
      "In Transit";

  } else if (trackingActive) {

    trackingStatus =
      "Dispatched";
  }


  /* =======================================================
     ETA
  ======================================================= */

  const currentETA =
    selectedRoute
      ? Math.max(
          0,
          Math.round(
            (Number(
              selectedRoute.durationMinutes ||
                0
            ) *
              (100 -
                trackingProgress)) /
              100
          )
        )
      : 0;


  /* =======================================================
     SIMULATED SPEED
  ======================================================= */

  const simulatedSpeed =
    vehicle === "heavyTruck"
      ? 55
      : vehicle === "mediumTruck"
      ? 65
      : 70;


  /* =======================================================
     SAVE TRIP
  ======================================================= */

  const saveTrip = () => {

    if (!selectedRoute) {

      setError(
        "Please calculate a route first."
      );

      return;
    }

    const newTrip = {

      id: Date.now(),

      source,

      destination,

      vehicle: vehicleName,

      distanceKm:
        selectedRoute.distanceKm,

      durationMinutes:
        selectedRoute.durationMinutes,

      fuelLitres:
        selectedRoute.fuelLitres,

      totalDeliveryCost:
        selectedRoute.totalDeliveryCost,

      score:
        selectedRoute.score,

      status: "Planned",

      date:
        new Date().toLocaleDateString(),
    };

    const updatedTrips = [
      newTrip,
      ...savedTrips,
    ];

    setSavedTrips(
      updatedTrips
    );

    localStorage.setItem(
      "nerTrips",
      JSON.stringify(
        updatedTrips
      )
    );

    alert(
      "Trip saved successfully!"
    );
  };


  /* =======================================================
     UPDATE TRIP STATUS
  ======================================================= */

  const updateTripStatus = (
    id,
    newStatus
  ) => {

    const updatedTrips =
      savedTrips.map(
        (trip) =>
          trip.id === id
            ? {
                ...trip,
                status:
                  newStatus,
              }
            : trip
      );

    setSavedTrips(
      updatedTrips
    );

    localStorage.setItem(
      "nerTrips",
      JSON.stringify(
        updatedTrips
      )
    );
  };


  /* =======================================================
     DELETE TRIP
  ======================================================= */

  const deleteTrip = (id) => {

    const updatedTrips =
      savedTrips.filter(
        (trip) =>
          trip.id !== id
      );

    setSavedTrips(
      updatedTrips
    );

    localStorage.setItem(
      "nerTrips",
      JSON.stringify(
        updatedTrips
      )
    );
  };


  /* =======================================================
     PDF REPORT
  ======================================================= */

  const generatePDF = (
    trip
  ) => {

    const doc =
      new jsPDF();

    doc.setFontSize(22);

    doc.text(
      "NER Logistics",
      20,
      25
    );

    doc.setFontSize(15);

    doc.text(
      "Delivery Route Report",
      20,
      36
    );

    doc.line(
      20,
      42,
      190,
      42
    );

    doc.setFontSize(12);

    doc.text(
      `Report Date: ${trip.date}`,
      20,
      55
    );

    doc.text(
      `Trip ID: ${trip.id}`,
      20,
      65
    );

    doc.text(
      `Source: ${trip.source}`,
      20,
      78
    );

    doc.text(
      `Destination: ${trip.destination}`,
      20,
      88
    );

    doc.text(
      `Vehicle: ${trip.vehicle}`,
      20,
      98
    );

    doc.text(
      `Status: ${trip.status}`,
      20,
      108
    );

    doc.text(
      "Route Details",
      20,
      125
    );

    doc.line(
      20,
      129,
      190,
      129
    );

    doc.text(
      `Distance: ${trip.distanceKm} km`,
      25,
      143
    );

    doc.text(
      `Estimated Time: ${formatTime(
        trip.durationMinutes
      )}`,
      25,
      153
    );

    doc.text(
      `Fuel Required: ${trip.fuelLitres} L`,
      25,
      163
    );

    doc.text(
      `Logistics Score: ${trip.score}/100`,
      25,
      173
    );

    doc.text(
      `Total Delivery Cost: Rs. ${trip.totalDeliveryCost}`,
      25,
      183
    );

    doc.line(
      20,
      193,
      190,
      193
    );

    doc.setFontSize(10);

    doc.text(
      "Generated by NER Logistics Intelligence Platform",
      20,
      208
    );

    doc.save(
      `NER-Logistics-${trip.source}-${trip.destination}.pdf`
    );
  };


  /* =======================================================
     ANALYTICS
  ======================================================= */

  const totalTrips =
    savedTrips.length;

  const activeTrips =
    savedTrips.filter(
      (trip) =>
        trip.status ===
        "In Transit"
    ).length;

  const deliveredTrips =
    savedTrips.filter(
      (trip) =>
        trip.status ===
        "Delivered"
    ).length;

  const plannedTrips =
    savedTrips.filter(
      (trip) =>
        trip.status ===
        "Planned"
    ).length;

  const totalCost =
    savedTrips.reduce(
      (sum, trip) =>
        sum +
        Number(
          trip.totalDeliveryCost ||
            0
        ),
      0
    );

  const totalDistance =
    savedTrips.reduce(
      (sum, trip) =>
        sum +
        Number(
          trip.distanceKm ||
            0
        ),
      0
    );

  const averageCost =
    totalTrips > 0
      ? Math.round(
          totalCost /
            totalTrips
        )
      : 0;

  const averageScore =
    totalTrips > 0
      ? Math.round(
          savedTrips.reduce(
            (sum, trip) =>
              sum +
              Number(
                trip.score ||
                  0
              ),
            0
          ) /
            totalTrips
        )
      : 0;

  const completionRate =
    totalTrips > 0
      ? Math.round(
          (deliveredTrips /
            totalTrips) *
            100
        )
      : 0;


  /* =======================================================
     AI ANALYSIS
  ======================================================= */

  let aiAnalysis =
    "Calculate a route to receive AI logistics analysis.";

  if (selectedRoute) {

    const score =
      Number(
        selectedRoute.score || 0
      );

    if (score >= 85) {

      aiAnalysis =
        "Excellent route selected. This route provides strong logistics efficiency with a high overall score and a good balance between distance, time, fuel and delivery cost.";

    } else if (score >= 70) {

      aiAnalysis =
        "Good route selected. This route provides a balanced combination of distance, delivery time, fuel consumption and overall logistics cost.";

    } else if (score >= 50) {

      aiAnalysis =
        "The selected route is usable, but alternative routes should be reviewed carefully for better fuel efficiency, delivery time and cost.";

    } else {

      aiAnalysis =
        "The current route has a relatively low logistics score. Consider comparing the available alternatives before finalizing the delivery.";
    }
  }


  /* =======================================================
     AI ROUTE COMPARISON
  ======================================================= */

  const bestOverallRoute =
    routes.length > 0
      ? routes.reduce(
          (best, route) =>
            Number(route.score || 0) >
            Number(best.score || 0)
              ? route
              : best
        )
      : null;

  const fastestRoute =
    routes.length > 0
      ? routes.reduce(
          (best, route) =>
            Number(
              route.durationMinutes ||
                0
            ) <
            Number(
              best.durationMinutes ||
                0
            )
              ? route
              : best
        )
      : null;

  const fuelEfficientRoute =
    routes.length > 0
      ? routes.reduce(
          (best, route) =>
            Number(
              route.fuelLitres ||
                0
            ) <
            Number(
              best.fuelLitres ||
                0
            )
              ? route
              : best
        )
      : null;

  const lowestCostRoute =
    routes.length > 0
      ? routes.reduce(
          (best, route) =>
            Number(
              route.totalDeliveryCost ||
                0
            ) <
            Number(
              best.totalDeliveryCost ||
                0
            )
              ? route
              : best
        )
      : null;


  /* =======================================================
     ROUTE BADGES
  ======================================================= */

  const getRouteBadges = (
    route
  ) => {

    const badges = [];

    if (
      bestOverallRoute &&
      route.id ===
        bestOverallRoute.id
    ) {

      badges.push(
        "🥇 Best Overall"
      );
    }

    if (
      fastestRoute &&
      route.id ===
        fastestRoute.id
    ) {

      badges.push(
        "⚡ Fastest"
      );
    }

    if (
      fuelEfficientRoute &&
      route.id ===
        fuelEfficientRoute.id
    ) {

      badges.push(
        "⛽ Fuel Efficient"
      );
    }

    if (
      lowestCostRoute &&
      route.id ===
        lowestCostRoute.id
    ) {

      badges.push(
        "💰 Lowest Cost"
      );
    }

    return badges;
  };

/* =======================================================
   ML ENVIRONMENTAL RISK ENGINE
   ======================================================= */

const [mlRisk, setMlRisk] = useState(null);
const [mlRiskLoading, setMlRiskLoading] = useState(false);
const [mlRiskError, setMlRiskError] = useState("");

const [riskState, setRiskState] = useState("ASSAM");
const [riskDistrict, setRiskDistrict] =
  useState("Hailakandi");

/* =======================================================
   ML RISK PREDICTION
   ======================================================= */

const fetchMlRisk = async () => {
  if (!riskState.trim() || !riskDistrict.trim()) {
    setMlRiskError(
      "Please enter both state and district."
    );
    return;
  }

  setMlRiskLoading(true);
  setMlRiskError("");

  try {
    const response = await fetch(
      `http://localhost:5000/api/ml-risk?state=${encodeURIComponent(
        riskState
      )}&district=${encodeURIComponent(
        riskDistrict
      )}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "ML prediction failed."
      );
    }

    setMlRisk(data);
  } catch (error) {
    console.error("ML Risk Error:", error);

    setMlRisk(null);

    setMlRiskError(
      error.message ||
        "Unable to connect to ML risk engine."
    );
  } finally {
    setMlRiskLoading(false);
  }
};

/* =======================================================
   DISPLAY HELPERS
   ======================================================= */

const mlRiskPercent = mlRisk
  ? Math.round(
      Number(mlRisk.probability || 0) * 100
    )
  : 0;

const mlRiskLevel = mlRisk
  ? mlRisk.risk
  : "NO DATA";

const getRiskColor = (value) => {
  if (value >= 70) {
    return "#ef4444";
  }

  if (value >= 40) {
    return "#f59e0b";
  }

  return "#22c55e";
};

const getMlRiskColor = (risk) => {
  if (risk === "HIGH") {
    return "#ef4444";
  }

  if (risk === "MEDIUM") {
    return "#f59e0b";
  }

  if (risk === "LOW") {
    return "#22c55e";
  }

  return "#64748b";
};

const environmentalRisk = {
  overall: mlRiskPercent,
  level:
    mlRiskLevel === "HIGH"
      ? "High"
      : mlRiskLevel === "MEDIUM"
      ? "Moderate"
      : mlRiskLevel === "LOW"
      ? "Low"
      : "No Data",
};

  /* =======================================================
     ROUTE AI RECOMMENDATION
  ======================================================= */

  const getRouteRecommendation = (
    route
  ) => {

    if (!route) {
      return "";
    }

    const badges =
      getRouteBadges(route);

    if (
      badges.includes(
        "🥇 Best Overall"
      )
    ) {

      return "AI recommends this route because it provides the strongest overall balance of distance, delivery time, fuel consumption and logistics cost.";
    }

    if (
      badges.includes(
        "⚡ Fastest"
      )
    ) {

      return "This route provides the fastest estimated delivery time and is suitable when delivery speed is the priority.";
    }

    if (
      badges.includes(
        "💰 Lowest Cost"
      )
    ) {

      return "This route has the lowest estimated delivery cost and can help reduce transportation expenses.";
    }

    if (
      badges.includes(
        "⛽ Fuel Efficient"
      )
    ) {

      return "This route has the lowest estimated fuel consumption and is suitable when fuel efficiency is the priority.";
    }

    return "This route is a viable alternative. Compare its time, fuel consumption and cost with the recommended route before selecting it.";
  };


  /* =======================================================
     RENDER
  ======================================================= */
/* =======================================================
     LOGIN SCREEN
  ======================================================= */

  if (!currentUser) {
    return (
      <div className="sih-login-page">
        <div className="sih-login-card">

          <div className="sih-login-icon">🚚</div>

    

          <h1>NER Logistics Intelligence</h1>

          <p>
            AI-powered logistics, accessibility and emergency operations platform.
          </p>

          <form onSubmit={handleLogin}>

            <label>Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="operator@nerlogistics.in"
            />

            <label>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Enter password"
            />

            <label>Role</label>
            <select
              value={loginRole}
              onChange={(event) => setLoginRole(event.target.value)}
            >
              <option>Logistics Manager</option>
              <option>Fleet Manager</option>
              <option>Operations Officer</option>
              <option>Field Official</option>
              <option>Administrator</option>
            </select>

            {loginError && (
              <div className="sih-login-error">
                ❌ {loginError}
              </div>
            )}

            <button type="submit">
              🔐 LOGIN
            </button>

          </form>

          <small>
            Prototype access • Enter any non-empty email and password.
          </small>

        </div>
      </div>
    );
  }

  return (

    <div className="app">

      <style>{`
        .sih-login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#f5f3ff,#eef2ff);}
        .sih-login-card{width:min(440px,92vw);background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:36px;box-shadow:0 24px 80px rgba(15,23,42,.14);}
        .sih-login-icon{width:72px;height:72px;border-radius:20px;background:#ede9fe;display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 16px;}
        .sih-login-kicker{display:block;text-align:center;color:#6d28d9;font-size:12px;font-weight:800;letter-spacing:1.4px;}
        .sih-login-card h1{text-align:center;color:#111827;margin:10px 0 8px;}
        .sih-login-card p{text-align:center;color:#6b7280;line-height:1.6;font-size:14px;}
        .sih-login-card form{display:flex;flex-direction:column;gap:7px;margin-top:20px;}
        .sih-login-card label{font-size:13px;font-weight:700;color:#374151;margin-top:8px;}
        .sih-login-card input,.sih-login-card select,.sih-card select,.sih-card textarea{box-sizing:border-box;width:100%;padding:11px 12px;border:1px solid #d1d5db;border-radius:10px;background:#fff;color:#111827;}
        .sih-login-card button,.sih-form-actions button,.sih-reoptimize button{border:0;border-radius:10px;padding:12px 14px;background:#6d28d9;color:#fff;font-weight:800;cursor:pointer;}
        .sih-login-error{padding:10px;border-radius:10px;background:#fef2f2;color:#b91c1c;font-size:13px;}
        .sih-login-card small{display:block;text-align:center;color:#9ca3af;margin-top:18px;}
        .sih-user-panel{display:flex;align-items:center;gap:12px;}
        .sih-online{font-size:11px;font-weight:800;color:#16a34a;}
        .sih-user-meta{display:flex;flex-direction:column;}
        .sih-user-meta strong{font-size:13px;color:#111827;}
        .sih-user-meta span{font-size:11px;color:#6b7280;}
        .sih-logout{padding:9px 12px;border:1px solid #fecaca;border-radius:9px;background:#fff1f2;color:#b91c1c;font-weight:700;cursor:pointer;}
        .sih-command-center{margin-top:24px;padding:24px;border-radius:22px;background:linear-gradient(180deg,#f5f3ff,#fff);border:1px solid #ddd6fe;}
        .sih-command-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;}
        .sih-command-header>div:first-child span,.sih-card-title span,.sih-emergency-panel>div:first-child span{font-size:11px;font-weight:800;letter-spacing:1px;color:#6d28d9;}
        .sih-command-header h2{margin:7px 0;color:#111827;}
        .sih-command-header p{margin:0;color:#6b7280;}
        .sih-command-actions{display:flex;gap:10px;flex-wrap:wrap;}
        .sih-command-actions select{padding:9px;border:1px solid #d1d5db;border-radius:9px;background:#fff;}
        .sih-emergency{padding:10px 13px;border-radius:9px;border:1px solid #fca5a5;background:#fff;color:#b91c1c;font-weight:800;cursor:pointer;}
        .sih-emergency.active{background:#dc2626;color:#fff;}
        .sih-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0;}
        .sih-kpi{padding:16px;border-radius:14px;background:#fff;border:1px solid #e5e7eb;}
        .sih-kpi span{font-size:11px;color:#6b7280;font-weight:800;}
        .sih-kpi strong{display:block;font-size:24px;color:#111827;margin:6px 0;}
        .sih-kpi small{color:#6b7280;}
        .sih-command-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .sih-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px;}
        .sih-card-title{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:14px;}
        .sih-card-title h3{margin:5px 0 0;color:#111827;}
        .sih-live-pill{font-size:10px!important;color:#16a34a!important;background:#f0fdf4;padding:6px 8px;border-radius:999px;}
        .sih-table-row{display:grid;grid-template-columns:1.5fr .8fr .8fr .6fr;gap:10px;align-items:center;padding:11px 0;border-top:1px solid #f3f4f6;}
        .sih-table-row strong{display:block;color:#111827;font-size:13px;}
        .sih-table-row small{display:block;color:#6b7280;font-size:11px;margin-top:2px;}
        .sih-status{font-size:10px;font-weight:800;padding:6px 8px;border-radius:999px;background:#f3f4f6;}
        .sih-status.open{color:#166534;background:#dcfce7}.sih-status.caution{color:#92400e;background:#fef3c7}.sih-status.alert{color:#991b1b;background:#fee2e2}
        .sih-alert{display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-top:1px solid #f3f4f6;}
        .sih-alert-icon{font-size:20px;}
        .sih-alert strong{color:#111827;font-size:13px;}
        .sih-alert p{margin:3px 0 0;color:#6b7280;font-size:12px;line-height:1.5;}
        .sih-alert-level{margin-left:auto;font-size:9px;font-weight:800;padding:5px 7px;border-radius:999px;}
        .sih-alert-level.high{color:#991b1b;background:#fee2e2}.sih-alert-level.medium{color:#92400e;background:#fef3c7}
        .sih-reoptimize{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:12px;padding-top:14px;border-top:1px solid #f3f4f6;}
        .sih-reoptimize strong,.sih-reoptimize span{display:block}.sih-reoptimize strong{font-size:13px;color:#111827}.sih-reoptimize span{font-size:11px;color:#6b7280;margin-top:3px;}
        .sih-gps-box{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .sih-gps-box div{padding:12px;border-radius:10px;background:#f9fafb;}
        .sih-gps-box span{display:block;font-size:10px;color:#6b7280;text-transform:uppercase}.sih-gps-box strong{display:block;margin-top:5px;color:#111827;font-size:13px;}
        .sih-gps-error{color:#b91c1c;font-size:12px;}.sih-note{font-size:11px!important;text-align:left!important;margin-top:10px!important;}
        .sih-card textarea{resize:vertical;margin-top:8px;}
        .sih-form-actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
        .sih-form-actions button:last-child{background:#111827;}
        .sih-sync{font-size:10px!important;padding:5px 7px;border-radius:999px;background:#f3f4f6;}
        .sih-sync.synced{color:#166534!important;background:#dcfce7}.sih-sync.queued{color:#92400e!important;background:#fef3c7;}
        .sih-queue-info{margin-top:10px;padding:9px;border-radius:8px;background:#f5f3ff;color:#5b21b6;font-size:11px;}
        .sih-emergency-panel{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-top:16px;padding:18px;border-radius:14px;background:#fff;border:1px solid #e5e7eb;}
        .sih-emergency-panel h3{margin:6px 0;color:#111827}.sih-emergency-panel p{margin:0;color:#6b7280;font-size:12px;}
        .sih-essential-tags{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;}
        .sih-essential-tags span{padding:8px 10px;border-radius:999px;background:#f5f3ff;color:#5b21b6;font-size:11px;font-weight:700;}
        @media(max-width:900px){.sih-kpi-grid{grid-template-columns:1fr 1fr}.sih-command-grid{grid-template-columns:1fr}.sih-command-header,.sih-emergency-panel{flex-direction:column}.sih-essential-tags{justify-content:flex-start}}
        @media(max-width:600px){.sih-kpi-grid{grid-template-columns:1fr}.sih-user-meta,.sih-online{display:none}.sih-login-card{padding:24px}.sih-table-row{grid-template-columns:1.4fr .8fr .7fr .5fr}.sih-gps-box{grid-template-columns:1fr}}
      `}</style>



      {/* =================================================
          HEADER
      ================================================= */}

      <header className="main-header">

        <div className="brand-title">

          <div>

            <h1>
              NER Logistics Intelligence Platform
            </h1>

            <p>
              Smart Route Planning and Logistics Management
            </p>

          </div>

        </div>


        <div className="sih-user-panel">
          <span className="sih-online">
            {isOnline ? "● ONLINE" : "● OFFLINE"}
          </span>

          <div className="sih-user-meta">
            <strong>{currentUser?.name || "Operator"}</strong>
            <span>{currentUser?.role || "Logistics"}</span>
          </div>

          <button
            type="button"
            className="sih-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </header>


      {/* =================================================
          TOP ANALYTICS
      ================================================= */}

      <section className="analytics-section">

        <div className="analytics-card">

          <h3>
            📦 Total Trips
          </h3>

          <h1>
            {totalTrips}
          </h1>

          <p>
            Saved deliveries
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            🚚 Active Trips
          </h3>

          <h1>
            {activeTrips}
          </h1>

          <p>
            In transit
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            📋 Planned
          </h3>

          <h1>
            {plannedTrips}
          </h1>

          <p>
            Upcoming trips
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            ✅ Delivered
          </h3>

          <h1>
            {deliveredTrips}
          </h1>

          <p>
            Completed
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            💰 Total Cost
          </h3>

          <h2>
            ₹
            {totalCost.toLocaleString()}
          </h2>

          <p>
            Estimated cost
          </p>

        </div>


        <div className="analytics-card">

          <h3>
            📏 Distance
          </h3>

          <h2>
            {totalDistance.toFixed(
              1
            )}{" "}
            km
          </h2>

          <p>
            Total distance
          </p>

        </div>

      </section>


      {/* =================================================
          MAIN DASHBOARD
      ================================================= */}

      <main className="dashboard">


        {/* =================================================
            TOP LEFT
            ROUTE PLANNER
        ================================================= */}

        <section className="route-planner-panel">

          <div className="section-box">

            <div className="box-heading">

              <div>

                <span>
                  ROUTE PLANNING
                </span>

                <h2>
                  🚚 Find Best Delivery Route
                </h2>

              </div>

            </div>


            <label>
              📍 Source Location
            </label>

            <input
              type="text"
              value={source}
              onChange={(e) =>
                setSource(
                  e.target.value
                )
              }
              placeholder="Enter source location"
            />


            <label>
              🏁 Destination
            </label>

            <input
              type="text"
              value={destination}
              onChange={(e) =>
                setDestination(
                  e.target.value
                )
              }
              placeholder="Enter destination"
            />


            <label>
              🚛 Vehicle Type
            </label>

            <select
              value={vehicle}
              onChange={(e) =>
                setVehicle(
                  e.target.value
                )
              }
            >

              <option value="heavyTruck">
                🚛 Heavy Truck
              </option>

              <option value="mediumTruck">
                🚚 Medium Truck
              </option>

              <option value="deliveryVan">
                🚐 Delivery Van
              </option>

            </select>


            {error && (

              <div className="error-box">

                ❌ {error}

              </div>

            )}


            <button
              className="primary-button"
              onClick={
                findRoute
              }
              disabled={
                loading
              }
            >

              {loading
                ? "⏳ Calculating Route..."
                : "🔎 Find Best Route"}

            </button>

          </div>

        </section>


        {/* =================================================
            TOP RIGHT
            MAP
        ================================================= */}

        <section className="map-panel">

          <div className="map-header">

            <div>

              <span>
                LIVE MAP
              </span>

              <h2>
                🗺️ Route Visualization
              </h2>

            </div>

            <div className="map-live-status">
              ● LIVE
            </div>

          </div>


          <div className="big-map">

            <MapContainer
              center={[
                26.8467,
                80.9462,
              ]}
              zoom={6}
              scrollWheelZoom={true}
              style={{
                height: "100%",
                width: "100%",
              }}
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapView
                selectedRoute={selectedRoute}
                trackingActive={trackingActive}
                trackingIndex={trackingIndex}
                gpsPosition={gpsPosition}
              />

            </MapContainer>

          </div>


          {!selectedRoute && (

            <div className="map-empty">

              <div>
                🗺️
              </div>

              <h3>
                Route Map
              </h3>

              <p>
                Enter source and destination
                to visualize the delivery route.
              </p>

            </div>

          )}

        </section>


        {/* =================================================
            LOWER FULL WIDTH CONTENT
        ================================================= */}

        <section className="lower-dashboard">


{/* =================================================
    SELECTED ROUTE SUMMARY
================================================= */}

{selectedRoute && (

  <div className="section-box recommendation-box">

    {/* HEADER */}
    <div className="box-heading">

      <div>
        <span>RECOMMENDED</span>

        <h2>🏆 Best Route</h2>
      </div>

      <div className="score-badge">
        {selectedRoute.score}/100
      </div>

    </div>


    {/* ROUTE DETAILS */}
    <div className="route-summary-grid">

      <div className="route-summary-item">
        <span>📏 Distance</span>

        <strong>
          {selectedRoute.distanceKm} km
        </strong>
      </div>


      <div className="route-summary-item">
        <span>⏱️ Time</span>

        <strong>
          {formatTime(
            selectedRoute.durationMinutes
          )}
        </strong>
      </div>


      <div className="route-summary-item">
        <span>⛽ Fuel</span>

        <strong>
          {selectedRoute.fuelLitres} L
        </strong>
      </div>


      <div className="route-summary-item">
        <span>💰 Cost</span>

        <strong>
          ₹
          {Number(
            selectedRoute.totalDeliveryCost || 0
          ).toLocaleString()}
        </strong>
      </div>

    </div>


    {/* VEHICLE */}
    <div className="vehicle-info">

      🚛 Vehicle:

      <strong>
        {vehicleName}
      </strong>

    </div>


    {/* SAVE BUTTON */}
    <button
      className="save-button"
      onClick={saveTrip}
    >
      💾 Save This Trip
    </button>

  </div>

)}

          {/* =================================================
              AI ANALYSIS
          ================================================= */}

          {selectedRoute && (

            <div className="ai-analysis-box">

              <div className="box-heading">

                <div>

                  <span>
                    ARTIFICIAL INTELLIGENCE
                  </span>

                  <h3>
                    🧠 AI Logistics Analysis
                  </h3>

                </div>

                <div className="ai-badge">
                  AI
                </div>

              </div>


              <div className="ai-score">

                <div className="score-ring">

                  <strong>
                    {
                      selectedRoute.score
                    }
                  </strong>

                  <span>
                    /100
                  </span>

                </div>


                <div className="ai-summary">

                  <strong>
                    Route Efficiency
                  </strong>

                  <p>
                    {aiAnalysis}
                  </p>

                </div>

              </div>


              <div className="analysis-list">

                <div>

                  <span>
                    ⛽ Fuel Efficiency
                  </span>

                  <strong>
                    {
                      selectedRoute.fuelLitres
                    }{" "}
                    L
                  </strong>

                </div>


                <div>

                  <span>
                    💰 Delivery Cost
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedRoute.totalDeliveryCost ||
                        0
                    ).toLocaleString()}
                  </strong>

                </div>


                <div>

                  <span>
                    🚛 Vehicle
                  </span>

                  <strong>
                    {vehicleName}
                  </strong>

                </div>


                <div>

                  <span>
                    ⏱️ Estimated Delivery
                  </span>

                  <strong>
                    {formatTime(
                      selectedRoute.durationMinutes
                    )}
                  </strong>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              AI DECISION SUMMARY
          ================================================= */}

          {selectedRoute && routes.length > 0 && (

            <section className="ai-decision-box">

              <div className="box-heading">

                <div>

                  <span>
                    AI LOGISTICS INTELLIGENCE
                  </span>

                  <h2>
                    🤖 AI Decision Summary
                  </h2>

                </div>

                <div className="ai-badge">
                  AI ACTIVE
                </div>

              </div>

              <div className="ai-decision-content">

                <div className="ai-decision-score">

                  <strong>
                    {selectedRoute.score}
                  </strong>

                  <span>
                    /100
                  </span>

                  <small>
                    Route Score
                  </small>

                </div>


                <div className="ai-decision-text">

                  <h3>

                    {selectedRoute.id ===
                    bestOverallRoute?.id
                      ? "🏆 Recommended Route"
                      : "📊 Selected Route"}

                  </h3>

                  <p>

                    {getRouteRecommendation(
                      selectedRoute
                    )}

                  </p>

                  <div className="ai-decision-tags">

                    <span>
                      📏 {selectedRoute.distanceKm} km
                    </span>

                    <span>
                      ⏱️ {formatTime(
                        selectedRoute.durationMinutes
                      )}
                    </span>

                    <span>
                      ⛽ {selectedRoute.fuelLitres} L
                    </span>

                    <span>
                      💰 ₹
                      {Number(
                        selectedRoute.totalDeliveryCost || 0
                      ).toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              SMART AI ROUTE COMPARISON
          ================================================= */}

          {routes.length > 0 && (() => {

            const fastestRoute = routes.reduce(
              (best, route) =>
                Number(route.durationMinutes || Infinity) <
                Number(best.durationMinutes || Infinity)
                  ? route
                  : best,
              routes[0]
            );

            const cheapestRoute = routes.reduce(
              (best, route) =>
                Number(route.totalDeliveryCost || Infinity) <
                Number(best.totalDeliveryCost || Infinity)
                  ? route
                  : best,
              routes[0]
            );

            const fuelEfficientRoute = routes.reduce(
              (best, route) =>
                Number(route.fuelLitres || Infinity) <
                Number(best.fuelLitres || Infinity)
                  ? route
                  : best,
              routes[0]
            );

            const highestScoreRoute = routes.reduce(
              (best, route) =>
                Number(route.score || 0) >
                Number(best.score || 0)
                  ? route
                  : best,
              routes[0]
            );

            return (
              <section className="smart-comparison-section">

                {/* HEADER */}

                <div className="smart-comparison-header">

                  <div>

                    <span className="comparison-kicker">
                      INTELLIGENT ROUTE SELECTION
                    </span>

                    <h2>
                      🧠 AI Route Comparison
                    </h2>

                    <p>
                      Compare routes using delivery time,
                      fuel consumption, cost and AI
                      logistics intelligence.
                    </p>

                  </div>

                  <div className="routes-total-badge">
                    {routes.length} ROUTES
                  </div>

                </div>


                {/* SMART INSIGHTS */}

                <div className="route-insights">

                  <div className="insight-card fastest">

                    <span>
                      ⚡ FASTEST
                    </span>

                    <strong>
                      {formatTime(
                        fastestRoute.durationMinutes
                      )}
                    </strong>

                    <small>
                      Shortest delivery time
                    </small>

                  </div>


                  <div className="insight-card cheapest">

                    <span>
                      💰 LOWEST COST
                    </span>

                    <strong>
                      ₹
                      {Number(
                        cheapestRoute.totalDeliveryCost || 0
                      ).toLocaleString()}
                    </strong>

                    <small>
                      Most economical route
                    </small>

                  </div>


                  <div className="insight-card fuel">

                    <span>
                      ⛽ FUEL EFFICIENT
                    </span>

                    <strong>
                      {fuelEfficientRoute.fuelLitres} L
                    </strong>

                    <small>
                      Lowest fuel consumption
                    </small>

                  </div>


                  <div className="insight-card score">

                    <span>
                      🧠 TOP AI SCORE
                    </span>

                    <strong>
                      {highestScoreRoute.score}/100
                    </strong>

                    <small>
                      Highest logistics efficiency
                    </small>

                  </div>

                </div>


                {/* ROUTE CARDS */}

                <div className="smart-route-grid">

                  {routes.map((route, index) => {

                    const isSelected =
                      selectedRoute?.id === route.id;

                    const isFastest =
                      route.id === fastestRoute.id;

                    const isCheapest =
                      route.id === cheapestRoute.id;

                    const isFuelEfficient =
                      route.id === fuelEfficientRoute.id;

                    const isHighestScore =
                      route.id === highestScoreRoute.id;

                    return (
                      <div
                        key={route.id || index}
                        className={
                          isSelected
                            ? "smart-route-card selected"
                            : "smart-route-card"
                        }
                        onClick={() => {
                          selectRoute(route);
                        }}
                      >

                        {/* BADGES */}

                        <div className="route-badges">

                          {index === 0 && (
                            <span className="badge recommended">
                              ⭐ AI RECOMMENDED
                            </span>
                          )}

                          {isFastest && (
                            <span className="badge fastest-badge">
                              ⚡ FASTEST
                            </span>
                          )}

                          {isCheapest && (
                            <span className="badge cheapest-badge">
                              💰 LOWEST COST
                            </span>
                          )}

                          {isFuelEfficient && (
                            <span className="badge fuel-badge">
                              ⛽ FUEL EFFICIENT
                            </span>
                          )}

                        </div>


                        {/* CARD HEADER */}

                        <div className="smart-route-card-header">

                          <div>

                            <span className="route-number">
                              ROUTE {index + 1}
                            </span>

                            <h3>
                              {index === 0
                                ? "AI Recommended Route"
                                : `Alternative Route ${index}`}
                            </h3>

                          </div>


                          <div
                            className={
                              isHighestScore
                                ? "route-score highest"
                                : "route-score"
                            }
                          >

                            <strong>
                              {route.score}
                            </strong>

                            <span>
                              /100
                            </span>

                          </div>

                        </div>


                        {/* SCORE BAR */}

                        <div className="smart-score-section">

                          <div className="smart-score-label">

                            <span>
                              Logistics Efficiency
                            </span>

                            <strong>
                              {route.score}%
                            </strong>

                          </div>

                          <div className="smart-score-bar">

                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Number(route.score || 0)
                                )}%`,
                              }}
                            />

                          </div>

                        </div>


                        {/* ROUTE DATA */}

                        <div className="smart-route-data">

                          <div className="smart-data-box">

                            <span>
                              📏 DISTANCE
                            </span>

                            <strong>
                              {route.distanceKm}
                              <small>
                                {" "}km
                              </small>
                            </strong>

                          </div>


                          <div className="smart-data-box">

                            <span>
                              ⏱️ TIME
                            </span>

                            <strong>
                              {formatTime(
                                route.durationMinutes
                              )}
                            </strong>

                          </div>


                          <div className="smart-data-box">

                            <span>
                              ⛽ FUEL
                            </span>

                            <strong>
                              {route.fuelLitres}
                              <small>
                                {" "}L
                              </small>
                            </strong>

                          </div>


                          <div className="smart-data-box">

                            <span>
                              💰 COST
                            </span>

                            <strong>
                              ₹
                              {Number(
                                route.totalDeliveryCost || 0
                              ).toLocaleString()}
                            </strong>

                          </div>

                        </div>


                        {/* SPECIAL INSIGHTS */}

                        <div className="route-special-tags">

                          {isFastest && (
                            <span>
                              ⚡ Quickest Delivery
                            </span>
                          )}

                          {isCheapest && (
                            <span>
                              💰 Cost Saving
                            </span>
                          )}

                          {isFuelEfficient && (
                            <span>
                              🌱 Better Fuel Economy
                            </span>
                          )}

                        </div>


                        {/* SELECT BUTTON */}

                        <button
                          className={
                            isSelected
                              ? "smart-selected-button"
                              : "smart-select-button"
                          }
                          onClick={(e) => {

                            e.stopPropagation();

                            selectRoute(route);

                          }}
                        >

                          {isSelected
                            ? "✓ SELECTED ROUTE"
                            : "SELECT THIS ROUTE →"}

                        </button>

                      </div>
                    );

                  })}

                </div>

              </section>
            );

          })()}

{/* =================================================
    LIVE VEHICLE TRACKING
================================================= */}

{selectedRoute && (

  <div className="tracking-box">

    {/* HEADER */}
    <div className="box-heading">

      <div>
        <span>REAL-TIME MONITORING</span>

        <h3>📡 Live Vehicle Tracking</h3>
      </div>

      <div className="live-indicator">
        ● LIVE
      </div>

    </div>


    {/* STATUS */}
    <div className="tracking-status-box">
      {trackingStatus}
    </div>


    {/* TRACKING DETAILS */}
    <div className="tracking-grid">

      <div className="tracking-item">

        <span>🚛 Vehicle</span>

        <strong>
          {vehicleName}
        </strong>

      </div>


      <div className="tracking-item">

        <span>⚡ Speed</span>

        <strong>
          {simulatedSpeed}
          <small> km/h</small>
        </strong>

      </div>


      <div className="tracking-item">

        <span>⏱️ ETA</span>

        <strong>
          {formatTime(currentETA)}
        </strong>

      </div>


      <div className="tracking-item">

        <span>📊 Progress</span>

        <strong>
          {trackingProgress}%
        </strong>

      </div>

    </div>


    {/* PROGRESS */}
    <div className="progress-container">

      <div className="progress-label">

        <span>
          Delivery Progress
        </span>

        <strong>
          {trackingProgress}%
        </strong>

      </div>


      <div className="progress-bar">

        <div
          style={{
            width: `${trackingProgress}%`,
          }}
        />
      </div>

    </div>


    {/* START BUTTON */}
    {!trackingActive &&
      trackingProgress < 100 && (

        <button
          className="success-button"
          onClick={startTracking}
        >
          ▶ Start Live Tracking
        </button>

      )}


    {/* STOP BUTTON */}
    {trackingActive && (

      <button
        className="danger-button"
        onClick={stopTracking}
      >
        ■ Stop Tracking
      </button>

    )}


    {/* COMPLETED */}
    {trackingProgress >= 100 && (

      <div className="completed-box">
        ✅ Delivery Completed Successfully
      </div>

    )}

  </div>

)}

{/* =================================================
               INTELLIGENCE COMMAND CENTER
          ================================================= */}

          <section className="sih-command-center">

            <div className="sih-command-header">
              <div>
            
                <h2>🛰️ NER Accessibility Intelligence Command Center</h2>
                <p>
                  Real-time-style operational visibility, predictive disruption
                  readiness, field reporting, emergency routing and offline support.
                </p>
              </div>

              <div className="sih-command-actions">
                <button
                  type="button"
                  className={emergencyMode ? "sih-emergency active" : "sih-emergency"}
                  onClick={() => setEmergencyMode((value) => !value)}
                >
                  {emergencyMode ? "🚨 EMERGENCY MODE ON" : "Emergency Mode"}
                </button>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option>English</option>
                  <option>हिन्दी</option>
                  <option>অসমীয়া</option>
                  <option>বাংলা</option>
                </select>
              </div>
            </div>

            <div className="sih-kpi-grid">
              <div className="sih-kpi">
                <span>🛣️ NETWORK ACCESS</span>
                <strong>79%</strong>
                <small>NER monitored corridors</small>
              </div>

              <div className="sih-kpi">
                <span>⚠️ HIGH-RISK ZONES</span>
                <strong>3</strong>
                <small>Predictive watchlist</small>
              </div>

              <div className="sih-kpi">
                <span>🚚 ACTIVE MOVEMENT</span>
                <strong>{activeTrips}</strong>
                <small>Tracked deliveries</small>
              </div>

              <div className="sih-kpi">
                <span>📡 DATA STATUS</span>
                <strong>{isOnline ? "LIVE" : "OFFLINE"}</strong>
                <small>
                  {isOnline ? "Network connected" : "Local queue enabled"}
                </small>
              </div>
            </div>

            <div className="sih-command-grid">

              <div className="sih-card">

                <div className="sih-card-title">
                  <div>
                    <span>GIS ACCESSIBILITY MONITOR</span>
                    <h3>District-wise Connectivity</h3>
                  </div>

                  <select
                    value={districtFilter}
                    onChange={(event) => setDistrictFilter(event.target.value)}
                  >
                    <option>All</option>
                    {districtRows.map((row) => (
                      <option key={row.district} value={row.district}>
                        {row.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sih-table">
                  {activeDistricts.map((row) => (
                    <div className="sih-table-row" key={row.district}>
                      <div>
                        <strong>{row.district}</strong>
                        <small>{row.state} • {row.bottleneck}</small>
                      </div>

                      <div>
                        <span className={`sih-status ${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </div>

                      <div>
                        <strong>{row.connectivity}%</strong>
                        <small>Connectivity</small>
                      </div>

                      <div>
                        <strong>{row.risk}%</strong>
                        <small>Risk</small>
                      </div>
                    </div>
                  ))}
                </div>

              </div>


              <div className="sih-card">

                <div className="sih-card-title">
                  <div>
                    <span>PREDICTIVE DISRUPTION ENGINE</span>
                    <h3>Route Risk Alerts</h3>
                  </div>

                  <span className="sih-live-pill">
                    ● LIVE MODEL
                  </span>
                </div>

                <div className="sih-alert-list">

                  {alertRows.map((alert) => (
                    <div className="sih-alert" key={alert.title}>
                      <div className="sih-alert-icon">{alert.icon}</div>

                      <div>
                        <strong>{alert.title}</strong>
                        <p>{alert.detail}</p>
                      </div>

                      <span className={`sih-alert-level ${alert.level.toLowerCase()}`}>
                        {alert.level}
                      </span>
                    </div>
                  ))}

                </div>

                <div className="sih-reoptimize">
                  <div>
                    <strong>Dynamic Re-optimization</strong>
                    <span>
                      Re-check the selected route when risk or accessibility changes.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      if (selectedRoute) {
                        alert("Route re-evaluation triggered for the selected corridor.");
                      } else {
                        alert("Calculate a route first.");
                      }
                    }}
                  >
                    🔄 Re-optimize
                  </button>
                </div>

              </div>


              <div className="sih-card">

                <div className="sih-card-title">
                  <div>
                    <span>GPS / FIELD OPERATIONS</span>
                    <h3>Vehicle & Field Location</h3>
                  </div>

                  <span className="sih-live-pill">
                    {gpsPosition ? "GPS FIX" : "GPS WAITING"}
                  </span>
                </div>

                <div className="sih-gps-box">

                  <div>
                    <span>Latitude</span>
                    <strong>
                      {gpsPosition ? gpsPosition.lat.toFixed(5) : "Waiting..."}
                    </strong>
                  </div>

                  <div>
                    <span>Longitude</span>
                    <strong>
                      {gpsPosition ? gpsPosition.lon.toFixed(5) : "Waiting..."}
                    </strong>
                  </div>

                  <div>
                    <span>Accuracy</span>
                    <strong>
                      {gpsPosition ? `${gpsPosition.accuracy} m` : "—"}
                    </strong>
                  </div>

                </div>

                {gpsError && (
                  <p className="sih-gps-error">
                    {gpsError}
                  </p>
                )}

                <p className="sih-note">
                  Browser GPS is used when permission is granted. Vehicle route
                  simulation continues independently.
                </p>

              </div>


              <div className="sih-card">

                <div className="sih-card-title">
                  <div>
                    <span>FIELD REPORTING</span>
                    <h3>Geo-tagged Incident Upload</h3>
                  </div>

                  <span className={isOnline ? "sih-sync synced" : "sih-sync queued"}>
                    {isOnline ? "● SYNCED" : "● OFFLINE QUEUE"}
                  </span>
                </div>

                <select
                  value={incidentType}
                  onChange={(event) => setIncidentType(event.target.value)}
                >
                  <option>Flood</option>
                  <option>Landslide</option>
                  <option>Heavy Rainfall</option>
                  <option>Road Damage</option>
                  <option>Bridge Damage</option>
                  <option>Traffic Congestion</option>
                </select>

                <select
                  value={incidentSeverity}
                  onChange={(event) => setIncidentSeverity(event.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <textarea
                  value={incidentNote}
                  onChange={(event) => setIncidentNote(event.target.value)}
                  placeholder="Describe the incident..."
                  rows={3}
                />

                <div className="sih-form-actions">
                  <button type="button" onClick={submitIncident}>
                    📍 Submit Geo-tagged Report
                  </button>

                  <button type="button" onClick={syncIncidentQueue}>
                    🔄 Sync Queue
                  </button>
                </div>

                {incidentQueue.length > 0 && (
                  <div className="sih-queue-info">
                    {incidentQueue.length} incident report(s) stored locally.
                    {isOnline ? " Ready to sync." : " Will sync when network returns."}
                  </div>
                )}

              </div>

            </div>

            <div className="sih-emergency-panel">
              <div>
                <span>EMERGENCY & DISASTER RESPONSE</span>
                <h3>
                  {emergencyMode
                    ? "🚨 Emergency logistics mode is active"
                    : "Emergency routing ready"}
                </h3>
                <p>
                  {emergencyMode
                    ? "Prioritize essential commodities, shortest safe alternatives and active field reports."
                    : "Switch to emergency mode during floods, landslides or major road disruptions."}
                </p>
              </div>

              <div className="sih-essential-tags">
                <span>💊 Medicines</span>
                <span>🍚 Food Supplies</span>
                <span>🌾 Agricultural Produce</span>
                <span>🏗️ Construction Materials</span>
              </div>
            </div>

          </section>

{/* =================================================
    LOGISTICS OVERVIEW
================================================= */}

<div className="overview-box">

  <div className="box-heading">
    <div>
      <span>PERFORMANCE</span>
      <h3>📊 Logistics Overview</h3>
    </div>
  </div>


  <div className="overview-grid">

    {/* TOTAL TRIPS */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>📦 Total Trips</span>
        <strong>{totalTrips}</strong>
        <small>Saved deliveries</small>
      </div>
    </div>


    {/* ACTIVE TRIPS */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>🚚 Active Trips</span>
        <strong>{activeTrips}</strong>
        <small>In transit</small>
      </div>
    </div>


    {/* PLANNED */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>📋 Planned</span>
        <strong>{plannedTrips}</strong>
        <small>Upcoming</small>
      </div>
    </div>


    {/* DELIVERED */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>✅ Delivered</span>
        <strong>{deliveredTrips}</strong>
        <small>Completed</small>
      </div>
    </div>


    {/* TOTAL COST */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>💰 Total Cost</span>
        <strong>
          ₹{totalCost.toLocaleString()}
        </strong>
        <small>Estimated</small>
      </div>
    </div>


    {/* TOTAL DISTANCE */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>📏 Total Distance</span>
        <strong>
          {totalDistance.toFixed(1)}
        </strong>
        <small>Kilometres</small>
      </div>
    </div>


    {/* AVERAGE SCORE */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>🧠 Average Score</span>
        <strong>{averageScore}</strong>
        <small>Out of 100</small>
      </div>
    </div>


    {/* AVERAGE COST */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>💵 Average Cost</span>
        <strong>
          ₹{averageCost.toLocaleString()}
        </strong>
        <small>Per trip</small>
      </div>
    </div>


    {/* COMPLETION RATE */}
    <div className="overview-card">
      <div className="overview-card-content">
        <span>🎯 Completion Rate</span>
        <strong>{completionRate}%</strong>
        <small>Delivery success</small>
      </div>
    </div>

  </div>

</div>

<div className="ner-environment-box">

  {/* =================================================
      HEADER
  ================================================= */}

  <div className="box-heading">

    <div>

      <span>
        NORTH EASTERN REGION 
      </span>

      <h3>
        🌦️ Environmental Risk Monitor
      </h3>

    </div>

    <div
      className="route-count-badge"
      style={{
        color: getMlRiskColor(
          mlRisk?.risk
        ),
      }}
    >
      {mlRisk
        ? mlRisk.risk
        : "NO DATA"}
    </div>

  </div>


  {/* =================================================
      ML INPUT
  ================================================= */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr auto",
      gap: "12px",
      marginBottom: "20px",
    }}
  >

    <div>

      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: "6px",
        }}
      >
        State
      </label>

      <select
        value={riskState}
        onChange={(e) =>
          setRiskState(e.target.value)
        }
        style={{
          width: "100%",
          padding: "11px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
        }}
      >
        <option value="ASSAM">
          Assam
        </option>

        <option value="ARUNACHAL PRADESH">
          Arunachal Pradesh
        </option>

        <option value="MANIPUR">
          Manipur
        </option>

        <option value="MEGHALAYA">
          Meghalaya
        </option>

        <option value="MIZORAM">
          Mizoram
        </option>

        <option value="NAGALAND">
          Nagaland
        </option>

        <option value="SIKKIM">
          Sikkim
        </option>

        <option value="TRIPURA">
          Tripura
        </option>
      </select>

    </div>


    <div>

      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: "6px",
        }}
      >
        District
      </label>

      <input
        value={riskDistrict}
        onChange={(e) =>
          setRiskDistrict(e.target.value)
        }
        placeholder="e.g. Hailakandi"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
        }}
      />

    </div>


    <div
      style={{
        display: "flex",
        alignItems: "end",
      }}
    >

      <button
        type="button"
        onClick={fetchMlRisk}
        disabled={mlRiskLoading}
        style={{
          padding: "11px 18px",
          border: "none",
          borderRadius: "10px",
          background: "#6d28d9",
          color: "white",
          fontWeight: 800,
          cursor: mlRiskLoading
            ? "wait"
            : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {mlRiskLoading
          ? "🤖 Analyzing..."
          : "🤖 Access Risk"}
      </button>

    </div>

  </div>


  {/* =================================================
      ERROR
  ================================================= */}

  {mlRiskError && (

    <div
      style={{
        padding: "10px 12px",
        marginBottom: "16px",
        borderRadius: "10px",
        background: "#fef2f2",
        color: "#b91c1c",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      ❌ {mlRiskError}
    </div>

  )}


  {/* =================================================
      OVERALL ML RISK
  ================================================= */}

  <div className="environment-overall">

    <div>

      <span>
      LANDSLIDE SUSCEPTIBILITY
      </span>

      <strong
        style={{
          color:
            getRiskColor(
              mlRiskPercent
            ),
        }}
      >
        {mlRisk
          ? `${mlRiskPercent}%`
          : "--"}
      </strong>

    </div>


    <div className="environment-risk-bar">

      <div
        style={{
          width: `${mlRiskPercent}%`,
          background:
            getRiskColor(
              mlRiskPercent
            ),
        }}
      />

    </div>


    <small>

      {mlRisk
        ? `Risk Level: ${mlRisk.risk} • ${riskDistrict}, ${riskState}`
        : "Run ML prediction to assess environmental risk."}

    </small>

  </div>


  {/* =================================================
      ML RESULT CARDS
  ================================================= */}

  <div className="environment-grid">


    {/* RISK LEVEL */}

    <div className="environment-card landslide">

      <div className="environment-icon">
        ⛰️
      </div>

      <div>

        <span>
          Landslide Risk
        </span>

        <strong
          style={{
            color:
              getMlRiskColor(
                mlRisk?.risk
              ),
          }}
        >
          {mlRisk
            ? mlRisk.risk
            : "NO DATA"}
        </strong>

        <small>
         susceptibility result
        </small>

      </div>

    </div>


    {/* PROBABILITY */}

    <div className="environment-card weather">

      <div className="environment-icon">
        📊
      </div>

      <div>

        <span>
         Probability
        </span>

        <strong>
          {mlRisk
            ? `${(
                mlRisk.probability *
                100
              ).toFixed(2)}%`
            : "--"}
        </strong>

        <small>
          Estimated susceptibility probability
        </small>

      </div>

    </div>


    {/* PREDICTION */}

    <div className="environment-card flood">

      <div className="environment-icon">
        🤖
      </div>

      <div>

        <span>
          Risk Assessment
        </span>

        <strong
          style={{
            color:
              mlRisk?.prediction === 1
                ? "#ef4444"
                : "#22c55e",
          }}
        >
          {mlRisk
            ? mlRisk.prediction === 1
              ? "SUSCEPTIBLE"
              : "LOW SUSCEPTIBILITY"
            : "--"}
        </strong>

        <small>
          Environmental Assessment
        </small>

      </div>

    </div>


    {/* LOCATION */}

    <div className="environment-card terrain">

      <div className="environment-icon">
        📍
      </div>

      <div>

        <span>
          Monitored Location
        </span>

        <strong>
          {mlRisk
            ? mlRisk.district
            : riskDistrict}
        </strong>

        <small>
          {mlRisk
            ? mlRisk.state
            : riskState}
        </small>

      </div>

    </div>

  </div>


  {/* =================================================
      MODEL ALERT
  ================================================= */}

  <div className="environment-alert">

    {mlRisk?.risk === "HIGH"
      ? "🔴"
      : mlRisk?.risk === "MEDIUM"
      ? "🟡"
      : mlRisk?.risk === "LOW"
      ? "🟢"
      : "ℹ️"}

    <strong>
     Logistics Alert:
    </strong>

    {mlRisk
      ? mlRisk.risk === "HIGH"
        ? " High landslide susceptibility detected. Review the corridor before dispatch."
        : mlRisk.risk === "MEDIUM"
        ? " Moderate landslide susceptibility detected. Monitor the route before dispatch."
        : " Low landslide susceptibility predicted for the selected district."
      : " Select a NER district and run the ML prediction."}

  </div>


  {/* =================================================
      MODEL NOTE
  ================================================= */}

  <div
    style={{
      marginTop: "12px",
      fontSize: "11px",
      color: "#64748b",
      lineHeight: 1.5,
    }}
  >
  </div>

</div>
{/* =================================================
    TRIP HISTORY
================================================= */}

{savedTrips.length > 0 && (

  <section className="trip-history-section">

    <div className="history-box">

      {/* HEADER */}
      <div className="box-heading">

        <div>
          <span>DELIVERY RECORDS</span>
          <h3>📋 Trip History</h3>
        </div>

        <div className="route-count-badge">
          {savedTrips.length} Saved
        </div>

      </div>


      {/* HISTORY LIST */}
      <div className="history-list">

        {savedTrips.map((trip) => (

          <div
            className="history-card"
            key={trip.id}
          >

            {/* =========================
                ROUTE INFORMATION
            ========================= */}

            <div className="history-main">

              <div className="history-route">

                <div className="history-location">
                  <span>FROM</span>
                  <strong>🚚 {trip.source}</strong>
                </div>

                <div className="route-arrow">
                  →
                </div>

                <div className="history-location">
                  <span>TO</span>
                  <strong>{trip.destination}</strong>
                </div>

              </div>


              {/* DETAILS */}

              <div className="history-details">

                <div className="history-detail-item">
                  <span>Vehicle</span>
                  <strong>{trip.vehicle}</strong>
                </div>

                <div className="history-detail-item">
                  <span>Distance</span>
                  <strong>{trip.distanceKm} km</strong>
                </div>

                <div className="history-detail-item">
                  <span>Cost</span>
                  <strong>
                    ₹{Number(trip.totalDeliveryCost || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="history-detail-item">
                  <span>Score</span>
                  <strong>{trip.score}/100</strong>
                </div>

                <div className="history-detail-item">
                  <span>Date</span>
                  <strong>{trip.date}</strong>
                </div>

              </div>

            </div>


            {/* =========================
                ACTIONS
            ========================= */}

            <div className="history-actions">

              <div className="status-control">

                <label>Status</label>

                <select
                  value={trip.status}
                  onChange={(e) =>
                    updateTripStatus(
                      trip.id,
                      e.target.value
                    )
                  }
                >
                  <option value="Planned">
                    📋 Planned
                  </option>

                  <option value="In Transit">
                    🚚 In Transit
                  </option>

                  <option value="Delivered">
                    ✅ Delivered
                  </option>
                </select>

              </div>


              <button
                type="button"
                className="pdf-button"
                onClick={() => generatePDF(trip)}
              >
                📄 Download Report
              </button>


              <button
                type="button"
                className="delete-button"
                onClick={() => deleteTrip(trip.id)}
              >
                🗑️ Delete Trip
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  </section>

)}


          

          </section>

      {/* =================================================
          FOOTER
      ================================================= */}
    </main>

      <footer className="main-footer">

        <strong>
          NER Logistics Intelligence Platform
        </strong>

        <span>
          • AI Route Optimization
          • Real-Time Vehicle Tracking
          • Smart Logistics Analytics
        </span>

      </footer>

    </div>
  );
}
export default App;
