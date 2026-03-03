import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import React from "react";

const AutoTracking = () => {
  return (
    <div>
      <CodeHighlighter
        language=""
        code={`
import { Analytics } from '@scrubbe/analytics';
const analytics = new Analytics({projectId: 'project_123',  
apiKey: 'sk_test_1234567890',  
database:{
host: 'db.example.com',   
port: 5432, 
database: 'analytics',    
username: 'admin',    
password: 'secure_password'},  
autoTrack: true 
// Automatically track page views, clicks, etc.});
// Initialize and start trackinganalytics.init();
            `}
      />
    </div>
  );
};

export default AutoTracking;
