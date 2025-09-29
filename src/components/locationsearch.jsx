import React, { useState, useRef, useEffect } from "react";
import { geocodeAddress, isWithinServiceArea, AREA_BOUNDS, searchPlacesAndPOIs } from "../utils/locationutils";

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Enter location (Society, Area, Landmark)",
  value = "",
  className = "border p-2 rounded w-full",
  showAreaSuggestions = true
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [societySuggestions, setSocietySuggestions] = useState([]);
  const [poiSuggestions, setPOISuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showServiceAreaWarning, setShowServiceAreaWarning] = useState(false);
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  // Generate area suggestions based on query
  const generateAreaSuggestions = (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const matchingAreas = [];
    
    Object.entries(AREA_BOUNDS).forEach(([key, area]) => {
      const areaName = area.name.toLowerCase();
      if (areaName.includes(query) || query.includes(areaName.split(' ')[0])) {
        matchingAreas.push({
          id: `area-${key}`,
          display_name: `${area.name}, Mumbai, Maharashtra, India`,
          lat: area.center.lat,
          lng: area.center.lng,
          city: "Mumbai",
          area: area.name,
          type: 'area',
          category: 'Service Area',
          isServiceArea: true,
          priority: areaName.startsWith(query) ? 1 : 2
        });
      }
    });
    
    return matchingAreas.sort((a, b) => a.priority - b.priority);
  };

  const searchLocations = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      setAreaSuggestions([]);
      setSocietySuggestions([]);
      setPOISuggestions([]);
      return;
    }

    setLoading(true);
    setShowServiceAreaWarning(false);
    
    try {
      // Generate area suggestions first
      const areaResults = showAreaSuggestions ? generateAreaSuggestions(searchQuery) : [];
      setAreaSuggestions(areaResults);
      
      // Enhanced search with societies and POIs
      const searchResults = await searchPlacesAndPOIs(searchQuery);
      
      // Separate different types of results
      const societies = searchResults.filter(result => result.type === 'society');
      const pois = searchResults.filter(result => result.type === 'poi');
      const places = searchResults.filter(result => 
        result.type !== 'poi' && result.type !== 'area' && result.type !== 'society'
      );
      
      setSocietySuggestions(societies.slice(0, 4));
      setPOISuggestions(pois.slice(0, 3));
      setSuggestions(places.slice(0, 4));
      
      // Show warning if no results in service area
      const allResults = [...societies, ...pois, ...places];
      if (allResults.length > 0 && !allResults.some(r => r.isInServiceArea)) {
        setShowServiceAreaWarning(true);
      }
      
    } catch (error) {
      console.error("Location search failed:", error);
      setSuggestions([]);
      setPOISuggestions([]);
      setSocietySuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setShowServiceAreaWarning(false);

    // Debounce the search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setAreaSuggestions([]);
    setSocietySuggestions([]);
    setPOISuggestions([]);
    setShowServiceAreaWarning(false);
    
    // Call the callback with location data
    onLocationSelect({
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.display_name,
      city: suggestion.city,
      area: suggestion.area,
      locationText: suggestion.display_name,
      isServiceArea: suggestion.isServiceArea || suggestion.isInServiceArea,
      areaInfo: suggestion.isServiceArea ? 
        Object.values(AREA_BOUNDS).find(area => area.name === suggestion.area) : null,
      type: suggestion.type,
      category: suggestion.category
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const allSuggestions = [
        ...areaSuggestions, 
        ...societySuggestions, 
        ...poiSuggestions, 
        ...suggestions
      ];
      if (allSuggestions.length > 0) {
        handleSuggestionClick(allSuggestions[0]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const allSuggestions = [
    ...areaSuggestions, 
    ...societySuggestions, 
    ...poiSuggestions, 
    ...suggestions
  ];

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {showSuggestions && (allSuggestions.length > 0 || showServiceAreaWarning) && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto">
          
          {/* Service Area Warning */}
          {showServiceAreaWarning && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
              <div className="text-amber-800 text-sm">
                <strong>Outside Service Area</strong>
                <br />
                <span className="text-xs">We currently serve: Mira Road, Bhayander, Dahisar areas</span>
              </div>
            </div>
          )}
          
          {/* Area Suggestions (Priority) */}
          {areaSuggestions.length > 0 && (
            <>
              <div className="px-3 py-2 bg-green-50 border-b border-green-200">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Our Service Areas
                </span>
              </div>
              {areaSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-sm">
                    <div className="font-medium text-green-700 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {suggestion.area}
                    </div>
                    <div className="text-green-600 text-xs truncate mt-1">
                      Full coverage area • Premium service available
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Society Suggestions (High Priority) */}
          {societySuggestions.length > 0 && (
            <>
              <div className="px-3 py-2 bg-purple-50 border-b border-purple-200">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  Societies & Apartments
                </span>
              </div>
              {societySuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-sm">
                    <div className="font-medium text-purple-700 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      {suggestion.name}
                      <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                        Society
                      </span>
                    </div>
                    <div className="text-purple-600 text-xs truncate mt-1">
                      {suggestion.area}, {suggestion.city}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* POI Suggestions */}
          {poiSuggestions.length > 0 && (
            <>
              <div className="px-3 py-2 bg-blue-50 border-b border-blue-200">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Places & Landmarks
                </span>
              </div>
              {poiSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                    suggestion.isInServiceArea 
                      ? 'hover:bg-blue-50' 
                      : 'hover:bg-amber-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-sm">
                    <div className={`font-medium flex items-center ${
                      suggestion.isInServiceArea 
                        ? 'text-blue-700' 
                        : 'text-amber-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        suggestion.isInServiceArea 
                          ? 'bg-blue-500' 
                          : 'bg-amber-500'
                      }`}></span>
                      {suggestion.name || suggestion.area || "Place"}
                      {suggestion.category && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                          {suggestion.category}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs truncate mt-1 ${
                      suggestion.isInServiceArea 
                        ? 'text-blue-600' 
                        : 'text-amber-600'
                    }`}>
                      {suggestion.area}, {suggestion.city}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
          
          {/* Regular Location Suggestions */}
          {suggestions.length > 0 && (
            <>
              {(areaSuggestions.length > 0 || 
                societySuggestions.length > 0 || 
                poiSuggestions.length > 0) && (
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Other Locations
                  </span>
                </div>
              )}
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                    suggestion.isInServiceArea 
                      ? 'hover:bg-green-50' 
                      : 'hover:bg-amber-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-sm">
                    <div className={`font-medium flex items-center ${
                      suggestion.isInServiceArea 
                        ? 'text-green-700' 
                        : 'text-amber-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        suggestion.isInServiceArea 
                          ? 'bg-green-500' 
                          : 'bg-amber-500'
                      }`}></span>
                      {suggestion.area || suggestion.city || "Unknown Area"}
                      {!suggestion.isInServiceArea && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          Limited Service
                        </span>
                      )}
                    </div>
                    <div className={`text-xs truncate mt-1 ${
                      suggestion.isInServiceArea 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                    }`}>
                      {suggestion.display_name}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
          
          {/* No Results */}
          {!loading && allSuggestions.length === 0 && query.length >= 2 && (
            <div className="px-4 py-6 text-center text-gray-500">
              <div className="text-sm">No locations found for "{query}"</div>
              <div className="text-xs mt-1">
                Try: "Apna Ghar Phase 1", "Vinay Nagar", "Maxus Mall", or area names
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}