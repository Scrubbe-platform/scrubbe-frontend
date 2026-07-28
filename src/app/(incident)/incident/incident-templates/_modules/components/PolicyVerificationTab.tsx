"use client";

import React from "react";
import { Card, CardHeader, CheckList, KVRows } from "./DetailPrimitives";
import { POLICY_ENGINE, VERIFICATION_REQUIREMENTS } from "./incidentTemplates.data";

export default function PolicyVerificationTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Policy Engine" />
        <KVRows rows={POLICY_ENGINE} />
      </Card>
      <Card>
        <CardHeader title="Verification Requirements" hint="before closure" />
        <CheckList items={VERIFICATION_REQUIREMENTS} />
      </Card>
    </div>
  );
}
