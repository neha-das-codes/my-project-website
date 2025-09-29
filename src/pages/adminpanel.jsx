import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { sendAdminBroadcastToMany, sendAdminBroadcastToOne, sendTutorApprovalEmail } from "../components/auth/services/emailservice";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminPanel = () => {
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [notice, setNotice] = useState({ subject: "", message: "" });
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [singleRecipient, setSingleRecipient] = useState({ email: "", name: "", subject: "", message: "" });
  const { profile } = useAuth();

  // Helper function to get tutor data with multiple fallback paths
  const getTutorData = (tutor, field) => {
    const paths = {
      board: [
        tutor.board,
        tutor.tutor?.board,
        tutor.educationBoard,
        tutor.selectedBoard,
        tutor.teachingBoard
      ],
      classes: [
        tutor.classes,
        tutor.tutor?.classes,
        tutor.teachingClasses,
        tutor.selectedClasses,
        tutor.classesOffered
      ],
      subjects: [
        tutor.subjects,
        tutor.tutor?.subjects,
        tutor.teachingSubjects,
        tutor.subjectsOffered,
        tutor.selectedSubjects
      ],
      area: [
        tutor.area,
        tutor.tutor?.area,
        tutor.location,
        tutor.teachingArea,
        tutor.selectedArea,
        tutor.address
      ],
      experience: [
        tutor.experience,
        tutor.tutor?.experience,
        tutor.teachingExperience,
        tutor.yearsOfExperience,
        tutor.workExperience
      ],
      qualification: [
        tutor.qualification,
        tutor.tutor?.qualification,
        tutor.highestQualification,
        tutor.educationQualification,
        tutor.degree
      ],
      feeRange: [
        tutor.feeRange,
        tutor.tutor?.feeRange,
        tutor.fees,
        tutor.feeStructure,
        (tutor.minFee && tutor.maxFee ? `₹${tutor.minFee} - ₹${tutor.maxFee}` : null),
        (tutor.tutor?.minFee && tutor.tutor?.maxFee ? `₹${tutor.tutor.minFee} - ₹${tutor.tutor.maxFee}` : null)
      ]
    };

    const fieldPaths = paths[field] || [];
    
    for (const value of fieldPaths) {
      if (value !== null && value !== undefined && value !== "") {
        // Handle arrays (like subjects)
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(', ') : "Not specified";
        }
        return value;
      }
    }
    
    return "Not specified";
  };

  // Fetch Tutors, Students, Demo Requests, Feedback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tutorSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "tutor"))
        );
        setTutors(tutorSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const studentSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "student"))
        );
        setStudents(studentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const demoSnap = await getDocs(collection(db, "demoRequests"));
        setDemoRequests(demoSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const fbSnap = await getDocs(collection(db, "feedback"));
        setFeedbacks(fbSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

 // Approve Tutor
const approve = async (id) => {
  try {
     const tutorToApprove = tutors.find((t) => t.id === id);
    await updateDoc(doc(db, "users", id), { verified: true });
  
    // Instead, update the tutor's status in the local state:
    setTutors((prev) => prev.map((t) => 
      t.id === id ? { ...t, verified: true } : t
    ));
     if (tutorToApprove) {
      await sendTutorApprovalEmail({
        tutorName: tutorToApprove.name,
        tutorEmail: tutorToApprove.email
      });
    }
    alert("Tutor approved successfully!");
  } catch (error) {
    console.error("Error approving tutor:", error);
    alert("Failed to approve tutor. Please try again.");
  }
};
 // Reject Tutor
const reject = async (id) => {
  try {
    await updateDoc(doc(db, "users", id), { rejected: true });
    // Remove this line:
    // setTutors((prev) => prev.filter((t) => t.id !== id));
    
    // Instead, update the tutor's status:
    setTutors((prev) => prev.map((t) => 
      t.id === id ? { ...t, rejected: true } : t
    ));
    
    alert("Tutor rejected successfully!");
  } catch (error) {
    console.error("Error rejecting tutor:", error);
    alert("Failed to reject tutor. Please try again.");
  }
};

  // Deactivate User
  const deactivateUser = async (id) => {
    try {
      await updateDoc(doc(db, "users", id), { active: false });
      alert("User deactivated successfully!");
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("Failed to deactivate user. Please try again.");
    }
  };

  // Send Notice to All Users
  const handleNoticeSend = async () => {
    if (!notice.subject || !notice.message) {
      alert("Please enter subject and message.");
      return;
    }

    try {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map((d) => d.data());

      await sendAdminBroadcastToMany(users, {
        title: notice.subject,
        messageHtml: notice.message.toString(),
      });

      alert("Notice sent to all users!");
      setNotice({ subject: "", message: "" });
    } catch (err) {
      console.error("Error sending notice:", err);
      alert("Failed to send notice. Check console.");
    }
  };

  // Send Message to Single Recipient
  const handleSingleSend = async () => {
    if (!singleRecipient.email || !singleRecipient.subject || !singleRecipient.message) {
      alert("Please fill all fields for single recipient.");
      return;
    }

    try {
      await sendAdminBroadcastToOne({
        toName: singleRecipient.name || "User",
        toEmail: singleRecipient.email,
        title: singleRecipient.subject,
        messageHtml: singleRecipient.message,
      });

      alert("Message sent successfully!");
      setSingleRecipient({ email: "", name: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error sending single message:", err);
      alert("Failed to send message. Check console.");
    }
  };
if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  // Counts (only approved tutors) - FIXED LINE
  const tutorCount = tutors.filter((t) => t.verified).length;
  const studentCount = students.length;
  const demoTotal = demoRequests.length;
  const demoApproved = demoRequests.filter((d) => d.status === "approved").length;
  const demoPending = demoRequests.filter((d) => d.status === "pending").length;
  const demoRejected = demoRequests.filter((d) => d.status === "rejected").length;

  // Chart Data
  const chartData = [
    { name: "Tutors", count: tutorCount },
    { name: "Students", count: studentCount },
    { name: "Demos", count: demoTotal },
    { name: "Approved", count: demoApproved },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Panel</h1>
              <p className="text-slate-200">Manage your TeachHunt platform</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-sm text-slate-200">Welcome</div>
              <div className="font-semibold text-lg">{profile?.name}</div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tutors</p>
                <p className="text-3xl font-bold text-blue-600">{tutorCount}</p>
                <p className="text-xs text-gray-500 mt-1">Verified tutors</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-green-600">{studentCount}</p>
                <p className="text-xs text-gray-500 mt-1">Registered students</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Demo Requests</p>
                <p className="text-3xl font-bold text-yellow-600">{demoTotal}</p>
                <p className="text-xs text-gray-500 mt-1">Total requests</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Demos</p>
                <p className="text-3xl font-bold text-purple-600">{demoApproved}</p>
                <p className="text-xs text-gray-500 mt-1">Success rate: {demoTotal > 0 ? Math.round((demoApproved / demoTotal) * 100) : 0}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Platform Analytics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px' 
                  }} 
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Communication Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Send Notice to All */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              Broadcast to All Users
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={notice.subject}
                onChange={(e) => setNotice({ ...notice, subject: e.target.value })}
                placeholder="Subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <textarea
                value={notice.message}
                onChange={(e) => setNotice({ ...notice, message: e.target.value })}
                placeholder="Message content"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows="4"
              />
              <button
                onClick={handleNoticeSend}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Send to All Users
              </button>
            </div>
          </div>

          {/* Send to Single Recipient */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              Send to Single User
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="email"
                  value={singleRecipient.email}
                  onChange={(e) => setSingleRecipient({ ...singleRecipient, email: e.target.value })}
                  placeholder="Email address"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                <input
                  type="text"
                  value={singleRecipient.name}
                  onChange={(e) => setSingleRecipient({ ...singleRecipient, name: e.target.value })}
                  placeholder="Name (optional)"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <input
                type="text"
                value={singleRecipient.subject}
                onChange={(e) => setSingleRecipient({ ...singleRecipient, subject: e.target.value })}
                placeholder="Subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <textarea
                value={singleRecipient.message}
                onChange={(e) => setSingleRecipient({ ...singleRecipient, message: e.target.value })}
                placeholder="Message content"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                rows="4"
              />
              <button
                onClick={handleSingleSend}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tutor Approvals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tutor Approvals</h3>
            {tutors.filter((t) => !t.verified && !t.rejected).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No pending tutor approvals</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tutors
                  .filter((t) => !t.verified && !t.rejected)
                  .map((t) => (
                    <div key={t.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{t.name}</h4>
                          <p className="text-sm text-gray-600">{t.email}</p>
                          <p className="text-xs text-gray-500">
                            {getTutorData(t, 'board')} • {getTutorData(t, 'classes')} • {getTutorData(t, 'area')}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <button
                            onClick={() => setSelectedTutor(t)}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => approve(t.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reject(t.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Demo Requests Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Demo Requests Overview</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{demoPending}</p>
                <p className="text-xs text-yellow-700">Pending</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{demoApproved}</p>
                <p className="text-xs text-green-700">Approved</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{demoRejected}</p>
                <p className="text-xs text-red-700">Rejected</p>
              </div>
            </div>
            {demoRequests.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No demo requests yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {demoRequests.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">{d.studentName} → {d.tutorName}</p>
                      <p className="text-xs text-gray-600">{d.preferredDate} at {d.preferredTime}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      d.status === "approved" ? "bg-green-100 text-green-800" :
                      d.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {d.status || "pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Management</h3>
          <div className="mb-4">
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search users by name or email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...tutors, ...students]
              .filter(
                (u) =>
                  u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
                  u.email?.toLowerCase().includes(searchUser.toLowerCase())
              )
              .map((u) => (
                <div key={u.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-xs text-gray-500">Role: {u.role}</p>
                  </div>
                  <button
                    onClick={() => deactivateUser(u.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Reports & Feedback */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Reports & Feedback</h3>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-gray-500">No feedback submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {feedbacks.map((f) => (
                <div key={f.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-sm text-gray-600">{f.email}</p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < f.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{f.feedback}</p>
                  {f.tutorName && (
                    <p className="text-xs text-gray-500 mt-2">For tutor: {f.tutorName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Tutor Profile Modal */}
        {selectedTutor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-t-2xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">{selectedTutor.name}'s Profile</h3>
                  <button
                    onClick={() => setSelectedTutor(null)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> {selectedTutor.email || "Not provided"}</p>
                      <p><strong>Phone:</strong> {selectedTutor.phone || selectedTutor.phoneNumber || "Not provided"}</p>
                      <p><strong>Experience:</strong> {getTutorData(selectedTutor, 'experience')}</p>
                      <p><strong>Qualification:</strong> {getTutorData(selectedTutor, 'qualification')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Teaching Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Board:</strong> {getTutorData(selectedTutor, 'board')}</p>
                      <p><strong>Classes:</strong> {getTutorData(selectedTutor, 'classes')}</p>
                      <p><strong>Subjects:</strong> {getTutorData(selectedTutor, 'subjects')}</p>
                      <p><strong>Area:</strong> {getTutorData(selectedTutor, 'area')}</p>
                      <p><strong>Fee Range:</strong> {getTutorData(selectedTutor, 'feeRange')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedTutor(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      approve(selectedTutor.id);
                      setSelectedTutor(null);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      reject(selectedTutor.id);
                      setSelectedTutor(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;