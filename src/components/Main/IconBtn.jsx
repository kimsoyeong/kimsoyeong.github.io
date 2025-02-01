import { useNavigate } from "react-router-dom";

const IconBtn = ({ title, func }) => {
  const navigate = useNavigate();

  return title === "Portfolio" || title === "Mail" ? (
    // Case 1: a href
    <a
      href={
        title === "Portfolio"
          ? "https://github.com/kimsoyeong"
          : "mailto:soyeong.kim9@gmail.com"
      }
      target="_blank"
      rel="noopener noreferrer" // ✅ 보안 강화
    >
      <div className="flex size-14 transform transition-all duration-300 hover:scale-110">
        <img src={`/assets/img/${title}.png`} alt={`icon-${title}`} />
      </div>
    </a>
  ) : title === "Finder" || title === "Terminal" || title === "Notes" ? (
    // Case 2: function
    <div className="flex size-14 transform transition-all duration-300 hover:scale-110 cursor-pointer">
      <img src={`/assets/img/${title}.png`} alt={`icon-${title}`} />
    </div>
  ) : (
    <div
      onClick={() =>
        navigate(
          title === "Notes"
            ? "/about"
            : title === "Freeform"
            ? "/freeform"
            : "/info"
        )
      }
      className="flex size-14 transform transition-all duration-300 hover:scale-110 cursor-pointer"
    >
      <img src={`/assets/img/${title}.png`} alt={`icon-${title}`} />
    </div>
  );
};

export default IconBtn;
