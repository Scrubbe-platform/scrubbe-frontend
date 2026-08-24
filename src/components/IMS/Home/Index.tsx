import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import Impacts from "./Impacts";
import Contact from "./Contact";
import ApiReference from "./ApiReference";
import CategoryShiftBanner from "./CategoryShiftBanner";
import TickerItem from "./TickerItem";
import NvidiaInceptionSection from "./NvidiaInceptionSection";
import MttrSection from "./MttrSection";
import CategoryStatement from "./CategoryStatement";
import ProblemSection from "./ProblemSection";
import TransformationSection from "./TransformationalSection";
import WhyScrubbeExists from "./WhyScrubbeExist";
import WhoUsesScrubbe from "./WhoUseScrubbe";
import ClosedLoopProof from "./ClosedLoopPool";
import HowItWorks from "./HowItWorks";
import FeaturesSection from "./FeatureSection";
import VideoSection from "./VideoSection";
import ConnectorsSection from "./ConnectorSection";
import IndustriesSection from "./IndustriesSection";
import GovernanceSection from "./GovernanceSection";
import WarRoomSection from "./WarRoomSection";
import APISection from "./ApiSection";
import EzraCodeEngineSection from "./CodeEngineSuggestionSection";
import MigrationSection from "./MigrationSection";
import RecommendedActions from "./RecommendedAction";
import RecentFindings from "./RecentFindings";
import ScrubbeSDKSection from "./SdkSection";
import TalkToUsSection from "./TalkToUsSection";

const Index = () => {
  return (
    <div className=" overflow-x-hidden">
      <Hero />
      <TickerItem />
      <NvidiaInceptionSection />
      <TransformationSection />
      <MttrSection />
      {/* <WhyScrubbeExists /> */}
      <WhoUsesScrubbe />
      {/* <ClosedLoopProof /> */}
      {/* <HowItWorks /> */}
      {/* <FeaturesSection /> */}
      {/* <RecommendedActions /> */}
      <VideoSection />
      <ConnectorsSection />
      {/* <IndustriesSection /> */}
      {/* <RecentFindings /> */}
      {/* <GovernanceSection /> */}
      {/* <WarRoomSection /> */}
      <APISection />
      {/* <ScrubbeSDKSection /> */}
      <EzraCodeEngineSection />
      <MigrationSection />
      <TalkToUsSection />
    </div>
  );
};

export default Index;
