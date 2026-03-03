import type { StateCreator } from "zustand";
import type { DataSourceId } from "./dataSourcesSlice";

export type ModalType = "configure" | "logs" | "metrics" | "overview";

export interface ModalData {
  type: ModalType;
  title: string;
  dataSourceId?: DataSourceId;
  dataSourceName?: string;
}

export interface ModalSliceType {
  isOpen: boolean;
  modalData: ModalData | null;

  // Actions
  openModal: (data: ModalData) => void;
  closeModal: () => void;
  setModalType: (type: ModalType) => void;
}

export const createModalSlice: StateCreator<ModalSliceType> = (set, get) => ({
  isOpen: false,
  modalData: null,

  // Actions
  openModal: (data) => {
    set({
      isOpen: true,
      modalData: data,
    });
  },

  closeModal: () => {
    set({
      isOpen: false,
      modalData: null,
    });
  },

  setModalType: (type) => {
    const currentData = get().modalData;
    if (currentData) {
      set({
        modalData: {
          ...currentData,
          type,
        },
      });
    }
  },
});
