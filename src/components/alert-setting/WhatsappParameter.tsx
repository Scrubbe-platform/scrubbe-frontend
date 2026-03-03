import React from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useForm, Controller } from "react-hook-form";

interface WhatsappParameterForm {
  provider: string;
  endpoint: string;
  authMethod: string;
  apiKey: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSave: (value: any) => void;
}

const WhatsappParameter = ({ handleSave }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WhatsappParameterForm>({
    defaultValues: {
      provider: "",
      endpoint: "",
      authMethod: "",
      apiKey: "",
    },
  });

  const onSubmit = (data: WhatsappParameterForm) => {
    // handle save
    handleSave(data);
    console.log(data);
  };

  return (
    <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-medium mb-4">Configure WhatsApp Parameters</p>

      <Controller
        name="provider"
        control={control}
        rules={{ required: "provider is required" }}
        render={({ field }) => (
          <Input
            label="The Provider"
            placeholder="Twilo"
            error={errors.provider?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="endpoint"
        control={control}
        rules={{ required: "api endpoint is required" }}
        render={({ field }) => (
          <Input
            label="API endpoint"
            error={errors.endpoint?.message}
            placeholder="http://example.com/...."
            {...field}
          />
        )}
      />
      <Controller
        name="authMethod"
        control={control}
        rules={{ required: "Authentication Method is required" }}
        render={({ field }) => (
          <Input
            label="Authentication Method"
            error={errors.authMethod?.message}
            placeholder="http://example.com/...."
            {...field}
          />
        )}
      />
      <Controller
        name="apiKey"
        control={control}
        rules={{ required: "API key is required" }}
        render={({ field }) => (
          <Input
            label="API key"
            error={errors.apiKey?.message}
            placeholder="http://example.com/...."
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

export default WhatsappParameter;
