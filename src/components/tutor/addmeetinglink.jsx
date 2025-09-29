import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

const AddMeetingLink = () => {
  const { profile } = useAuth();
  const [demoRequests, setDemoRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [mode, setMode] = useState("demo"); // Changed default to "demo"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch demo requests for this tutor
  useEffect(() => {
    const fetchRequests = async () => {
      if (!profile?.uid) return;
      const q = query(
        collection(db, "demoRequests"),
        where("tutorId", "==", profile.uid),
        where("status", "==", "approved") // Only show approved requests
      );
      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((docSnap) => {
        requests.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDemoRequests(requests);
    };
    fetchRequests();
  }, [profile]);

  // Auto-send meeting link to chat when created
  const sendMeetingLinkToChat = async (studentId, requestData) => {
    try {
      const chatId = [profile.uid, studentId].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Create a special meeting link message
      const messageData = {
        text: `🎥 Meeting Link Ready! Join your demo session: ${meetingLink}`,
        senderId: profile.uid,
        senderName: profile.name,
        timestamp: serverTimestamp(),
        type: 'meeting_link',
        meetingData: {
          url: meetingLink,
          type: 'demo',
          studentName: requestData.studentName,
          scheduledTime: `${requestData.preferredDate} at ${requestData.preferredTime}`
        }
      };

      await addDoc(messagesRef, messageData);
      
      // Also update the chat document
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: 'Meeting link shared',
        lastMessageTime: serverTimestamp()
      });

    } catch (error) {
      console.warn('Could not send meeting link to chat:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingLink) {
      setMessage("Please enter a meeting link.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "global") {
        // Save inside user profile (users collection)
        const userRef = doc(db, "users", profile.uid);
        await updateDoc(userRef, { globalMeetingLink: meetingLink });
        setMessage("Global meeting link saved successfully!");
      } else if (mode === "demo") {
        if (!selectedRequest) {
          setMessage("Please select a demo request.");
          setLoading(false);
          return;
        }
        
        // Get the selected request data
        const selectedRequestData = demoRequests.find(req => req.id === selectedRequest);
        
        const reqRef = doc(db, "demoRequests", selectedRequest);
        await updateDoc(reqRef, { meetingLink: meetingLink });
        
        // Auto-send meeting link to chat interface
        if (selectedRequestData && selectedRequestData.studentId) {
          await sendMeetingLinkToChat(selectedRequestData.studentId, selectedRequestData);
        }
        
        setMessage("Demo request meeting link saved and sent to student chat!");
      }

      setMeetingLink("");
      setSelectedRequest("");
    } catch (err) {
      console.error("Error updating meeting link:", err);
      setMessage("Error saving link.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        >
          <option value="demo">Demo Request Link (specific request)</option>
          <option value="global">Global Link (for all students)</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Show demo request dropdown only if demo mode */}
        {mode === "demo" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Approved Demo Request</label>
            <select
              value={selectedRequest}
              onChange={(e) => setSelectedRequest(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            >
              <option value="">-- Select Demo Request --</option>
              {demoRequests.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.studentName} - {req.preferredDate} at {req.preferredTime}
                </option>
              ))}
            </select>
            {demoRequests.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No approved demo requests found</p>
            )}
          </div>
        )}

        {/* Meeting Link Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Meet Link</label>
          <input
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/xyz-abcd-123"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save & Send Link"}
        </button>
        
        {message && (
          <div className={`text-sm p-3 rounded-lg ${
            message.includes('Error') || message.includes('Please') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddMeetingLink;