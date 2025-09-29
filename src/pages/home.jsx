import { Search, MapPin, BookOpen, Users, Star, CheckCircle, GraduationCap, Target, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const [searchSubject, setSearchSubject] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [counters, setCounters] = useState({
    tutors: 0,
    subjects: 0,
    success: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Animated counter effect
  useEffect(() => {
    const targetCounts = {
      tutors: 500,
      subjects: 15,
      success: 95
    };

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounters({
        tutors: Math.floor(targetCounts.tutors * progress),
        subjects: Math.floor(targetCounts.subjects * progress),
        success: Math.floor(targetCounts.success * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targetCounts); // Ensure final values are exact
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const handleFindTutors = () => {
    // Always redirect to register form
    navigate('/register');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSubjectClick = (subject) => {
    navigate('/register');
  };

  // Popular subjects
  const popularSubjects = [
    "Mathematics", "Physics", "Chemistry", "English", "Biology", "Computer Science",
    "Hindi", "Science", "Social Science", "Economics", "Accountancy", "Business Studies"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-4">
                Welcome to
                <span className="text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text block mt-2">
                  TeachHunt
                </span>
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto font-medium">
              Find the best tutors near you for personalized learning. 
              Boost your grades and achieve your academic goals.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 mb-8 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-teal-500" />
                  <input
                    type="text"
                    placeholder="What subject do you need help with?"
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-teal-500" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <button 
                  onClick={handleFindTutors}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Search size={20} />
                  Find Tutors
                </button>
              </div>
              
              {/* No register text - removed as requested */}
            </div>

            {/* Quick Stats with Animation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {counters.tutors}+
                </div>
                <div className="text-slate-600 font-medium">Expert Tutors</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {counters.subjects}+
                </div>
                <div className="text-slate-600 font-medium">Subjects Available</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {counters.success}%
                </div>
                <div className="text-slate-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              How TeachHunt Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get started with just a few simple steps and connect with your perfect tutor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                <Search className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">1. Search & Browse</h3>
              <p className="text-slate-600">
                Browse through verified tutor profiles by subject, location, and class level. Read reviews and check ratings.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                <Users className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">2. Connect & Chat</h3>
              <p className="text-slate-600">
                Message tutors directly, discuss your learning goals, and schedule your sessions at convenient times.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                <GraduationCap className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">3. Start Learning</h3>
              <p className="text-slate-600">
                Begin your personalized learning journey with expert guidance and track your academic progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Subjects Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Popular Subjects
            </h2>
            <p className="text-lg text-slate-600">
              Find expert tutors for all educational levels and competitive exams
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularSubjects.map((subject, index) => (
              <div 
                key={index} 
                onClick={() => handleSubjectClick(subject)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center border border-gray-100 hover:border-teal-200 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                  <BookOpen className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{subject}</h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Plus many more subjects from Pre-Primary to Competitive Exams
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose TeachHunt Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose TeachHunt?
            </h2>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto">
              We're committed to providing the best tutoring experience for students at every level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Tutors</h3>
              <p className="text-slate-300">
                All our tutors are background-verified and have proven teaching experience with excellent track records.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Assured</h3>
              <p className="text-slate-300">
                Choose from highly-rated tutors with detailed profiles, student reviews, and verified credentials.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Learning</h3>
              <p className="text-slate-300">
                Get customized lesson plans and teaching methods tailored to your learning style and academic goals.
              </p>
            </div>
          </div>
        </div>
      </section>

    {/* Testimonials Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              What Our Students Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex mb-4">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <Star className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-slate-600 mb-6 italic">
                "Found a great math tutor through TeachHunt. The platform made it easy to connect and my grades have improved significantly!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold mr-4">
                  RS
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Rahul Sharma</div>
                  <div className="text-sm text-slate-500">Class 10 Student</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-6 italic">
                "Excellent platform! The chemistry tutor we found was very patient and explained concepts in a simple way."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold mr-4">
                  PK
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Priya Kulkarni</div>
                  <div className="text-sm text-slate-500">Class 12 Student</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex mb-4">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <Star className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-slate-600 mb-6 italic">
                "As a parent, I appreciate the verified tutor profiles and the ease of communication. Great service!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold mr-4">
                  SG
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Sunita Gupta</div>
                  <div className="text-sm text-slate-500">Parent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Join hundreds of students who have improved their grades with TeachHunt
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Today
            </button>
            <button 
              onClick={handleSignIn}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-teal-600 transition-colors transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;