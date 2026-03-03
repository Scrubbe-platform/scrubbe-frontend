import AboutHero from "./AboutHero";
import CTA from "./CTA";
import OurMission from "./OurMission";
import WhyWeExist from "./WhyWeExist";

const IncidentAboutUs = () => {
  return (
    <div className=" bg-[#08132F]">
      <AboutHero />
      <OurMission />
      {/* <WhatWeDo /> */}
      <WhyWeExist />
      {/* <WhoWeServe /> */}
      {/* <WhyChooseScrubbe /> */}
      {/* <Impact /> */}
      {/* <Globe /> */}
      <CTA />
    </div>
  );
};

export default IncidentAboutUs;
