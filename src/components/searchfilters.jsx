import React, { useState } from "react";
import { subjectsByClass } from "../data/subjectsdata";
import LocationSearch from "./locationsearch";

export default function SearchFilters({ onFilterChange, initial = {} }) {
  const [filters, setFilters] = useState({
    classes: "",
    board: "",
    subjects: [], // Changed to array for multiple selection
    locationText: "",
    city: "",
    area: "",
    lat: null,
    lng: null,
    minFee: "",
    maxFee: "",
    radius: 10, // Default 10km radius
    ...initial,
  });

  const handleChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubjectChange = (e) => {
    const { value, checked } = e.target;
    setFilters(prev => {
      const subjects = new Set(prev.subjects);
      if (checked) {
        subjects.add(value);
      } else {
        subjects.delete(value);
      }
      return { ...prev, subjects: [...subjects] };
    });
  };

  const handleLocationSelect = (locationData) => {
    setFilters(prev => ({
      ...prev,
      locationText: locationData.address,
      city: locationData.city,
      area: locationData.area,
      lat: locationData.lat,
      lng: locationData.lng
    }));
  };
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate required fields
  if (!filters.classes || !filters.board || !filters.locationText) {
    alert("⚠️ Please fill all required fields:\n\n• Class/Grade\n• Board\n• Location\n\nThese fields are mandatory to search for tutors.");
    return;
  }
  
  // All validation passed, proceed with search
  onFilterChange(filters);
};
 return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        Find Your Perfect Tutor
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Details Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4"/>
              </svg>
            </div>
            Academic Requirements
          </h3>
          <div className="space-y-4">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class/Grade</label>
              <select
                name="classes"
                value={filters.classes}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, classes: e.target.value, subjects: [] }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select Class</option>
                {Object.keys(subjectsByClass).map((cls) => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {/* Board Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
              <select
                name="board"
                value={filters.board}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
              </select>
            </div>

            {/* Subjects - Show only if class is selected */}
            {filters.classes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects (Select Multiple)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="grid grid-cols-1 gap-2">
                    {(subjectsByClass[filters.classes] || []).map((subj) => (
                      <label key={subj} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white rounded p-2 transition-colors">
                        <input
                          type="checkbox"
                          value={subj}
                          checked={filters.subjects.includes(subj)}
                          onChange={handleSubjectChange}
                          className="text-teal-500 rounded focus:ring-teal-500"
                        />
                        <span className="text-gray-700">{subj}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {filters.subjects.length > 0 && (
                  <div className="mt-2 p-2 bg-teal-50 rounded-lg">
                    <p className="text-xs text-teal-700 font-medium">
                      Selected: {filters.subjects.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
              <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4"/>
              </svg>
            </div>
            Location Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Society, Area, City)
              </label>
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="e.g., Raheja Vihar Mira Road, Bandra West, Thane"
                value={filters.locationText}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Search Radius - only show if location is selected */}
            {filters.lat && filters.lng && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
                <select
                  name="radius"
                  value={filters.radius}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value={2}>Within 2 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={15}>Within 15 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Fee Range Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center mr-2">
              <svg className="w-2 h-2 text-purple-600" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4"/>
              </svg>
            </div>
            Budget Range
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Fee (₹)</label>
              <input
                type="number"
                name="minFee"
                placeholder="500"
                value={filters.minFee}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Fee (₹)</label>
              <input
                type="number"
                name="maxFee"
                placeholder="2000"
                value={filters.maxFee}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          🔍 Search Tutors
        </button>

        {/* Location Info */}
        {filters.locationText && (
          <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-700 font-medium">
              📍 Searching near: {filters.locationText}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}