import React from "react";
import { useNavigate } from "react-router-dom";
import MapComponent from "./mapcomponent";

export default function TutorCard({ tutor, studentLocation = null, showDistance = false }) {
  const navigate = useNavigate();
  const locationString = [tutor.area, tutor.city].filter(Boolean).join(", ");
  
  // Calculate distance if both locations are available
  const distance = showDistance && studentLocation && tutor.lat && tutor.lng && studentLocation.lat && studentLocation.lng
    ? calculateDistance(studentLocation.lat, studentLocation.lng, tutor.lat, tutor.lng)
    : null;

  const handleTutorClick = (clickedTutor) => {
    navigate(`/tutor/${clickedTutor.id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6 cursor-pointer" onClick={() => navigate(`/tutor/${tutor.id}`)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-1">
              {tutor.name}
            </h2>
            <div className="flex items-center space-x-2 mb-2">
              {(tutor.board || []).map((board, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {board}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 font-medium">{tutor.classes}</p>
          </div>
          
          {/* Verified Badge */}
          {tutor.verified && (
            <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
          <div className="flex flex-wrap gap-1">
            {(tutor.subjects || []).slice(0, 4).map((subject, index) => (
              <span key={index} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-200">
                {subject}
              </span>
            ))}
            {(tutor.subjects || []).length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{(tutor.subjects || []).length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Location & Distance */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{locationString || "Location not specified"}</span>
          </div>
          {distance && (
            <div className="flex items-center space-x-1 mt-1">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-green-600 font-medium">{distance.toFixed(1)} km away</p>
            </div>
          )}
        </div>

        {/* Fee & Availability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-medium text-green-800 mb-1">Fees Range</p>
            <p className="text-sm font-bold text-green-900">₹{tutor.minFee ?? 0} - ₹{tutor.maxFee ?? 0}</p>
            <p className="text-xs text-green-700">per session</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs font-medium text-purple-800 mb-1">Availability</p>
            <div className="flex flex-wrap gap-1">
              {(tutor.availability || []).slice(0, 2).map((avail, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {avail}
                </span>
              ))}
              {(tutor.availability || []).length > 2 && (
                <span className="text-xs text-purple-600">+{(tutor.availability || []).length - 2}</span>
              )}
            </div>
          </div>
        </div>

        {/* Experience & Rating */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{tutor.experience || "Experience not specified"}</span>
          </div>
          
          {tutor.rating > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-600 font-medium">{tutor.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]">
          View Profile & Book Demo
        </button>
      </div>

      {/* Map - only show if tutor has coordinates */}
      {tutor.lat && tutor.lng && (
        <div className="border-t border-gray-100">
          <MapComponent
            center={{ lat: tutor.lat, lng: tutor.lng }}
            zoom={14}
            tutors={[tutor]}
            studentLocation={studentLocation}
            height="180px"
            onTutorClick={handleTutorClick}
          />
        </div>
      )}
    </div>
  );
}

// Helper function to calculate distance
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