import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import React from "react";

const LocationTesting = () => {
  return (
    <CodeHighlighter
      language=""
      code={`
import { LocationTracker } from '@scrubbe/location-tracker';
const locationTracker = new LocationTracker({  enableGPS: true,  enableIP: true,  enableTimezone: true,  accuracy: 'high'});
// Get location information
const location = await locationTracker.getLocation();
console.log('Coordinates:', location.coordinates);
console.log('Country:', location.country);
console.log('City:', location.city);
console.log('Timezone:', location.timezone);
console.log('IP Address:', location.ip);
// Send to analyticsanalytics.setLocation(location);
        `}
    />
  );
};

export default LocationTesting;
