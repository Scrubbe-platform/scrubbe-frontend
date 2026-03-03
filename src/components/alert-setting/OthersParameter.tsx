import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface OthersParameterForm {
  webhookUrl: string;
  customField: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (value: any) => void;
}

const OthersParameter = ({ handleSave }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OthersParameterForm>({
    defaultValues: {
      webhookUrl: "",
      customField: "",
    },
  });

  const onSubmit = (data: OthersParameterForm) => {
    // handle save
    handleSave(data);
    console.log(data);
  };

  return (
    <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-medium mb-4">Configure other Parameters</p>

      <Controller
        name="webhookUrl"
        control={control}
        rules={{ required: "Webhook URL is required" }}
        render={({ field }) => (
          <Input
            label="Webhook URL"
            placeholder="custom webhook URL"
            error={errors.webhookUrl?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="customField"
        control={control}
        rules={{ required: "Custome field is required" }}
        render={({ field }) => (
          <Input
            label="Custom field"
            error={errors.customField?.message}
            placeholder="Additional Parameter"
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

export default OthersParameter;
