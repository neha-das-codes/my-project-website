import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { subjectsByClass } from "../../data/subjectsdata"; 
import { sendStudentRegisterEmail, sendTutorRegisterEmail, sendTutorRegistrationNotification } from "./services/emailservice";
import LocationSearch from "../locationsearch";
import { geocodeAddress } from "../../utils/locationutils";
import { Eye, EyeOff, User, Mail, Phone, MapPin, BookOpen, GraduationCap } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", board: [], classes: "", subjects: [],
    area: "", city: "", minFee: "", maxFee: "", 
    availability: [], experience: "", qualification: ""
  });
  const [location, setLocation] = useState({
    address: "",
    city: "",
    area: "",
    lat: null,
    lng: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "availability") {
      setForm(prev => {
        const arr = new Set(prev.availability);
        checked ? arr.add(value) : arr.delete(value);
        return { ...prev, availability: [...arr] };
      });
    } else if (name === "subjects") {
      setForm(prev => {
        const arr = new Set(prev.subjects);
        checked ? arr.add(value) : arr.delete(value);
        return { ...prev, subjects: [...arr] };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationSelect = (locationData) => {
    setLocation(locationData);
    setForm(prev => ({
      ...prev,
      city: locationData.city || prev.city,
      area: locationData.area || prev.area
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); 
    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = res.user.uid;

      const userDoc = {
        uid,
        name: form.name,
        email: form.email, 
        role,  
        createdAt: serverTimestamp(),
        verified: role === "tutor" ? false : true
      };

      if (role === "tutor") {
        userDoc.phone = form.phone || "";
        userDoc.city = location.city || form.city || "";
        userDoc.area = location.area || form.area || "";
        userDoc.board = form.board || [];
        userDoc.classes = form.classes || "";
        userDoc.subjects = form.subjects || [];
        userDoc.minFee = Number(form.minFee) || 0;
        userDoc.maxFee = Number(form.maxFee) || 0;
        userDoc.experience = form.experience || "";
        userDoc.qualification = form.qualification || "";
        userDoc.availability = form.availability || [];
        userDoc.rating = 0;
        userDoc.ratingCount = 0

        if (location.lat && location.lng) {
          userDoc.lat = location.lat;
          userDoc.lng = location.lng;
          userDoc.address = location.address;
        } else if (form.area && form.city) {
          const fullAddress = `${form.area}, ${form.city}, Maharashtra, India`;
          const coords = await geocodeAddress(fullAddress);
          if (coords) {
            userDoc.lat = coords.lat;
            userDoc.lng = coords.lng;
            userDoc.address = coords.formatted_address;
          }
        }
      }

      await setDoc(doc(db, "users", uid), userDoc);
       if (role === "tutor") {
        await sendTutorRegistrationNotification({
          tutorName: form.name,
          tutorEmail: form.email,
          tutorPhone: form.phone,
          tutorArea: userDoc.area,
          tutorBoard: form.board,
          tutorClasses: form.classes,
          tutorSubjects: form.subjects
        });
      }
// Email notification
      if (role === "student") {
        await sendStudentRegisterEmail({ name: form.name, email: form.email });
      } else if (role === "tutor") {
        await sendTutorRegisterEmail({ name: form.name, email: form.email });
      }

      navigate("/dashboard");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-teal-500 to-cyan-500 px-8 py-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join TeachHunt</h2>
            <p className="text-teal-100">Create your account to get started</p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {err && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{err}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">I am a:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`p-4 border-2 rounded-2xl transition-all ${
                      role === "student" 
                        ? "border-teal-500 bg-teal-50 text-teal-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <span className="font-medium">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("tutor")}
                    className={`p-4 border-2 rounded-2xl transition-all ${
                      role === "tutor" 
                        ? "border-teal-500 bg-teal-50 text-teal-700" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                    <span className="font-medium">Tutor</span>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Full Name"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Email Address"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Tutor Specific Fields */}
              {role === "tutor" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
                    <h3 className="text-lg font-semibold text-amber-800 mb-6 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Tutor Profile Details
                    </h3>
                    
                    {/* Phone */}
                    <div className="relative mb-4">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="Phone Number"
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                      />
                    </div>

                    {/* Location Search */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <LocationSearch
                          onLocationSelect={handleLocationSelect}
                          placeholder="Location"
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                        />
                      </div>
                      {location.address && (
                        <div className="mt-2 p-3 bg-green-50 rounded-xl text-sm border border-green-200">
                          <p className="text-green-800 font-medium">✅ {location.address}</p>
                        </div>
                      )}
                    </div>

                    {/* Manual Location Inputs */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <input 
                        name="city" 
                        value={form.city} 
                        onChange={onChange} 
                        placeholder="City (if not found above)" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                      />
                      <input 
                        name="area" 
                        value={form.area} 
                        onChange={onChange} 
                        placeholder="Area/Society" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                      />
                    </div>

                    {/* Qualification */}
                    <input
                      name="qualification"
                      value={form.qualification}
                      onChange={onChange}
                      placeholder="Qualification (e.g., M.Sc in Physics)"
                      className="w-full px-4 py-3 mb-4 bg-white border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                    />

                    {/* Experience */}
                    <input
                      name="experience"
                      value={form.experience}
                      onChange={onChange}
                      placeholder="Experience (e.g., 4 years)"
                      className="w-full px-4 py-3 mb-4 bg-white border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                    />

                    {/* Board Selection */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-3">Board</label>
                      <div className="flex flex-wrap gap-2">
                        {["CBSE", "ICSE", "State Board"].map((board) => (
                          <label key={board} className="flex items-center">
                            <input
                              type="checkbox"
                              value={board}
                              checked={form.board.includes(board)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setForm({ ...form, board: [...form.board, board] });
                                } else {
                                  setForm({ ...form, board: form.board.filter((b) => b !== board) });
                                }
                              }}
                              className="sr-only"
                            />
                            <div className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                              form.board.includes(board)
                                ? 'bg-amber-200 text-amber-800 border-2 border-amber-300'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-200'
                            }`}>
                              {board}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Class Selection */}
                    <select
                      name="classes"
                      value={form.classes}
                      onChange={onChange}
                      className="w-full px-4 py-3 mb-4 bg-white border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                    >
                      <option value="">Select Class/Range</option>
                      {Object.keys(subjectsByClass).map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>

                    {/* Subjects */}
                    {form.classes && (
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-3">Subjects</label>
                        <div className="flex flex-wrap gap-2">
                          {subjectsByClass[form.classes]?.map((subj) => (
                            <label key={subj} className="flex items-center">
                              <input
                                type="checkbox"
                                name="subjects"
                                value={subj}
                                checked={form.subjects.includes(subj)}
                                onChange={onChange}
                                className="sr-only"
                              />
                              <div className={`px-3 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                                form.subjects.includes(subj)
                                  ? 'bg-amber-200 text-amber-800 border-2 border-amber-300'
                                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-200'
                              }`}>
                                {subj}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fee Range */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <input
                        name="minFee"
                        value={form.minFee}
                        onChange={onChange}
                        placeholder="Min Fee (₹)"
                        type="number"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                      />
                      <input
                        name="maxFee"
                        value={form.maxFee}
                        onChange={onChange}
                        placeholder="Max Fee (₹)"
                        type="number"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                      />
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-3">Teaching Mode</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: "online", label: "Online Classes" },
                          { value: "home", label: "Home Tuition" },
                          { value: "center", label: "At Tutor's Place" }
                        ].map((opt) => (
                          <label key={opt.value} className="flex items-center">
                            <input
                              type="checkbox"
                              name="availability"
                              value={opt.value}
                              onChange={onChange}
                              className="sr-only"
                            />
                            <div className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                              form.availability.includes(opt.value)
                                ? 'bg-amber-200 text-amber-800 border-2 border-amber-300'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-200'
                            }`}>
                              {opt.label}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:from-teal-700 hover:to-cyan-700 focus:ring-4 focus:ring-teal-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-8 text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate('/login')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-teal-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-teal-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}