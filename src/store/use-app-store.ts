import { create } from "zustand";
import { IDialogType } from "@/types";

interface AppStore {
  dialogType: IDialogType;
  setDialogType: (dialogType: IDialogType) => void;
}

export const useAppStore = create<AppStore>()((set) => ({
  dialogType: "None",
  setDialogType: (dialogType) => set({ dialogType }),
}));

export const useStore = () => {
  const store = useAppStore();
  return {
    dialogType: store.dialogType,
    setDialogType: store.setDialogType,
  };
};

