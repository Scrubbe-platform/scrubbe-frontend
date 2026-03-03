"use client";
import { ReactNode, createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createBoundStore, BoundStoreType } from ".";

const StoreContext = createContext<
  ReturnType<typeof createBoundStore> | undefined
>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createBoundStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createBoundStore();
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (store: BoundStoreType) => T) {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used within Provider");
  return useStore(store, selector);
}
