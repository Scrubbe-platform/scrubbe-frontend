"use client";
import SideModal from "@/components/ui/SideModal";
import React, { ReactNode } from "react";
import RepoConfigurationForm from "./RepoConfigurationForm";
import CiCdConfigurationForm from "./CiCdConfigurationForm";
import RuntimeConfigurationForm from "./RuntimeConfigurationForm";
import DatastoresConfigurationForm from "./DatastoreConfigurationForm";
import FraudConfigurationForm from "./FraudConfigurationForm";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  type:
    | "none"
    | "code_repos"
    | "cicd"
    | "runtime"
    | "datastores"
    | "fraud_metrics"
    | string;
  integration: string;
  integrationType: string;
};
const ConfigureIntegration = ({
  open,
  setOpen,
  type,
  integration,
  integrationType,
}: Props) => {
  switch (type) {
    case "code_repos":
      return (
        <ConfigureModal open={open} setOpen={setOpen}>
          <RepoConfigurationForm
            integration={integration}
            integrationType={integrationType}
            onSuccess={() => setOpen(false)}
          />
        </ConfigureModal>
      );
    case "cicd":
      return (
        <ConfigureModal open={open} setOpen={setOpen}>
          <CiCdConfigurationForm
            integration={integration}
            integrationType={integrationType}
            onSuccess={() => setOpen(false)}
          />
        </ConfigureModal>
      );
    case "runtime":
      return (
        <ConfigureModal open={open} setOpen={setOpen}>
          <RuntimeConfigurationForm
            integration={integration}
            integrationType={integrationType}
            onSuccess={() => setOpen(false)}
          />
        </ConfigureModal>
      );
    case "datastores":
      return (
        <ConfigureModal open={open} setOpen={setOpen}>
          <DatastoresConfigurationForm
            integration={integration}
            integrationType={integrationType}
            onSuccess={() => setOpen(false)}
          />
        </ConfigureModal>
      );
    case "fraud_metrics":
      return (
        <ConfigureModal open={open} setOpen={setOpen}>
          <FraudConfigurationForm
            integration={integration}
            integrationType={integrationType}
            onSuccess={() => setOpen(false)}
          />
        </ConfigureModal>
      );
    default:
      return null;
  }
};

type ModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  children: ReactNode;
};

const ConfigureModal = ({ open, setOpen, children }: ModalProps) => {
  return (
    <SideModal
      title="Configure Integration"
      isOpen={open}
      onClose={() => setOpen(false)}
    >
      {children}
    </SideModal>
  );
};

export default ConfigureIntegration;
