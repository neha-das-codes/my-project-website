// src/components/MapComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Rectangle, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { calculateDistance, generateRoutePoints, getOptimalBounds, SERVICE_AREA_BOUNDS, AREA_BOUNDS, searchPlacesAndPOIs } from "../utils/locationutils";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Enhanced custom icons with better visibility
const userLocationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png", // Blue user location
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'user-location-marker'
});

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Red destination marker
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
  className: 'destination-marker'
});

const tutorIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/201/201623.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  className: 'tutor-marker'
});

const societyIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1329/1329499.png", // Building icon for societies
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  className: 'society-marker'
});

// POI Icons for different categories
const POI_ICONS = {
  school: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3595/3595030.png",
    iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24]
  }),
  hospital: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1434/1434324.png",
    iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24]
  }),
  mall: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
    iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24]
  }),
  society: societyIcon,
  default: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22]
  })
};

// Component to fit bounds and show area boundaries
function MapController({ userLocation, destinationLocation, tutors, nearbyPOIs, showRouting }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    // Calculate bounds based on all markers
    const points = [];
    
    if (userLocation?.lat && userLocation?.lng) {
      points.push({ lat: userLocation.lat, lng: userLocation.lng });
    }
    
    if (destinationLocation?.lat && destinationLocation?.lng) {
      points.push({ lat: destinationLocation.lat, lng: destinationLocation.lng });
    }
    
    tutors.forEach(tutor => {
      if (tutor.lat && tutor.lng) {
        points.push({ lat: tutor.lat, lng: tutor.lng });
      }
    });

    if (nearbyPOIs && nearbyPOIs.length > 0) {
      nearbyPOIs.forEach(poi => {
        if (poi.lat && poi.lng) {
          points.push({ lat: poi.lat, lng: poi.lng });
        }
      });
    }
    
    if (points.length > 0) {
      const bounds = getOptimalBounds(points);
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      // Fit to service area
      map.fitBounds(SERVICE_AREA_BOUNDS, { padding: [20, 20] });
    }
  }, [map, userLocation, destinationLocation, tutors, nearbyPOIs]);
  
  return null;
}

