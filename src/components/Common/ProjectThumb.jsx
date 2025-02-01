import { IoLogoGithub, IoIosBeer } from "react-icons/io";

const ProjectThumb = ({ idx, proj, current, func }) => {
  const { title, desc, types, languages, skills, logo, url } = proj;

  return (
    <div
      className={`flex flex-col gap-2 p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
        current == idx && "bg-blue-100/70 border-l-2 border-blue-500"
      }`}
      onClick={() => func(idx)}
    >
      <div className="flex justify-between items-center text-md font-semibold">
        <div className="flex items-center gap-2">
          {logo ? (
            <img
              src={logo}
              alt={`logo-${title.toLowerCase()}`}
              className="size-4"
            />
          ) : (
            <IoIosBeer className="size-4" />
          )}
          <p>{title}</p>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer" // ✅ 보안 강화
          >
            <IoLogoGithub className="text-gray-400 size-5" />
          </a>
        )}
      </div>
      <p className="text-sm line-clamp-2">{desc}</p>
      <div className="flex flex-wrap justify-start gap-1 w-full">
        {types.map((type, i) => (
          <p className="rounded-xl px-2.5 py-0.5 text-xs bg-lime-200 text-lime-600">
            {type}
          </p>
        ))}
        {languages.map((lang, i) => (
          <p
            key={i}
            className="rounded-xl px-2.5 py-0.5 text-xs bg-purple-100 text-purple-500"
          >
            {lang}
          </p>
        ))}
        {skills.map((skill, i) => (
          <p
            key={i}
            className="rounded-xl px-2.5 py-0.5 text-xs bg-orange-100 text-orange-500"
          >
            {skill}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ProjectThumb;
