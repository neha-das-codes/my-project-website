// src/utils/locationUtils.js

// Corrected area boundaries with accurate coordinates
export const AREA_BOUNDS = {
  MIRA_ROAD_EAST: {
    name: "Mira Road East",
    bounds: [
      [19.270, 72.870], // Southwest
      [19.290, 72.890]  // Northeast
    ],
    center: { lat: 19.280, lng: 72.880 },
    landmarks: [ "Cosmopolitan School", "Xavier School", "Mira Road Station", "Shanti Shopping Centre", "Ghodbunder Road" ]
  },
  BHAYANDER_WEST: {
    name: "Bhayander West", 
    bounds: [
      [19.295, 72.845],
      [19.315, 72.865]
    ],
    center: { lat: 19.305, lng: 72.855 },
    landmarks: ["Maxus Mall"]
  },
  BHAYANDER_EAST: {
    name: "Bhayander East",
    bounds: [
      [19.295, 72.865], 
      [19.315, 72.885]
    ],
    center: { lat: 19.305, lng: 72.875 },
    landmarks: ["Bhayander East Station"]
  },
  DAHISAR_EAST: {
    name: "Dahisar East",
    bounds: [
      [19.250, 72.860],
      [19.270, 72.880] 
    ],
    center: { lat: 19.260, lng: 72.870 },
    landmarks: ["Dahisar Station", "Dahisar Check Naka", "Link Road"]
  },
  DAHISAR_WEST: {
    name: "Dahisar West",
    bounds: [
      [19.250, 72.840],
      [19.270, 72.860]
    ],
    center: { lat: 19.260, lng: 72.850 },
    landmarks: ["BhavdeviTemple", "Zen Garden"]
  }
};

// Combined bounds for all covered areas
export const SERVICE_AREA_BOUNDS = [
  [19.245, 72.835], // Southwest corner
  [19.320, 72.890]  // Northeast corner
];

