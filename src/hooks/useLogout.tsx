import useAuthStore from "@/lib/stores/auth.store";
import { signOut } from "next-auth/react";

const useLogout = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    logout();
    await signOut();
  };

  return {
    handleLogout,
  };
};

export default useLogout;
