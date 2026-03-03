"use client";
import React, { useState } from "react";
import { IoTrendingDown, IoTrendingUp } from "react-icons/io5";
import CButton from "../ui/Cbutton";
import ProgressBar from "../ezra/ProgressBar";
import { Table } from "../ui/table";
import { CellContext } from "@tanstack/react-table";
import moment from "moment";
import Modal from "../ui/Modal";
import LineChart from "./LineChart";
import Select from "../ui/select";
import Input from "../ui/input";

interface IActivity {
  endpoint: string;
  status: number;
  time: string;
}

export const dummyActivities: IActivity[] = [
  {
    endpoint: "/api/user/login",
    status: 200,
    time: "2024-07-01T10:15:00Z",
  },
  {
    endpoint: "/api/user/logout",
    status: 401,
    time: "2024-07-01T11:20:00Z",
  },
  {
    endpoint: "/api/data/fetch",
    status: 500,
    time: "2024-07-01T12:30:00Z",
  },
  {
    endpoint: "/api/notifications/read",
    status: 200,
    time: "2024-07-01T13:45:00Z",
  },
];

const columns = [
  {
    accessorKey: "endpoint",
    header: () => <span className="font-semibold">Endpoint</span>,
    cell: (info: CellContext<IActivity, unknown>) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<IActivity, unknown>) => info.getValue(),
  },
  {
    accessorKey: "time",
    header: () => <span className="font-semibold">Time</span>,
    cell: (info: CellContext<IActivity, unknown>) =>
      moment(info.getValue() as string).fromNow(),
  },
];