// Comprehensive database with societies, apartments, and landmarks
const COMPREHENSIVE_PLACES_DATABASE = {
  "mira road east": {
    // Societies and Apartments
    societies: [
      { name: "Apna Ghar Phase 1", area: "Ghodbunder", lat: 19.2801, lng: 72.8785 },
      { name: "Apna Ghar Phase 2", area: "Ghodbunder", lat: 19.2805, lng: 72.8790 },
      { name: "Ramdev Ritu Heights", area: "Vinay Nagar", lat: 19.2800, lng: 72.8780 },
      { name: "Royal Crest CHS", area: "Beverly Park", lat: 19.3048, lng: 72.8662 },
      { name: "Sonam Indraprasth", area: "Golden Nest", lat: 19.2991,lng: 72.8624 },
      { name: "Vishal Co-operative Housing Society", area: "Silver Park", lat:19.2810,lng: 72.8726},
      { name: "Iraisa Co.op Housing Society", area: "Kanakia ", lat:19.2922,lng: 72.8711 }
    ],
    // Schools and landmarks
    schools: [
      { name: "Cosmopolitan School", lat: 19.2790, lng: 72.8770 },
      { name: "Xavier School", lat: 19.2810, lng: 72.8790 }
    ],
    hospitals: [
      { name: "Wockhardt Hospital", lat: 19.2805, lng: 72.8785 }
    ],
    malls: [
      { name: "Shanti Shopping Centre", lat: 19.2785, lng: 72.8765 }
    ],
    transport: [
      { name: "Mira Road Station", lat: 19.2750, lng: 72.8750 }
    ]
  },
  "bhayander west": {
    societies: [
      { name: "Porwal Complex", area: "Bhayander West", lat: 19.3007, lng: 72.8520 },
      { name: "Vrindavan Building", area: "Bhayander West", lat: 19.2964, lng: 72.8490 },
      { name: "Salasar Srushti", area: "Bhayander West", lat: 19.3001 ,lng: 72.8481 }
    ],
    schools: [
      { name: "Ryan International School", lat: 19.3045, lng: 72.8545 },
      { name: "MET School", lat: 19.3055, lng: 72.8555 }
    ],
    hospitals: [
      { name: "Criticare Hospital", lat: 19.3025, lng: 72.8525 }
    ],
    malls: [
      { name: "Maxus Mall", lat: 19.2825, lng: 72.8805 }
    ],
    transport: [
      { name: "Bhayander Station", lat: 19.3015, lng: 72.8515 },
    ],
    temples: [
      { name: "Shree Datta Mandir", lat: 19.3020, lng: 72.8520 }
    ]
  },
  "bhayander east": {
    societies: [
      { name: "Sonam Heights", area: "Bhayander East", lat: 19.3009,lng: 72.8653 },
      { name: "Sonam Srivilas,Phase 15", area: "Bhayander East", lat: 19.3002, lng:72.8649},
      { name: "Mahadev Nagar", area: "Bhayander East", lat: 19.3101, lng: 72.8626},
      ],
    schools: [
      { name: "Blossomms High School & Jr. College", lat: 19.3043,lng: 72.8553}
    ],
    hospitals: [
      { name: "Indralok Multispeciality Hospital", lat:19.3025,lng: 72.8633  }
      
    ],
    transport: [
      { name: "Bhayander East Station", lat: 19.3050, lng: 72.8730 }
    ]
  },
  "dahisar east": {
    societies: [
      { name: "Shree Vallabh Nagar", area: "Dahisar East", lat: 19.2580, lng: 72.8680 },
      { name: "Ganesh Nagar", area: "Dahisar East", lat: 19.2620, lng: 72.8720 }
    ],
    schools: [
      { name: "Podar School", lat: 19.2590, lng: 72.8690 }
    ],
    hospitals: [
      { name: "Samarpan Hospital", lat:19.2532, lng:72.8645 }
    ],
    transport: [
      { name: "Dahisar Station", lat: 19.2550, lng: 72.8650 },
      { name: "Dahisar Check Naka", lat: 19.2570, lng: 72.8670 }
    ]
  },
  "dahisar west": {
    societies: [
      { name: "Dahivali Society", area: "Dahisar West", lat:19.2558, lng:72.8534 },
      { name: "Rustomjee Royale CHS", area: "Dahisar West", lat: 19.2425,lng: 72.8585}
    ],
    landmarks: [
      { name: "Zen Garden", lat: 19.2618,lng: 72.8505 },
      { name: "Bhavdevi Temple", lat:19.2568, lng:72.8532 }
    ]
  }
};

// Enhanced search that includes societies and apartments
export const searchPlacesAndPOIs = async (searchQuery) => {
  if (!searchQuery || searchQuery.length < 2) return [];
  
  try {
    const results = [];
    const query = searchQuery.toLowerCase();
    
    // First, search comprehensive local database (societies, apartments, landmarks)
    const localResults = findComprehensivePlaces(query);
    results.push(...localResults);
    
    // Then search via Nominatim for broader results
    if (localResults.length < 3) { // Only search Nominatim if few local results
      const nominatimResults = await searchNominatim(searchQuery);
      results.push(...nominatimResults);
    }
    
    // Remove duplicates and sort by relevance
    const uniqueResults = removeDuplicates(results);
    return sortByRelevance(uniqueResults, query);
    
  } catch (error) {
    console.error("Enhanced search failed:", error);
    return [];
  }
};

