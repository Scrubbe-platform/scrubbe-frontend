import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface GoogleChatParameterForm {
  webhookUrl: string;
  spaceName: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (value: any) => void;
}

const GoogleChatParameter = ({ handleSave }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GoogleChatParameterForm>({
    defaultValues: {
      webhookUrl: "",
      spaceName: "",
    },
  });

  const onSubmit = (data: GoogleChatParameterForm) => {
    // handle save
    handleSave(data);
    console.log(data);
  };

  return (
    <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-medium mb-4">
        Configure Google Chat Parameters
      </p>

      <Controller
        name="webhookUrl"
        control={control}
        rules={{ required: "Webhook URL is required" }}
        render={({ field }) => (
          <Input
            label="Webhook URL"
            placeholder="http://chat.googleapis.com/...."
            error={errors.webhookUrl?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="spaceName"
        control={control}
        rules={{ required: "Space name is required" }}
        render={({ field }) => (
          <Input
            label="Space Name"
            error={errors.spaceName?.message}
            placeholder="Security Alert"
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

export default GoogleChatParameter;
