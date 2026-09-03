import { create } from "zustand";

interface OutputTabStore {
  isOpen: boolean;
  openOutput: () => void;
  closeOutput: () => void;
  toggleOutput: () => void;
}

export const useOutputTabStore = create<OutputTabStore>((set) => ({
  isOpen: false,
  openOutput: () => set({ isOpen: true }),
  closeOutput: () => set({ isOpen: false }),
  toggleOutput: () => set((state) => ({ isOpen: !state.isOpen })),
}));
