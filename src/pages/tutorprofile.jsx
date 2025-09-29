import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import DemoRequestForm from "../components/demoreqform";
import MapComponent from "../components/mapcomponent";

export default function TutorProfile() {
  const { id } = useParams(); // tutor doc id in 'users'
  const [tutor, setTutor] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists() && snap.data().role === "tutor") {
        setTutor({ id: snap.id, ...snap.data() });
      }
    })();
  }, [id]);

  if (!tutor) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading tutor profile...</p>
      </div>
    </div>
  );

  const locationString = [tutor.area, tutor.city].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            className="text-teal-100 hover:text-white flex items-center gap-2 mb-4 transition-colors" 
            onClick={() => navigate(-1)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
          
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Tutor Profile</h1>
            <p className="text-teal-100">Connect with your perfect learning partner</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tutor Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{tutor.name}</h1>
                  <p className="text-lg text-gray-600 mb-4">{tutor.qualification || "Professional Tutor"}</p>
                  
                  {/* Verification Badge */}
                  {tutor.verified && (
                    <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Verified Tutor</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                {tutor.rating > 0 && (
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xl font-bold text-gray-900">{tutor.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-500">({tutor.ratingCount || 0} reviews)</p>
                  </div>
                )}
              </div>

              {/* Academic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Boards
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(tutor.board || []).map((board, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {board}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Classes
                  </h3>
                  <p className="text-gray-800 font-medium">{tutor.classes || "Not specified"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Experience
                  </h3>
                  <p className="text-gray-800 font-medium">{tutor.experience || "Not specified"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Availability
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {(tutor.availability || []).map((avail, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        {avail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Subjects Taught
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(tutor.subjects || []).map((subject, idx) => (
                    <span key={idx} className="px-3 py-2 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-200">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Fees Range
                </h3>
                <p className="text-2xl font-bold text-green-900">₹{tutor.minFee || 0} - ₹{tutor.maxFee || 0}</p>
                <p className="text-sm text-green-700">per session</p>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </h2>
              <p className="text-gray-600 mb-4 text-lg">{locationString || "Location not specified"}</p>

              {/* Map - only show if tutor has coordinates */}
              {tutor.lat && tutor.lng ? (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <MapComponent
                    center={{ lat: tutor.lat, lng: tutor.lng }}
                    zoom={15}
                    tutors={[tutor]}
                    height="300px"
                  />
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      * Approximate location for privacy. Exact address shared after demo booking.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Map location not available</p>
                  <p className="text-sm text-gray-500 mt-1">Precise location will be shared after demo booking</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Book a Demo Class</h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Get a free demo class to evaluate teaching style and compatibility.
              </p>
              
              <button
                onClick={() => setOpen(true)}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-xl hover:from-teal-700 hover:to-cyan-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all text-lg"
              >
                Request Demo Class
              </button>

              {/* Benefits */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free demo session</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No payment required</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Direct contact with tutor</span>
                </div>
                {tutor.availability?.includes("online") && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Online classes available</span>
                  </div>
                )}
                {tutor.availability?.includes("home") && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Home visits available</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Have questions? Contact details will be shared after demo booking for your privacy and security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Request Modal */}
      {open && (
        <DemoRequestForm 
          tutor={tutor} 
          onClose={() => setOpen(false)} 
        />
      )}
    </div>
  );
}