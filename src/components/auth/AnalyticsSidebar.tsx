"use client";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function AnalyticsSidebar() {
  const signupChartRef = useRef<HTMLCanvasElement>(null);
  const authMethodsChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Store references to canvas elements to use in cleanup
    const signupCanvas = signupChartRef.current;
    const authCanvas = authMethodsChartRef.current;

    let signupChartInstance: Chart | undefined;
    let authChartInstance: Chart | undefined;

    // Function to initialize charts
    const initializeCharts = () => {
      if (signupCanvas && authCanvas) {
        // Destroy existing charts if they exist
        if (signupChartInstance) signupChartInstance.destroy();
        if (authChartInstance) authChartInstance.destroy();

        // Signup Activity Chart
        const signupCtx = signupCanvas.getContext("2d");

        if (signupCtx) {
          signupChartInstance = new Chart(signupCtx, {
            type: "line",
            data: {
              labels: ["Jan", "Feb", "March", "April", "May", "June", "July"],
              datasets: [
                {
                  label: "Business",
                  data: [2, 2, 3, 4, 4, 4, 6],
                  borderColor: "#1a237e",
                  backgroundColor: "#99c2ff",
                  tension: 0.3,
                  fill: true,
                  borderWidth: 2,
                  pointBackgroundColor: "#1a237e",
                  pointRadius: 4,
                },
                {
                  label: "Developer",
                  data: [2, 3, 3, 4, 5, 5, 6],
                  borderColor: "#9575cd",
                  backgroundColor: "#e5e7eb",
                  tension: 0.3,
                  fill: true,
                  borderWidth: 2,
                  pointBackgroundColor: "#9575cd",
                  pointRadius: 4,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  titleColor: "#333",
                  bodyColor: "#333",
                  borderColor: "#ddd",
                  borderWidth: 1,
                  padding: 10,
                  displayColors: true,
                  usePointStyle: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    display: true,
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "#333",
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: "#333",
                  },
                },
              },
            },
          });
        }

        // Authentication Methods Chart
        const authCtx = authCanvas.getContext("2d");

        if (authCtx) {
          authChartInstance = new Chart(authCtx, {
            type: "doughnut",
            data: {
              labels: ["Email", "SSO", "Cloud", "GitHub", "Gitlab"],
              datasets: [
                {
                  data: [1, 2, 1, 1, 1],
                  backgroundColor: [
                    "#1F3A89", // Light blue for Email
                    "#DBEAFE", // Dark blue for SSO
                    "#61A5F9", // Very light blue for Cloud qq
                    "#086763", // Navy blue for GitHub
                    "#00C9B7", // Teal for Gitlab
                  ],
                  borderWidth: 0,
                  borderRadius: 5,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: "60%",
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  titleColor: "#333",
                  bodyColor: "#333",
                  borderColor: "#ddd",
                  borderWidth: 1,
                  padding: 10,
                  displayColors: true,
                  usePointStyle: true,
                },
              },
            },
          });
        }
      }
    };

    // Initialize charts
    initializeCharts();

    // Add resize event listener to make charts responsive
    if (typeof window !== "undefined") {
      window.addEventListener("resize", initializeCharts);
    }

    // Cleanup function to destroy charts on unmount
    return () => {
      if (signupChartInstance) signupChartInstance.destroy();
      if (authChartInstance) authChartInstance.destroy();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", initializeCharts);
      }
    };
  }, []);

  return (
    <section className="w-full mx-auto bg-gradient-to-b from-[#1F40AE] to-[#0D1A48] p-4 md:p-8">
      {/* Title Section */}
      <div className="text-center mb-6">
        <h1 className="text-[20px] sm:text-[28px] lg:text-[36px] font-bold text-white uppercase tracking-wide">
          SIEM and SOAR Solution
        </h1>
      </div>

      {/* Charts Column Layout */}
      <div className="flex flex-col gap-4 items-center">
        {/* User Signup Activity Card */}
        <div className="bg-white rounded-lg shadow p-4 w-full max-w-[510px]">
          <h2 className="text-gray-800 text-base font-medium mb-4">
            User Sign up Activity
          </h2>
          <div className="h-[400px] relative">
            <canvas ref={signupChartRef}></canvas>
          </div>
          <div className="flex gap-4 mt-3 ">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-900 mr-2"></div>
              <span>Business</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-purple-400 mr-2"></div>
              <span>Developer</span>
            </div>
          </div>
        </div>

        {/* Authentication Methods Card */}
        <div className="bg-white rounded-lg shadow p-4 w-full max-w-[510px] ">
          <h2 className="text-gray-800 text-base font-medium mb-4">
            Authentication Methods
          </h2>
          <div className="h-[400px] relative">
            <canvas ref={authMethodsChartRef}></canvas>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-[#1F3A89] mr-2"></div>
              <span>Email</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-[#DBEAFE] mr-2"></div>
              <span>SSO</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-[#61A5F9] mr-2"></div>
              <span>Cloud</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-[#086763] mr-2"></div>
              <span>GitHub</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-[#00C9B7] mr-2"></div>
              <span>Gitlab</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
