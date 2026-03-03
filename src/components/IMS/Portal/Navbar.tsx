"use client";
import { ChevronDown } from "lucide-react";
import useAuthStore from "@/lib/stores/auth.store";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { CgSpinner } from "react-icons/cg";
import Image from "next/image";

const Navbar = () => {
  const { user, setUser } = useAuthStore();
  const [menu, setMenu] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const { get } = useFetch();

  const { isLoading } = useQuery({
    queryKey: ["PROFIILE"],
    queryFn: async () => {
      const res = await get(endpoint.auth.me);
      console.log({ res });
      if (res.success) {
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
        <div className=" h-10 flex items-center">
          <Image
            src="/scrubbe-logo-01.png"
            alt="scrubbe-logo-01.png"
            height={160}
            width={160}
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <div
            onClick={() => setMenu((prev) => !prev)}
            className="flex items-center gap-1 relative"
          >
            <div className=" cursor-pointer size-7 rounded-full bg-zinc-700 flex justify-center items-center text-sm text-white">
              {user?.firstName?.[0]}.{user?.lastName?.[0]}
            </div>
            <ChevronDown className=" text-zinc-400" size={16} />

            {menu && (
              <div
                ref={statusFilterRef}
                className=" w-auto border z-50 border-gray-200 p-2 absolute   h-fit bg-white rounded-md top-full right-0 transform  mt-1"
              >
                <div className="flex items-center gap-3 text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                  <div className=" size-9 rounded-full bg-zinc-700 flex justify-center items-center text-[80%] text-white">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
