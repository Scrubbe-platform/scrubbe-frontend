import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import React from "react";

const NetworkInfo = () => {
  return (
    <CodeHighlighter
      language=""
      code={`
import { NetworkInfo } from '@scrubbe/network-info';
const networkInfo = new NetworkInfo({  enableSpeedTest: true,  enableConnectionType: true,  enableISP: true});
// Get network information
const network = await networkInfo.getNetworkInfo();
console.log('Connection Type:', network.connectionType);
console.log('Download Speed:', network.downloadSpeed);
console.log('Upload Speed:', network.uploadSpeed);
console.log('ISP:', network.isp);
console.log('IP Address:', network.ip);
// Send to analyticsanalytics.setNetworkInfo(network);
        `}
    />
  );
};

export default NetworkInfo;
