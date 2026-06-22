export interface FlowStep {
  step: string;
  title: string;
  text: string;
}

export const FLOW_STEPS: ReadonlyArray<FlowStep> = [
  {
    step: "1",
    title: "Sign in",
    text: "OTP login links bookings and payments to your account.",
  },
  {
    step: "2",
    title: "Pick a slot",
    text: "Choose date & time from live availability.",
  },
  {
    step: "3",
    title: "Pay on Razorpay",
    text: "UPI, cards, or wallets — order created for your booking.",
  },
  {
    step: "4",
    title: "Get confirmed",
    text: "We verify payment; you'll see status here and in email.",
  },
  {
    step: "5",
    title: "Join the call",
    text: "Meet link appears when your session is ready — same page, anytime.",
  },
] as const;
