import emailjs from "@emailjs/browser";
// Read from env
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const USER_ID = process.env.REACT_APP_EMAILJS_USER_ID; // public key
const FROM_NAME = process.env.REACT_APP_FROM_NAME || "TeachHunt Team";
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || "neha182103@gmail.com";
// Init once
if (!emailjs._initialized) {
  if (USER_ID) emailjs.init(USER_ID);
  emailjs._initialized = true;
}
// ---------- Generic sender ----------
async function sendGenericEmail({ to_email, to_name, subject, message_html }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !USER_ID) {
    console.warn("EmailJS env vars missing. Email not sent.");
    return;
  }

  const templateParams = {
    to_name,
    to_email,
    subject: subject,           // ✅ Ensure subject is explicitly set
    message_html,               // ✅ This matches your template {{message_html}}
    from_name: FROM_NAME,
    from_email: ADMIN_EMAIL,
    reply_to: ADMIN_EMAIL,
  };

  console.log('Email template params:', templateParams); // 🔍 Debug log
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
}
// ---------- Concrete helpers ----------
// 1) Student registration email
export function sendStudentRegisterEmail({ name, email }) {
  const subject = "Welcome to TeachHunt!";
  const msg = `<p>Thank you for registering on TeachHunt, ${name}.</p>
    <p>Your registration has been completed successfully.
    You can now log in and search for tutors.<br><br> Best Regards,<br><br>TeachHunt Team</p>`;
  
  return sendGenericEmail({ to_email: email, to_name: name, subject, message_html: msg });
}
// 2) Tutor registration email
export function sendTutorRegisterEmail({ name, email }) {
  const subject = "Welcome to TeachHunt!";
  const msg = `<p>Hi ${name},</p>
    <p>Your registration has been completed successfully.
    You can now log in to your account and start connecting with students.<br><br> Best Regards,
    <br><br>TeachHunt Team</p>`;

  return sendGenericEmail({ to_email: email, to_name: name, subject, message_html: msg });
}
// 3) Student requested a demo -> notify tutor & student
export async function sendDemoRequestEmails({ 
  studentName, 
  studentEmail, 
  tutorName, 
  tutorEmail, 
  demoTime,
  classLevel,
  exam,
  subjects,
  mode,
  note,
  studentLocation
}) {
  // Email to tutor
  const tutorSubject = "New Demo Request Received";
  const tutorMsg = `<p>You have received a new demo request from <strong>${studentName}</strong>.</p>
    <p><strong>Student Details:</strong></p>
    <ul>
      <li><strong>Name:</strong> ${studentName}</li>
      <li><strong>Email:</strong> ${studentEmail}</li>
      <li><strong>Class:</strong> ${classLevel || 'Not specified'}</li>
      <li><strong>Exam:</strong> ${exam || 'Not specified'}</li>
      <li><strong>Subjects:</strong> ${Array.isArray(subjects) ? subjects.join(', ') : subjects || 'Not specified'}</li>
      <li><strong>Preferred Time:</strong> ${demoTime}</li>
      <li><strong>Mode:</strong> ${mode}</li>
      ${studentLocation ? `<li><strong>Student Location:</strong> ${studentLocation}</li>` : ''}
    </ul>
    ${note ? `<p><strong>Additional Notes:</strong> ${note}</p>` : ''}
    <p>Please check your tutor dashboard to approve or reject this request.</p>
    <br>
    <p>Best Regards,<br>TeachHunt Team</p>`;

  const tutorPromise = sendGenericEmail({
    to_email: tutorEmail,
    to_name: tutorName,
    subject: tutorSubject,
    message_html: tutorMsg,
  });

  // Confirmation to student
  const studentSubject = "Demo Request Submitted Successfully";
  const studentMsg = `<p>Hi ${studentName},</p>
    <p>Thank you for requesting a demo class with <strong>${tutorName}</strong>.</p>
    <p><strong>Your Request Details:</strong></p>
    <ul>
      <li><strong>Tutor:</strong> ${tutorName}</li>
      <li><strong>Requested Time:</strong> ${demoTime}</li>
      <li><strong>Mode:</strong> ${mode}</li>
      <li><strong>Subjects:</strong> ${Array.isArray(subjects) ? subjects.join(', ') : subjects}</li>
    </ul>
    <p>We have notified the tutor about your request. You will receive a confirmation email once the tutor approves your demo session.</p>
    <br>
    <p>Best Regards,<br>TeachHunt Team</p>`;

  const studentPromise = sendGenericEmail({
    to_email: studentEmail,
    to_name: studentName,
    subject: studentSubject,
    message_html: studentMsg,
  });

  return Promise.all([tutorPromise, studentPromise]);
}
// 4) Demo approved by tutor -> notify student WITH TIME MODIFICATION SUPPORT
export function sendDemoApprovedEmail({ 
  studentName, 
  studentEmail, 
  tutorName, 
  approvedTime, 
  extraNotes,
  modifiedTime = null  // ✅ Support for time modification
}) {
  const subject = "Your Demo Class Has Been Approved!";
  
  // Check if time was modified
  const timeMessage = modifiedTime 
    ? `<p><strong>⚠️ Time Updated:</strong> The tutor has modified your requested time.</p>
       <p><strong>New Scheduled Time:</strong> ${modifiedTime}</p>
       <p><em>Original requested time: ${approvedTime}</em></p>`
    : `<p><strong>Scheduled Time:</strong> ${approvedTime}</p>`;
  
  const msg = `<p>Hi ${studentName},</p>
    <p>Great news! <strong>${tutorName}</strong> has approved your demo class request.</p>
    <p><strong>Demo Details:</strong></p>
    <ul>
      <li><strong>Tutor:</strong> ${tutorName}</li>
    </ul>
    ${timeMessage}
    ${extraNotes ? `<p><strong>Additional Information:</strong> ${extraNotes}</p>` : ''}
    <p>The tutor will contact you shortly with meeting details and any specific instructions for your demo session.</p>
    <br>
    <p>Best Regards,<br>TeachHunt Team</p>`;

  return sendGenericEmail({
    to_email: studentEmail,
    to_name: studentName,
    subject,
    message_html: msg,
  });
}
// NEW: Notify admin when tutor registers
export function sendTutorRegistrationNotification({ tutorName, tutorEmail, tutorPhone, tutorArea, tutorBoard, tutorClasses, tutorSubjects }) {
  const subject = "New Tutor Registration - Awaiting Approval";
  const msg = `<p>A new tutor has registered on TeachHunt and is awaiting your approval.</p>
    <p><strong>Tutor Details:</strong></p>
    <ul>
      <li><strong>Name:</strong> ${tutorName}</li>
      <li><strong>Email:</strong> ${tutorEmail}</li>
      <li><strong>Phone:</strong> ${tutorPhone || 'Not provided'}</li>
      <li><strong>Area:</strong> ${tutorArea || 'Not specified'}</li>
      <li><strong>Board:</strong> ${tutorBoard || 'Not specified'}</li>
      <li><strong>Classes:</strong> ${tutorClasses || 'Not specified'}</li>
      <li><strong>Subjects:</strong> ${Array.isArray(tutorSubjects) ? tutorSubjects.join(', ') : tutorSubjects || 'Not specified'}</li>
    </ul>
    <p>Please log in to the admin panel to review and approve this tutor's profile.</p>
    <br>
    <p>Best Regards,<br>TeachHunt System</p>`;

  return sendGenericEmail({
    to_email: ADMIN_EMAIL,
    to_name: "Admin",
    subject,
    message_html: msg,
  });
}

