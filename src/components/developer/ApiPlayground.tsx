"use client";
import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import { ChevronDown, Dot } from "lucide-react";
import React from "react";
import CButton from "../ui/Cbutton";
import Select from "../ui/select";
import clsx from "clsx";
import moment from "moment";

const histories = [
  {
    endpoint: "POST /v1/fingerprint",
    code: 200,
    createdAt: new Date(Date.now()),
    status: "OK",
  },
  {
    endpoint: "GET /v1/identify",
    code: 200,
    createdAt: new Date(Date.now()),
    status: "OK",
  },
  {
    endpoint: "POST /v1/behavior",
    code: 429,
    createdAt: new Date(Date.now()),
    status: "Rate Limited",
  },
];

const ApiPlayground = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="font-semibold text-lg dark:text-white">API Playground</h2>

      <div className="p-6 bg-white dark:bg-dark rounded-xl space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg dark:text-white">
            API Playground
          </h2>

          <div className="flex items-center gap-3 p-2 px-3 rounded-md border dark:border-gray-500 border-gray-200 dark:text-white opacity-60 hover:opacity-100 cursor-pointer">
            <p className="text-sm">POST/v1/fingerprint</p>
            <ChevronDown />
          </div>
        </div>

        <div className=" md:grid-cols-2 grid gap-6">
          <div className="p-6 bg-gray-100 dark:bg-subDark rounded-xl space-y-4">
            <h2 className="font-semibold text-lg dark:text-white">Request</h2>

            <CodeHighlighter
              language=""
              code={`{
  "apiKey": "sb_test_your_key_here",
  "requestId": "req_123456789",
  "linkedId": "user_abc123",
  "timeout": 5000,
  "components": {
    "ip": true,
    "userAgent": true,
    "canvas": true,
    "fonts": true
  }
}
                `}
            />
          </div>
          <div className="p-6 bg-gray-100 dark:bg-subDark rounded-xl space-y-4">
            <h2 className="font-semibold text-lg dark:text-white">Response</h2>

            <CodeHighlighter
              language=""
              code={`{ "visitorId": "fp_d2e3f4g5h6i7j8k9",
"requestId": "req_123456789",
"confidence": 0.99,
"timestamp": "2024-01-15T10:30:00Z",
"components": { 
"ip": "192.168.1.100",
"userAgent": "Mozilla/5.0...",
"canvas": "canvas_hash_abc123",
"fonts": ["Arial", "Helvetica", "Times"] },
"riskScore": 0.12,
"incognito": false }
                `}
            />
          </div>
        </div>

        <div className="flex  gap-3">
          <CButton
            className=" border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white  "
            onClick={() => {}}
          >
            Clear
          </CButton>

          <CButton
            className=" border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white  "
            onClick={() => {}}
          >
            Save as Template
          </CButton>
          <CButton className=" w-fit" onClick={() => {}}>
            Send Request
          </CButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-dark rounded-xl space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg dark:text-white">
              Code Examples
            </h2>
          </div>
          <Select
            label="Language"
            options={[{ value: "javascript", label: "Javascript" }]}
          />
          <CodeHighlighter
            language=""
            code={`// JavaScript 
Example const response = await fetch('/v1/fingerprint', 
{ method: 'POST',
headers: { 'Content-Type': 'application/json', 
'Authorization': 'Bearer YOUR_API_KEY' },
 body: JSON.stringify({ requestId: 'req_123', 
 components: { ip: true, userAgent: true } }) });`}
          />
        </div>

        <div className="p-6 bg-white dark:bg-dark rounded-xl space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg dark:text-white">
              Request History
            </h2>
          </div>

          <div className=" flex flex-col gap-3">
            {histories.map((history, idx) => (
              <div
                key={idx}
                className="p-3 rounded-md dark:bg-subDark bg-gray-200"
              >
                <p
                  className={clsx(
                    "font-medium",
                    history.code >= 400 ? "text-red-500" : "text-green-500"
                  )}
                >
                  {history.endpoint}
                </p>
                <div className=" dark:text-white flex items-center text-sm">
                  <p>{moment(history.createdAt).days(10).toNow()}</p>
                  <Dot />
                  <p>
                    {history.code} <span>{history.status}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-dark rounded-xl space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg dark:text-white">
              Response Schema
            </h2>
          </div>

          <CodeHighlighter
            language=""
            code={`visitorId : string,
requestId : string,
confidence :  number,
timestamp : string,
components : object,
riskScore : number,
incognito :  boolean
            `}
          />
        </div>
      </div>
    </div>
  );
};

export default ApiPlayground;
