"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BiCheck } from "react-icons/bi";
import { BsCheckSquareFill } from "react-icons/bs"; // A checkmark icon for the progress bar
import { toast } from "sonner";
import { z } from "zod";

// Dummy components for each step's content
type Props = {
  onContinue: () => void;
  decodedUser?: {
    role: string;
    email: string;
    businessId: string;
    workspaceName: string;
  };
};

const formType = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type IFormType = z.infer<typeof formType>;

const AcceptInvite = ({ onContinue, decodedUser }: Props) => (
  <div className="flex flex-col items-center p-8 bg-neutral-50">
    <h3 className=" font-bold mb-4">Accept invite</h3>
    <p className="text-gray-600 mb-4 text-center text-base">
      You&apos;ve been invited to join{" "}
      <strong>{decodedUser?.workspaceName}</strong> on Scrubbe IMS.
    </p>
    <CButton onClick={onContinue} className=" w-[200px]">
      Accept Invite and Continue
    </CButton>
  </div>
);

const ProfileSetup = ({ onContinue, decodedUser }: Props) => {
  const { post } = useFetch();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<IFormType>({
    resolver: zodResolver(formType),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isWorkspace, setIsWorkspace] = useState(false);
  const [isPrivacyPolicy, setIsPrivacyPolicy] = useState(false);

  const handleSubmitForm = async (value: IFormType) => {
    const data = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: decodedUser?.email,
      password: value.password,
      businessId: decodedUser?.businessId,
    };
    if (!isPrivacyPolicy || !isWorkspace) {
      toast.error("Please accept privacy policy and workspace terms");
      return;
    }

    setLoading(true);
    const res = await post(endpoint.auth.accept_invite, data);
    setLoading(false);
    if (res.success) {
      toast.success("You've successfully accept this invite");
      onContinue();
    } else {
      toast.error(res.data);
    }
  };

  return (
    <form className="" onSubmit={handleSubmit(handleSubmitForm)}>
      <h3 className="text-lg font-medium mb-8 text-center">Profile Setup</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                label="First Name"
                placeholder="First Name"
                {...field}
                error={errors.firstName?.message}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                label="Last Name"
                placeholder="Last Name"
                {...field}
                error={errors.lastName?.message}
              />
            )}
          />
        </div>

        <Input
          label="Work Email"
          placeholder="Enter Work Email"
          value={decodedUser?.email}
          readOnly
        />

        <Input
          label="Role"
          value={decodedUser?.role}
          className="dark:!text-black"
          labelClassName="dark:!text-black"
          readOnly
        />

        <PasswordInput
          label="Password"
          // {...field}
          value={watch("password")}
          onValueChange={(value) => setValue("password", value)}
          onValidationChange={setIsPasswordValid}
          error={!isPasswordValid ? "complete all requirement" : ""}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              label="Confirm Password"
              placeholder="Confirm Password"
              type="password"
              error={errors.confirmPassword?.message}
              {...field}
            />
          )}
        />
      </div>
      <br />
      <CButton isLoading={loading} type="submit" disabled={!isValid}>
        Continue
      </CButton>

      <div className="flex items-center space-x-2 mt-6">
        <div
          className=" size-[17px] border rounded-sm"
          onClick={() => setIsWorkspace((prev) => !prev)}
        >
          <BsCheckSquareFill
            className={`${
              isWorkspace ? "text-IMSLightGreen" : " text-transparent"
            } text-xl`}
          />
        </div>
        <p className="text-gray-700 text-base">
          I accept the{" "}
          <a href="#" target="_blank" className="text-IMSLightGreen underline">
            Workspace Policies
          </a>{" "}
          (e.g., SLA obligations, data handling rules)
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div
          className=" size-[17px] border rounded-sm"
          onClick={() => setIsPrivacyPolicy((prev) => !prev)}
        >
          <BsCheckSquareFill
            className={`${
              isPrivacyPolicy ? "text-IMSLightGreen" : "text-transparent"
            } text-xl`}
          />
        </div>
        <p className="text-gray-700 text-base">
          I agree to the{" "}
          <a href="#" target="_blank" className="text-IMSLightGreen underline">
            Scrubbe IMS Terms & Privacy Policy
          </a>
        </p>
      </div>
    </form>
  );
};

