import { useState, useEffect } from "react";

const TableOfContents = ({ items }) => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const ids = items.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-24">
      <div className="font-dm-mono text-[10px] text-[#6b7280] uppercase tracking-[0.15em] mb-4">
        On this page
      </div>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block py-1.5 pl-3 border-l-2 text-[13px] transition-all duration-150 ${
                activeId === item.id
                  ? "border-[#2563eb] text-[#2563eb] font-medium"
                  : "border-transparent text-[#6b7280] hover:text-[#1a1e2a] hover:border-[#dde1ea]"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