// Search comprehensive places database
const findComprehensivePlaces = (searchQuery) => {
  const results = [];
  const query = searchQuery.toLowerCase();
  
  Object.entries(COMPREHENSIVE_PLACES_DATABASE).forEach(([areaKey, categories]) => {
    const areaInfo = AREA_BOUNDS[areaKey.toUpperCase().replace(/ /g, '_')];
    if (!areaInfo) return;
    
    Object.entries(categories).forEach(([category, places]) => {
      places.forEach(place => {
        const placeName = place.name.toLowerCase();
        const placeArea = place.area ? place.area.toLowerCase() : '';
        
        // Check for matches in name or area
        if (placeName.includes(query) || 
            query.includes(placeName.split(' ')[0]) ||
            placeArea.includes(query) ||
            isPartialMatch(query, placeName)) {
          
          results.push({
            id: `local-${areaKey}-${place.name.replace(/\s+/g, '-')}`,
            name: place.name,
            display_name: `${place.name}, ${place.area || areaInfo.name}, Mumbai, Maharashtra, India`,
            lat: place.lat,
            lng: place.lng,
            city: "Mumbai",
            area: place.area || areaInfo.name,
            type: category === 'societies' ? 'society' : 'poi',
            category: getCategoryLabel(category),
            isInServiceArea: true,
            isLocalMatch: true,
            priority: getMatchPriority(query, placeName)
          });
        }
      });
    });
  });
  
  return results;
};

// Get category label
const getCategoryLabel = (category) => {
  const labels = {
    societies: 'Society',
    schools: 'School',
    hospitals: 'Hospital',
    malls: 'Mall',
    transport: 'Transport',
    temples: 'Temple',
    landmarks: 'Landmark'
  };
  return labels[category] || 'Place';
};

