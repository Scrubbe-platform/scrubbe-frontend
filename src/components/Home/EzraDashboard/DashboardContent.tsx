import { useEzraMockStore } from "@/lib/stores/ezraMock.store";
import React from "react";
import { navItem } from "./Index";
import { Dashboard } from "./Content/Dashboard";
import NaturalLanguage from "./Content/NaturalLanguage";
import Detection from "./Content/Detection";
import Playbook from "./Content/Playbook";
import IncedentTicket from "./Content/IncedentTicket";
import NotificationSetting from "./Content/NotificationSetting";
import Support from "./Content/Support";

const DashboardContent = () => {
  const { pathname } = useEzraMockStore();

  switch (pathname) {
    case navItem[0].link:
      return <Dashboard />;
      break;
    case navItem[1].link:
      return <NaturalLanguage />;
      break;
    case navItem[2].link:
      return <Detection />;
      break;
    case navItem[3].link:
      return <Playbook />;
      break;
    case navItem[4].link:
      return <IncedentTicket />;
      break;
    case navItem[5].link:
      return <NotificationSetting />;
      break;
    case navItem[6].link:
      return <Support />;
      break;

    default:
      return <Dashboard />;
      break;
  }
};

export default DashboardContent;
