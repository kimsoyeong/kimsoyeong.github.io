import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import Terminal from "../Common/Terminal";
import Directory from "../Common/Directory";
import IconBtn from "./IconBtn";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import ProjectThumb from "../Common/ProjectThumb";
import TopButtons from "../Common/TopButtons";

const Introduction = () => {
  const [notesVisible, setNotesVisible] = useState(true);
  const [finderVisible, setFinderVisible] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);

  const projects = [
    {
      title: "Human Activity Recognition",
      desc: "Deep Learning-Based Human Activity Recognition with Smartwatch's sensor data",
      types: ["AI", "Human Activity Recognition", "Smartwatch app"],
      languages: ["Python", "Monkey C"],
      skills: ["Tensorflow", "Garmin"],
      logo: "",
    },
    {
      title: "YOCO",
      desc: "A Unbiased teacher v2-based AI model predicting doneness of the ingredients",
      types: ["AI", "Computer Vision"],
      languages: ["Python"],
      skills: ["ub-teacher v2"],
      logo: "",
      url: "https://github.com/SNU-YOCO/YOCO",
    },
    {
      title: "PruPru",
      desc: "An guide android app for waste sorting with deep learning cameras",
      types: ["AI", "Computer Vision", "Android App"],
      languages: ["Kotlin", "Java", "Python"],
      skills: ["Tensorflow", "TFLite", "Firebase", "Android Studio"],
      logo: "",
      url: "https://github.com/PA-roketdan/PruPru",
    },
    {
      title: "Blooming",
      desc: "A website to change the image style to a different style",
      types: ["AI", "Computer Vision", "Web"],
      languages: ["Javascript", "Python", "SQL"],
      skills: [
        "Docker",
        "React",
        "Flask",
        "Gunicorn",
        "MySQL",
        "Nginx",
        "GCP",
        "AWS",
      ],
      logo: "",
      url: "https://github.com/SiliconValleyInternship-Lambda/Blooming",
    },
    {
      title: "소복소복",
      desc: "A Rolling-paper website celebrating Korean New Year",
      types: ["Web"],
      languages: ["Javascript"],
      skills: ["React", "Node.js", "Express", "MongoDB"],
      logo: "",
      url: "https://github.com/horangtteok/sendmesobok",
    },
  ];
  const [currentProject, setCurrentProject] = useState(0);

  const showNotesBox = () => {
    setNotesVisible(!notesVisible);
  };

  const showFinderBox = () => {
    setFinderVisible(!finderVisible);
  };

  const showTerminal = () => {
    setTerminalVisible(!terminalVisible);
  };

  return (
    <div className="relative flex w-full h-screen bg-gradient-to-t from-[#559aff] via-[#a9d9fd] to-90% text-white md:w-full md:h-screen">
      <div className="relative flex flex-row justify-center items-start w-[768px] h-screen px-5 py-10 mx-auto sm:w-full sm:flex-col sm:justify-start sm:pt-2">
        {finderVisible && (
          <Draggable>
            <div className="flex absolute min-w-[900px] h-[600px] rounded-lg shadow-xl border border-gray-500/30 top-20 left-20 z-30">
              <div className="flex flex-col min-w-[320px] max-w-[320px] text-black rounded-l-lg bg-gray-50 border-r border-b-gray-15 overflow-hidden">
                <div className="flex items-center py-2.5 px-3 border-b border-b-gray-150">
                  <TopButtons red={showFinderBox} />
                </div>

                <div className="flex flex-col w-full h-full overflow-y-auto">
                  {projects.map((proj, idx) => (
                    <>
                      <ProjectThumb
                        key={idx}
                        proj={proj}
                        current={currentProject}
                        idx={idx}
                        func={() => setCurrentProject(idx)}
                      />
                      <hr class="border-gray-200"></hr>
                    </>
                  ))}
                </div>
              </div>

              <div className="flex flex-col w-full h-full justify-center items-center rounded-r-lg overflow-hidden bg-[#fefefe] text-black">
                <div className="flex w-full items-center py-3 border-b border-gray-150">
                  <div className="flex gap-3 pl-4">
                    <IoIosArrowBack className="size-6 text-gray-500 stroke-1" />
                    <IoIosArrowForward className="size-6 text-gray-300 stroke-1" />
                  </div>
                  <p className="mx-3 text-start text-md">Projects</p>
                </div>
                <div className="flex w-full h-full justify-center items-center bg-white overflow-y-auto markdown-body">
                  <p className="">{projects[currentProject].title}</p>
                </div>
              </div>
            </div>
          </Draggable>
        )}

        {notesVisible && (
          <Draggable>
            <div className="flex flex-col absolute top-20 left-20 px-6 py-2 min-w-[300px] rounded-xl shadow-xl bg-[#fefefe] border border-gray-500/15 z-20">
              <div className="flex items-center py-2 text-black font-semibold">
                <TopButtons red={showNotesBox} />

                <p className="mx-4 text-center">Soyeong Kim</p>
              </div>
              <div className="p-2">
                <p className="mb-4 text-2xl font-bold text-black">
                  Soyeong Kim
                </p>
                <p className="mt-4 mb-2 text-md font-semibold text-black">
                  Interest
                </p>
                <p className="mb-2 text-md text-black">
                  <li>AI, AI Agent, NLP</li>
                  <li>Web, Android, iOS</li>
                </p>
                <p className="mt-4 mb-2 text-md font-semibold text-black">
                  What can I do
                </p>
                <p className="mb-2 text-md text-black">
                  <li>Python, Javascript</li>
                  <li>Java/Kotlin, C++</li>
                </p>
                <p className="mt-4 mb-2 bg-[#f2f2f2] rounded-lg px-5 py-3 items-center text-black/50 text-md">
                  Check my resume by clicking the memo app.
                </p>
              </div>
            </div>
          </Draggable>
        )}

        <Draggable>
          <div className="flex flex-col justify-center items-start gap-2 px-4 bg-gradient-to-tr from-blue-400 via-cyan-300 to-emerald-200 bg-opacity-90 shadow-lg rounded-3xl size-40 absolute top-20 right-40 z-30">
            <div className="flex w-full justify-between">
              <div className="w-16 aspect-square overflow-hidden rounded-lg">
                <img
                  src="/assets/img/profile.gif"
                  className="w-full h-full object-cover size-16 rounded-lg shadow-xl"
                  alt="profile"
                />
              </div>
              <img
                src="/assets/img/Beam.png"
                className="w-5 h-6"
                alt="music-icon"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">Hello, World</p>
              <span className="text-xs text-white/70">Soyeong</span>
            </div>
          </div>
        </Draggable>

        <Directory
          title="Projects"
          func={() => alert("Double Clicked!! Projects:)")}
          pos={20}
        />
        <Directory
          title="Folder2"
          func={() => alert("Double Clicked!! Memory:D")}
          pos={124}
        />

        {/* Bottom Navigation Bar */}
        <div className="flex justify-center items-center gap-2 fixed bottom-2 left-1/2 transform -translate-x-1/2 text-center px-2.5 h-[70px] bg-white bg-opacity-30 shadow-xl border border-white border-opacity-10 rounded-3xl z-20">
          <IconBtn title={"Finder"} func={showFinderBox} />
          <IconBtn title={"Launchpad"} />
          <IconBtn title={"Freeform"} />
          <IconBtn title={"Mail"} />
          <IconBtn title={"Notes"} func={showNotesBox} />
          <IconBtn title={"Terminal"} func={showTerminal} />
          <IconBtn title={"Portfolio"} />
        </div>

        {terminalVisible ? <Terminal func={showTerminal} /> : null}
      </div>
    </div>
  );
};

export default Introduction;
