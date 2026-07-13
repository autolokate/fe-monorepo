import {
  Ambulance,
  BrainCircuit,
  Headset,
  MapPin,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { AboutHeroCopy, AboutHeroFeature, AboutHeroStat } from "./types";

export const ABOUT_HERO_BANNER_IMAGE = "/images/about/about_banner.png";

export const ABOUT_HERO_COPY: AboutHeroCopy = {
  eyebrow: "About Autolokate",
  headline: "Building a Safer India.",
  headlineAccent: "Together.",
  subheading:
    "Autolokate is an AI-powered road safety platform that connects technology, people, and infrastructure to ensure faster help in every emergency.",
  primaryCta: { label: "Explore features", href: "#what-autolokate-offers" },
  secondaryCta: { label: "Contact us", href: "/contact-us" },
};

export const ABOUT_HERO_FEATURES: AboutHeroFeature[] = [
  {
    title: "AI Crash Detection",
    body: "Detects. Alerts. Responds.",
    Icon: BrainCircuit,
  },
  {
    title: "Human War Room",
    body: "Real people. Real action.",
    Icon: Headset,
  },
  {
    title: "Trusted Network",
    body: "Ambulance, police, RSA, hospitals.",
    Icon: Users,
  },
  {
    title: "End-to-End Care",
    body: "From alert to resolution.",
    Icon: ShieldCheck,
  },
];

export const ABOUT_HERO_STATS: AboutHeroStat[] = [
  { value: "24/7", label: "War Room Support", Icon: Headset },
  { value: "10,000+", label: "Partner Ambulances", Icon: Ambulance },
  { value: "1M+", label: "Protected Vehicles", Icon: Shield },
  { value: "500+", label: "Cities Covered", Icon: MapPin },
];
