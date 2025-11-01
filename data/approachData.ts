import { ApproachType } from "@/types/approachType";
import enterprise from "@/public/approach/enterprise.png";
import support from "@/public/approach/support.png";

export const approachData: ApproachType[] = [
  {
    id: 1,
    index: "customersupport",
    title: "Lead Generation & Customer Support Reimagined",
    description:
      "With Joy AI, enterprises can create intelligent Voice AI Agents that naturally collect leads, understand customer pain points, and position your product as the right solution — all in a single phone conversation. Turn every customer interaction into an opportunity — from first call to conversion.",
    imageUrl: enterprise,
    videoUrl: "https://www.youtube.com/embed/7L092HXwu3A?si=x2EoZ7pGfujFfUOu",
  },
  {
    id: 2,
    index: "support",
    title: "Scale Support Without Scaling Headcount",
    description:
      "Joy AI automates customer service, appointments, and follow-ups in natural voice conversations that feel human — and never sleep.",
    imageUrl: support,
  },
];