// Enhanced routing component with multiple route display
function EnhancedRoutingLines({ userLocation, destinationLocation, tutors = [], showRouting = true }) {
  if (!showRouting || !userLocation?.lat || !userLocation?.lng) return null;
  
  return (
    <>
      {/* Main route from user to destination */}
      {destinationLocation?.lat && destinationLocation?.lng && (
        <>
          {/* Distance circle around user */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={1000} // 1km radius
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 1,
              dashArray: '3, 3'
            }}
          />
          
          {/* Main routing line */}
          <Polyline
            positions={generateRoutePoints(
              userLocation.lat, userLocation.lng,
              destinationLocation.lat, destinationLocation.lng,
              12 // More points for smoother curve
            )}
            pathOptions={{
              color: '#dc2626', // Red route line
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 5'
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>Route to Destination</strong>
                <br />
                <span className="text-lg font-bold text-red-600">
                  ~{calculateDistance(
                    userLocation.lat, userLocation.lng,
                    destinationLocation.lat, destinationLocation.lng
                  ).toFixed(1)} km
                </span>
                <br />
                <small>Approximate travel distance</small>
              </div>
            </Popup>
          </Polyline>
        </>
      )}

      {/* Routes to tutors */}
      {tutors.map((tutor) => {
        if (!tutor.lat || !tutor.lng) return null;
        
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          tutor.lat, tutor.lng
        );
        
        // Only show routing for tutors within reasonable distance
        if (distance > 15) return null;
        
        const routePoints = generateRoutePoints(
          userLocation.lat, userLocation.lng,
          tutor.lat, tutor.lng,
          8
        );
        
        // Color based on distance
        const getRouteColor = (dist) => {
          if (dist <= 3) return '#10b981'; // Green - very close
          if (dist <= 7) return '#f59e0b'; // Amber - moderate
          return '#ef4444'; // Red - far
        };
        
        return (
          <Polyline
            key={`route-tutor-${tutor.id}`}
            positions={routePoints}
            pathOptions={{
              color: getRouteColor(distance),
              weight: 2,
              opacity: 0.6,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>Route to {tutor.name}</strong>
                <br />
                <span className="text-lg font-bold text-blue-600">
                  ~{distance.toFixed(1)} km
                </span>
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </>
  );
}

// Component for POI markers with enhanced display
function POIMarkers({ pois = [], onPOIClick = null, showPOIs = true }) {
  if (!showPOIs || !pois || pois.length === 0) return null;
  
  return (
    <>
      {pois.map((poi, index) => {
        if (!poi.lat || !poi.lng) return null;
        
        const iconKey = poi.type === 'society' ? 'society' : 
                       (poi.category ? poi.category.toLowerCase() : 'default');
        const icon = POI_ICONS[iconKey] || POI_ICONS.default;
        
        return (
          <Marker
            key={poi.id || `poi-${index}`}
            position={[poi.lat, poi.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onPOIClick && onPOIClick(poi)
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-gray-800">
                    {poi.name}
                  </h3>
                  {poi.category && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      poi.type === 'society' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {poi.category}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-xs">
                  <p><strong>Area:</strong> {poi.area}</p>
                  <p><strong>City:</strong> {poi.city}</p>
                  {poi.isInServiceArea && (
                    <p className="text-green-600">
                      <strong>✓ In Service Area</strong>
                    </p>
                  )}
                </div>
                
                {onPOIClick && (
                  <button
                    onClick={() => onPOIClick(poi)}
                    className="mt-2 w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Set as Destination
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function MapComponent({ 
  center = { lat: 19.280, lng: 72.870 }, // Updated to Mira Road center
  zoom = 13,
  userLocation = null, // User's current location
  destinationLocation = null, // Selected destination (society, landmark, etc.)
  tutors = [],
  height = "400px",
  onTutorClick = null,
  onPOIClick = null,
  showAreaBounds = false,
  showRouting = true, // Enable routing by default
  showPOIs = true,
  nearbyPOIs = [],
  interactive = true,
  className = ""
}) {
  const mapRef = useRef();
  const [displayedPOIs, setDisplayedPOIs] = useState([]);
  const [loadingPOIs, setLoadingPOIs] = useState(false);

  // Auto-load POIs when destination is selected
  useEffect(() => {
    if (showPOIs && destinationLocation?.lat && !nearbyPOIs.length) {
      loadNearbyPOIs(destinationLocation);
    }
  }, [showPOIs, destinationLocation]);

  const loadNearbyPOIs = async (location) => {
    if (loadingPOIs) return;
    
    setLoadingPOIs(true);
    try {
      // Search for POIs around the destination
      const poiSearches = ['school', 'hospital', 'mall', 'restaurant', 'bank'];
      const allPOIs = [];
      
      for (const poiType of poiSearches.slice(0, 3)) {
        try {
          const results = await searchPlacesAndPOIs(poiType);
          const relevantPOIs = results.filter(result => 
            result.type === 'poi' && 
            calculateDistance(location.lat, location.lng, result.lat, result.lng) <= 3
          );
          allPOIs.push(...relevantPOIs.slice(0, 2));
        } catch (error) {
          console.warn(`Failed to search for ${poiType}:`, error);
        }
      }
      
      setDisplayedPOIs(allPOIs.slice(0, 10));
    } catch (error) {
      console.error('Failed to load nearby POIs:', error);
    } finally {
      setLoadingPOIs(false);
    }
  };

  const finalPOIs = nearbyPOIs.length > 0 ? nearbyPOIs : displayedPOIs;
  
  return (
    <div 
      style={{ height, width: "100%" }} 
      className={`relative ${className}`}
    >
      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        className="rounded-lg shadow-lg"
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />
        
        {/* Area boundaries */}
        {showAreaBounds && Object.entries(AREA_BOUNDS).map(([key, area]) => (
          <Rectangle
            key={key}
            bounds={area.bounds}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>{area.name}</strong>
                <br />
                <small>Service Area Coverage</small>
              </div>
            </Popup>
          </Rectangle>
        ))}
        
        {/* Enhanced routing lines */}
        <EnhancedRoutingLines 
          userLocation={userLocation}
          destinationLocation={destinationLocation}
          tutors={tutors}
          showRouting={showRouting}
        />

        {/* POI markers */}
        <POIMarkers 
          pois={finalPOIs}
          onPOIClick={onPOIClick}
          showPOIs={showPOIs}
        />
        
        {/* User location marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-center min-w-[180px]">
                <strong className="text-blue-600 text-lg">
                  📍 Your Location
                </strong>
                <br />
                <div className="mt-2 text-sm">
                  {userLocation.area && (
                    <div><strong>Area:</strong> {userLocation.area}</div>
                  )}
                  {userLocation.city && (
                    <div><strong>City:</strong> {userLocation.city}</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destinationLocation && destinationLocation.lat && destinationLocation.lng && (
          <Marker 
            position={[destinationLocation.lat, destinationLocation.lng]}
            icon={destinationLocation.type === 'society' ? societyIcon : destinationIcon}
            zIndexOffset={900}
          >
            <Popup>
              <div className="text-center min-w-[200px]">
                <strong className="text-red-600 text-lg">
                  🎯 {destinationLocation.name || 'Destination'}
                </strong>
                <br />
                <div className="mt-2 text-sm">
                  {destinationLocation.category && (
                    <div className="mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        destinationLocation.type === 'society' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {destinationLocation.category}
                      </span>
                    </div>
                  )}
                  <div><strong>Area:</strong> {destinationLocation.area}</div>
                  <div><strong>City:</strong> {destinationLocation.city}</div>
                  
                  {userLocation && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <strong>Distance:</strong> {' '}
                      <span className="font-bold text-red-600">
                        {calculateDistance(
                          userLocation.lat, userLocation.lng,
                          destinationLocation.lat, destinationLocation.lng
                        ).toFixed(1)} km
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Tutor markers - SIMPLIFIED WITHOUT POPUP */}
        {tutors.map((tutor) => {
          if (!tutor.lat || !tutor.lng) return null;
          
          let distance = null;
          if (userLocation?.lat && userLocation?.lng) {
            distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              tutor.lat, tutor.lng
            );
          }
          
          return (
            <Marker
              key={tutor.id}
              position={[tutor.lat, tutor.lng]}
              icon={destinationIcon}
              eventHandlers={{
                click: () => onTutorClick && onTutorClick(tutor)
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-red-600">
                      📍 {tutor.name}
                    </h3>
                    {distance && (
                      <span className={`text-sm font-bold px-2 py-1 rounded ${
                        distance <= 3 ? 'bg-green-100 text-green-700' :
                        distance <= 7 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {distance.toFixed(1)}km
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p><strong>📚 Class:</strong> {tutor.classes}</p>
                    <p><strong>📖 Subjects:</strong> {(tutor.subjects || []).slice(0,2).join(", ")}
                      {tutor.subjects?.length > 2 && '...'}
                    </p>
                    <p><strong>💰 Fees:</strong> ₹{tutor.minFee} - ₹{tutor.maxFee}</p>
                    <p><strong>📍 Area:</strong> {tutor.area}</p>
                  </div>
                  
                  {onTutorClick && (
                    <button
                      onClick={() => onTutorClick(tutor)}
                      className="mt-3 w-full bg-red-600 text-white text-sm py-2 px-3 rounded hover:bg-red-700 transition-colors"
                    >
                      View Profile & Book Demo
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Map controller for bounds and features */}
        <MapController 
          userLocation={userLocation}
          destinationLocation={destinationLocation}
          tutors={tutors}
          nearbyPOIs={finalPOIs}
          showRouting={showRouting}
        />
      </MapContainer>
      
      {/* Enhanced map legend */}
      {(showRouting || showAreaBounds || showPOIs) && (
        <div className="absolute top-2 right-2 bg-white p-3 rounded shadow-lg text-xs z-[1000] max-w-[160px]">
          {showRouting && (userLocation || destinationLocation) && (
            <div className="mb-2">
              <div className="font-semibold mb-1">Routes:</div>
              {destinationLocation && (
                <div className="flex items-center mb-1">
                  <div className="w-4 h-0.5 bg-red-600 mr-1"></div>
                  <span>To Destination</span>
                </div>
              )}
              <div className="flex items-center mb-1">
                <div className="w-4 h-0.5 bg-green-500 mr-1"></div>
                <span>≤ 3km</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-4 h-0.5 bg-amber-500 mr-1"></div>
                <span>3-7km</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-red-500 mr-1"></div>
                <span>7km+</span>
              </div>
            </div>
          )}
          {showPOIs && (
            <div className="text-gray-600 border-t pt-2">
              <div className="font-semibold">Nearby Places</div>
              <div className="text-xs mt-1">
                Schools, Hospitals, Malls
              </div>
              {loadingPOIs && (
                <div className="text-xs mt-1 text-blue-600">
                  Loading...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Distance info overlay */}
      {userLocation && destinationLocation && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg z-[1000]">
          <div className="text-sm">
            <strong>Distance to Destination:</strong>
            <br />
            <span className="text-lg font-bold text-red-600">
              {calculateDistance(
                userLocation.lat, userLocation.lng,
                destinationLocation.lat, destinationLocation.lng
              ).toFixed(1)} km
            </span>
          </div>
        </div>
      )}
    </div>
  );
}