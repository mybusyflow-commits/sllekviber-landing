import Experience from "@/components/Experience";
import { Hero } from "@/components/sections/Hero";
import { Problems } from "@/components/sections/Problems";
import { Reveal } from "@/components/sections/Reveal";
import { Solutions } from "@/components/sections/Solutions";
import { Questionnaire } from "@/components/sections/Questionnaire";
import { About } from "@/components/sections/About";

export default function Home() {
  return <div className="creative-experience relative isolate min-h-screen text-ink"><Experience /><main id="story-root" className="relative z-10 overflow-clip"><Hero /><Problems /><Reveal /><Solutions /><Questionnaire /><About /></main></div>;
}
