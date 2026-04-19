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
import {
  FaBuilding,
  FaLink,
  FaGithub,
  FaGitlab,
  FaMicrosoft,
} from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";
import { getCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/lib/constant";
import { apiClient } from "@/lib/api/client";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

export default function SignInForm() {
  const [rememberMe, setRememberMe] = useState(false);
  const { oauthLogin, requestMagicLink, consumeMagicLink } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const magicToken = searchParams.get("magic");
  const isAuthRef = useRef(false);
  const inviteEmail = searchParams.get("email");
  const [steps, setSteps] = useState<"email" | "authenticate">("email");
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);

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
      router.push("/incident");
      return;
    }

    if (accountType === "DEVELOPER") {
      router.push("/developer/dashboard");
      return;
    }

    router.push("/incident");
  };

  const onSubmit = async () => {
    setSteps("authenticate");
  };

  const handleContinueWithSso = async () => {
    const email = watch("email").trim();

    if (!email) {
      toast.error("Please enter your work email first");
      return;
    }

    try {
      setIsSsoLoading(true);

      const discovery = await apiClient.get("/auth/sso/discovery", {
        params: { email },
      });
      const policy = discovery.data?.data;
      const provider = String(policy?.provider ?? "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      const callbackUrl = `/auth/signin${
        path ? `?to=${encodeURIComponent(path)}` : ""
      }`;
      const providerMap: Record<string, string> = {
        GOOGLE: "google",
        GITHUB: "github",
        GITLAB: "gitlab",
        AZURE: "microsoft-entra-id",
        OIDC: "microsoft-entra-id",
        MICROSOFT: "microsoft-entra-id",
        MICROSOFTENTRAID: "microsoft-entra-id",
        AZUREAD: "microsoft-entra-id",
        ENTRAID: "microsoft-entra-id",
      };
      const nextAuthProvider =
        providerMap[provider] ??
        (policy?.oidcIssuer ? "microsoft-entra-id" : "");

      if (!policy?.available) {
        toast.error("This workspace does not have SSO configured yet.");
        return;
      }

      if (!nextAuthProvider) {
        toast.error(
          `This workspace uses ${
            provider || "an unsupported"
          } SSO provider, which is not enabled on this sign-in path yet.`
        );
        return;
      }

      await signIn(nextAuthProvider, {
        redirectTo: callbackUrl,
      });
    } catch (error) {
      console.error("SSO login error:", error);
      toast.error("SSO login failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Unable to start SSO sign in",
      });
    } finally {
      setIsSsoLoading(false);
    }
  };

  const handleRequestMagicLink = async () => {
    const email = watch("email").trim();

    if (!email) {
      toast.error("Please enter your work email first");
      return;
    }

    try {
      setIsMagicLinkLoading(true);
      await requestMagicLink(email, path);
      toast.success("Check your inbox", {
        description: "If your account exists, we sent a magic sign-in link.",
      });
    } catch (error) {
      console.error("Magic link request error:", error);
      toast.error("Unable to send magic link", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "We could not send the link right now",
      });
    } finally {
      setIsMagicLinkLoading(false);
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
      !isAuthRef.current &&
      !magicToken
    ) {
      isAuthRef.current = true;
      onSubmitOAuth();
    }
  }, [session.status, magicToken]);

  useEffect(() => {
    if (inviteEmail) {
      setValue("email", inviteEmail);
    }
  }, [inviteEmail, setValue]);

  useEffect(() => {
    if (!magicToken || isAuthRef.current) {
      return;
    }

    let isMounted = true;

    const handleConsumeMagicLink = async () => {
      try {
        setIsMagicLinkLoading(true);
        isAuthRef.current = true;

        const userDetails = await consumeMagicLink(magicToken);

        if (!isMounted) {
          return;
        }

        await signOut({ redirect: false });
        toast.success("Successfully signed in!", {
          description: `${
            userDetails?.email ?? "Your account"
          } is being redirected...`,
          duration: 10000,
          id: "magic-link-redirect",
        });

        redirectAfterLogin(
          userDetails?.accountType,
          userDetails?.purpose ?? null
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const description =
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Unable to consume magic link";

        toast.error("Magic link failed", {
          description,
        });

        const params = new URLSearchParams();
        if (path) {
          params.set("to", path);
        }
        router.replace(
          `/auth/signin${params.toString() ? `?${params.toString()}` : ""}`
        );
      } finally {
        if (isMounted) {
          setIsMagicLinkLoading(false);
        }
      }
    };

    void handleConsumeMagicLink();

    return () => {
      isMounted = false;
    };
  }, [consumeMagicLink, magicToken, path, redirectAfterLogin, router, signOut]);

  if (steps === "email") {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {(session.status == "loading" || isMagicLinkLoading) && (
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
        {(session.status == "loading" || isMagicLinkLoading) && (
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

          <div className="flex flex-col gap-2">
            <CButton
              onClick={() =>
                signIn("google", {
                  callbackUrl: `/auth/signin${
                    path ? `?to=${encodeURIComponent(path)}` : ""
                  }`,
                })
              }
              type="button"
              disabled={isSsoLoading}
              className="border border-zinc-600 bg-zinc-800 text-white hover:text-dark flex items-center justify-center gap-2"
            >
              <FcGoogle size={18} /> Continue with Google
            </CButton>
            <CButton
              onClick={() =>
                signIn("github", {
                  callbackUrl: `/auth/signin${
                    path ? `?to=${encodeURIComponent(path)}` : ""
                  }`,
                })
              }
              type="button"
              disabled={isSsoLoading}
              className="border border-zinc-600 bg-zinc-800 text-white hover:text-dark flex items-center justify-center gap-2"
            >
              <FaGithub size={18} /> Continue with GitHub
            </CButton>
            <CButton
              onClick={() =>
                signIn("gitlab", {
                  callbackUrl: `/auth/signin${
                    path ? `?to=${encodeURIComponent(path)}` : ""
                  }`,
                })
              }
              type="button"
              disabled={isSsoLoading}
              className="border border-zinc-600 bg-zinc-800 text-white hover:text-dark flex items-center justify-center gap-2"
            >
              <FaGitlab size={18} /> Continue with GitLab
            </CButton>
            <CButton
              onClick={() =>
                signIn("microsoft-entra-id", {
                  callbackUrl: `/auth/signin${
                    path ? `?to=${encodeURIComponent(path)}` : ""
                  }`,
                })
              }
              type="button"
              disabled={isSsoLoading}
              className="border border-zinc-600 bg-zinc-800 text-white hover:text-dark flex items-center justify-center gap-2"
            >
              <FaMicrosoft size={18} /> Continue with Microsoft
            </CButton>
          </div>

          <div className="flex justify-center items-center text-sm text-zinc-400 gap-2 py-3">
            <div className="h-[1px] w-[100%] bg-zinc-700" />
            or
            <div className="h-[1px] w-[100%] bg-zinc-700" />
          </div>

          <CButton
            onClick={handleRequestMagicLink}
            type="button"
            disabled={isMagicLinkLoading}
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
