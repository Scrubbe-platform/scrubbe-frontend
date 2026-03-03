import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface GoogleChatParameterForm {
  webhookUrl: string;
  meetingLink: string;
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
      meetingLink: "",
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
        Configure Google Meet Parameters
      </p>

      <Controller
        name="webhookUrl"
        control={control}
        rules={{ required: "Webhook URL is required" }}
        render={({ field }) => (
          <Input
            label="Webhook URL"
            placeholder="http://meet.google.com/...."
            error={errors.webhookUrl?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="meetingLink"
        control={control}
        rules={{ required: "Meeting link is required" }}
        render={({ field }) => (
          <Input
            label="Meeting Link"
            error={errors.meetingLink?.message}
            placeholder="https://meet.google.com/abc-def-ghi"
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
