import { useCallback, useEffect, useState } from "react";
import ServiceProviderService from "../service/ServiceProviderService";

export default function useServiceDashboard(enabled = true) {
  const [dashboard, setDashboard] = useState(ServiceProviderService.getStoredDashboard());
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");

  const refreshDashboard = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setDashboard(null);
      return null;
    }

    try {
      setLoading(true);
      setError("");
      const nextDashboard = await ServiceProviderService.refreshDashboard();
      setDashboard(nextDashboard);
      return nextDashboard;
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load service dashboard.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return { dashboard, loading, error, refreshDashboard };
}
