"use client";
import React, { useState } from "react";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import Modal from "../ui/Modal";
import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import { SiDatadog, SiZapier } from "react-icons/si";
import { FaLock, FaSlack } from "react-icons/fa";

const sdks = [
  { name: "JavaScript SDK", version: "v2.1.4", size: "45KB" },
  { name: "Python  SDK", version: "v1.8.2", size: "67KB" },
  { name: "PHP SDK", version: "v1.5.7", size: "52KB" },
  { name: "Ruby SDK", version: "v1.3.9", size: "38KB" },
];

const cicd = [
  { name: "GitHub Actions", desc: "Automated testing workflow" },
  { name: "Jenkins Pipeline", desc: "Continuous integration" },
  { name: "Docker Container", desc: "Containerized deployment" },
  { name: "React Integration", desc: "Complete React component with hooks" },
  {
    name: "Express.js Middleware",
    desc: "Node.js Express middleware integration",
  },
  { name: "Django Integration", desc: "Python Django framework integration" },
];

const thirdParty = [
  { name: "Slack", desc: "Alert notifications", status: "Connected" },
  { name: "Zapier", desc: "Workflow automation", status: "Connect" },
  { name: "Datadog", desc: "Performance monitoring", status: "Connect" },
];

const IntegrationTools = () => {
  const [openGenerateCode, setOpenGenerateCode] = useState(false);
  const [openOtherTemplate, setOpenOtherTemplate] = useState(false);
  const [openSetupWizard, setOpenSetupWizard] = useState(false);
  const [openIntegration, setOpenIntegration] = useState(false);
  return (
    <div className="p-6  min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">
        Integration Tools
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SDK Downloads */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 flex justify-between flex-col gap-4 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">
              SDK Downloads
            </h3>
            <div className="flex flex-col gap-2">
              {sdks.map((sdk) => (
                <div
                  key={sdk.name}
                  className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                >
                  <div>
                    <span className="font-medium dark:text-white">
                      {sdk.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {sdk.version} - {sdk.size}
                    </span>
                  </div>
                  <button className="px-4 py-1 bg-blue-50 text-blue-700 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-dark dark:text-blue-400 dark:border-blue-400 transition">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
          <CButton>View all SDK</CButton>
        </div>

        {/* Code Examples */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Code Examples
          </h3>
          <div className="flex flex-col gap-3">
            <Select
              label="Framework"
              options={[
                { value: "react", label: "React" },
                { value: "vue", label: "Vue" },
                { value: "angular", label: "Angular" },
                { value: "node.js", label: "Node.js" },
              ]}
            />
            <Select
              label="Use Case"
              options={[
                {
                  value: "Device Fingerprinting",
                  label: "Device Fingerprinting",
                },
                { value: "Authentication", label: "Authentication" },
                { value: "API Integration", label: "API Integration" },
              ]}
            />
            <Select
              label="Use Case"
              options={[
                { value: "Production", label: "Production" },
                { value: "Staging", label: "Staging" },
                { value: "Development", label: "Development" },
              ]}
            />
          </div>
          <CButton onClick={() => setOpenGenerateCode(true)}>
            Generate code
          </CButton>
        </div>

        {/* CI/CD Integration */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            CI/CD Integration
          </h3>
          <div className="flex flex-col gap-2">
            {cicd.slice(0, 3).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
                <button
                  onClick={() => setOpenSetupWizard(true)}
                  className="px-4 py-1 bg-blue-50 text-blue-700 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-dark dark:text-blue-400 dark:border-blue-400 transition"
                >
                  Setup
                </button>
              </div>
            ))}
          </div>
          <CButton onClick={() => setOpenOtherTemplate(true)}>
            View all templates
          </CButton>
        </div>

        {/* Postman Collection */}
        <div className="bg-white dark:bg-dark rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Postman Collection
          </h3>
          <div className="mb-2">
            <div className="font-medium dark:text-white">
              Complete API Collection
            </div>
            <div className="text-gray-500 text-sm dark:text-gray-400 mb-2">
              All endpoints with examples and tests
            </div>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2 dark:text-white">
                <span className="text-green-600 dark:text-green-400">✔</span> 25
                API Endpoints
              </li>
              <li className="flex items-center gap-2 dark:text-white">
                <span className="text-green-600 dark:text-green-400">✔</span>{" "}
                Response Examples
              </li>
              <li className="flex items-center gap-2 dark:text-white">
                <span className="text-green-600 dark:text-green-400">✔</span>{" "}
                Environment Variables
              </li>
              <li className="flex items-center gap-2 dark:text-white">
                <span className="text-green-600 dark:text-green-400">✔</span>{" "}
                Pre-configured Auth
              </li>
              <li className="flex items-center gap-2 dark:text-white">
                <span className="text-green-600 dark:text-green-400">✔</span>{" "}
                Pre-configured Auth
              </li>
              <li className="flex items-center gap-2 dark:text-white">
                <span className="text-green-600 dark:text-green-400">✔</span>{" "}
                Error Handling
              </li>
            </ul>
          </div>
          <CButton>Import to Postman</CButton>
        </div>
        <div className="grid md:grid-cols-2">
          {/* Third-Party Integration */}
          <div className="bg-white dark:bg-dark rounded-xl p-6 flex flex-col gap-4 shadow-sm col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">
              Third-Party Integration
            </h3>
            <div className="flex flex-col gap-2">
              {thirdParty.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                >
                  <div>
                    <p className="font-medium dark:text-white">{item.name}</p>
                    <p className=" text-xs text-gray-500 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                  {item.status === "Connected" ? (
                    <span className="px-4 py-1 bg-green-50 text-green-700 border border-green-600 rounded-lg text-sm font-medium dark:bg-dark dark:text-green-400 dark:border-green-400">
                      Connected
                    </span>
                  ) : (
                    <button className="px-4 py-1 bg-blue-50 text-blue-700 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-dark dark:text-blue-400 dark:border-blue-400 transition">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
            <CButton onClick={() => setOpenIntegration(true)}>
              Browse Integrations
            </CButton>
          </div>
        </div>
      </div>

      <Modal
        onClose={() => setOpenGenerateCode(false)}
        isOpen={openGenerateCode}
      >
        <h2 className="text-xl font-medium mb-4 dark:text-white">
          Generate Code
        </h2>
        <CodeHighlighter
          language=""
          code={`import { ScrubbeFP } from '@scrubbe/fingerprint-sdk';  
const scrubbe = new ScrubbeFP({ apiKey: 'YOUR_API_KEY', 
environment: 'production' });  
// Initialize fingerprinting 
scrubbe.identify({ linkedId: 'user_123', 
components: { device: true, browser: true, behavior: true } })
    .then(result => { console.log('Visitor ID:', result.visitorId); 
console.log('Risk Score:', result.riskScore); })
.catch(error => { console.error('Error:', error); });
            `}
        />
        <div className=" float-end mt-8">
          <CButton onClick={() => setOpenGenerateCode(false)}>Close</CButton>
        </div>
      </Modal>

      <Modal
        onClose={() => setOpenOtherTemplate(false)}
        isOpen={openOtherTemplate}
      >
        <div className="  rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            CI/CD Integration
          </h3>
          <div className="flex flex-col gap-2">
            {cicd.slice(3).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
                <button className="px-4 py-1 bg-blue-50 text-blue-700 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-dark dark:text-blue-400 dark:border-blue-400 transition">
                  Use Template
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <CButton
              className=" border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white  "
              onClick={() => setOpenOtherTemplate(false)}
            >
              Cancel
            </CButton>
            <CButton className=" w-fit">Browse More</CButton>
          </div>
        </div>
      </Modal>

      <Modal onClose={() => setOpenSetupWizard(false)} isOpen={openSetupWizard}>
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Setup Wizard
          </h2>
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#23263a] rounded-lg p-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                1
              </div>
              <div>
                <div className="font-semibold text-lg dark:text-white">
                  Install Dependencies
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm mt-1">
                  npm install @scrubbe/sdk
                </div>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#23263a] rounded-lg p-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                2
              </div>
              <div>
                <div className="font-semibold text-lg dark:text-white">
                  Configure API Key
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm mt-1">
                  Add your API key to environment variables
                </div>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#23263a] rounded-lg p-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                3
              </div>
              <div>
                <div className="font-semibold text-lg dark:text-white">
                  Initialize SDK
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm mt-1">
                  Import and configure the SDK in your app
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <CButton
            className=" border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white  "
            onClick={() => setOpenSetupWizard(false)}
          >
            Cancel
          </CButton>
          <CButton className=" w-fit">Start Setup</CButton>
        </div>
      </Modal>

      <Modal onClose={() => setOpenIntegration(false)} isOpen={openIntegration}>
        {/* Implement here */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Integration Catalog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zapier */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181C2A] p-8 flex flex-col items-center justify-center text-center transition hover:shadow-md">
              <SiZapier className="text-3xl text-blue-600 mb-2" />
              <div className="font-bold text-lg dark:text-white">Zapier</div>
              <div className="text-gray-500 dark:text-gray-300 mt-1">
                Automation Workflow
              </div>
            </div>
            {/* Slack */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181C2A] p-8 flex flex-col items-center justify-center text-center transition hover:shadow-md">
              <FaSlack className="text-3xl text-blue-600 mb-2" />
              <div className="font-bold text-lg dark:text-white">Slack</div>
              <div className="text-gray-500 dark:text-gray-300 mt-1">
                Team notifications
              </div>
            </div>
            {/* Datadog */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181C2A] p-8 flex flex-col items-center justify-center text-center transition hover:shadow-md">
              <SiDatadog className="text-3xl text-blue-600 mb-2" />
              <div className="font-bold text-lg dark:text-white">Datadog</div>
              <div className="text-gray-500 dark:text-gray-300 mt-1">
                Monitoring & analytics
              </div>
            </div>
            {/* Auth0 */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181C2A] p-8 flex flex-col items-center justify-center text-center transition hover:shadow-md">
              <FaLock className="text-3xl text-blue-600 mb-2" />
              <div className="font-bold text-lg dark:text-white">Auth0</div>
              <div className="text-gray-500 dark:text-gray-300 mt-1">
                Identity platform
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <CButton
              className=" border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white  "
              onClick={() => setOpenOtherTemplate(false)}
            >
              Cancel
            </CButton>
            <CButton className=" w-fit">Request Integration</CButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IntegrationTools;
