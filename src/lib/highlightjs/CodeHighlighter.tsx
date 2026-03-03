"use client";
import { useRef, useState } from "react";
// import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark-reasonable.min.css";

interface CodeHighlighterProps {
  language: string;
  code: string;
}

export default function CodeHighlighter({
  language,
  code,
}: CodeHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  // useEffect(() => {
  //   if (codeRef.current) {
  //     hljs.highlightElement(codeRef.current);
  //   }
  // }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative mx-auto">
      <pre className="whitespace-pre">
        <code ref={codeRef} className={language}>
          {code}
        </code>
      </pre>

      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-gray-800 text-white text-sm px-3 py-1 rounded hover:bg-gray-700 transition"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

/* 
How to see all available styles:
You can check your node_modules/highlight.js/styles/ folder in your project, or just browse the Highlight.js GitHub repo here:
https://github.com/highlightjs/highlight.js/tree/main/src/styles

  whitespace-normal 
  and
  whitespace-pre interchange for extra spacing control etc
*/
