import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import posts, { categories } from "./posts";

const categoryLabel = {
  paper: "논문 리뷰",
  docs: "공식문서",
  article: "아티클",
};

const cardColors = [
  "bg-[#f0ede4]", // warm beige
  "bg-[#d6e4d6]", // muted green
  "bg-[#dce6ef]", // muted blue
  "bg-[#e8d8df]", // muted pink
  "bg-[#e8ddd0]", // muted sand
  "bg-[#d9d3e3]", // muted purple
];

const cardRotations = ["-rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]", "rotate-1", "-rotate-[0.3deg]", "rotate-[0.8deg]"];

const FreeformPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState(null);

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

  return (
    <div className="min-h-screen bg-[#fafafa] font-dm-sans text-[#1a1e2a]">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[960px] mx-auto px-7 pt-20 pb-14">
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/img/Freeform.png" alt="freeform" className="w-8 h-8" />
            <p className="font-mono text-[11px] text-gray-500 tracking-[0.15em] uppercase">
              Freeform · Blog
            </p>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl leading-tight mb-5">
            Reading <span className="text-gray-800">Notes</span>
          </h1>
          <p className="text-gray-500 text-[15px] max-w-[640px] leading-relaxed">
            논문, 공식문서, 아티클을 읽고 정리한 리뷰와 리포트를 모아둡니다.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-[#f8f8f8]">
        <div className="max-w-[960px] mx-auto px-7 py-4">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap items-center mb-3">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.12em] mr-2">Category</span>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`font-mono text-[11px] px-3 py-1 rounded-full border transition-all ${
                  activeCategory === cat.key
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-500 border-gray-300 hover:border-gray-800 hover:text-gray-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Tag filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.12em] mr-2">Tags</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`font-mono text-[10px] px-2.5 py-0.5 rounded border transition-all ${
                  activeTag === tag
                    ? "bg-gray-100 text-gray-800 border-gray-800"
                    : "bg-white text-gray-500 border-transparent hover:border-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="font-mono text-[10px] text-gray-400 hover:text-red-500 ml-1"
              >
                × clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post List — sticky note board */}
      <div className="max-w-[960px] mx-auto px-7 py-16">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-6">
          {activeCategory === "all" ? "All Posts" : categoryLabel[activeCategory] || activeCategory} · {filtered.length}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No posts found.</p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveTag(null); }}
              className="font-mono text-[12px] text-gray-800 hover:underline"
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
                            rounded-lg p-6 shadow-md cursor-pointer
                            hover:rotate-0 hover:scale-[1.01] hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 bg-gray-200/50 flex items-center justify-center shadow-sm">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">📝</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-gray-500 bg-black/5 px-2 py-0.5 rounded">
                        {categoryLabel[post.category] || post.category}
                      </span>
                      <span className="font-mono text-[11px] text-gray-500">
                        {post.date}
                      </span>
                      {post.source && (
                        <a
                          href={post.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[10px] text-gray-500 hover:text-gray-800 underline"
                        >
                          원본 →
                        </a>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {post.title}
                      {post.subtitle && (
                        <span className="text-gray-600 ml-2 font-semibold">
                          — {post.subtitle}
                        </span>
                      )}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
                      {post.desc}
                    </p>

                    <div className="flex gap-1.5 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[9px] text-gray-500 bg-black/5 px-1.5 py-0.5 rounded"
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
      <div className="max-w-[960px] mx-auto px-7 pb-16">
        <button
          onClick={() => navigate("/")}
          className="font-mono text-[12px] text-gray-400 hover:text-gray-800 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default FreeformPage;
