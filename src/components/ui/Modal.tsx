import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 -top-10 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`${className} relative dark:bg-[#111827] bg-white rounded-lg p-2 sm:p-6 w-full sm:min-w-[42rem]  sm:max-w-2xl mx-2 max-h-[90vh] overflow-y-auto `}
          >
            <div className=" absolute right-3 top-3">
              <div
                onClick={onClose}
                className="bg-neutral-100 dark:bg-[#111827] text-black dark:text-white rounded-sm p-1 w-fit cursor-pointer"
              >
                <X />
              </div>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
