"use client";
import ChangeForm from "@/components/IMS/Dashboard/ChangeForm";
import Changes from "@/components/IMS/Dashboard/Changes";
import ProblemForm from "@/components/IMS/Dashboard/ProblemForm";
import Problems from "@/components/IMS/Dashboard/Problems";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import { Download, Plus } from "lucide-react";
import React, { useState } from "react";

const TABS = ["Changes", "Problems"];
const Page = () => {
  const [tab, setTab] = useState(0);
  const [openProblemForm, setOpenProblemForm] = useState(false);
  const [openChangeForm, setOpenChangeForm] = useState(false);
  return (
    <div className="p-4 gap-5 flex flex-col">
      <p className=" text-2xl font-bold">Changes and Problems</p>
      <div className="flex justify-end gap-4">
        <CButton onClick={() => setOpenChangeForm(true)} className=" w-fit">
          Create New Change <Plus />
        </CButton>
        <CButton
          onClick={() => setOpenProblemForm(true)}
          className=" w-fit bg-transparent border border-IMSLightGreen text-IMSLightGreen hover:text-white shadow-none"
        >
          Create New Problem <Plus />
        </CButton>
        <CButton className=" w-fit bg-transparent border border-IMSLightGreen text-IMSLightGreen hover:text-white shadow-none">
          Export <Download />
        </CButton>
      </div>

      <div className=" bg-white p-3 rounded-md">
        <div className="grid grid-cols-2 gap-8 border-b border-gray-200 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`p-4 text-sm font-medium border-b-2 transition-colors ${
                tab === i
                  ? "border-IMSLightGreen text-IMSLightGreen"
                  : "border-transparent text-gray-500  dark:text-gray-400 hover:text-green"
              }`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 0 && <Changes />}
          {tab === 1 && <Problems />}

          {/* Collaboration Tab */}
        </motion.div>
      </div>

      <Modal onClose={() => setOpenProblemForm(false)} isOpen={openProblemForm}>
        <ProblemForm onClose={() => setOpenChangeForm(false)} />
      </Modal>
      <Modal onClose={() => setOpenChangeForm(false)} isOpen={openChangeForm}>
        <ChangeForm onClose={() => setOpenChangeForm(false)} />
      </Modal>
    </div>
  );
};

export default Page;
