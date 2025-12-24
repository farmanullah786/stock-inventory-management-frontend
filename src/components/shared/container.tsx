import { ReactNode } from "react";

export const Container = ({ children }: { children: ReactNode }) => (
  <div className="space-y-4 p- sm:p-6 sm:pt-10">{children}</div>
);

