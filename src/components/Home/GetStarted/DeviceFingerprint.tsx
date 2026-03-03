import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import React from "react";

const DeviceFingerprint = () => {
  return (
    <CodeHighlighter
      language=""
      code={`
import { DeviceFingerprint } from '@scrubbe/device-fingerprint';
const deviceFP = new DeviceFingerprint({
enableCanvas: true,  
enableWebGL: true,  
enableAudio: true,  
enableScreen: true,  
enableBrowser: true});
// Get device fingerprint
const fingerprint = await deviceFP.generate();
console.log('Device ID:', fingerprint.deviceId);
console.log('Canvas Hash:', fingerprint.canvas);
console.log('WebGL Hash:', fingerprint.webgl);
console.log('Audio Hash:', fingerprint.audio);
console.log('Screen Info:', fingerprint.screen);
console.log('Browser Info:', fingerprint.browser);
// Send to analytics
analytics.setDeviceFingerprint(fingerprint);
          `}
    />
  );
};

export default DeviceFingerprint;
