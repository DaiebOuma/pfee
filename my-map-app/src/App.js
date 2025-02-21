"use client"

import { useState , useEffect, } from "react"
import "./App.css"
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents ,  GeoJSON} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import SearchBar from "./components/SearchBar"
import axios from "axios"


// Assume these imports are available
import iconUrl from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"

const customIcon = new L.Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})


const defaultPosition = [33.8869, 9.5375]
const defaultZoom = 6

// Define polygon coordinates for Kairouan, Sousse, and Beja
const kairouanCoords = [
  [35.6784, 10.0963],
  [35.6784, 10.1963],
  [35.7784, 10.1963],
  [35.7784, 10.0963],
]

const sousseCoords = [
  [35.8245, 10.537],
  [35.8245, 10.637],
  [35.9245, 10.637],
  [35.9245, 10.537],
]

const bejaCoords = [
  [36.7256, 9.1528],
  [36.7256, 9.2528],
  [36.8256, 9.2528],
  [36.8256, 9.1528],
]

// Define polygon coordinates for Tunis-Bizerte-Hammamet
const tunisBizerteHammametCoords = [
  [36.8065, 10.1815], // Tunis
  [37.0194, 9.6662], // Bizerte
  [36.4335, 10.6956], // Hammamet
]

// Define coordinates for Sfax, Mahdia, and Le Kef
const additionalCities = [
  { name: "Sfax", coords: [34.7406, 10.76] },
  { name: "Mahdia", coords: [35.5047, 11.0622] },
  { name: "Le Kef", coords: [36.168, 8.7096] },
]

// Define polygon coordinates for Tozeur-Kebili-Gafsa-Gabes
const southWestPolygonCoords = [
  [33.9197, 8.1336], // Tozeur
  [33.306445, 9.058228], // Kebili
  [33.8881, 10.0975], // Gabes
  [34.4311, 8.7861], // Gafsa
  
]


function ChangeView({ center, zoom }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

const getLocationInfo = async (lat, lon) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        format: "json",
        lat: lat,
        lon: lon,
      },
    })
    return response.data.display_name
  } catch (error) {
    console.error("Erreur lors de la récupération des informations du lieu:", error)
    return "Lieu inconnu"
  }
}

function ClickHandler({ setClickedPosition }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      const locationName = await getLocationInfo(lat, lng)
      setClickedPosition({ lat, lng, name: locationName })
    },
  })
  return null
}

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [clickedPosition, setClickedPosition] = useState(null)
  const [error, setError] = useState(null)
  const [points, setPoints] = useState([]);

  // api
const [shapes, setShapes] = useState(null);
useEffect(() => {
  axios.get("http://localhost:5000/api/shapes")
    .then(response => {
      console.log("✅ Données reçues :", response.data);

      // Séparer les polygones et les points
      const polygons = response.data.features.filter(f => f.geometry.type === "Polygon");
      const pointMarkers = response.data.features.filter(f => f.geometry.type === "Point");

      setShapes({ type: "FeatureCollection", features: polygons });
      setPoints(pointMarkers); // Stocke uniquement les points
    })
    .catch(error => {
      console.error("Erreur lors du chargement des shapes :", error);
    });
}, []);


  const resetMapState = () => {
    setSelectedLocation(null)
    setClickedPosition(null)
  }

  const locateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
        setError(null)
      },
      (err) => {
        console.error("Impossible d'obtenir la localisation", err)
        setError("Impossible d'obtenir votre position. Vérifiez les permissions de géolocalisation.")
        setUserLocation(null)
      },
    )
  }

  return (
    <div className="col1">
      <h1>📍 Recherche d'adresse en Tunisie</h1>
      <SearchBar onLocationSelect={setSelectedLocation} onSearchClear={resetMapState} />
      <button onClick={locateUser} className="maposition">
        📍 Ma Position
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="colmap">
        <MapContainer
          className="map"
          center={selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : defaultPosition}
          zoom={selectedLocation ? 13 : defaultZoom}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Affichage des polygones en GeoJSON */}
{shapes && <GeoJSON data={shapes} />}

{/* Affichage des points en tant que Markers */}
{points.map((point, index) => (
  <Marker 
    key={index} 
    position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]} 
    icon={customIcon}
  >
    <Popup>{point.properties.name}</Popup>
  </Marker>
))}

          <ChangeView
            center={selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : userLocation || defaultPosition}
            zoom={selectedLocation || userLocation ? 13 : defaultZoom}
          />
          <ClickHandler setClickedPosition={setClickedPosition} />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={customIcon}>
              <Popup>{selectedLocation.name}</Popup>
            </Marker>
          )}
          {userLocation && (
            <Marker position={userLocation} icon={customIcon}>
              <Popup>📍 Vous êtes ici</Popup>
            </Marker>
          )}
          {clickedPosition && (
            <Marker position={[clickedPosition.lat, clickedPosition.lng]} icon={customIcon}>
              <Popup>
                📌 {clickedPosition.name}
                <br />
                Latitude: {clickedPosition.lat.toFixed(6)} <br />
                Longitude: {clickedPosition.lng.toFixed(6)}
              </Popup>
            </Marker>
          )}
          <Polygon positions={kairouanCoords} color="red">
            <Popup>Kairouan</Popup>
          </Polygon>
          <Polygon positions={sousseCoords} color="green">
            <Popup>Sousse</Popup>
          </Polygon>
          <Polygon positions={bejaCoords} color="blue">
            <Popup>Beja</Popup>
          </Polygon>
          <Polygon positions={tunisBizerteHammametCoords} color="purple">
            <Popup>Tunis-Bizerte-Hammamet</Popup>
          </Polygon>
          <Polygon positions={southWestPolygonCoords} color="orange">
            <Popup>Tozeur-Kebili-Gabes-Gafsa</Popup>
          </Polygon>
          {additionalCities.map((city) => (
            <Marker key={city.name} position={city.coords} icon={customIcon}>
              <Popup>{city.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

