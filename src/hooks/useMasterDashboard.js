import { useContext } from "react";
import { MasterDashboardContext } from "@/components/context/MasterDashboardContext";

export function useMasterDashboard() {
  const context = useContext(MasterDashboardContext);
  if (!context) {
    throw new Error("useMasterDashboard must be used inside MasterDashboardProvider");
  }
  return context;
}