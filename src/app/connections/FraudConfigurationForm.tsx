import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import React from "react";
import { BiGitRepoForked } from "react-icons/bi";

type Props = {
  integration: string;
};

const FraudConfigurationForm = ({ integration }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg text-white">{integration}</h2>
      </div>
      <div className="border border-gray-400 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-white text-base font-bold">
          <BiGitRepoForked />
          <p>Fraud metrics & signals</p>
        </div>
        <p className="text-sm text-white">
          Scrubbe listens to fraud metrics, events and risk APIs, so incidents
          can distinguish noisy technical issues from real fraud, abuse or money
          leakage.
        </p>
      </div>

      <div>
        <Input
          label="Display Name"
          placeholder="eg GitHub . Core Org"
          labelClassName="text-white"
          className="text-white"
        />
        <Input
          label="API base URL / broker host"
          placeholder="eg  https://github.com / db. example.com"
          labelClassName="text-white"
          className="text-white"
        />
        <Input
          label="API Key / stream auth"
          placeholder="Paste a read-only  token or key"
          labelClassName="text-white"
          className="text-white"
        />
        <p className="text-white text-sm pb-4">
          Scrubbe uses this to read metadata , pipeline results and metrics -
          never to push changes{" "}
        </p>
        <div className="grid grid-cols-2 gap-5">
          <Input
            label="Tenant / topic / dataset"
            placeholder="eg scrubbe-core , analytics -d"
            labelClassName="text-white"
            className="text-white"
          />
          <Input
            label="Environment tags"
            placeholder="eg prod , staging"
            labelClassName="text-white"
            className="text-white"
          />
        </div>
        <TextArea
          label="Notes  for your team ( optional )"
          placeholder="Example : Github Org  for customer - facing services only . Jenkins instance is internal only"
          labelClassName="text-white"
          className="text-white"
        />
        <CButton>Save</CButton>
      </div>
    </div>
  );
};

export default FraudConfigurationForm;
