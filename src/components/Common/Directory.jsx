const Directory = ({ title, func, pos, inset }) => {
  return (
    <div
      className={`absolute top-${pos} right-0` + inset && `inset-y-${inset}`}
      onDoubleClick={func}
    >
      <img src="/assets/img/Folder.png" className="size-16" alt="Folder-icon" />
      <p className="text-gray-500 text-xs text-center drop-shadow-xl">
        {title}
      </p>
    </div>
  );
};

export default Directory;
