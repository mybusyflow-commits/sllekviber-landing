"use client";
import { PROBLEM_CHAPTERS } from "@/lib/story";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { DesignStudy, ConnectionStudy, TrustStudy } from "@/components/ui/StoryStudies";
import ScrollStack, { ScrollStackItem } from "@/components/react-bits/ScrollStack";
const studies = [DesignStudy, ConnectionStudy, TrustStudy];
export function Problems() {
  return <section id="problems" className="problems-section" aria-labelledby="problems-title">
    <div className="problems-intro"><h2 id="problems-title"><SplitReveal text="Why we are building SleekViber" /></h2></div>
    <ScrollStack useWindowScroll smoothScroll={false} stackPosition="78px" itemDistance={170} itemStackDistance={16} itemScale={.06} baseScale={.88} dimAmount={.22} holdDistance={100}>
      {PROBLEM_CHAPTERS.map((chapter, i) => { const Study = studies[i]; return <ScrollStackItem key={chapter.title} itemClassName={`problem-chapter chapter-${i}`}>
        <div className="chapter-copy"><h3>{chapter.title}</h3><p>{chapter.note}</p><ul className="topic-list" aria-label="Related problems">{chapter.topics.map(topic => <li key={topic}>{topic}</li>)}</ul><span className="chapter-context">{i === 0 ? "Design study" : i === 1 ? "Connection study" : "Access-control study"}</span></div>
        <div className="chapter-art"><Study /></div>
      </ScrollStackItem>; })}
    </ScrollStack>
  </section>;
}
