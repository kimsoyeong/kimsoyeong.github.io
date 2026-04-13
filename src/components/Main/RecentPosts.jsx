import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import TopButtons from "../Common/TopButtons";
import posts from "../Freeform/posts";

const categoryLabel = {
  paper: "논문 리뷰",
  docs: "공식문서",
  article: "아티클",
};

const cardColors = [
  "bg-[#fff9c4]", // yellow sticky
  "bg-[#c8e6c9]", // green sticky
  "bg-[#bbdefb]", // blue sticky
];

const cardRotations = ["-rotate-2", "rotate-1", "-rotate-1"];

const RecentPosts = ({ count = 3, onClose }) => {
  const navigate = useNavigate();
  const recent = [...posts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);

  return (
    <Draggable>
      <div className="flex flex-col absolute top-[18%] left-[45%] min-w-[360px] max-w-[400px] rounded-xl shadow-xl bg-white dark:bg-[#2d2d2d] border border-gray-500/15 dark:border-gray-600/50 z-20 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#f8f8f8] dark:bg-[#353535] border-b border-gray-200 dark:border-gray-600">
          <TopButtons red={onClose} />
          <div className="flex items-center gap-2 ml-2">
            <img
              src="/assets/img/Freeform.png"
              alt="freeform"
              className="w-4 h-4"
            />
            <p className="text-xs font-semibold text-black/60 dark:text-gray-300">
              Freeform — Recent Notes
            </p>
          </div>
        </div>

        {/* Board area */}
        <div className="flex flex-col gap-4 p-5 bg-[#fafafa] dark:bg-[#2a2a2a]">
          {recent.map((post, i) => (
            <div
              key={post.slug}
              onClick={() => navigate(`/freeform/${post.slug}`)}
              className={`${cardColors[i % cardColors.length]} dark:bg-[#3a3a3a] ${cardRotations[i % cardRotations.length]} 
                          rounded-lg p-4 shadow-md cursor-pointer 
                          hover:scale-[1.02] hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📝</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {categoryLabel[post.category] || post.category} · {post.date}
                  </span>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mt-0.5">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                    {post.desc}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* View all link */}
          <button
            onClick={() => navigate("/freeform")}
            className="text-xs font-mono text-center text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors py-1"
          >
            모든 글 보기 →
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default RecentPosts;
