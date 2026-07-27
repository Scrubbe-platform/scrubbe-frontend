"use client";

import { useEffect, useState } from "react";
import { useCurrentUser, User } from "@/lib/api";

export default function useCurrentUserProfile() {
  const { execute: getUser } = useCurrentUser();
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    (async () => {
      const resp = await getUser();
      setUser(resp as User);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return user;
}
