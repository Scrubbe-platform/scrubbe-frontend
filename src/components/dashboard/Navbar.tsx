"use client";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/lib/stores/auth.store";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { CgSpinner } from "react-icons/cg";
import { HiUserGroup } from "react-icons/hi";
import Modal from "../ui/Modal";
import InviteTeamMember from "../ui/InviteTeamMember";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";
const Navbar = () => {
  const pathname = usePathname();
  const isIncidentTicket = pathname.split("/").includes("incident-ticket");
  const { user, setUser } = useAuthStore();
  const [menu, setMenu] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const { get } = useFetch();
  const [openInvite, setOpenInvite] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ["PROFIILE"],
    queryFn: async () => {
      const res = await get(endpoint.auth.me);
      console.log({ res });
      if (res.success && res.data) {
        if (!user) {
          setUser(res.data);
        }
        return res.data;
      }
      return null;
    },
  });
  useEffect(() => {
    if (!menu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menu]);
  return (
    <div>
      <div className="h-[70px] w-full border-b border-neutral-200 dark:border-blue-400/50  flex justify-between items-center px-[3%]">
        {/* <div className=" w-[50%] dark:bg-zinc-800 bg-zinc-100 flex gap-3 items-center border border-zinc-200 dark:border-zinc-600 rounded-lg h-[38px] px-2">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none dark:text-white w-full"
          />
          <Search className="dark:text-white" size={18} />
        </div> */}
        <div></div>

        <div className="flex items-center gap-3">
          <div
            onClick={() => setMenu((prev) => !prev)}
            className="flex items-center gap-1 relative"
          >
            <div className=" cursor-pointer uppercase size-7 rounded-full bg-zinc-700 flex justify-center items-center text-sm text-white">
              {user?.firstName?.[0]}.{user?.lastName?.[0]}
            </div>
            <ChevronDown className=" text-zinc-400" size={16} />

            {menu && (
              <div
                ref={statusFilterRef}
                className=" w-auto border z-50 border-gray-200 p-2 absolute   h-fit bg-white rounded-md top-full right-0 transform  mt-1 space-y-2"
              >
                <div className="flex border-b items-center gap-3 text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white hover:rounded-md transition-colors">
                  <div className=" size-6 rounded-full bg-zinc-700 flex justify-center items-center text-[80%] text-white">
                    {isLoading && !user ? (
                      <CgSpinner className=" animate-spin" />
                    ) : (
                      <>
                        {user?.firstName?.[0]}.{user?.lastName?.[0]}
                      </>
                    )}
                  </div>
                  <p className=" text-nowrap">
                    {user?.firstName} {user?.lastName} (You)
                  </p>
                </div>
                <div
                  onClick={() => {
                    setMenu(false);
                    setOpenInvite(true);
                  }}
                  className="flex items-center gap-3 text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors"
                >
                  <HiUserGroup />
                  <p className=" text-nowrap">Invite Team</p>
                </div>
              </div>
            )}
          </div>

          {isIncidentTicket && (
            <Button variant="destructive" size="sm" className="px-2 ml-2">
              <p className="  text-white">48 active threats</p>
            </Button>
          )}
          {IS_STANDALONE ? null : (
            <div className="animated-gradient p-[2px] rounded-3xl">
              <Link
                href={"/ezra/dashboard"}
                className=" bg-[#111827] gap-2 px-6 py-2 text-white rounded-3xl font-medium text-sm flex items-center"
              >
                Ezra Ai
                <img
                  src="/ezrastar1.svg"
                  alt="ezrastar1.svg"
                  className=" size-4"
                />
                {/* <PiStarFourFill className=" text-blue-500" size={22} /> */}
              </Link>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={openInvite} onClose={() => setOpenInvite(false)}>
        <InviteTeamMember />
      </Modal>
    </div>
  );
};

export default Navbar;
