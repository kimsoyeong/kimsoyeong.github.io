import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import posts, { categories } from "./posts";

const categoryLabel = {
  paper: "논문 리뷰",
  docs: "공식문서",
  article: "아티클",
};

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
    <div className="min-h-screen bg-[#f5f6f8] font-dm-sans text-[#1a1e2a]">
      {/* Hero */}
      <div className="border-b border-[#dde1ea]">
        <div className="max-w-[960px] mx-auto px-7 pt-20 pb-14">
          <p className="font-dm-mono text-[11px] text-[#2563eb] tracking-[0.15em] uppercase mb-4">
            Freeform · Blog
          </p>
          <h1 className="font-playfair text-4xl md:text-5xl leading-tight mb-5">
            Reading <span className="text-[#2563eb]">Notes</span>
          </h1>
          <p className="text-[#6b7280] text-[15px] max-w-[640px] leading-relaxed">
            논문, 공식문서, 아티클을 읽고 정리한 리뷰와 리포트를 모아둡니다.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-[#dde1ea] bg-white">
        <div className="max-w-[960px] mx-auto px-7 py-4">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap items-center mb-3">
            <span className="font-dm-mono text-[10px] text-[#6b7280] uppercase tracking-[0.12em] mr-2">Category</span>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`font-dm-mono text-[11px] px-3 py-1 rounded-full border transition-all ${
                  activeCategory === cat.key
                    ? "bg-[#2563eb] text-white border-[#2563eb]"
                    : "bg-white text-[#6b7280] border-[#dde1ea] hover:border-[#2563eb] hover:text-[#2563eb]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Tag filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="font-dm-mono text-[10px] text-[#6b7280] uppercase tracking-[0.12em] mr-2">Tags</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`font-dm-mono text-[10px] px-2.5 py-0.5 rounded border transition-all ${
                  activeTag === tag
                    ? "bg-[rgba(37,99,235,0.08)] text-[#2563eb] border-[#2563eb]"
                    : "bg-[#f0f2f7] text-[#6b7280] border-transparent hover:border-[#dde1ea]"
                }`}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="font-dm-mono text-[10px] text-[#6b7280] hover:text-[#dc2626] ml-1"
              >
                × clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="max-w-[960px] mx-auto px-7 py-16">
        <p className="font-dm-mono text-[10px] tracking-[0.18em] uppercase text-[#6b7280] mb-4">
          {activeCategory === "all" ? "All Posts" : categoryLabel[activeCategory] || activeCategory} · {filtered.length}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#6b7280]">
            <p className="text-lg mb-2">No posts found.</p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveTag(null); }}
              className="font-dm-mono text-[12px] text-[#2563eb] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtered.map((post) => (
              <div
                key={post.slug}
                onClick={() => navigate(`/freeform/${post.slug}`)}
                className="bg-white border border-[#dde1ea] rounded-[10px] p-7 cursor-pointer
                           hover:border-[#2563eb] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-dm-mono text-[10px] tracking-[0.12em] uppercase text-[#2563eb] bg-[rgba(37,99,235,0.08)] px-2 py-0.5 rounded">
                    {categoryLabel[post.category] || post.category}
                  </span>
                  <span className="font-dm-mono text-[11px] text-[#6b7280]">
                    {post.date}
                  </span>
                  {post.source && (
                    <a
                      href={post.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-dm-mono text-[10px] text-[#6b7280] hover:text-[#2563eb] underline"
                    >
                      원본 →
                    </a>
                  )}
                </div>

                <h3 className="text-lg font-bold mb-1">
                  {post.title}
                  {post.subtitle && (
                    <span className="text-[#2563eb] ml-2 font-semibold">
                      — {post.subtitle}
                    </span>
                  )}
                </h3>

                <p className="text-[#4b5563] text-sm leading-relaxed mb-3">
                  {post.desc}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-dm-mono text-[10px] text-[#6b7280] bg-[#f0f2f7] px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
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
          className="font-dm-mono text-[12px] text-[#6b7280] hover:text-[#2563eb] transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default FreeformPage;
