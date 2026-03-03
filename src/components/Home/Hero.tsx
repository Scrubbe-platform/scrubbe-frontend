"use client";
import React, { useEffect, useState, useRef } from "react";
import CButton from "../ui/Cbutton";
import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Connect",
    description:
      "Detect, investigate, and respond to fraud, account takeovers, and behavioral anomalies with AI-powered precision.",
  },
  {
    number: 2,
    title: "Analyze",
    description:
      "Scrubbe delivers full stack threat intelligence from raw logs to analyst ready insights without the noise",
  },
];
const Hero = () => {
  const [activeStep, setActiveStep] = useState(1);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length) {
          return 1; // Reset to 1 when reaching the end
        }
        return prev + 1;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [steps]);

  // Progress countdown effect
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    const start = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const newProgress = Math.max(0, 1 - elapsed / 10000);
      if (newProgress === 0) {
        if (progressInterval.current) clearInterval(progressInterval.current);
      }
    }, 16); // ~60fps
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeStep]);

  const step = steps[activeStep - 1];

  // SVG circle constants
  // const size = window.innerWidth > 768 ? 60 : 40;
  // const stroke = 4;
  // const radius = (size - stroke) / 2;
  // const circumference = 2 * Math.PI * radius;
  // const dashOffset = circumference * (1 - progress);

  return (
    <section className=" bg-white px-4 md:px-6 lg:px-20 xl:px-20 py-10 ">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className=" max-w-[1440px] mx-auto h-full lg:h-[600px] bg-[#6A5ACD] rounded-[40px] flex lg:flex-row flex-col relative overflow-clip"
      >
        <div className="sm:p-10 p-4 lg:h-[80%] h-[749px] flex flex-col items-center lg:items-start md:justify-center gap-5 lg:gap-10 z-20">
          <h1 className=" text-white xl:text-[40px] md:text-[36px] text-[24px] leading-tight  font-bold lg:text-start text-center pt-4">
            AI-Powered security architecture <br className=" md:block hidden" />{" "}
            with behavioural analytics for <br className=" md:block hidden" />{" "}
            fintechs and digital businesses- <br className=" md:block hidden" />
            No SOC Team required
          </h1>
          <div className="flex   flex-col space-y-6 sm:space-y-8">
            {
              <div
                key={step.number}
                className={`flex justify-center items-start transition-all duration-300 ${
                  activeStep === step.number ? "scale-[1.02]" : ""
                }`}
              >
                {/* <div className="relative flex-shrink-0 w-[40px] sm:w-[60px] h-[40px] sm:h-[60px] rounded-full bg-white flex items-center justify-center mr-4 sm:mr-5">
                  <span className="text-[20px] sm:text-[24px] font-bold">
                    {step.number}
                  </span>
                  {activeStep === step.number && (
                    <svg
                      width={size}
                      height={size}
                      className="absolute inset-0"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={stroke}
                      />
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#1F3A89"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 0.05s linear" }}
                      />
                    </svg>
                  )}
                </div> */}

                <div className="min-h-[100px]">
                  <p
                    className={`${
                      activeStep === step.number ? "text-white" : "text-white"
                    } text-lg sm:text-xl leading-relaxed max-w-lg font-medium 2xl:w-full lg:w-[70%] w-full`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            }
          </div>
          <div className=" flex items-center lg:justify-start justify-center md:flex-row flex-col gap-4 w-full">
            <CButton className=" md:w-fit w-full">Get a Demo</CButton>
            <CButton className=" md:w-fit w-full bg-white text-colorScBlue hover:bg-white">
              View AI dashboard
            </CButton>
          </div>
        </div>
        <div className=" h-[300%] bg-white w-[50%] absolute -top-[100%] lg:block hidden lg:-right-[10%] xl:-right-[15%] 2xl:-right-[22%]  rotate-45" />
        <div className=" h-[100%] bg-white w-[50%] absolute left-[30%]  min-[400px]:bottom-[-17%] bottom-[-14%] block sm:hidden min-[472px]:rotate-[75deg] min-[400px]:rotate-[72deg] rotate-[69deg]" />
        <div>
          <img
            src="/Emma2.gif"
            alt=""
            className=" lg:block hidden absolute right-0 max-w-[800px] h-full rounded-r-[40px] xl:scale-110 object-cover"
          />

          <img
            src="/Emma2.gif"
            alt=""
            className=" block md:hidden absolute bottom-0 w-full  h-[400px] brightness-50 rounded-b-[40px]"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