// NEW: Notify tutor when their profile is approved by admin
export function sendTutorApprovalEmail({ tutorName, tutorEmail }) {
  const subject = "Your TeachHunt Profile Has Been Approved!";
  const msg = `<p>Hi ${tutorName},</p>
    <p>Great news! Your tutor profile on TeachHunt has been approved by our admin team.</p>
    <p>You can now:</p>
    <ul>
      <li>Log in to your tutor dashboard</li>
      <li>Start receiving demo requests from students</li>
      <li>Connect with students looking for tutoring</li>
    </ul>
    <p>Thank you for joining TeachHunt. We look forward to helping you connect with students!</p>
    <br>
    <p>Best Regards,<br>TeachHunt Team</p>`;

  return sendGenericEmail({
    to_email: tutorEmail,
    to_name: tutorName,
    subject,
    message_html: msg,
  });
}
// 5) Admin broadcast to single recipient
export function sendAdminBroadcastToOne({ toName, toEmail, title, messageHtml }) {
  return sendGenericEmail({
    to_email: toEmail,
    to_name: toName,
    subject: title,
    message_html: messageHtml,
  });
}
// 6) Send feedback from student to admin
export function sendFeedbackFromStudent(formData) {
  const subject = "New Feedback Received";
  const body = `<p>A new feedback has been submitted by ${formData.name}.</p>
    <p><strong>Student Details:</strong></p>
    <ul>
      <li><strong>Name:</strong> ${formData.name}</li>
      <li><strong>Email:</strong> ${formData.email}</li>
      <li><strong>Phone:</strong> ${formData.phone || 'Not provided'}</li>
    </ul>
    <p><strong>Tutor:</strong> ${formData.tutorName || 'Not specified'}</p>
    <p><strong>Rating:</strong> ${formData.rating}/5 stars</p>
    <p><strong>Feedback:</strong></p>
    <p>${formData.feedback}</p>
    <br>
    <p>Please check the admin dashboard for more details.</p>`;

  return sendGenericEmail({
    to_email: ADMIN_EMAIL,
    to_name: "Admin",
    subject,
    message_html: body,
  });
}
// 7) Thank-you email to student
export function sendFeedbackThankYou({ name, email }) {
  const subject = "Thank you for your feedback!";
  const msg = `<p>Hi ${name},</p>
    <p>Thank you for sharing your feedback with TeachHunt.
     We really appreciate your input and will use it to improve.</p>
    <p>Best Regards,<br/>TeachHunt Team</p>`;

  return sendGenericEmail({
    to_email: email,
    to_name: name,
    subject,
    message_html: msg,
  });
}
// 8) Send broadcast to many users
export async function sendAdminBroadcastToMany(usersArray = [], { title, messageHtml }) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const results = [];

  // Filter out admin email to prevent duplicate
  const filteredUsers = usersArray.filter(u => 
    u.email && u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  );

  for (const u of filteredUsers) {
    try {
      const res = await sendGenericEmail({
        to_email: u.email,
        to_name: u.name || "User",
        subject: title,
        message_html: messageHtml,
      });
      results.push({ email: u.email, status: "ok", res });
    } catch (err) {   
      results.push({ email: u.email, status: "error", err });
    }
    await sleep(500); // 0.5s gap
  }

  return results;
}