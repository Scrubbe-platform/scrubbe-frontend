/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from 'react';
import SettingWrapper from './setting-wrapper';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { popularTimezones } from '@/lib/constant/index';
import { FaCodeBranch } from 'react-icons/fa';
import { Switch } from '@heroui/react';
import CButton from '@/components/ui/Cbutton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFetch } from '@/hooks/useFetch';
import { endpoint } from '@/lib/api/endpoint';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import useAuthStore from '@/lib/stores/auth.store';

type OrgFormValues = {
  orgName: string;
  primaryDomain: string;
  allowedEmailDomain: string;
  timezone: string;
  productionEnv: string;
  stagingEnv: string;
  defaultRegion: string;
  environmentTags: string;
  multiEnvRouting: boolean;
};

function Settings() {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { control, handleSubmit, reset, watch, setValue } = useForm<OrgFormValues>({
    defaultValues: {
      orgName: '',
      primaryDomain: '',
      allowedEmailDomain: '',
      timezone: 'UTC',
      productionEnv: 'production',
      stagingEnv: 'staging',
      defaultRegion: '',
      environmentTags: '',
      multiEnvRouting: false,
    },
  });

  const { data: imsConfig, isLoading } = useQuery({
    queryKey: ['ims-config'],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (imsConfig) {
      reset({
        orgName: imsConfig.orgName ?? '',
        primaryDomain: imsConfig.primaryDomain ?? '',
        allowedEmailDomain: imsConfig.allowedEmailDomain ?? '',
        timezone: imsConfig.timezone ?? 'UTC',
        productionEnv: imsConfig.productionEnv ?? 'production',
        stagingEnv: imsConfig.stagingEnv ?? 'staging',
        defaultRegion: imsConfig.defaultRegion ?? '',
        environmentTags: imsConfig.environmentTags ?? '',
        multiEnvRouting: imsConfig.multiEnvRouting ?? false,
      });
    }
  }, [imsConfig, reset]);

  const { mutateAsync: saveConfig, isPending } = useMutation({
    mutationFn: async (data: OrgFormValues) => {
      const res = await put(endpoint.auth.ims_config, data);
      if (!res.success) throw new Error(res.data?.message ?? 'Failed to save settings');
      return res.data;
    },
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['ims-config'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: OrgFormValues) => {
    saveConfig(data);
  };

  return (
    <div>
      <SettingWrapper title='Organization' description='Tenant identity and operating profile' sub='Names, domains, environments, and basic org controls used across Scrubbe.'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-2 pt-5 gap-5'>
            <div className='border rounded-xl border-neutral-500 p-4 space-y-3'>
              <p className='text-base text-white'>Profile</p>
              <Controller
                name="orgName"
                control={control}
                render={({ field }) => (
                  <Input label='Organization name' labelClassName='text-white' className='text-white' {...field} />
                )}
              />
              <Controller
                name="primaryDomain"
                control={control}
                render={({ field }) => (
                  <Input label='Primary domain' labelClassName='text-white' className='text-white' {...field} />
                )}
              />
              <Controller
                name="allowedEmailDomain"
                control={control}
                render={({ field }) => (
                  <Input label='Allowed email domain' labelClassName='text-white' className='text-white' {...field} />
                )}
              />
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select
                    label='Default timezone'
                    labelClassName='text-white'
                    options={popularTimezones}
                    className='text-white'
                    value={field.value}
                    onChange={(e: any) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className='border rounded-xl border-neutral-500 p-4 space-y-3'>
              <p className='text-base text-white'>Environment</p>
              <Controller
                name="productionEnv"
                control={control}
                render={({ field }) => (
                  <Input label='Production env name' labelClassName='text-white' className='text-white' {...field} />
                )}
              />
              <Controller
                name="stagingEnv"
                control={control}
                render={({ field }) => (
                  <Input label='Staging env name' labelClassName='text-white' className='text-white' {...field} />
                )}
              />
              <Controller
                name="defaultRegion"
                control={control}
                render={({ field }) => (
                  <Input label='Default region' labelClassName='text-white' className='text-white' {...field} />
                )}
              />
              <Controller
                name="environmentTags"
                control={control}
                render={({ field }) => (
                  <Input label='Environment tags' labelClassName='text-white' className='text-white' placeholder='e.g. prod,staging,dev' {...field} />
                )}
              />
              <div className='border border-neutral-500 rounded-xl p-3'>
                <div className='flex justify-between'>
                  <div className='flex items-center gap-2'>
                    <FaCodeBranch className='text-orange-500' />
                    <p className='text-sm text-white'>Enable multi-env routing</p>
                  </div>
                  <Controller
                    name="multiEnvRouting"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        size="sm"
                        color="success"
                        isSelected={field.value}
                        onChange={e => field.onChange((e as any).target?.checked ?? !field.value)}
                      />
                    )}
                  />
                </div>
                <p className='text-gray-200 text-sm'>Allow policies/playbooks to scope actions per environment.</p>
              </div>
            </div>
          </div>
          <div className='flex justify-end py-4'>
            <CButton type="submit" className='w-fit' isLoading={isPending} disabled={isPending || isLoading}>
              Save
            </CButton>
          </div>
        </form>
      </SettingWrapper>
    </div>
  );
}

export default Settings;
