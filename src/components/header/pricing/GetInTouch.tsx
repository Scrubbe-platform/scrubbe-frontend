import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import { Checkbox } from "@heroui/react";
import React from "react";

const GetInTouch = () => {
  return (
    <div className="min-h-screen w-full relative z-10">
      <img
        src="/get-in-touch.jpg"
        alt=""
        className=" absolute w-full h-full -z-10"
      />
      <div className=" px-4 md:px-6 lg:px-20 xl:px-20 py-20 flex justify-center items-center h-full">
        <div className=" bg-white max-w-3xl rounded-lg p-6 border-t-4 border-colorScBlue mx-auto h-full">
          <p className=" font-bold text-center">Get in Touch</p>
          <p className=" text-center">
            Have questions about pricing or need a custom quote? We&apos;re here
            to help find the right plan for you
          </p>

          <div className=" mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="First Name"
                className="bg-transparent text-white"
                labelClassName=" text-black"
              />
              <Input
                label="Last Name"
                placeholder="Last Name"
                className="bg-transparent text-white"
                labelClassName=" text-black"
              />
              <Input
                label="Business Email"
                placeholder="Business Email"
                className="bg-transparent text-white"
                labelClassName=" text-black"
              />
              <Input
                label="Phone Number"
                placeholder="Phone Number"
                className="bg-transparent text-white"
                labelClassName=" text-black"
              />
              <Input
                label="Company's Name"
                placeholder="Company's Name"
                className="bg-transparent text-white"
                labelClassName=" text-black"
              />
              <Input
                label="Job Title"
                placeholder="Job Title"
                className="bg-transparent text-white"
                labelClassName=" text-black"
              />
            </div>
            <TextArea
              label="Tell us about your Pricing Requirements"
              placeholder="Let us know your budget range, specific pricing questions or if you need a custom enterprise quote "
              className="bg-transparent text-white"
              labelClassName=" text-black"
            />

            <CButton>Submit</CButton>

            <div className="flex items-center gap-2">
              <Checkbox />
              <p>
                I agree to receive communications from Scrubbe about their
                security solutions and services. I understand I can unsubscribe
                at any time. 
                <span className=" text-colorScBlue">Privacy Policy</span> 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;
