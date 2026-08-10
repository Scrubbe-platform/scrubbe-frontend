import WelcomePage from "@/components/auth/account-setup/WelcomePage";
import WelcomePageV2 from "@/components/auth/account-setup/WelcomePageV2";
import IdleLoader from "@/components/ui/LoaderUI/IdleLoader";
import { Suspense } from "react";

const AccountSetupPage = () => {
  return (
    <>
      <Suspense fallback={<IdleLoader />}>
        <WelcomePageV2 />
      </Suspense>
    </>
  );
};

export default AccountSetupPage;
