"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import useAuthStore from "@/lib/stores/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { getEmailDomain } from "@/lib/utils";
import { FaBuilding, FaLink } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";
import { getCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/lib/constant";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

export default function SignInForm() {
  const [rememberMe, setRememberMe] = useState(false);
  const { login, oauthLogin, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const isAuthRef = useRef(false);
  const inviteEmail = searchParams.get("email");
  const [steps, setSteps] = useState<"email" | "authenticate">("email");

  // Keep the form handling sfirsture closer to the original
  // even though we're simplifying functionality
  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      // password: "",
    },
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const redirectAfterLogin = (
    accountType?: string | null,
    purpose?: string | null
  ) => {
    if (IS_STANDALONE) {
      if (path === "payment") {
        router.replace("/pricing");
        return;
      }
      if (path === "community") {
        router.replace("/community");
        return;
      }
      return;
    }

    if (path === "ezra") {
      router.push("/ezra/dashboard");
      return;
    }

    if (accountType === "BUSINESS") {
      if (purpose === "IMS") {
        const token = getCookie(COOKIE_KEYS.TOKEN);
        const incidentUrl =
          process.env.NEXT_PUBLIC_INCIDENT_URL ??
          "https://incidents.scrubbe.com";
        window.location.href = `${incidentUrl}/incident/tickets?token=${
          token ?? ""
        }`;
        return;
      }
      router.push("/dashboard");
      return;
    }

    if (accountType === "DEVELOPER") {
      router.push("/developer/dashboard");
      return;
    }

    router.push("/dashboard");
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const userDetails = await login(data.email, "");

      toast.success("Successfully signed in!", {
        description: `${data.email}, you are being redirected...`,
        duration: 10000,
      });

      redirectAfterLogin(
        userDetails?.accountType,
        userDetails?.purpose ?? null
      );
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Login failed",
      });
    }
  };

  const session = useSession();

  const onSubmitOAuth = async () => {
    try {
      if (!session.data) {
        return;
      }
      const data = {
        email: session.data?.user.email,
        provider_uuid: session.data?.user.id,
        oAuthProvider: session.data?.user.oAuthProvider,
      };
      const userDetails = await oauthLogin(
        data.email ?? "",
        data.provider_uuid ?? "",
        data.oAuthProvider ?? ""
      );

      toast.success("Successfully signed in!", {
        description: `${data.email}, you are being redirected...`,
        duration: 10000,
        id: "redirect",
      });

      await signOut({ redirect: false });
      redirectAfterLogin(
        userDetails?.accountType,
        userDetails?.purpose ?? null
      );
    } catch (error) {
      const status =
        error instanceof AxiosError ? error.response?.status : undefined;
      if (status === 404) {
        toast.error("No account found", {
          description: "Please create an account to continue.",
        });
        const params = new URLSearchParams();
        if (session.data?.user.email) {
          params.set("email", session.data.user.email);
        }
        if (path) {
          params.set("to", path);
        }
        router.push(`/auth/business-signup?${params.toString()}`);
        return;
      }

      console.error("Login error:", error);
      toast.error("Login failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Login failed",
      });
    }
  };

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      session.data?.user &&
      !isAuthRef.current
    ) {
      isAuthRef.current = true;
      onSubmitOAuth();
    }
  }, [session.status]);

  useEffect(() => {
    if (inviteEmail) {
      setValue("email", inviteEmail);
    }
  }, [inviteEmail, setValue]);

  if (steps === "email") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {session.status == "loading" && (
          <div className=" absolute inset-0 bg-black/20 z-50 flex justify-center pt-[20%] h-screen">
            <Loader2 className=" animate-spin text-primary-500" size={30} />
          </div>
        )}
        <div className="w-full p-6">
          <div className="mb-6 text-center">
            <h1 className=" text-xl md:text-2xl text-white font-semibold">
              Sign in
            </h1>
            <p className="text-base text-white">
              Enter your work email to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Work Email"
                  placeholder="Enter Email"
                  {...field}
                  error={errors.email?.message}
                  labelClassName="text-white"
                  className="text-white"
                />
              )}
            />

            {/* <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  label="Password"
                  placeholder="Enter Password"
                  {...field}
                  type="password"
                  error={errors.password?.message}
                  labelClassName="text-white"
                  className="text-white"
                />
              )}
            /> */}

            {/* <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isLoading ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-400"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-IMSCyan hover:underline"
              >
                Forgot password?
              </Link>
            </div> */}

            {/* <CButton type="submit" disabled={isLoading || !isValid}>
              {isLoading ? " Signing in..." : "Sign in"}
            </CButton> */}

            <CButton
              onClick={() => setSteps("authenticate")}
              type="button"
              disabled={!isValid}
              className="mt-3 border border-zinc-600 bg-zinc-800 text-white hover:text-dark"
            >
              Continue
            </CButton>

            <div className="mt-4 text-center text-gray-200 text-base">
              New to Scrubbe?{" "}
              <Link
                href={`/auth/business-signup?to=${path}`}
                className={`${
                  IS_STANDALONE ? "text-IMSCyan" : "text-blue-600"
                } underline hover:underline inline-flex items-center`}
              >
                Create Workspace
              </Link>
            </div>
          </form>
        </div>
      </Suspense>
    );
  } else if (steps === "authenticate") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {session.status == "loading" && (
          <div className=" absolute inset-0 bg-black/20 z-50 flex justify-center pt-[20%] h-screen">
            <Loader2 className=" animate-spin text-primary-500" size={30} />
          </div>
        )}
        <div className="w-full p-6">
          <div className="mb-6 text-center">
            <h1 className=" text-lg md:text-xl text-white font-semibold">
              Continue to your workspace
            </h1>
            <p className="text-base text-white">
              We’ll route you to the right sign-in method for your organization.
            </p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className=" border border-zinc-500 bg px-2 py-2 rounded-full text-sm text-zinc-300 w-fit capitalize flex items-center gap-2 bg-zinc-800/70">
              <FaBuilding />
              {getEmailDomain(watch("email")).domain}
            </div>
            <div className=" border border-zinc-500 bg px-2 py-2 rounded-full text-sm text-zinc-300 w-fit flex items-center gap-2 bg-zinc-800/70">
              <MdOutlineEmail />
              {getEmailDomain(watch("email")).email}
            </div>
          </div>

          {/* <div className="border">Magic link sent to ol*****@scrubbe.com.</div> */}

          <CButton
            onClick={() => {}}
            type="button"
            className="border border-zinc-600 bg-zinc-800 text-white hover:text-dark"
          >
            Continue with SSO
          </CButton>
          <div className="flex justify-center items-center text-sm text-zinc-400 gap-2 py-3">
            <div className="h-[1px] w-[100%] bg-zinc-700" />
            or
            <div className="h-[1px] w-[100%] bg-zinc-700" />
          </div>

          <CButton
            onClick={() => toast.info("Magic link is coming soon.")}
            type="button"
            className="border border-zinc-600 bg-zinc-800 text-white hover:text-dark"
          >
            <FaLink /> Email me a magic link
          </CButton>
          <div
            onClick={() => setSteps("email")}
            className="mt-4 text-center text-IMSCyan text-base cursor-pointer"
          >
            Use a different email
          </div>
        </div>
      </Suspense>
    );
  }
}
