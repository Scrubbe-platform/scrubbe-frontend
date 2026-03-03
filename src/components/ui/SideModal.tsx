import { X } from "lucide-react";
import React from "react";

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subTitle?:string
}

const SideModal: React.FC<SideModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subTitle
}) => {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-[#08132F] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-500 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-white ">{title}</h2>
              <p className="text-gray-200 text-sm">{subTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </>
  );
};

export default SideModal;
