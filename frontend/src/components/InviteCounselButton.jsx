import React from "react";
import { Mail } from "lucide-react";
import { track } from "@/lib/analytics";
import { toast } from "sonner";

/**
 * One-click "invite your legal counsel" mailto action.
 *
 * Props:
 *  - subject: string
 *  - body:    string (already formatted with \r\n line breaks)
 *  - context: object — extra analytics props
 *  - variant: "primary" | "outline"
 */
export default function InviteCounselButton({
  subject,
  body,
  context = {},
  variant = "outline",
  label = "Invite your legal counsel",
  testId = "invite-counsel-btn",
  fullWidth = false,
}) {
  const onClick = () => {
    const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    track("counsel_invited", context);
    // Open in the user's default mail client.
    window.location.href = href;
    toast.success("Opening your mail client with a pre-filled draft…");
  };

  const cls =
    variant === "primary"
      ? "bg-foreground text-background hover:bg-[#0020C2] hover:text-white"
      : "border border-foreground/20 hover:bg-foreground hover:text-background";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-11 px-5 label-eyebrow transition-all ${cls} ${
        fullWidth ? "w-full justify-center" : ""
      }`}
      data-testid={testId}
    >
      <Mail className="h-4 w-4" /> {label}
    </button>
  );
}
