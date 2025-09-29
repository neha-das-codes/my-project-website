import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc, 
  getDoc,
} from "firebase/firestore";
import AddMeetingLink from "../components/tutor/addmeetinglink";
import FeedbackForm from "../components/feedbackform";

const Dashboard = () => {
  const { profile } = useAuth();
  const [demoRequests, setDemoRequests] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [fullProfile, setFullProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [timeModification, setTimeModification] = useState({}); 

  // Tutor: load demo requests
  useEffect(() => {
    if (profile?.role === "tutor") {
      const q = query(
        collection(db, "demoRequests"),
        where("tutorId", "==", profile.uid)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setDemoRequests(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      });
      return () => unsub();
    }
  }, [profile]);

  // Enhanced handleStatusChange with optional time modification
  const handleStatusChange = async (id, status) => {
    try {
      const request = demoRequests.find(req => req.id === id);
      const modifiedTime = timeModification[id];
      
      // Update database
      const ref = doc(db, "demoRequests", id);
      if (status === "approved" && modifiedTime) {
        // If tutor modified the time
        await updateDoc(ref, { 
          status,
          modifiedTime: modifiedTime,
          originalTime: `${request.preferredDate} at ${request.preferredTime}`
        });
      } else {
        // Regular approval/rejection without time change
        await updateDoc(ref, { status });
      }
      
      // Update local state immediately
      setDemoRequests((prev) =>
        prev.map((req) => (req.id === id ? { 
          ...req, 
          status,
          ...(modifiedTime && { modifiedTime })
        } : req))
      );
      
      // Send email notification when demo is approved
      if (request && status === "approved") {
        const { sendDemoApprovedEmail } = await import("../components/auth/services/emailservice");
        
        const finalTime = modifiedTime || `${request.preferredDate} at ${request.preferredTime}`;
        const originalTime = `${request.preferredDate} at ${request.preferredTime}`;
        
        await sendDemoApprovedEmail({
          studentName: request.studentName,
          studentEmail: request.email,
          tutorName: profile.name,
          approvedTime: originalTime,
          modifiedTime: modifiedTime ? finalTime : null,
          extraNotes: modifiedTime 
            ? "The tutor has updated your demo session time. Please check the new schedule above."
            : "Your demo session has been confirmed with your requested time."
        });
        
        // Clear the time modification for this request
        setTimeModification(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }

      await getDoc(ref);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Function to fetch full profile data
  const fetchFullProfile = async () => {
    if (!profile?.uid) return;
    
    setLoadingProfile(true);
    try {
      const userDoc = await getDoc(doc(db, "users", profile.uid));
      if (userDoc.exists()) {
        setFullProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching full profile:", error);
      alert("Failed to load profile data");
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!profile) return <div className="p-6">Loading...</div>;
// ================== Student Dashboard ==================
  if (profile.role === "student") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {profile.name}! 👋
                </h1>
                <p className="text-teal-100">Ready to continue your learning journey?</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              to="/search"
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-teal-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">Find Tutors</h3>
                  <p className="text-sm text-gray-500">Search for expert tutors</p>
                </div>
              </div>
            </Link>

            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-green-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">Give Feedback</h3>
                  <p className="text-sm text-gray-500">Share your experience</p>
                </div>
              </div>
            </button>

            <Link
              to="/chat"
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">Chat</h3>
                  <p className="text-sm text-gray-500">Message your tutors</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Feedback Form */}
          {showFeedback && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Share Your Feedback</h2>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <FeedbackForm studentId={profile.uid} />
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Account created</p>
                    <p className="text-xs text-gray-500">Welcome to TeachHunt!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">Use specific search filters to find the perfect tutor for your needs</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">Book a demo class before committing to regular sessions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">Share feedback to help other students and improve our platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
// ================== Tutor Dashboard ==================
if (profile.role === "tutor") {
    const pendingCount = demoRequests.filter((req) => req.status === "pending").length;
    const approvedCount = demoRequests.filter((req) => req.status === "approved").length;
    const rejectedCount = demoRequests.filter((req) => req.status === "rejected").length;

    const nextDemo = demoRequests
      .filter((r) => r.status === "approved" && r.preferredDate)
      .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header - REMOVED TUTOR ID */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome, {profile.name}! 🎓
                </h1>
                <p className="text-teal-100">
                  Status: {profile.verified ? (
                    <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-sm font-medium">✓ Verified</span>
                  ) : (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-sm font-medium">⏳ Pending Verification</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{demoRequests.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Demo</p>
                  {nextDemo ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nextDemo.preferredDate}</p>
                      <p className="text-xs text-gray-500">{nextDemo.preferredTime}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">None scheduled</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demo Requests - SHOW BOTH PENDING AND APPROVED */}
<div className="lg:col-span-2">
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-xl font-bold text-gray-800">Demo Requests</h2>
      <p className="text-sm text-gray-500 mt-1">Manage your incoming demo requests</p>
    </div>
    <div className="p-6">
      {demoRequests.filter(req => req.status === "pending" || req.status === "approved").length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No demo requests</p>
          <p className="text-sm text-gray-400">New requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {demoRequests
            .filter(req => req.status === "pending" || req.status === "approved")
            .map((req) => (
            <div key={req.id} className={`border rounded-xl p-4 ${
              req.status === "approved" ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{req.studentName}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  req.status === "approved" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="font-medium">Email:</span> {req.email}</div>
                <div><span className="font-medium">Phone:</span> {req.phone}</div>
                <div><span className="font-medium">Class:</span> {req.classLevel}</div>
                <div><span className="font-medium">Mode:</span> {req.mode}</div>
                <div><span className="font-medium">Date:</span> {req.preferredDate}</div>
                <div><span className="font-medium">Time:</span> {req.preferredTime}</div>
              </div>

              {req.subjects && (
                <div className="mb-3">
                  <span className="font-medium text-sm">Subjects:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {req.subjects.map((subject, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {req.note && (
                <div className="mb-3">
                  <span className="font-medium text-sm">Note:</span>
                  <p className="text-sm text-gray-600 mt-1">{req.note}</p>
                </div>
              )}

              {/* Show meeting link if approved and available */}
              {req.status === "approved" && req.meetingLink && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-sm text-blue-800">Meeting Link:</span>
                  <div className="mt-2">
                    <button
                 onClick={() => window.open(req.meetingLink, '_blank')}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Demo Meeting
                    </button>
                  </div>
                </div>
              )}

              {/* Show time modification section only for pending requests */}
              {req.status === "pending" && (
                <>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        Student's Requested Time: {req.preferredDate} at {req.preferredTime}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Change Time (Optional - Leave empty to keep student's time)
                      </label>
                      <input
                        type="text"
                        value={timeModification[req.id] || ''}
                        onChange={(e) => setTimeModification(prev => ({
                          ...prev,
                          [req.id]: e.target.value
                        }))}
                        placeholder="e.g., 2025-09-30 at 2:00 PM"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {timeModification[req.id] 
                          ? `Will use your time: ${timeModification[req.id]}` 
                          : "Will use student's requested time if left empty"
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Only for pending */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(req.id, "approved")}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      {timeModification[req.id] ? 'Approve with My Time' : 'Approve (Student\'s Time)'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(req.id, "rejected")}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {/* Show approved status message */}
              {req.status === "approved" && (
                <div className="mt-3 p-2 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Demo approved and confirmed with student
                  </p>
                  {req.modifiedTime && (
                    <p className="text-xs text-green-700 mt-1">
                      Time was changed to: {req.modifiedTime}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Enhanced Profile Summary with Modal */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Profile Summary</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <p className="text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900 break-all">{profile.email}</p>
                  </div>
                  {profile.phone && (
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <p className="text-gray-900">{profile.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">Verification:</span>
                    <p className={profile.verified ? "text-green-600" : "text-yellow-600"}>
                      {profile.verified ? "✓ Verified" : "⏳ Pending"}
                    </p>
                  </div>
                </div>
                
                {/* View Full Profile Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      fetchFullProfile();
                      setShowProfileModal(true);
                    }}
                    className="w-full bg-teal-600 text-white text-center py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Full Profile
                  </button>
                </div>
              </div>

              {/* Meeting Links */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Meeting Links</h3>
                <AddMeetingLink tutorId={profile.uid} />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/chat"
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    💬 Chat with Students
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Modal */}
          {showProfileModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-t-2xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">Your Complete Profile</h3>
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setFullProfile(null);
                      }}
                      className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {loadingProfile ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading profile...</p>
                    </div>
                  ) : fullProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b border-gray-200 pb-2">Personal Information</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Name:</span>
                            <span className="text-gray-900">{fullProfile.name || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Email:</span>
                            <span className="text-gray-900 break-all">{fullProfile.email || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Phone:</span>
                            <span className="text-gray-900">{fullProfile.phone || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Role:</span>
                            <span className="text-gray-900 capitalize">{fullProfile.role || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Verified:</span>
                            <span className={fullProfile.verified ? "text-green-600" : "text-yellow-600"}>
                              {fullProfile.verified ? "✓ Verified" : "⏳ Pending"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">City:</span>
                            <span className="text-gray-900">{fullProfile.city || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Area:</span>
                            <span className="text-gray-900">{fullProfile.area || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Created:</span>
                            <span className="text-gray-900">
                              {fullProfile.createdAt ? new Date(fullProfile.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Teaching Details */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b border-gray-200 pb-2">Teaching Details</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Qualification:</span>
                            <span className="text-gray-900">{fullProfile.qualification || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Experience:</span>
                            <span className="text-gray-900">{fullProfile.experience || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Classes:</span>
                            <span className="text-gray-900">{fullProfile.classes || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Min Fee:</span>
                            <span className="text-gray-900">{fullProfile.minFee ? `₹${fullProfile.minFee}` : 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Max Fee:</span>
                            <span className="text-gray-900">{fullProfile.maxFee ? `₹${fullProfile.maxFee}` : 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Rating:</span>
                            <span className="text-gray-900">{fullProfile.rating || 0}/5 ({fullProfile.ratingCount || 0} reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subjects & Availability */}
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b border-gray-200 pb-2">Subjects & Availability</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-600 text-sm">Subjects:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {fullProfile.subjects && fullProfile.subjects.length > 0 ? (
                                fullProfile.subjects.map((subject, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {subject}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No subjects specified</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 text-sm">Board:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {fullProfile.board && fullProfile.board.length > 0 ? (
                                fullProfile.board.map((boardItem, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {boardItem}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No board specified</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 text-sm">Availability:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {fullProfile.availability && fullProfile.availability.length > 0 ? (
                                fullProfile.availability.map((avail, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                    {avail}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No availability specified</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 text-sm">Address:</span>
                            <p className="text-gray-900 text-sm mt-1">{fullProfile.address || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Failed to load profile data</p>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setFullProfile(null);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
// ================== Admin Dashboard ==================
if (profile.role === "admin") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Admin Dashboard 🔧
              </h1>
              <p className="text-teal-100">Manage your TeachHunt platform</p>
            </div>
           </div>
        </div>

        {/* Quick Actions - Chat replacing User Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin"
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">Admin Panel</h3>
                <p className="text-sm text-gray-500">Full admin controls</p>
              </div>
            </div>
          </Link>

          {/* Platform Stats */}
          <Link
            to="/admin#stats"
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Platform Stats</h3>
                <p className="text-sm text-gray-500">Monitor activity</p>
              </div>
            </div>
          </Link>

          {/* Chat - Replacing User Management */}
          <Link
            to="/chat"
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-green-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">Chat</h3>
                <p className="text-sm text-gray-500">Message users</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Admin Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Users</p>
                  <p className="text-lg font-bold text-blue-900">500+</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">Active Tutors</p>
                  <p className="text-lg font-bold text-green-900">150+</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-purple-800">Demo Sessions</p>
                  <p className="text-lg font-bold text-purple-900">2000+</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/admin"
                className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🔧 Access Full Admin Panel
              </Link>
              <Link 
                to="/admin#analytics"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📊 View Analytics
              </Link>
              <Link 
                to="/chat"
                className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                💬 Open Chat Interface
              </Link>
              <Link 
                to="/admin#settings"
                className="block w-full bg-orange-600 text-white text-center py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                ⚙️ System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  return null;
};

export default Dashboard;