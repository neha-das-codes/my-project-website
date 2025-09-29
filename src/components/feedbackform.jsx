import React, { useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { sendFeedbackFromStudent, sendFeedbackThankYou } from "./auth/services/emailservice";

export default function FeedbackForm({ tutorId: propTutorId }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    feedback: "",
    rating: 0,
    tutorName: "", // New field for tutor name
  });

  const [tutorSuggestions, setTutorSuggestions] = useState([]);
  const [selectedTutorId, setSelectedTutorId] = useState(propTutorId || null);
  const [selectedTutorName, setSelectedTutorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchingTutors, setSearchingTutors] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  // Search for tutors by name
  const searchTutors = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setTutorSuggestions([]);
      return;
    }

    setSearchingTutors(true);
    try {
      const tutorsRef = collection(db, "users");
      const q = query(
        tutorsRef,
        where("role", "==", "tutor"),
        where("verified", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const tutors = [];
      
      querySnapshot.forEach((doc) => {
        const tutorData = doc.data();
        const tutorName = tutorData.name || tutorData.displayName || "";
        
        // Check if tutor name contains the search term (case insensitive)
        if (tutorName.toLowerCase().includes(searchTerm.toLowerCase())) {
          tutors.push({
            id: doc.id,
            name: tutorName,
            email: tutorData.email,
            subjects: tutorData.subjects || []
          });
        }
      });
      
      setTutorSuggestions(tutors);
    } catch (error) {
      console.error("Error searching tutors:", error);
    } finally {
      setSearchingTutors(false);
    }
  };

  const handleTutorNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, tutorName: value });
    
    // Clear selection if user is typing new name
    if (value !== selectedTutorName) {
      setSelectedTutorId(null);
      setSelectedTutorName("");
    }
    
    // Search for tutors
    searchTutors(value);
  };

  const selectTutor = (tutor) => {
    setSelectedTutorId(tutor.id);
    setSelectedTutorName(tutor.name);
    setFormData({ ...formData, tutorName: tutor.name });
    setTutorSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!auth.currentUser) {
        alert("You must be logged in to submit feedback.");
        setLoading(false);
        return;
      }

      // Save feedback in Firestore with tutorId
      await addDoc(collection(db, "feedback"), {
        ...formData,
        tutorId: selectedTutorId, // This will now be properly set
        tutorName: selectedTutorName,
        studentId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // Send feedback to admin with details
      await sendFeedbackFromStudent(formData);

      // Send thank-you to student
      await sendFeedbackThankYou(formData);

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 bg-green-100 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-green-700">
          Thank you for your feedback!
        </h2>
        <p className="text-green-600 mt-2">
          We've sent you a confirmation email and notified our team.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Submit Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="text"
          name="phone"
          placeholder="Your Phone (optional)"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        {/* Tutor Name Search */}
        <div className="relative">
          <input
            type="text"
            name="tutorName"
            placeholder="Tutor Name (optional - start typing to search)"
            value={formData.tutorName}
            onChange={handleTutorNameChange}
            className="w-full p-2 border rounded-lg"
          />
          
          {/* Search indicator */}
          {searchingTutors && (
            <div className="absolute right-3 top-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Tutor suggestions dropdown */}
          {tutorSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {tutorSuggestions.map((tutor) => (
                <div
                  key={tutor.id}
                  onClick={() => selectTutor(tutor)}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-800">{tutor.name}</div>
                  <div className="text-sm text-gray-500">{tutor.email}</div>
                  {tutor.subjects.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      Subjects: {tutor.subjects.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Selected tutor confirmation */}
          {selectedTutorId && selectedTutorName && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              Selected Tutor: <strong>{selectedTutorName}</strong>
            </div>
          )}
        </div>

        {/* Rating stars */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => handleRating(star)}
              className={`text-2xl ${
                formData.rating >= star ? "text-yellow-500" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          name="feedback"
          placeholder="Write your feedback..."
          value={formData.feedback}
          onChange={handleChange}
          required
          rows="4"
          className="w-full p-2 border rounded-lg"
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}