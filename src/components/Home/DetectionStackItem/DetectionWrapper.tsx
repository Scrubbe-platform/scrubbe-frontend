import React from "react";
import { detectionTabs } from "../DetectionStack";
import TargetRange from "./TargetRange";
import AutomationNumber from "./AutomationNumber";
import DataIngestion from "./DataIngestion";

type Props = {
  name: string;
};
const DetectionWrapper = ({ name }: Props) => {
  if (name == detectionTabs[0].name) {
    return <TargetRange />;
  }
  if (name == detectionTabs[1].name) {
    return <DataIngestion />;
  }
  if (name == detectionTabs[2].name) {
    return <AutomationNumber />;
  }
};

export default DetectionWrapper;
