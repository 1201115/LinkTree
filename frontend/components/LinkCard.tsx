import { ReactNode } from "react";

export default function LinkCard({
  title,
  href,
  icon
}: {
  title: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <a
      className="glass rounded-2xl px-5 py-4 flex items-center justify-between transition hover:scale-[1.01] hover:shadow-glow"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <div className="flex items-center gap-4">
        <div className="text-2xl text-cyan">{icon}</div>
        <span className="font-semibold">{title}</span>
      </div>
      <span className="text-white/40">↗</span>
    </a>
  );
}
