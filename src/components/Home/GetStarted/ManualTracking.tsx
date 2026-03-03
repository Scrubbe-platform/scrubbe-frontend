import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import React from "react";

const ManualTracking = () => {
  return (
    <div>
      <CodeHighlighter
        language=""
        code={`
// Track custom 
eventsanalytics.track('button_click', 
{buttonId: 'signup_cta',  
page: '/landing',  
section: 'hero',  
userId: 'user_123'});
// Track page views
analytics.page('/dashboard', {category: 'app',  userId: 'user_123'});
// Identify users
analytics.identify('user_123', {email: 'user@example.com', plan: 'premium', signupDate: new Date()});
// Track user properties
analytics.alias('user_123', 'anonymous_id_456');
                `}
      />
    </div>
  );
};

export default ManualTracking;
