import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import SearchFilters from "../components/searchfilters";
import TutorCard from "../components/tutorcard";
import MapComponent from "../components/mapcomponent";
import { useNavigate } from "react-router-dom";

// Add this helper function if it's missing from locationutils
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function SearchPage() {
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const navigate = useNavigate();

  useEffect(() => {
    if (!filters) return; // don't fetch until filters are set

    const fetchTutors = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "tutor"),
          where("verified", "==", true)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const filtered = list.filter((t) => {
          // Enhanced class filtering to handle ranges like "Secondary (6-10)"
          if (filters.classes) {
            let classMatch = false;
            
            if (t.classes === filters.classes) {
              // Exact match
              classMatch = true;
            } else if (t.classes && typeof t.classes === 'string') {
              // Handle ranges like "Secondary (6-10)", "Primary (1-5)"
              const classStr = t.classes.toLowerCase();
              const searchClass = filters.classes.toLowerCase();
              
              // Extract numbers from tutor's class range
              const rangeMatch = classStr.match(/\((\d+)-(\d+)\)/);
              if (rangeMatch) {
                const minClass = parseInt(rangeMatch[1]);
                const maxClass = parseInt(rangeMatch[2]);
                const searchClassNum = parseInt(searchClass);
                
                // Check if searched class is within the range
                if (searchClassNum >= minClass && searchClassNum <= maxClass) {
                  classMatch = true;
                }
              }
              
              // Also check for direct mentions
              if (classStr.includes(searchClass) || searchClass.includes(classStr)) {
                classMatch = true;
              }
            }
            
            if (!classMatch) return false;
          }
          
          // Board filter
          if (filters.board && !(t.board || []).includes(filters.board)) return false;
          
          // Multiple subjects filter - tutor should have at least one selected subject
          if (filters.subjects && filters.subjects.length > 0) {
            const tutorSubjects = t.subjects || [];
            const hasMatchingSubject = filters.subjects.some(subject => 
              tutorSubjects.includes(subject)
            );
            if (!hasMatchingSubject) return false;
          }

          // Enhanced location-based filtering with better regional matching
          if (filters.lat && filters.lng && t.lat && t.lng) {
            // Use precise distance calculation
            const distance = calculateDistance(filters.lat, filters.lng, t.lat, t.lng);
            if (distance > (filters.radius || 10)) return false;
          } else if (filters.city || filters.area || filters.locationText) {
            // Enhanced text-based regional search
            let locationMatch = false;
            
            // Clean and normalize location terms for better matching
            const normalizeLocation = (str) => {
              if (!str) return '';
              return str.toLowerCase()
                .replace(/[^\w\s]/g, ' ') // Remove special characters
                .replace(/\s+/g, ' ')     // Normalize spaces
                .trim();
            };
            
            // Get all possible search terms
            const searchTerms = [];
            
            if (filters.locationText) {
              // Split by common separators and clean each part
              const parts = filters.locationText.split(/[,\-\(\)]/);
              parts.forEach(part => {
                const cleaned = normalizeLocation(part);
                if (cleaned.length > 2) {
                  searchTerms.push(cleaned);
                  // Also add individual words for better matching
                  cleaned.split(' ').forEach(word => {
                    if (word.length > 2) searchTerms.push(word);
                  });
                }
              });
            }
            
            if (filters.city) searchTerms.push(normalizeLocation(filters.city));
            if (filters.area) searchTerms.push(normalizeLocation(filters.area));
            
            // Get tutor location fields (normalized)
            const tutorLocationFields = [
              normalizeLocation(t.city),
              normalizeLocation(t.area), 
              normalizeLocation(t.address)
            ].filter(field => field.length > 0);
            
            // Check for matches with partial string matching
            locationMatch = searchTerms.some(searchTerm =>
              tutorLocationFields.some(tutorField => {
                // Check if either contains the other (partial match)
                return tutorField.includes(searchTerm) || 
                       searchTerm.includes(tutorField) ||
                       // Word-by-word matching for better results
                       tutorField.split(' ').some(word => 
                         word.includes(searchTerm) || searchTerm.includes(word)
                       );
              })
            );
            
            if (!locationMatch) return false;
          }

          // Fee range filtering
          const min = parseInt(filters.minFee || 0, 10);
          const max = parseInt(filters.maxFee || 0, 10);
          const tMin = parseInt(t.minFee || 0, 10);
          const tMax = parseInt(t.maxFee || 0, 10);
          if (filters.minFee && tMax < min) return false;
          if (filters.maxFee && tMin > max) return false;

          return true;
        });

        // Sort by distance if location search is active
        if (filters.lat && filters.lng) {
          filtered.sort((a, b) => {
            if (!a.lat || !a.lng) return 1;
            if (!b.lat || !b.lng) return -1;
            
            const distA = calculateDistance(filters.lat, filters.lng, a.lat, a.lng);
            const distB = calculateDistance(filters.lat, filters.lng, b.lat, b.lng);
            return distA - distB;
          });
        }

        setTutors(filtered);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [filters]);

  const handleTutorClick = (tutor) => {
    navigate(`/tutor/${tutor.id}`);
  };

  const studentLocation = filters && filters.lat && filters.lng 
    ? { lat: filters.lat, lng: filters.lng, address: filters.locationText }
    : null;

  // Get tutors with coordinates for map view
  const mappableTutors = tutors.filter(t => t.lat && t.lng);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Perfect Tutor</h1>
            <p className="text-teal-100">Connect with verified tutors for personalized learning</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left column - search form */}
          <div className="lg:col-span-1">
            <SearchFilters onFilterChange={setFilters} />
            
            {/* View Mode Toggle */}
            {tutors.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">View Options</h3>
                <div className="flex rounded-lg border overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                      viewMode === "list" 
                        ? "bg-teal-600 text-white" 
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>List</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                      viewMode === "map" 
                        ? "bg-teal-600 text-white" 
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    disabled={mappableTutors.length === 0}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Map</span>
                    </div>
                  </button>
                </div>
                
                {mappableTutors.length === 0 && tutors.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Map view unavailable - tutors don't have location coordinates
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right column - results */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600 font-medium">Finding the best tutors for you...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            )}

            {!loading && tutors.length === 0 && filters && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No tutors found</h3>
                <p className="text-gray-600 mb-4">No tutors match your current search criteria.</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Try:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Widening your search radius</li>
                    <li>Adjusting your fee range</li>
                    <li>Selecting different subjects or boards</li>
                    <li>Searching in nearby areas</li>
                  </ul>
                </div>
              </div>
            )}

            {!loading && !filters && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Your Tutor Search</h3>
                <p className="text-gray-600">Use the search filters to find qualified tutors in your area.</p>
              </div>
            )}

            {/* Results */}
            {!loading && tutors.length > 0 && (
              <div>
                {/* Results Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        Found {tutors.length} qualified tutor{tutors.length !== 1 ? 's' : ''}
                      </h2>
                      {filters.locationText && (
                        <p className="text-sm text-gray-600 mt-1">
                          Near {filters.locationText}
                        </p>
                      )}
                    </div>
                    {studentLocation && (
                      <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-green-600 font-medium">Showing distances</p>
                      </div>
                    )}
                  </div>
                </div>

                {viewMode === "list" && (
                  <div className="space-y-6">
                    {tutors.map((t) => (
                      <TutorCard 
                        key={t.id} 
                        tutor={t} 
                        studentLocation={studentLocation}
                        showDistance={Boolean(studentLocation)}
                      />
                    ))}
                  </div>
                )}

                {viewMode === "map" && mappableTutors.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">
                        Tutors on Map ({mappableTutors.length} of {tutors.length} shown)
                      </h3>
                      <p className="text-sm text-gray-500">Click on markers to view tutor details</p>
                    </div>
                    <MapComponent
                      center={studentLocation || { lat: 19.0760, lng: 72.8777 }}
                      zoom={studentLocation ? 12 : 11}
                      tutors={mappableTutors}
                      studentLocation={studentLocation}
                      height="600px"
                      onTutorClick={handleTutorClick}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}