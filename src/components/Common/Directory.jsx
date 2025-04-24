const Directory = ({ title, func, pos }) => {
  return (
    <div
      className={`absolute right-8 `}
      style={{ top: `${pos}px` }}
      onDoubleClick={func}
    >
      <img
        src={
          title === "Projects"
            ? "/assets/img/Folder_prj.png"
            : "/assets/img/Folder.png"
        }
        className="size-16 drop-shadow-md"
        alt="Folder-icon"
      />
      <p className="text-white text-xs font-bold text-center [text-shadow:_0_1px_3px_rgb(0_0_0_/_32%)]">
        {title}
      </p>
    </div>
  );
};

export default Directory;
