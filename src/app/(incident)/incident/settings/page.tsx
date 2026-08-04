"use client";

import React from "react";
import Settings from "./_modules/components/Settings";
import UserSettings from "./_modules/components/user/UserSettings";
import { useRoleCheck } from "@/components/auth/RoleGuard";

function Page() {
  const { isAdmin } = useRoleCheck();
  return isAdmin() ? <Settings /> : <UserSettings />;
}

export default Page;
