"use client";

import dynamic from "next/dynamic";

const SceneAtmosphere = dynamic(
  () => import("./scene-atmosphere").then((m) => m.SceneAtmosphere),
  { ssr: false },
);

export function LazySceneAtmosphere() {
  return <SceneAtmosphere />;
}
