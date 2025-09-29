import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Target, 
  Shield, 
  Star, 
  BookOpen,
  Award,
  Clock,
  MapPin,
  Mail,
  Phone,
  Heart,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const About = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Tutors', value: '500+', icon: Users },
    { label: 'Subjects Covered', value: '15+', icon: BookOpen },
    { label: 'Students Helped', value: '2000+', icon: GraduationCap },
    { label: 'Success Rate', value: '95%', icon: TrendingUp }
  ];

  const teamMembers = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Founder & CEO',
      description: 'PhD in Education, 15+ years in academic leadership',
      image: 'RK'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Tutor Relations',
      description: 'M.Ed, Former school principal with 12 years experience',
      image: 'PS'
    },
    {
      name: 'Amit Patel',
      role: 'Technology Director',
      description: 'B.Tech IIT, Expert in EdTech platforms',
      image: 'AP'
    },
    {
      name: 'Sneha Joshi',
      role: 'Student Success Manager',
      description: 'M.A. Psychology, Specialist in learning strategies',
      image: 'SJ'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'All tutors are verified and background-checked for your peace of mind'
    },
    {
      icon: Heart,
      title: 'Student-Centered',
      description: 'Every decision we make prioritizes student success and well-being'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Using technology to make learning more accessible and effective'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Maintaining the highest standards in education and service'
    }
  ];

  const [counters, setCounters] = useState({
    tutors: 0,
    subjects: 0,
    students: 0,
    success: 0
  });

  // Add counter animation effect
  useEffect(() => {
    const targetCounts = {
      tutors: 500,
      subjects: 15,
      students: 2000,
      success: 95
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounters({
        tutors: Math.floor(targetCounts.tutors * progress),
        subjects: Math.floor(targetCounts.subjects * progress),
        students: Math.floor(targetCounts.students * progress),
        success: Math.floor(targetCounts.success * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targetCounts);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

 const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
const handleCall = () => {
  if (isMobile()) {
    window.location.href = 'tel:+919876543210';
  } else {
    // On desktop: Just copy number to clipboard or show alert
    navigator.clipboard.writeText('+919876543210').then(() => {
      alert('Phone number copied to clipboard: +91 98765 43210');
    }).catch(() => {
      alert('Phone number: +91 98765 43210');
    });
  }
};
const handleEmail = () => {
  // Force Gmail web interface
  const email = 'support@teachhunt.com';
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
  window.open(gmailUrl, '_blank');
};

const handleContactSupport = () => {
  // Force Gmail web interface with subject
  const email = 'support@teachhunt.com';
  const subject = 'Support Request - TeachHunt';
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}`;
  window.open(gmailUrl, '_blank');
};

const handleJoinTeam = () => {
  navigate('/register', { state: { role: 'tutor' } });
};

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              About
              <span className="text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text block mt-2">
                TeachHunt
              </span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full mb-8"></div>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium">
              Revolutionizing education by connecting passionate tutors with eager learners across India
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                At TeachHunt, we believe every student deserves access to quality education. Our mission is to bridge the gap between exceptional tutors and students who need personalized learning support.
              </p>
              <p className="text-lg text-slate-600 mb-8">
                We're democratizing education by making it easier for students to find qualified, verified tutors in their area while giving educators a platform to share their expertise and make a meaningful impact.
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Our Goal</h3>
                  <p className="text-slate-600">Empower every student to reach their full academic potential</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Our Vision</h3>
                <p className="text-slate-700 mb-6">
                  To become India's most trusted educational platform where learning knows no boundaries, and every student has access to world-class tutoring.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700">Accessible quality education for all</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700">Strong student-tutor relationships</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700">Continuous academic excellence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {counters.tutors}+
              </div>
              <div className="text-slate-600 font-medium">Active Tutors</div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                <BookOpen className="w-8 h-8 text-teal-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {counters.subjects}+
              </div>
              <div className="text-slate-600 font-medium">Subjects Covered</div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                <GraduationCap className="w-8 h-8 text-teal-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {counters.students}+
              </div>
              <div className="text-slate-600 font-medium">Students Helped</div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {counters.success}%
              </div>
              <div className="text-slate-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-slate-600">
              The principles that guide everything we do at TeachHunt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                    <IconComponent className="w-10 h-10 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-slate-600">
              Passionate educators and technology experts working to transform learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                RK
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Dr. Rajesh Kumar</h3>
              <p className="text-teal-600 font-medium mb-3">Founder & CEO</p>
              <p className="text-sm text-slate-600">PhD in Education, 15+ years in academic leadership</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                PS
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Priya Sharma</h3>
              <p className="text-teal-600 font-medium mb-3">Head of Tutor Relations</p>
              <p className="text-sm text-slate-600">M.Ed, Former school principal with 12 years experience</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                AP
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Amit Patel</h3>
              <p className="text-teal-600 font-medium mb-3">Technology Director</p>
              <p className="text-sm text-slate-600">B.Tech IIT, Expert in EdTech platforms</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                SJ
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Sneha Joshi</h3>
              <p className="text-teal-600 font-medium mb-3">Student Success Manager</p>
              <p className="text-sm text-slate-600">M.A. Psychology, Specialist in learning strategies</p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              How We Make a Difference
            </h2>
            <p className="text-lg text-slate-600">
              Supporting both students and tutors in their educational journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">For Students</h3>
                  <p className="text-slate-600">
                    Find qualified tutors, get personalized learning plans, track progress, and achieve academic goals with our comprehensive support system.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">For Tutors</h3>
                  <p className="text-slate-600">
                    Connect with students, build your teaching career, access professional development resources, and make a meaningful impact in education.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">For Parents</h3>
                  <p className="text-slate-600">
                    Peace of mind with verified tutors, transparent pricing, progress tracking, and direct communication channels.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Commitment</h3>
                <p className="mb-6">
                  We're committed to maintaining the highest standards of quality, safety, and educational excellence.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <span>24/7 platform support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-teal-400" />
                    <span>Verified tutor profiles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-teal-400" />
                    <span>Quality assurance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-teal-400" />
                    <span>Student success focus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Get In Touch Section */}
<section className="py-16 md:py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
    <p className="text-xl text-teal-100 mb-12">
      Have questions or want to learn more about TeachHunt? We'd love to hear from you!
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <button onClick={handleEmail} className="flex flex-col items-center hover:transform hover:scale-105 transition-all group">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-30">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold mb-2">Email Us</h3>
        <p className="text-teal-100 group-hover:text-white">support@teachhunt.com</p>
      </button>
      
      <button onClick={handleCall} className="flex flex-col items-center hover:transform hover:scale-105 transition-all group">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-30">
          <Phone className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold mb-2">Call Us</h3>
        <p className="text-teal-100 group-hover:text-white">+91 98765 43210</p>
      </button>
      
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold mb-2">Visit Us</h3>
        <p className="text-teal-100">Mumbai, Maharashtra</p>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        onClick={handleContactSupport}
        className="bg-white text-teal-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
      >
        Contact Support
      </button>
      <button 
        onClick={handleJoinTeam}
        className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-teal-600 transition-colors"
      >
        Join Our Team
      </button>
    </div>
  </div>
</section>
    </div>
  );
};
export default About;