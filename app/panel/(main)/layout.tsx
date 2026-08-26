
"use client";

import type { ReactNode } from "react";

import {
  PanelAccessProvider,
} from "@/hooks/PanelAccessProvider";
import PanelHeader from "./PanelHeader";
import PanelFooter from "./PanelFooter";

export default function PanelMainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PanelAccessProvider>
      <div className="min-h-screen flex flex-col">
        <PanelHeader />

        <main className="flex-1">
          {children}
        </main>

        <PanelFooter />
      </div>        </PanelAccessProvider>
  );
}
