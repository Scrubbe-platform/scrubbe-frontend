import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface SlackParameterForm {
  webhookUrl: string;
  channelName: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (value: any) => void;
}

const SlackParameter = ({ handleSave }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SlackParameterForm>({
    defaultValues: {
      webhookUrl: "",
      channelName: "",
    },
  });

  const onSubmit = (data: SlackParameterForm) => {
    // handle save
    handleSave(data);
    console.log(data);
  };

  return (
    <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-medium mb-4">Configure Slack Parameters</p>

      <Controller
        name="webhookUrl"
        control={control}
        rules={{ required: "Webhook URL is required" }}
        render={({ field }) => (
          <Input
            label="Webhook URL"
            placeholder="http://hooks.slack.com/services/....."
            error={errors.webhookUrl?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="channelName"
        control={control}
        rules={{ required: "Channel name is required" }}
        render={({ field }) => (
          <Input
            label="Channel Name"
            error={errors.channelName?.message}
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

export default SlackParameter;
