import { useState } from "react";
import Draggable from "react-draggable";
import Terminal from "../Common/Terminal";
// import WindowBox from 'components/Common/WindowBox'
import Directory from "../Common/Directory";
import IconBtn from "./IconBtn";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

const Introduction = () => {
  const [windowVisible, setWindowVisible] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);

  const showWindowBox = () => {
    setWindowVisible(!windowVisible);
  };

  const showTerminal = () => {
    setTerminalVisible(!terminalVisible);
  };

  return (
    <div className="relative flex w-full h-screen bg-gradient-to-t from-[#559aff] via-[#a9d9fd] to-90% text-white md:w-full md:h-screen">
      <div className="relative flex flex-row justify-center items-start w-[768px] h-screen px-5 py-10 mx-auto sm:w-full sm:flex-col sm:justify-start sm:pt-2">
        <Draggable>
          <div className="flex absolute min-w-[720px] rounded-lg shadow-xl border border-gray-500/30 top-20 left-20 z-30">
            <div className="flex flex-col pl-3 pr-11 py-3 rounded-l-lg bg-[#ededed] bg-opacity-85">
              <div className="flex items-center p-2 text-black font-semibold">
                <div className="flex">
                  <div className="bg-[#FC5959] w-[12px] h-[12px] rounded-xl mr-2"></div>
                  <div className="bg-[#FCBD29] w-[12px] h-[12px] rounded-xl mr-2"></div>
                  <div className="bg-[#36D141] w-[12px] h-[12px] rounded-xl mr-2"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full justify-center items-center rounded-r-lg bg-[#fefefe] text-black">
              <div className="flex w-full items-center py-3 border-b border-b-gray-500/30">
                <div className="flex gap-3 pl-4">
                  <div className="">
                    <IoIosArrowBack className="size-6 text-gray-500" />
                  </div>
                  <div className="">
                    <IoIosArrowForward className="size-6 text-gray-300" />
                  </div>
                </div>
                <p className="mx-3 text-start text-md">데스크탑</p>
              </div>
              <div className="flex w-full justify-center items-center min-h-[420px]"></div>
            </div>
          </div>
        </Draggable>

        <Draggable>
          <div className="flex flex-col absolute top-20 left-20 px-6 py-2 min-w-[300px] rounded-xl shadow-xl bg-[#fefefe] border border-gray-500/15 z-20">
            <div className="flex items-center p-2 text-black font-semibold">
              <div className="flex">
                <div className="bg-[#FC5959] w-[12px] h-[12px] rounded-xl mr-2"></div>
                <div className="bg-[#FCBD29] w-[12px] h-[12px] rounded-xl mr-2"></div>
                <div className="bg-[#36D141] w-[12px] h-[12px] rounded-xl mr-2"></div>
              </div>
              <p className="mx-4 text-center">Soyeong Kim</p>
            </div>
            <div className="p-2">
              <p className="mb-4 text-2xl font-bold text-black">Soyeong Kim</p>
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
        <div className="flex justify-center items-center gap-2 fixed bottom-2 left-1/2 transform -translate-x-1/2 text-center px-2 h-[70px] bg-white bg-opacity-30 shadow-lg border border-white border-opacity-10 rounded-2xl z-20">
          <IconBtn title={"Finder"} func={showWindowBox} />
          <IconBtn title={"Launchpad"} />
          <IconBtn title={"Freeform"} />
          <IconBtn title={"Mail"} />
          <IconBtn title={"Notes"} />
          <IconBtn title={"Terminal"} func={showTerminal} />
          <IconBtn title={"Portfolio"} />
        </div>

        {/* {windowVisible ? (
          <WindowBox
            title={'Project Finder'}
            projects={projects}
            func={showWindowBox}
          />
        ) : null} */}

        {terminalVisible ? <Terminal func={showTerminal} /> : null}
      </div>
    </div>
  );
};

export default Introduction;
