import { Minus, Plus } from "lucide-react";
import { PropsWithChildren, useState } from "react";

interface ExpandableBlockProps extends PropsWithChildren {
  title: string;
  meta?: string;
  defaultOpen?: boolean;
}

export function ExpandableBlock({
  title,
  meta,
  defaultOpen = false,
  children,
}: ExpandableBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`ga-expand-block${open ? "" : " is-collapsed"}`}>
      <button
        className="ga-expand-toggle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ga-expand-icon" aria-hidden>
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
        <span>
          <strong>{title}</strong>
          {meta && <small>{meta}</small>}
        </span>
      </button>
      {open && <div className="ga-expand-body">{children}</div>}
    </section>
  );
}
