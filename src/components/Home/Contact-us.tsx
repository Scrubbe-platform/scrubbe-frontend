"use client";
import React, { useState } from "react";
import Input from "../ui/input";
import TextArea from "../ui/text-area";
import CButton from "../ui/Cbutton";
import Link from "next/link";
import { BiChat, BiEnvelope } from "react-icons/bi";
import { MdPhoneInTalk } from "react-icons/md";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

const ContactUs = () => {
  const [type, setType] = useState<
    "technical-support" | "sales-inquiry" | "general-support"
  >("technical-support");
  const { post } = useFetch();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactUs = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await post(endpoint.contact_us, formData);
    setLoading(false);
    if (res.success) {
      toast.success(res.data.message);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        subject: "",
        message: "",
      });
    }
  };
  return (
    <div className="bg-white min-h-screen font-sans pt-20">
      {/* ── CONTACT SECTION ── */}
      <section className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14 items-start">
        {/* LEFT */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-2">
            Contact us
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-emerald-500 mb-3">
            We'd love to hear from you
          </p>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-sm">
            Reach out for any questions, partnerships, support, or to see
            Scrubbe in action.
          </p>

          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
            Ways to reach us
          </p>

          <div className="flex flex-col gap-6">
            {WAYS.map((w, i) => (
              <WayRow key={i} w={w} />
            ))}
          </div>
        </div>

        {/* RIGHT — FORM CARD */}
        <div className="border-2 border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white">
          {/* Top two action buttons */}
          <div className="grid grid-cols-2 border-b-2 border-gray-300">
            <button
              data-cal-namespace="demo"
              data-cal-link="scrubbe/scrubbe-demo"
              data-cal-config='{"layout":"month_view","theme":"light"}'
              className="flex items-center gap-3 p-5 bg-transparent cursor-pointer text-left hover:bg-emerald-50 active:bg-emerald-100 transition-colors border-r-2 border-gray-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                <Calendar size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  Book a Demo
                </p>
                <p className="text-sm text-gray-400 leading-snug mt-0.5">
                  Schedule a personalised demo with our team
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-5 bg-transparent border-none cursor-pointer text-left hover:bg-gray-50 active:bg-gray-100 transition-colors group w-full">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                <MessageSquare size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800 group-hover:text-gray-600 transition-colors">
                  Send us a message
                </p>
                <p className="text-sm text-gray-400 leading-snug mt-0.5">
                  We'll get back to you soon
                </p>
              </div>
            </button>
          </div>

            <div className="grid sm:grid-cols-2 mt-10 gap-4">
              <Input
                label="First Name"
                required
                value={formData.first_name}
                labelClassName="text-white"
                onChange={(e) => handleChange(e.target.value, "first_name")}
              />
              <Input
                label="Last Name"
                required
                value={formData.last_name}
                labelClassName="text-white"
                onChange={(e) => handleChange(e.target.value, "last_name")}
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                labelClassName="text-white"
                onChange={(e) => handleChange(e.target.value, "email")}
              />
              <Input label="Phone Number" labelClassName="text-white" />
              <Input label="Company's Name" labelClassName="text-white" />
              <Input label="Job Title" labelClassName="text-white" />
            </div>
            <Input
              label="Subject"
              labelClassName="text-white"
              value={formData.subject}
              onChange={(e) => handleChange(e.target.value, "subject")}
            />
            <TextArea
              label="Message"
              required
              value={formData.message}
              labelClassName="text-white"
              onChange={(e) => handleChange(e.target.value, "message")}
            />

            <div className="flex justify-end">
              <CButton isLoading={loading} type="submit" className="w-fit">
                Send Message
              </CButton>
            </div>
          </form>
          <div className="bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip text-white p-10">
            <p className=" font-semibold text-xl">Send us a message</p>
            <div className="flex flex-col gap-3 mt-3">
              <div className="p-4 py-6 border border-IMSCyan rounded-xl  flex-row flex gap-3 items-center">
                <BiEnvelope size={23} />
                <div className=" space-y-2">
                  <p className=" font-medium">Email Support</p>
                  <Link href={"mailto:support@scrubbe.com"}>
                    Support@scrubbe.com
                  </Link>
                </div>
              </div>
              <div>
                <label className={labelCls}>Work Email</label>
                <input
                  className={inputCls}
                  type="email"
                  placeholder="Enter your work email"
                  value={form.workEmail}
                  onChange={set("workEmail")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Company Name</label>
                <input
                  className={inputCls}
                  placeholder="Enter your company name"
                  value={form.companyName}
                  onChange={set("companyName")}
                />
              </div>
              <div>
                <label className={labelCls}>What best describes you</label>
                <select
                  className={`${inputCls} ${
                    !form.role ? "text-gray-400" : "text-gray-700"
                  }`}
                  value={form.role}
                  onChange={set("role")}
                >
                  <option value="">Enter your role</option>
                  <option>SRE</option>
                  <option>Engineering Manager</option>
                  <option>DevOps Engineer</option>
                  <option>CTO / VP Engineering</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className={labelCls}>How can we help you</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Tell us a bit about your use case and goals"
                value={form.message}
                onChange={set("message")}
              />
            </div>

            <button className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold text-lg transition-colors">
              Continue to Confirm
            </button>

            <p className="flex items-center justify-center gap-2 text-base text-gray-400 mt-4">
              <Shield size={15} />
              Your information is secured and will never be shared
            </p>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="border-t-2 border-gray-200" />

      {/* ── FAQ SECTION ── */}
      <section className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500">
            Got questions? We've got answers.{" "}
            <span className="font-medium text-gray-700">
              Browse our frequently asked questions
            </span>{" "}
            to find what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
          <div>
            {leftFAQ.map((item, i) => (
              <FAQRow key={i} item={item} />
            ))}
          </div>
          <div>
            {rightFAQ.map((item, i) => (
              <FAQRow key={i} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
