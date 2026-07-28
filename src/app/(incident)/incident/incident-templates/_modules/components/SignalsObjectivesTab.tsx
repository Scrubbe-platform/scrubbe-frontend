"use client";

import React from "react";
import { Card, CardHeader, CheckList, RankList } from "./DetailPrimitives";
import { INVESTIGATION_OBJECTIVES, SIGNAL_PRIORITIES } from "./incidentTemplates.data";

export default function SignalsObjectivesTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Signal Priorities" hint="ranked by weight" />
        <RankList items={SIGNAL_PRIORITIES} />
      </Card>
      <Card>
        <CardHeader title="Investigation Objectives" />
        <CheckList items={INVESTIGATION_OBJECTIVES} />
      </Card>
    </div>
  );
}
