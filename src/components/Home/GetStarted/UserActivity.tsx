import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import React from "react";

const UserActivity = () => {
  return (
    <CodeHighlighter
      language=""
      code={`
import { UserTracker } from '@scrubbe/user-tracker';
const userTracker = new UserTracker({  enablePageViews: true,  enableClicks: true,  
enableScrolling: true,  enableForms: true,  enableSessions: true});
// Start tracking user activitiesuserTracker.start();
// // Track specific activities
// userTracker.trackPageView('/dashboard');
// userTracker.trackClick('#signup-button');
// userTracker.trackFormSubmit('#contact-form');
// userTracker.trackScroll(75); 
// 75% scrolled
// Get session information
const session = userTracker.getSession();
console.log('Session ID:', session.id);
console.log('Duration:', session.duration);
console.log('Page Views:', session.pageViews);
console.log('Clicks:', session.clicks);
      `}
    />
  );
};

export default UserActivity;
