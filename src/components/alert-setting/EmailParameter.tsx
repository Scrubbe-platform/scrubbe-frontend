import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface EmailParameterForm {
  recipients: string;
  template: string;
  email: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (value: any) => void;
}

const EmailParameter = ({ handleSave }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailParameterForm>({
    defaultValues: {
      recipients: "",
      template: "",
      email: "",
    },
  });

  const onSubmit = (data: EmailParameterForm) => {
    // handle save
    handleSave(data);
    console.log(data);
  };

  return (
    <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-medium mb-4">Configure Email Parameters</p>

      <Controller
        name="recipients"
        control={control}
        rules={{ required: "Recipients is required" }}
        render={({ field }) => (
          <Input
            label="Webhook URL"
            placeholder="user1@example.com, user2@example.com"
            error={errors.recipients?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="template"
        control={control}
        rules={{ required: "Subject template is required" }}
        render={({ field }) => (
          <Input
            label="Subject Template"
            placeholder="Alert: {Severity}-{id}"
            error={errors.template?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        rules={{ required: "Subject Email is required" }}
        render={({ field }) => (
          <Input
            label="Sender Email"
            placeholder="alerts@company.com"
            error={errors.email?.message}
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

export default EmailParameter;
