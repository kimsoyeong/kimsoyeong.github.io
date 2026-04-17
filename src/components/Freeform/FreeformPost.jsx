import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MarkdownRenderer from "../Common/MarkdownRenderer";
import TableOfContents from "./TableOfContents";
import posts from "./posts";

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

const FreeformPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const post = posts.find((p) => p.slug === slug);
  const Component = post?.component;
  const hasToc = post?.toc?.length > 0;

  useEffect(() => {
    if (!post || Component) return;
    if (post.path) {
      fetch(post.path)
        .then((res) => res.text())
        .then(setContent)
        .catch(() => setContent("Failed to load content."));
    }
  }, [post, Component]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const dk = isDark;

  if (!post) {
    return (
      <div className="min-h-screen bg-[#fafafa] font-dm-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Post not found.</p>
          <button
            onClick={() => navigate("/freeform")}
            className="font-mono text-[12px] text-gray-800 hover:underline"
          >
            ← Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-post-theme={dk ? "dark" : "light"}
      className={`min-h-screen font-dm-sans transition-colors duration-200 ${
        dk ? "bg-[#0d1117] text-[#e6edf3]" : "bg-[#fafafa] text-[#1a1e2a]"
      }`}
    >
      {/* Hero */}
      <div className={`border-b ${dk ? "border-[#30363d] bg-[#0d1117]" : "border-gray-200 bg-white"}`}>
        <div className="max-w-[960px] mx-auto px-4 pt-12 pb-8 sm:px-7 sm:pt-20 sm:pb-14">
          {/* Top bar: back + theme toggle */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigate("/freeform")}
              className={`font-mono text-[12px] transition-colors ${
                dk ? "text-[#8b949e] hover:text-[#e6edf3]" : "text-gray-400 hover:text-gray-800"
              }`}
            >
              ← All Posts
            </button>
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

          {/* Mobile-only thumbnail */}
          {post.thumbnail && (
            <div className="sm:hidden flex justify-center mb-5">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full max-w-[280px] h-auto rounded-xl"
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <img src="/assets/img/Freeform.png" alt="freeform" className="w-5 h-5 sm:w-6 sm:h-6" />
            <p className={`font-mono text-[10px] sm:text-[11px] tracking-[0.15em] uppercase ${
              dk ? "text-[#8b949e]" : "text-gray-500"
            }`}>
              {post.tag}
            </p>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-[clamp(2rem,5vw,3.4rem)] leading-[1.3] mb-1 sm:mb-2">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className={`font-playfair text-xl sm:text-2xl md:text-[clamp(1.5rem,3.5vw,2.2rem)] leading-[1.3] mb-3 sm:mb-5 ${
              dk ? "text-[#8b949e]" : "text-gray-600"
            }`}>
              {post.subtitle}
            </p>
          )}
          <p className={`text-[14px] sm:text-[15px] max-w-[640px] leading-relaxed ${
            dk ? "text-[#8b949e]" : "text-gray-500"
          }`}>
            {post.desc}
          </p>

          <div className="flex gap-4 sm:gap-7 flex-wrap mt-5 sm:mt-7 items-center">
            <span className={`font-mono text-[11px] sm:text-[12px] ${dk ? "text-[#8b949e]" : "text-gray-500"}`}>
              날짜 <strong className={dk ? "text-[#e6edf3]" : "text-gray-800"}>{post.date}</strong>
            </span>
            {post.source && (
              <a
                href={post.source}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-mono text-[11px] sm:text-[12px] underline transition-colors ${
                  dk ? "text-[#8b949e] hover:text-[#58a6ff]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                원본 논문 →
              </a>
            )}
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className={`font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded ${
                    dk ? "text-[#8b949e] bg-white/8" : "text-gray-500 bg-black/5"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content + TOC */}
      <div className={`mx-auto px-4 py-8 sm:px-7 sm:py-16 ${hasToc ? "max-w-[1280px]" : "max-w-[960px]"}`}>
        <div className={hasToc ? "flex gap-10" : ""}>
          <div className={hasToc ? "flex-1 min-w-0 max-w-[860px] mx-auto" : ""}>
            {Component ? (
              <Component />
            ) : (
              <div className={`rounded-lg p-5 sm:p-8 md:p-10 shadow-md ${
                dk ? "bg-[#161b22]" : "bg-[#f6f8fa]"
              }`}>
                <MarkdownRenderer content={content} />
              </div>
            )}
          </div>

          {hasToc && (
            <aside className="hidden xl:block w-[200px] shrink-0">
              <TableOfContents items={post.toc} isDark={dk} />
            </aside>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="max-w-[960px] mx-auto px-4 pb-10 sm:px-7 sm:pb-16">
        <button
          onClick={() => navigate("/freeform")}
          className={`font-mono text-[12px] transition-colors ${
            dk ? "text-[#8b949e] hover:text-[#e6edf3]" : "text-gray-400 hover:text-gray-800"
          }`}
        >
          ← Back to All Posts
        </button>
      </div>
    </div>
  );
};

export default FreeformPost;
