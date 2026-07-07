import WelcomePage from "@/components/auth/account-setup/WelcomePage";
import IdleLoader from "@/components/ui/LoaderUI/IdleLoader";
import { Suspense } from "react";

const AccountSetupPage = () => {
  return (
    <>
      <Suspense fallback={<IdleLoader />}>
        <WelcomePage />
      </Suspense>
    </>
  );
};

export default AccountSetupPage;