const Review = () => {
  const router = useRouter();
  const handleNext = () => {
    router.replace("/auth/signin");
  };
  return (
    <div className="p-8">
      <div className="w-full p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <div className="mb-8">
          {/* Enhanced Success Icon with concentric circles */}
          <div className="relative flex items-center justify-center translate-y-[-50px]">
            <div className=" size-[150px] rounded-full bg-emerald-100 absolute animate-ping" />
            <div className=" size-[130px] rounded-full bg-emerald-200 absolute" />
            <div className=" size-[110px] rounded-full bg-emerald-300 absolute" />
            <div className=" size-[90px] rounded-full bg-emerald-500 absolute" />
            <BiCheck className=" absolute text-white" size={40} />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Invite Accepted
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          You have successfully accepted this invite.
        </p>
        <CButton onClick={handleNext} className=" mt-6">
          Proceed to Login
        </CButton>
      </div>
    </div>
  );
};

const InvitationFlow = () => {
  const [step, setStep] = useState(1);
  const [decodeUser, setDecodeUser] = useState<
    | { role: string; email: string; businessId: string; workspaceName: string }
    | undefined
  >();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { post } = useFetch();
  const [loading, setLoading] = useState(false);
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <AcceptInvite
            onContinue={() => setStep(2)}
            decodedUser={decodeUser}
          />
        );
      case 2:
        return (
          <ProfileSetup
            onContinue={() => setStep(3)}
            decodedUser={decodeUser}
          />
        );
      case 3:
        return <Review />;
      default:
        return null;
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await post(endpoint.auth.decode_invite_token, { token });
      setLoading(false);
      if (res.success) {
        // toast.success("decode successful");
        setDecodeUser(res.data);
      } else {
        // toast.error("decode failed");
      }
    })();
  }, []);

  const getStepClass = (stepNum: number) => {
    const baseClass =
      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm";
    if (stepNum < step) {
      return `${baseClass} bg-IMSLightGreen text-white`;
    }
    if (stepNum === step) {
      return `${baseClass} bg-IMSLightGreen text-white`;
    }
    return `${baseClass} bg-gray-200 text-gray-500`;
  };

  return (
    <div className="bg-gray-100 min-h-screen  flex flex-col items-center pt-16 relative">
      <div className="mb-8 absolute left-5 top-5">
        {/* Placeholder for the logo */}
        <div className=" h-10 flex items-center">
          <Image
            src="/scrubbe-logo-01.png"
            alt="scrubbe-logo-01.png"
            height={160}
            width={160}
            className="object-contain"
          />
        </div>
      </div>
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-8">
          Welcome to Scrubbe IMS
        </h2>

        {/* Progress Bar */}
        <div className="flex justify-center items-center mb-10">
          <div className="relative flex items-center space-x-4 w-full">
            <div className="flex items-center gap-2 ">
              <div className={getStepClass(1)}>1</div>
              <p className=" text-sm text-IMSLightGreen"> Accept Invite</p>
            </div>
            <div
              className={`flex-1 h-1 rounded-full ${
                step >= 2 ? "bg-emerald-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-emerald-600" : "text-black"
              }`}
            >
              <div className={getStepClass(2)}>2</div>
              <p className=" text-sm">Profile Setup</p>
            </div>
            <div
              className={`flex-1 h-1 rounded-full ${
                step >= 3 ? "bg-emerald-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? "text-emerald-600" : "text-black"
              }`}
            >
              <div className={getStepClass(3)}>3</div>
              <p className=" text-sm">Completed</p>
            </div>{" "}
          </div>
        </div>

        {loading ? (
          <div className="mx-auto flex flex-col items-center gap-2">
            <p>Verifying invite token</p>
            <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden ">
              <motion.div
                className="h-full bg-IMSLightGreen"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                }}
              />
            </div>
            <p className=" text-sm opacity-50">
              Please wait for invite verification to be done
            </p>
          </div>
        ) : (
          renderStep()
        )}
      </div>
    </div>
  );
};

export default InvitationFlow;
