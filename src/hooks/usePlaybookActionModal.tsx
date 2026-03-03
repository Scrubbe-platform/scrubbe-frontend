import Modal from "@/components/ui/Modal";
import { useState } from "react";

const usePlaybookActionModal = () => {
  const [action, setAction] = useState<
    | "Unauthorized access"
    | "Failed Login"
    | "Phishing Email"
    | "Severity = High"
    | "Send Alert"
    | "Block IP"
    | "Log event"
    | "Send Slack Message"
    | "Create Jira Ticket"
    | null
  >(null);

  const handleClickAction = (action: string) => {
    setAction(
      action as
        | "Unauthorized access"
        | "Failed Login"
        | "Phishing Email"
        | "Severity = High"
        | "Send Alert"
        | "Block IP"
        | "Log event"
        | "Send Slack Message"
        | "Create Jira Ticket"
        | null
    );
  };
  const handleCloseModal = () => {
    setAction(null);
  };

  let content: React.ReactNode;
  switch (action) {
    // case "Unauthorized access":
    //   content = <UnauthorizedAccess closeModal={handleCloseModal} />;
    //   break;
    // case "Failed Login":
    //   content = <FailedLoginModal closeModal={handleCloseModal} />;
    //   break;
    // case "Phishing Email":
    //   content = <PhisingEmail closeModal={handleCloseModal} />;
    //   break;
    // case "Severity = High":
    //   content = <SeverityModal closeModal={handleCloseModal} />;
    //   break;
    // case "Send Alert":
    //   content = <SendAlertModal closeModal={handleCloseModal} />;
    //   break;
    // case "Block IP":
    //   content = <BlockIpModal closeModal={handleCloseModal} />;
    //   break;
    // case "Log event":
    //   content = <LogEvent closeModal={handleCloseModal} />;
    //   break;
    // case "Send Slack Message":
    //   content = <SlackMessageModal closeModal={handleCloseModal} />;
    //   break;
    // case "Create Jira Ticket":
    //   content = <JiraTicketModal closeModal={handleCloseModal} />;
    //   break;
    default:
      content = <div>Unauthorized access</div>;
      break;
  }
  return {
    action,
    handleClickAction,
    viewModalAction: (
      <Modal isOpen={action !== null} onClose={handleCloseModal}>
        {content}
      </Modal>
    ),
  };
};

export default usePlaybookActionModal;