const Dashboard = () => {
  const [openConfigure, setOpenConfigure] = useState(false);
  return (
    <div className="p-6">
      <h2 className="font-semibold text-lg dark:text-white">
        Dashboard Overview
      </h2>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 mt-7">
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            2,810
          </p>
          <p className="text-colorScBlue dark:text-white">API Calls Today</p>
          <p className=" text-green-500 flex items-center gap-2">
            <IoTrendingUp />
            +12.3% from yesterday
          </p>
        </div>
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            99.4%
          </p>
          <p className="text-colorScBlue dark:text-white">Uptime</p>
          <p className=" text-green-500 flex items-center gap-2">
            <IoTrendingUp />
            +12.3% this month
          </p>
        </div>
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            127ms
          </p>
          <p className="text-colorScBlue dark:text-white">Avg Response Time</p>
          <p className=" text-red-500 flex items-center gap-2">
            <IoTrendingDown />
            +5ms from last week
          </p>
        </div>
        <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[163px] flex flex-col justify-center  border-t-4 border-blue-400/60 relative">
          <p className=" text-4xl font-bold text-colorScBlue dark:text-white">
            98.7%
          </p>
          <p className="text-colorScBlue dark:text-white">Rate Limit Health</p>
          <p className=" text-green-500 flex items-center gap-2">
            <IoTrendingUp />
            +12.3% Within safe limits
          </p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-dark mt-6 rounded-xl">
        <div className=" flex justify-between items-center">
          <h2 className="font-semibold text-lg dark:text-white">
            Rate Limiting Overview
          </h2>
          <CButton onClick={() => setOpenConfigure(true)} className=" w-fit">
            Configure Limit
          </CButton>
        </div>

        <div className="grid grid-cols-3 gap-5 mt-4">
          <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[150px] flex flex-col justify-center border dark:border-subDark border-gray-200 relative">
            <p className=" text-4xl font-bold text-colorScBlue">856/1000</p>

            <div className="space-y-2">
              <p className=" dark:text-white">Request per minute</p>
              <ProgressBar color=" bg-colorScBlue" value={60} />
            </div>
          </div>
          <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[150px] flex flex-col justify-center border dark:border-subDark border-gray-200 relative">
            <p className=" text-4xl font-bold text-green-500">856/1000</p>

            <div className="space-y-2">
              <p className=" dark:text-white">Request per minute</p>
              <ProgressBar color="bg-green-500" value={40} />
            </div>
          </div>
          <div className="dark:bg-dark bg-white rounded-xl gap-3 dark:shadow-md p-4 w-full h-[150px] flex flex-col justify-center border dark:border-subDark border-gray-200 relative">
            <p className=" text-4xl font-bold text-amber-500">856/1000</p>

            <div className="space-y-2">
              <p className=" dark:text-white">Request per minute</p>
              <ProgressBar color="bg-amber-500" value={60} />
            </div>
          </div>
        </div>

        <div className=" mt-6 grid md:grid-cols-2">
          <div className=" rounded-lg p-4 border space-y-3">
            <p className=" text-colorScBlue font-medium">Recent Activity</p>
            <Table columns={columns} data={dummyActivities} />
          </div>
          <div className=" rounded-lg p-4 border space-y-3">
            <p className=" text-colorScBlue font-medium">Usage Overview</p>
            <div className="space-y-2 bg-zinc-100 dark:bg-subDark p-3 rounded-md">
              <div className="flex justify-between items-center">
                <p className=" dark:text-white">API Call</p>
                <p className=" text-colorScBlue">2,847/10,000</p>
              </div>
              <ProgressBar color=" bg-colorScBlue" value={60} />
            </div>
            <div className="space-y-2 bg-zinc-100 dark:bg-subDark p-3 rounded-md">
              <div className="flex justify-between items-center">
                <p className=" dark:text-white">Fingerprints</p>
                <p className=" text-colorScBlue">1,433/5,000</p>
              </div>
              <ProgressBar color=" bg-colorScBlue" value={60} />
            </div>
            <div className="space-y-2 bg-zinc-100 dark:bg-subDark p-3 rounded-md">
              <div className="flex justify-between items-center">
                <p className=" dark:text-white">Webhook Calls</p>
                <p className=" text-colorScBlue">567/2,000</p>
              </div>
              <ProgressBar color=" bg-colorScBlue" value={60} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-dark mt-6 rounded-xl">
        <div className=" flex justify-between items-center">
          <h2 className="font-semibold text-lg dark:text-white">
            Performance Analytics
          </h2>
        </div>
        <div className="mt-6">
          <LineChart
            labels={[
              "8:00",
              "8:15",
              "8:20",
              "8:30",
              "8:40",
              "8:50",
              "9:00",
              "9:10",
              "9:20",
              "9:30",
              "9:40",
              "9:50",
              "10:00",
              "10:10",
              "10:20",
            ]}
            datasets={[
              {
                label: "Response time",
                data: [
                  120, 30, 130, 140, 0, 110, 125, 135, 120, 80, 110, 90, 60,
                  100, 120,
                ],
                borderColor: "#2563eb",
                backgroundColor: "#2563eb",
                yAxisID: "y",
                pointBorderColor: "#fff",
                pointBackgroundColor: "#2563eb",
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: false,
              },
              {
                label: "Rate Error time",
                data: [
                  0.12, 0.02, 0.11, 0.09, 0.04, 0.1, 0.11, 0.12, 0.1, 0.11,
                  0.09, 0.05, 0.04, 0.08, 0.1,
                ],
                borderColor: "#0f766e",
                backgroundColor: "#0f766e",
                yAxisID: "y1",
                pointBorderColor: "#fff",
                pointBackgroundColor: "#0f766e",
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: false,
              },
            ]}
            yAxes={[
              {
                id: "y",
                position: "left",
                label: "Response Time(ms)",
                min: 0,
                max: 150,
                stepSize: 20,
              },
              {
                id: "y1",
                position: "right",
                label: "Rate Error time",
                min: 0,
                max: 0.12,
                stepSize: 0.02,
              },
            ]}
            height={350}
          />
        </div>
      </div>

      <Modal
        isOpen={openConfigure}
        onClose={() => setOpenConfigure(false)}
        className=" !max-w-[36rem]"
      >
        <div className="space-y-4">
          <p className="dark:text-white text-xl">Configure Rate Limits</p>

          <Select
            label="Rate Limit Types"
            options={[
              { label: "Per IP Address", value: "per ip address" },
              { label: "Per API Key", value: "per api key" },
              { label: "Per User", value: "per user" },
              { label: "Global", value: "global" },
            ]}
          />

          <Select
            label="Time Window"
            options={[
              { label: "Per Second", value: "per second" },
              { label: "Per Minute", value: "per minute" },
              { label: "Per Hour", value: "per hour" },
              { label: "Per Day", value: "per day" },
            ]}
          />
          <Input label="Request Limit" placeholder="1000" />
          <Input label="Action on Limit Exceeded" placeholder="Block Request" />

          <div className="flex justify-end gap-3">
            <CButton
              className=" border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white  "
              onClick={() => setOpenConfigure(false)}
            >
              Cancel
            </CButton>
            <CButton className=" w-fit" onClick={() => setOpenConfigure(false)}>
              Apply Configuration
            </CButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
