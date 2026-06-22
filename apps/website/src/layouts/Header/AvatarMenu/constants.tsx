import type { ComponentType, SVGProps } from "react";
import { CalendarDays, LogOut, User } from "lucide-react";

export interface AvatarMenuItem {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Either a route to navigate to, or `"logout"` to trigger sign-out. */
  href?: string;
  action?: "logout";
  /** Optional tone — `danger` styles the row in destructive red. */
  tone?: "default" | "danger";
}

/** Items rendered inside the avatar dropdown when the user is signed in. */
export const avatarMenuItems: AvatarMenuItem[] = [
  { id: "profile", label: "My Profile", icon: User, href: "/profile" },
  { id: "book-session", label: "Book a session", icon: CalendarDays, href: "/book-session" },
  { id: "logout", label: "Logout", icon: LogOut, action: "logout", tone: "danger" },
];

/** Default avatar glyph rendered inside the circular trigger. */
export { User as AvatarGlyph };
