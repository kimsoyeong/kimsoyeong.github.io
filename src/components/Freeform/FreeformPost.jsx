import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MarkdownRenderer from "../Common/MarkdownRenderer";
import TableOfContents from "./TableOfContents";
import posts from "./posts";

const FreeformPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");

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
    <div className="min-h-screen bg-[#fafafa] font-dm-sans text-[#1a1e2a]">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[960px] mx-auto px-4 pt-12 pb-8 sm:px-7 sm:pt-20 sm:pb-14">
          <button
            onClick={() => navigate("/freeform")}
            className="font-mono text-[12px] text-gray-400 hover:text-gray-800 transition-colors mb-4 sm:mb-6 block"
          >
            ← All Posts
          </button>

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
            <p className="font-mono text-[10px] sm:text-[11px] text-gray-500 tracking-[0.15em] uppercase">
              {post.tag}
            </p>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-[clamp(2rem,5vw,3.4rem)] leading-[1.3] mb-1 sm:mb-2">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="font-playfair text-xl sm:text-2xl md:text-[clamp(1.5rem,3.5vw,2.2rem)] leading-[1.3] text-gray-600 mb-3 sm:mb-5">
              {post.subtitle}
            </p>
          )}
          <p className="text-gray-500 text-[14px] sm:text-[15px] max-w-[640px] leading-relaxed">
            {post.desc}
          </p>

          <div className="flex gap-4 sm:gap-7 flex-wrap mt-5 sm:mt-7 items-center">
            <span className="font-mono text-[11px] sm:text-[12px] text-gray-500">
              날짜 <strong className="text-gray-800">{post.date}</strong>
            </span>
            {post.source && (
              <a
                href={post.source}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] sm:text-[12px] text-gray-500 hover:text-gray-800 underline"
              >
                원본 논문 →
              </a>
            )}
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] sm:text-[10px] text-gray-500 bg-black/5 px-2 py-0.5 rounded"
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
          {/* Main content */}
          <div className={hasToc ? "flex-1 min-w-0 max-w-[860px] mx-auto" : ""}>
            {Component ? (
              <Component />
            ) : (
              <div className="bg-[#f0ede4] rounded-lg p-5 sm:p-8 md:p-10 shadow-md">
                <MarkdownRenderer content={content} />
              </div>
            )}
          </div>

          {/* TOC sidebar */}
          {hasToc && (
            <aside className="hidden xl:block w-[200px] shrink-0">
              <TableOfContents items={post.toc} />
            </aside>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="max-w-[960px] mx-auto px-4 pb-10 sm:px-7 sm:pb-16">
        <button
          onClick={() => navigate("/freeform")}
          className="font-mono text-[12px] text-gray-400 hover:text-gray-800 transition-colors"
        >
          ← Back to All Posts
        </button>
      </div>
    </div>
  );
};

export default FreeformPost;
