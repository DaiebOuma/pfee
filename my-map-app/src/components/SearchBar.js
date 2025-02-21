"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const SearchBar = ({ onLocationSelect, onSearchClear }) => {
  const [query, setQuery] = useState("")
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 3) {
      setLocations([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: query, format: "json", countrycodes: "TN", addressdetails: 1 },
        })
        setLocations(data.slice(0, 5))
      } catch (error) {
        console.error("Erreur de recherche :", error)
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const clearSearch = () => {
    setQuery("")
    setLocations([])
    onSearchClear()
  }

  return (
    <div className="barre-rech">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Tapez une adresse..."
        className="placehold"
      />
      {query && (
        <button onClick={clearSearch} className="btnpos">
          ❌
        </button>
      )}
      {loading && <p className="chargement">Chargement...</p>}
      {locations.length > 0 && (
        <ul className="ul">
          {locations.map((loc, index) => (
            <li
              className="separation"
              key={index}
              onClick={() => {
                onLocationSelect({ lat: loc.lat, lon: loc.lon, name: loc.display_name })
                setQuery(loc.display_name)
                setLocations([])
              }}
            >
              <strong>{loc.display_name}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar

