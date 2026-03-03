"use client";
import { useEffect, Suspense } from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/store/StoreProvider";
import { getModalContent } from "@/lib/modal/modalContentMapper";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ModalManager: React.FC = () => {
  const { isOpen, modalData, closeModal } = useAppStore((state) => state);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeModal]);

  if (!isOpen || !modalData) return null;

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getHeaderTitle = () => {
    const dataSourceName =
      modalData.dataSourceName || modalData.title || "Data Source";
    const currentTab = capitalizeFirstLetter(modalData.type || "overview");
    return `${dataSourceName} - ${currentTab}`;
  };

  // Get the appropriate content component
  const ContentComponent =
    modalData.dataSourceId && modalData.type
      ? getModalContent(modalData.dataSourceId, modalData.type)
      : null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeModal}
      />

      <div
        className={`fixed top-0 right-0 h-full min-w-[600px]  bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
            <h2 className="text-xl font-semibold text-gray-800">
              {getHeaderTitle()}
            </h2>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              {ContentComponent ? (
                <ContentComponent />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-medium">Content not available</p>
                  <p className="text-sm mt-2">
                    No content found for {modalData.dataSourceName} -{" "}
                    {modalData.type}
                  </p>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalManager;
