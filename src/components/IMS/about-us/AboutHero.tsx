"use client";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Clock from "react-clock";
import "react-clock/dist/Clock.css";

const timeZones = [
  { name: "London", zone: "Europe/London" },
  { name: "New York", zone: "America/New_York" },
  { name: "Lagos", zone: "Africa/Lagos" },
  { name: "Sao Paulo", zone: "America/Sao_Paulo" }, // Using New York as a common US East Coast time zone
  { name: "Singapore", zone: "Asia/Singapore" }, // Cape Town uses the same time zone as Johannesburg
];

const AboutHero = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getCurrentTimeForTimeZone(timeZone: any) {
    const now = new Date();
    const dateInTimeZone = new Date(now.toLocaleString("en-US", { timeZone }));

    return dateInTimeZone;
  }

  const [london, setLondon] = useState(
    getCurrentTimeForTimeZone(timeZones[0].zone)
  );
  const [nairobi, setNairobi] = useState(
    getCurrentTimeForTimeZone(timeZones[1].zone)
  );
  const [lagos, setLagos] = useState(
    getCurrentTimeForTimeZone(timeZones[2].zone)
  );
  const [washington, setWashington] = useState(
    getCurrentTimeForTimeZone(timeZones[3].zone)
  );
  const [capetown, setCapetown] = useState(
    getCurrentTimeForTimeZone(timeZones[4].zone)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLondon(getCurrentTimeForTimeZone(timeZones[0].zone));
      setNairobi(getCurrentTimeForTimeZone(timeZones[1].zone));
      setLagos(getCurrentTimeForTimeZone(timeZones[2].zone));
      setWashington(getCurrentTimeForTimeZone(timeZones[3].zone));
      setCapetown(getCurrentTimeForTimeZone(timeZones[4].zone));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="w-full min-h-[800px] relative z-0">
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-10 justify-center h-full px-4 md:px-6 lg:px-20 xl:px-20 pt-40 py-20">
        <div>
          <h1 className="text-white md:text-[60px] text-[30px] font-bigshotOne max-w-4xl ">
            Reliability-first{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan via-[#8250BE] to-IMSCyan">
               incident intelligence {" "}
            </span>{" "}
            for teams who ship real money and real risk.
          </h1>
          <p className="text-white  md:text-lg max-w-3xl">
            Scrubbe is built for engineering and fraud teams who can’t afford
            “best effort” incident management. We blend incident workflows,
            code-aware remediation, CI/CD pipelines, and fraud signals into a
            single system that actually helps you close the loop — not just log
            the chaos.
          </p>

          <div className=" grid md:grid-cols-2 max-w-4xl gap-8 mx-auto mt-10">
            <div className=" bg-gradient-to-t from-[#004B571A] to-[#0074834D] border border-IMSCyan/30 rounded-2xl p-4 flex-col gap-2 text-white">
              <p>WHAT WE BELIEVE</p>
              <p className=" font-semibold">
                Incidents start in code, not tickets.
              </p>
              <p>
                Most tools stare at tickets. Scrubbe stares at git log,
                pipelines, metrics and fraud events.
              </p>
            </div>

            <div className=" bg-gradient-to-t from-[#004B571A] to-[#0074834D] border border-IMSCyan/30 rounded-2xl p-4 flex-col gap-2 text-white">
              <p>WHO WE BUILD FOR</p>
              <ul className=" pl-5 space-y-2 list-disc text-sm">
                <li> Dev & SRE teams shipping weekly</li>
                <li>Fintech & payments reliability</li>
                <li>Fraud & risk engineering squads</li>
              </ul>
            </div>
          </div>
        </div>

        <div className=" bg-gradient-to-t from-[#004B571A] to-[#0074834D] h-fit border-IMSCyan/35 border min-h-[300px] w-full rounded-lg p-5 md:p-10 space-y-5 ">
          <p className="text-2xl text-white font-bold">
            Reliability across regions
          </p>
          <p className=" text-lg font-bold text-white">
            We design for global uptime.{" "}
          </p>
          <p className="text-base text-white">
            Five regions, one incident brain — Scrubbe treats the planet as your
            failure domain.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 place-items-center">
            <div className="flex flex-col items-center gap-3 justify-evenly text-white">
              <div className="bg-white rounded-full">
                <Clock value={london} size={100} />
              </div>
              <div>
                <p className="font-bold text-center">London</p>
                <p className="text-center text-sm text-green">
                  Core uptime region
                </p>
                <p className=" text-center text-sm">
                  {moment(london).format("HH:mm a")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 justify-evenly text-white">
              <div className="bg-white rounded-full">
                <Clock value={nairobi} size={100} />
              </div>
              <div>
                <p className="font-bold text-center">New York</p>
                <p className="text-center text-sm text-green">
                  US fintech corridor
                </p>
                <p className=" text-center text-sm">
                  {moment(nairobi).format("HH:mm a")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 justify-evenly text-white">
              <div className="bg-white rounded-full">
                <Clock value={lagos} size={100} />
              </div>
              <div>
                <p className="font-bold text-center">Lagos</p>
                <p className="text-center text-sm text-green">
                  High-growth Africa
                </p>
                <p className=" text-center text-sm">
                  {moment(lagos).format("HH:mm a")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 justify-evenly text-white">
              <div className="bg-white rounded-full">
                <Clock value={washington} size={100} />
              </div>
              <div>
                <p className="font-bold text-center">São Paulo</p>
                <p className="text-center text-sm text-green">
                  LatAm <br /> payments
                </p>
                <p className=" text-center text-sm">
                  {moment(washington).format("HH:mm a")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 justify-evenly text-white">
              <div className="bg-white rounded-full">
                <Clock value={capetown} size={100} />
              </div>
              <div>
                <p className="font-bold text-center">Singapore</p>
                <p className="text-center text-sm text-green">
                  APAC <br /> rail
                </p>
                <p className=" text-center text-sm">
                  {moment(capetown).format("HH:mm a")}
                </p>
              </div>
            </div>{" "}
          </div>
          <p className="text-white text-base text-center">
            Scrubbe’s incident model was designed for teams operating
            across time zones, currencies and regulatory zones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
