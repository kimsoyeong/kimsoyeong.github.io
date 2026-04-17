import { useState, useEffect } from "react";

const TableOfContents = ({ items, isDark = false }) => {
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

  const dk = isDark;

  return (
    <nav className="sticky top-24">
      <div className={`font-mono text-[10px] uppercase tracking-[0.15em] mb-4 ${dk ? "text-[#6e7681]" : "text-gray-400"}`}>
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
                  ? dk
                    ? "border-[#58a6ff] text-[#e6edf3] font-medium"
                    : "border-gray-800 text-gray-800 font-medium"
                  : dk
                    ? "border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:border-[#30363d]"
                    : "border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300"
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
