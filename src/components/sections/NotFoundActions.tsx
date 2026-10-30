"use client";

import { useNavActions } from "@/hooks/useNavActions";

export function NotFoundActions({ label }: { label: string }) {
  const { goSection } = useNavActions();
  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => goSection("hero")}
        data-cursor-snap
        className="mono-label bg-accent px-6 py-4 text-[0.74rem]"
        style={{ color: "#101F1C" }}
      >
        {label}
      </button>
    </div>
  );
}
