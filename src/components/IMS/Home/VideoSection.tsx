/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import CButton from "@/components/ui/Cbutton";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<any | null>(null);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <div className=" min-h-screen bg-[#000017] w-full p-10 space-y-7 ">
      <p className="text-white text-3xl md:text-4xl font-bigshotOne text-center">
        See how our Incident Management System Keeps your Team in Control
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-3">
        <Link href={"/auth/business-signup"}>
          <CButton className=" w-full md:!w-[300px] h-[50px] bg-IMSLightGreen text-white hover:bg-IMSDarkGreen shadow-none text-base">
            Get Started
          </CButton>
        </Link>
        <CButton className="w-full md:!w-[300px]  h-[50px] border bg-transparent hover:bg-transparent border-IMSLightGreen text-IMSLightGreen shadow-none text-base">
          Request War Room Demo
        </CButton>
      </div>
      <motion.div
        initial={{ scale: 0.3 }}
        whileInView={{ scale: 1 }}
        transition={{
          duration: 1,
          ease: "easeIn",
        }}
        viewport={{ once: true }}
        className=" container mx-auto flex justify-center items-center w-12/12 md:w-9/12 h-full rounded-2xl overflow-clip relative"
      >
        <video
          ref={videoRef}
          src="/video/scrubbe-ims.mp4"
          width="500"
          height="300"
          className=" h-full w-full "
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        <div
          className={` size-16 md:size-40 rounded-full justify-center items-center absolute bg-black/50 text-xl md:text-5xl text-white/70 ${
            isPlaying ? "hidden" : "flex"
          }`}
          onClick={handlePlayPause}
        >
          <FaPlay className=" md:translate-x-2" />
        </div>
      </motion.div>
    </div>
  );
};

export default VideoSection;
