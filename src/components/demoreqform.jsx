import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { sendDemoRequestEmails } from "./auth/services/emailservice";
import LocationSearch from "./locationsearch";

export default function DemoRequestForm({ tutor, onClose }) {
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [classLevel, setClassLevel] = useState(""); 
  const [exam, setExam] = useState(""); 
  const [subjects, setSubjects] = useState(""); 
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("online");
  const [note, setNote] = useState("");
  const [location, setLocation] = useState({
    address: "",
    city: "",
    area: "",
    lat: null,
    lng: null
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleLocationSelect = (locationData) => {
    setLocation(locationData);
  };
 const submit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      navigate("/signin");
      return;
    }
    setSaving(true);
    try {
      const demoData = {
        studentId: auth.currentUser.uid,
        tutorId: tutor.id,
        tutorName: tutor.name || "",
        studentName,
        email,
        phone,
        classLevel,
        exam,
        subjects: subjects.split(",").map((s) => s.trim()),
        preferredDate: date,
        preferredTime: time,
        mode,
        note,
        status: "pending",
        createdAt: serverTimestamp(),
      };
// Add location data only for home tuition
      if (mode === "home" && location.address) {
        demoData.studentLocation = {
          address: location.address,
          city: location.city,
          area: location.area,
          lat: location.lat,
          lng: location.lng
        };
      }
     await addDoc(collection(db, "demoRequests"), demoData);
     // Send emails to both tutor and student
      await sendDemoRequestEmails({
        studentName,
        studentEmail: email,
        tutorName: tutor.name,
        tutorEmail: tutor.email,
        demoTime: `${date} at ${time}`,
        classLevel,
        exam,
        subjects: subjects.split(",").map((s) => s.trim()),
        mode,
        note,
        studentLocation: mode === "home" ? location.address : null
      });
    alert("Demo request sent successfully! You will receive a confirmation email shortly.");
      onClose();
    } catch (error) {
      console.error("Error submitting demo request:", error);
      alert("Failed to send demo request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Request Demo Class</h3>
              <p className="text-teal-100">Book a free demo session with {tutor.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={submit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Academic Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class/Grade</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                  >
                    <option value="">Select your class</option>
                    {[
                      "Nursery","KG","1","2","3","4","5","6",
                      "7","8","9","10","11","12"
                    ].map((cls) => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Competitive Exam (Optional)</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                  >
                    <option value="">Select exam (if any)</option>
                    <option value="JEE">JEE Main/Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="CET">State CET</option>
                    <option value="CBSE Board">CBSE Board</option>
                    <option value="State Board">State Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Needed *</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple subjects with commas</p>
              </div>
            </div>

            {/* Session Details Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Session Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Mode *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="mode"
                      value="online"
                      checked={mode === "online"}
                      onChange={(e) => setMode(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      mode === "online" 
                        ? "border-teal-500 bg-teal-50 text-teal-700" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Online</span>
                      </div>
                      <p className="text-sm mt-1 opacity-75">Video call session</p>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="mode"
                      value="home"
                      checked={mode === "home"}
                      onChange={(e) => setMode(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      mode === "home" 
                        ? "border-teal-500 bg-teal-50 text-teal-700" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">Home Tuition</span>
                      </div>
                      <p className="text-sm mt-1 opacity-75">Tutor visits your place</p>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="mode"
                      value="center"
                      checked={mode === "center"}
                      onChange={(e) => setMode(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      mode === "center" 
                        ? "border-teal-500 bg-teal-50 text-teal-700" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">At Center</span>
                      </div>
                      <p className="text-sm mt-1 opacity-75">Visit tutor's place</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Location Input - only for home tuition */}
            {mode === "home" && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Your Location
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Address (for tutor to visit) *
                  </label>
                  <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    placeholder="e.g., 123 ABC Society, Mira Road East, Thane"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                  {location.address && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <p className="text-green-800 font-medium">Selected Location:</p>
                      <p className="text-green-700">{location.address}</p>
                      {location.area && <p className="text-green-600 text-sm">Area: {location.area}</p>}
                      {location.city && <p className="text-green-600 text-sm">City: {location.city}</p>}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    This address will be shared with the tutor only after they accept your demo request.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Any specific requirements, learning goals, or questions for the tutor..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Request...
                  </div>
                ) : (
                  "Send Demo Request"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 rounded-b-2xl px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free demo session</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No payment required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}