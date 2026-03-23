/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from 'react';
import SettingWrapper from '../_module/setting-wrapper';
import { GitBranch, CheckCircle } from 'lucide-react';
import Select from '@/components/ui/select';
import Input from '@/components/ui/input';
import CButton from '@/components/ui/Cbutton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFetch } from '@/hooks/useFetch';
import { endpoint } from '@/lib/api/endpoint';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

type NotifFormValues = {
  alertEmail: string;
  slackChannel: string;
  rateLimit: string;
  notifyOnCreate: boolean;
  notifyOnResolve: boolean;
};

const page = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<NotifFormValues>({
    defaultValues: {
      alertEmail: '',
      slackChannel: '',
      rateLimit: 'off',
      notifyOnCreate: true,
      notifyOnResolve: true,
    },
  });

  const { data: config, isLoading } = useQuery({
    queryKey: ['ims-notif-config'],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (config) {
      reset({
        alertEmail: config.alertEmail ?? '',
        slackChannel: config.slackChannel ?? '',
        rateLimit: config.rateLimit ?? 'off',
        notifyOnCreate: config.notifyOnCreate ?? true,
        notifyOnResolve: config.notifyOnResolve ?? true,
      });
    }
  }, [config, reset]);

  const { mutateAsync: saveConfig, isPending } = useMutation({
    mutationFn: async (data: NotifFormValues) => {
      const res = await put(endpoint.auth.ims_config, data);
      if (!res.success) throw new Error(res.data?.message ?? 'Failed to save');
      return res.data;
    },
    onSuccess: () => {
      toast.success('Notification settings saved');
      queryClient.invalidateQueries({ queryKey: ['ims-notif-config'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <SettingWrapper title='Notifications' description='Where alerts and summaries are sent' sub='Route delivery incidents and approvals to the right places.'>
        <form onSubmit={handleSubmit(data => saveConfig(data))}>
          <div className="grid grid-cols-2 gap-8 items-start pt-5">

            {/* ROUTING RULES */}
            <section className="bg-transparent border border-neutral-500 rounded-lg p-4 space-y-4">
              <h3 className="text-white font-bold text-lg px-1">Routing rules</h3>

              <div className="space-y-4">
                <div className="p-4 border border-neutral-500 rounded-2xl space-y-3 group hover:border-[#00CAD8]/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
                      <GitBranch size={16} className="text-[#F472B6]" />
                      <span className="text-xs font-bold text-white">Delivery incidents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">On create</span>
                      <Controller
                        name="notifyOnCreate"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`w-8 h-4 rounded-full relative transition-colors ${field.value ? 'bg-green-500' : 'bg-neutral-600'}`}
                          >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${field.value ? 'left-4' : 'left-0.5'}`} />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-[#64748B] text-xs leading-normal">
                    Send to Slack channel + create approval thread when required.
                  </p>
                </div>

                <div className="p-4 border border-neutral-500 rounded-2xl space-y-3 group hover:border-[#00CAD8]/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-500 rounded-xl bg-[#0B1224]/50">
                      <CheckCircle size={16} className="text-[#4ADE80]" />
                      <span className="text-xs font-bold text-white">Approvals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">On resolve</span>
                      <Controller
                        name="notifyOnResolve"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`w-8 h-4 rounded-full relative transition-colors ${field.value ? 'bg-green-500' : 'bg-neutral-600'}`}
                          >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${field.value ? 'left-4' : 'left-0.5'}`} />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-[#64748B] text-xs leading-normal">
                    Notify approvers and log decisions to the timeline.
                  </p>
                </div>
              </div>
            </section>

            {/* EMAIL FALLBACK */}
            <section className="bg-transparent border border-neutral-500 rounded-lg p-4 space-y-4">
              <h3 className="text-white font-bold text-lg px-1">Email fallback</h3>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-white text-sm font-medium ml-1">Notification email</label>
                  <Controller
                    name="alertEmail"
                    control={control}
                    render={({ field }) => (
                      <Input className='text-white' placeholder='alerts@yourorg.com' {...field} />
                    )}
                  />
                  <p className="text-[#64748B] text-xs leading-normal px-1">
                    Used when chat/paging integrations are unavailable.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-white text-sm font-medium ml-1">Slack channel</label>
                  <Controller
                    name="slackChannel"
                    control={control}
                    render={({ field }) => (
                      <Input className='text-white' placeholder='#incidents' {...field} />
                    )}
                  />
                </div>

                <div className="p-4 border border-neutral-500 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">Rate limit notifications</span>
                    <Controller
                      name="rateLimit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className="text-white"
                          options={[
                            { value: "off", label: "Off" },
                            { value: "10/minute", label: "10/minute" },
                            { value: "20/minute", label: "20/minute" },
                          ]}
                          value={field.value}
                          onChange={(e: any) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </div>
                  <p className="text-[#64748B] text-xs leading-normal">
                    Prevent spam during flake storms.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="pt-6 flex justify-end">
            <CButton type="submit" className='w-fit px-4' isLoading={isPending} disabled={isPending || isLoading}>
              Save
            </CButton>
          </div>
        </form>
      </SettingWrapper>
    </div>
  );
};

export default page;
