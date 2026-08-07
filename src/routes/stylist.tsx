import { Outlet, createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CustomCursor } from "@/components/site/CustomCursor";

export const Route = createFileRoute("/stylist")({
  component: StylistLayout,
});

function StylistLayout() {
  return (
    <>
      <SmoothScroll />
      <CustomCursor />
      <Nav solid />
      <Outlet />
    </>
  );
}