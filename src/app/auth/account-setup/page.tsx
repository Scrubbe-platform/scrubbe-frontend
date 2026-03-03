import WelcomePage from "@/components/auth/account-setup/WelcomePage";
import { Suspense } from "react";

const AccountSetupPage = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <WelcomePage />
      </Suspense>
    </>
  );
};

export default AccountSetupPage;
