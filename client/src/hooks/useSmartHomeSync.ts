import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { initialSimulationState, type CoverDeviceKey, type DeviceKey, type SmartHomeScene, type ToggleCapability } from "@shared/smart-home";

export type SyncStatus = "loading" | "connected" | "reconnecting" | "offline";

export function useSmartHomeSync() {
  const utils = trpc.useUtils();
  const snapshotQuery = trpc.smartHome.snapshot.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
  const commandMutation = trpc.smartHome.command.useMutation({
    onSuccess: () => utils.smartHome.snapshot.invalidate(),
  });
  const sceneMutation = trpc.smartHome.scene.useMutation({
    onSuccess: () => utils.smartHome.snapshot.invalidate(),
  });
  const [streamStatus, setStreamStatus] = useState<"connected" | "reconnecting">("reconnecting");

  const invalidateSnapshot = useCallback(() => {
    void utils.smartHome.snapshot.invalidate();
  }, [utils]);

  useEffect(() => {
    const source = new EventSource("/api/smart-home/events");
    source.onopen = () => setStreamStatus("connected");
    source.onmessage = () => {
      setStreamStatus("connected");
      invalidateSnapshot();
    };
    const onBackendStatus = (event: Event) => {
      try {
        const { available } = JSON.parse((event as MessageEvent<string>).data) as { available: boolean };
        setStreamStatus(available ? "connected" : "reconnecting");
        if (available) invalidateSnapshot();
      } catch {
        setStreamStatus("reconnecting");
      }
    };
    source.addEventListener("backend-status", onBackendStatus);
    source.onerror = () => setStreamStatus("reconnecting");
    return () => {
      source.removeEventListener("backend-status", onBackendStatus);
      source.close();
    };
  }, [invalidateSnapshot]);

  const toggle = useCallback((deviceKey: DeviceKey, capability: ToggleCapability) => {
    if (capability === "light") return commandMutation.mutateAsync({ deviceKey, capability: "light" });
    if (capability === "climate") return commandMutation.mutateAsync({ deviceKey, capability: "climate" });
    return commandMutation.mutateAsync({ deviceKey, capability: "hood" });
  }, [commandMutation.mutateAsync]);

  const adjustTemperature = useCallback((deviceKey: DeviceKey, delta: -1 | 1) =>
    commandMutation.mutateAsync({ deviceKey, capability: "temperature", delta }), [commandMutation.mutateAsync]);

  const setCoverPosition = useCallback((deviceKey: CoverDeviceKey, position: number) =>
    commandMutation.mutateAsync({ deviceKey, capability: "cover", position }), [commandMutation.mutateAsync]);

  const applyScene = useCallback((scene: SmartHomeScene) =>
    sceneMutation.mutateAsync({ scene }), [sceneMutation.mutateAsync]);

  const status: SyncStatus = snapshotQuery.isError
    ? "offline"
    : !snapshotQuery.data
      ? "loading"
      : streamStatus;

  return {
    state: snapshotQuery.data?.state ?? initialSimulationState,
    revision: snapshotQuery.data?.revision ?? null,
    isReady: Boolean(snapshotQuery.data) && !snapshotQuery.isError,
    status,
    error: snapshotQuery.error,
    toggle,
    adjustTemperature,
    setCoverPosition,
    applyScene,
  };
}
