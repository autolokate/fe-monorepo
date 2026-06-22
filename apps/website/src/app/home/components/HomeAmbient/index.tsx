/**
 * Background ambient decoration that sits underneath the rest of the home
 * sections. Uses theme tokens so it adapts to light/dark automatically.
 * Pure CSS — no JS, no framer-motion.
 */
export function HomeAmbient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-primary/[0.07] blur-3xl" />
      <div className="absolute right-[-12rem] top-[42rem] h-[28rem] w-[28rem] rounded-full bg-primary/[0.05] blur-3xl" />
      <div className="absolute left-[20%] top-[120%] h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" />
    </div>
  );
}
