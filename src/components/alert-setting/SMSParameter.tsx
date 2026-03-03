import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface SMSParameterForm {
  phoneNumbers: string;
  smsProvider: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (value: any) => void;
}

const SMSParameter = ({ handleSave }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SMSParameterForm>({
    defaultValues: {
      phoneNumbers: "",
      smsProvider: "",
    },
  });

  const onSubmit = (data: SMSParameterForm) => {
    // handle save
    handleSave(data);
    console.log(data);
  };

  return (
    <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-medium mb-4">Configure SMS Parameters</p>

      <Controller
        name="phoneNumbers"
        control={control}
        rules={{ required: "Phone number is required" }}
        render={({ field }) => (
          <Input
            label="Phone Numbers"
            placeholder="+2348143778125"
            error={errors.phoneNumbers?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="smsProvider"
        control={control}
        rules={{ required: "SMS provider is required" }}
        render={({ field }) => (
          <Input
            label="SMS provider"
            placeholder="Twilo"
            error={errors.smsProvider?.message}
            {...field}
          />
        )}
      />

      <CButton className="mt-2" type="submit">
        Save
      </CButton>
    </form>
  );
};

export default SMSParameter;
