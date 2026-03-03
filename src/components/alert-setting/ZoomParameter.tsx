import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface ZoomParameterForm {
  webhookUrl: string;
  meetingID: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (value: any) => void;
}

const ZoomParameter = ({ handleSave }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ZoomParameterForm>({
    defaultValues: {
      webhookUrl: "",
      meetingID: "",
    },
  });

  const onSubmit = (data: ZoomParameterForm) => {
    // handle save
    handleSave(data);
    console.log(data);
  };

  return (
    <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-medium mb-4">Configure Zoom Parameters</p>

      <Controller
        name="webhookUrl"
        control={control}
        rules={{ required: "Webhook URL is required" }}
        render={({ field }) => (
          <Input
            label="Webhook URL"
            placeholder="http://api.zoom.us/...."
            error={errors.webhookUrl?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="meetingID"
        control={control}
        rules={{ required: "Meeting ID is required" }}
        render={({ field }) => (
          <Input
            label="Meeting ID"
            error={errors.meetingID?.message}
            placeholder="123-456-789"
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

export default ZoomParameter;
