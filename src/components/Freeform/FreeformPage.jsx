import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import posts, { categories } from "./posts";

const categoryLabel = {
  paper: "논문 리뷰",
  docs: "공식문서",
  article: "아티클",
};

const cardColorsLight = [
  "bg-[#f0ede4]",
  "bg-[#d6e4d6]",
  "bg-[#dce6ef]",
  "bg-[#e8d8df]",
  "bg-[#e8ddd0]",
  "bg-[#d9d3e3]",
];

const cardColorsDark = [
  "bg-[#2d2a24]",
  "bg-[#1a2e1a]",
  "bg-[#1c2d3e]",
  "bg-[#2d1a1e]",
  "bg-[#2a2018]",
  "bg-[#271d37]",
];

const cardRotations = ["-rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]", "rotate-1", "-rotate-[0.3deg]", "rotate-[0.8deg]"];

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const FreeformPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState(null);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const dk = isDark;

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const allTags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      return true;
    });
  }, [activeCategory, activeTag]);

  const cardColors = dk ? cardColorsDark : cardColorsLight;

  return (
    <div className={`min-h-screen font-dm-sans transition-colors duration-200 ${dk ? "bg-[#0d1117] text-[#e6edf3]" : "bg-[#fafafa] text-[#1a1e2a]"}`}>
      {/* Hero */}
      <div className={`border-b ${dk ? "border-[#30363d] bg-[#0d1117]" : "border-gray-200 bg-white"}`}>
        <div className="max-w-[960px] mx-auto px-4 pt-12 pb-8 sm:px-7 sm:pt-20 sm:pb-14">
          {/* top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/assets/img/Freeform.png" alt="freeform" className="w-8 h-8" />
              <p className={`font-mono text-[11px] tracking-[0.15em] uppercase ${dk ? "text-[#8b949e]" : "text-gray-500"}`}>
                Freeform · Blog
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                dk
                  ? "bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3]"
                  : "bg-[#f6f8fa] hover:bg-[#eaeef2] text-[#1f2328]"
              }`}
              aria-label="Toggle theme"
            >
              {dk ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 sm:mb-5">
            Reading <span className={dk ? "text-[#e6edf3]" : "text-gray-800"}>Notes</span>
          </h1>
          <p className={`text-[15px] max-w-[640px] leading-relaxed ${dk ? "text-[#8b949e]" : "text-gray-500"}`}>
            논문, 공식문서, 아티클을 읽고 정리한 리뷰와 리포트를 모아둡니다.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={`border-b ${dk ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-[#f8f8f8]"}`}>
        <div className="max-w-[960px] mx-auto px-4 py-3 sm:px-7 sm:py-4">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap items-center mb-3">
            <span className={`font-mono text-[10px] uppercase tracking-[0.12em] mr-2 ${dk ? "text-[#8b949e]" : "text-gray-500"}`}>
              Category
            </span>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`font-mono text-[11px] px-3 py-1 rounded-full border transition-all ${
                  activeCategory === cat.key
                    ? dk
                      ? "bg-[#e6edf3] text-[#0d1117] border-[#e6edf3]"
                      : "bg-gray-800 text-white border-gray-800"
                    : dk
                      ? "bg-transparent text-[#8b949e] border-[#30363d] hover:border-[#8b949e] hover:text-[#e6edf3]"
                      : "bg-white text-gray-500 border-gray-300 hover:border-gray-800 hover:text-gray-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Tag filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className={`font-mono text-[10px] uppercase tracking-[0.12em] mr-2 ${dk ? "text-[#8b949e]" : "text-gray-500"}`}>
              Tags
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`font-mono text-[10px] px-2.5 py-0.5 rounded border transition-all ${
                  activeTag === tag
                    ? dk
                      ? "bg-[#21262d] text-[#e6edf3] border-[#8b949e]"
                      : "bg-gray-100 text-gray-800 border-gray-800"
                    : dk
                      ? "bg-transparent text-[#8b949e] border-transparent hover:border-[#30363d]"
                      : "bg-white text-gray-500 border-transparent hover:border-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className={`font-mono text-[10px] ml-1 ${dk ? "text-[#6e7681] hover:text-[#ff7b72]" : "text-gray-400 hover:text-red-500"}`}
              >
                × clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="max-w-[960px] mx-auto px-4 py-10 sm:px-7 sm:py-16">
        <p className={`font-mono text-[10px] tracking-[0.18em] uppercase mb-6 ${dk ? "text-[#6e7681]" : "text-gray-400"}`}>
          {activeCategory === "all" ? "All Posts" : categoryLabel[activeCategory] || activeCategory} · {filtered.length}
        </p>

        {filtered.length === 0 ? (
          <div className={`text-center py-20 ${dk ? "text-[#8b949e]" : "text-gray-500"}`}>
            <p className="text-lg mb-2">No posts found.</p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveTag(null); }}
              className={`font-mono text-[12px] hover:underline ${dk ? "text-[#e6edf3]" : "text-gray-800"}`}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((post, i) => (
              <div
                key={post.slug}
                onClick={() => navigate(`/freeform/${post.slug}`)}
                className={`${cardColors[i % cardColors.length]} ${cardRotations[i % cardRotations.length]}
                            rounded-lg p-4 sm:p-6 shadow-md cursor-pointer
                            hover:rotate-0 hover:scale-[1.01] hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Thumbnail */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden shrink-0 flex items-center justify-center shadow-sm ${dk ? "bg-white/10" : "bg-gray-200/50"}`}>
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📝</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`font-mono text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded ${dk ? "text-[#8b949e] bg-white/8" : "text-gray-500 bg-black/5"}`}>
                        {categoryLabel[post.category] || post.category}
                      </span>
                      <span className={`font-mono text-[11px] ${dk ? "text-[#8b949e]" : "text-gray-500"}`}>
                        {post.date}
                      </span>
                      {post.source && (
                        <a
                          href={post.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`font-mono text-[10px] underline transition-colors ${dk ? "text-[#8b949e] hover:text-[#58a6ff]" : "text-gray-500 hover:text-gray-800"}`}
                        >
                          원본 →
                        </a>
                      )}
                    </div>

                    <h3 className={`text-[15px] sm:text-lg font-bold mb-1 ${dk ? "text-[#e6edf3]" : "text-gray-800"}`}>
                      {post.title}
                      {post.subtitle && (
                        <span className={`ml-2 font-semibold ${dk ? "text-[#8b949e]" : "text-gray-600"}`}>
                          — {post.subtitle}
                        </span>
                      )}
                    </h3>

                    <p className={`text-sm leading-relaxed mb-2 line-clamp-2 ${dk ? "text-[#8b949e]" : "text-gray-600"}`}>
                      {post.desc}
                    </p>

                    <div className="flex gap-1.5 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${dk ? "text-[#8b949e] bg-white/8" : "text-gray-500 bg-black/5"}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back */}
      <div className="max-w-[960px] mx-auto px-4 pb-10 sm:px-7 sm:pb-16">
        <button
          onClick={() => navigate("/")}
          className={`font-mono text-[12px] transition-colors ${dk ? "text-[#8b949e] hover:text-[#e6edf3]" : "text-gray-400 hover:text-gray-800"}`}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default FreeformPage;