// Search via Nominatim API (only when needed)
const searchNominatim = async (searchQuery) => {
  const results = [];
  
  // More focused search queries
  const searchQueries = [
    `${searchQuery}, Mumbai, Maharashtra, India`,
    `${searchQuery}, Mira Road, Mumbai`,
    `${searchQuery}, Bhayander, Mumbai`
  ];

  for (const query of searchQueries.slice(0, 2)) { // Limit API calls
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=3&countrycodes=in&addressdetails=1&bounded=1&viewbox=72.83,19.32,72.89,19.24`
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        data.forEach(result => {
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          if (lat && lng && isWithinServiceArea(lat, lng)) {
            results.push({
              id: result.place_id || `nominatim-${Date.now()}-${Math.random()}`,
              name: extractNameFromNominatim(result),
              display_name: result.display_name,
              lat,
              lng,
              city: extractCityFromNominatim(result),
              area: extractAreaFromNominatim(result),
              type: 'nominatim',
              category: 'Place',
              isInServiceArea: true,
              isLocalMatch: false,
              priority: 3
            });
          }
        });
      }
    } catch (error) {
      console.warn("Nominatim search failed for:", query, error);
    }
  }
  
  return results;
};

// Enhanced geocoding with society support
export const geocodeAddress = async (address) => {
  if (!address) return null;
  
  try {
    const searchQuery = address.toLowerCase();
    
    // First, try comprehensive local search
    const localMatches = findComprehensivePlaces(searchQuery);
    if (localMatches.length > 0) {
      const bestMatch = localMatches[0];
      return {
        lat: bestMatch.lat,
        lng: bestMatch.lng,
        formatted_address: bestMatch.display_name,
        city: bestMatch.city,
        area: bestMatch.area,
        areaInfo: getAreaInfo(bestMatch.lat, bestMatch.lng),
        isLocalMatch: true
      };
    }

    // Fallback to Nominatim
    const nominatimResults = await searchNominatim(address);
    if (nominatimResults.length > 0) {
      const bestMatch = nominatimResults[0];
      return {
        lat: bestMatch.lat,
        lng: bestMatch.lng,
        formatted_address: bestMatch.display_name,
        city: bestMatch.city,
        area: bestMatch.area,
        areaInfo: getAreaInfo(bestMatch.lat, bestMatch.lng)
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};

// Helper functions
const isPartialMatch = (query, text) => {
  if (query.length < 3) return false;
  
  const queryWords = query.split(' ');
  const textWords = text.split(' ');
  
  return queryWords.some(qWord => 
    textWords.some(tWord => 
      tWord.startsWith(qWord) || qWord.startsWith(tWord) || 
      (qWord.length > 2 && tWord.includes(qWord)) ||
      (tWord.length > 2 && qWord.includes(tWord))
    )
  );
};

const getMatchPriority = (query, text) => {
  const textLower = text.toLowerCase();
  
  if (textLower === query) return 1; // Exact match
  if (textLower.startsWith(query)) return 2; // Starts with
  if (textLower.includes(query)) return 3; // Contains
  
  // Check word matches
  const queryWords = query.split(' ');
  const textWords = textLower.split(' ');
  
  for (const qWord of queryWords) {
    for (const tWord of textWords) {
      if (tWord.startsWith(qWord) || qWord.startsWith(tWord)) {
        return 4; // Word match
      }
    }
  }
  
  return 5; // Weak match
};

const removeDuplicates = (results) => {
  const seen = new Set();
  return results.filter(result => {
    const key = `${result.lat.toFixed(4)}-${result.lng.toFixed(4)}-${result.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const sortByRelevance = (results, query) => {
  return results.sort((a, b) => {
    // Societies and local matches first
    if (a.isLocalMatch !== b.isLocalMatch) {
      return a.isLocalMatch ? -1 : 1;
    }
    
    // Society type priority
    if (a.type === 'society' && b.type !== 'society') return -1;
    if (b.type === 'society' && a.type !== 'society') return 1;
    
    // Then by priority
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    return 0;
  });
};

const extractNameFromNominatim = (result) => {
  if (result.namedetails && result.namedetails.name) {
    return result.namedetails.name;
  }
  
  const address = result.address || {};
  return address.amenity || address.shop || address.name || 
         address.suburb || address.neighbourhood || 'Place';
};

const extractCityFromNominatim = (data) => {
  const address = data.address || {};
  return address.city || address.town || address.village || address.municipality || "Mumbai";
};

const extractAreaFromNominatim = (data) => {
  const address = data.address || {};
  return address.suburb || address.neighbourhood || address.residential || 
         address.quarter || address.district || "";
};

// Existing utility functions
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=in&addressdetails=1`
    );
    
    const data = await response.json();
    
    if (data) {
      return {
        formatted_address: data.display_name,
        city: extractCityFromNominatim(data),
        area: extractAreaFromNominatim(data),
        areaInfo: getAreaInfo(lat, lng)
      };
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
};

export const isWithinServiceArea = (lat, lng) => {
  const [southwest, northeast] = SERVICE_AREA_BOUNDS;
  return lat >= southwest[0] && lat <= northeast[0] && 
         lng >= southwest[1] && lng <= northeast[1];
};

export const getAreaInfo = (lat, lng) => {
  for (const [key, area] of Object.entries(AREA_BOUNDS)) {
    const [southwest, northeast] = area.bounds;
    if (lat >= southwest[0] && lat <= northeast[0] && 
        lng >= southwest[1] && lng <= northeast[1]) {
      return area;
    }
  }
  return null;
};

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1.3;
};

export const generateRoutePoints = (startLat, startLng, endLat, endLng, numPoints = 5) => {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    const lat = startLat + (endLat - startLat) * ratio;
    const lng = startLng + (endLng - startLng) * ratio;
    points.push([lat, lng]);
  }
  return points;
};

export const getOptimalBounds = (points) => {
  if (!points || points.length === 0) return SERVICE_AREA_BOUNDS;
  
  let minLat = points[0].lat || points[0][0];
  let maxLat = minLat;
  let minLng = points[0].lng || points[0][1]; 
  let maxLng = minLng;
  
  points.forEach(point => {
    const lat = point.lat || point[0];
    const lng = point.lng || point[1];
    
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });
  
  const latPadding = (maxLat - minLat) * 0.1 || 0.01;
  const lngPadding = (maxLng - minLng) * 0.1 || 0.01;
  
  return [
    [minLat - latPadding, minLng - lngPadding],
    [maxLat + latPadding, maxLng + lngPadding]
  ];
};

export const SERVICE_AREA_CENTER = {
  lat: 19.280,
  lng: 72.870
};

export const DEFAULT_SEARCH_RADIUS = 15;