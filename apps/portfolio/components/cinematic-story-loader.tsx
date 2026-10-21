"use client";

import dynamic from "next/dynamic";
import { ProjectWorlds } from "./project-worlds";

const Story = dynamic(() => import("./cinematic-story").then((module) => module.CinematicStory), {
  ssr: false,
  loading: () => <div className="cinematic-story-loading" aria-label="Loading cinematic scene"><span>ENTERING THE WORLD</span><i /></div>,
});

export function CinematicStoryLoader() {
  return <><Story /><ProjectWorlds /></>;
}
