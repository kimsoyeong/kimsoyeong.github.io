import { useState } from "react";
import { CgGitBranch } from "react-icons/cg";
import { FaCaretRight } from "react-icons/fa";

const CmdLine = ({ command }) => {
  return (
    <div className="mb-2 flex items-center">
      <span className="flex bg-[#DB666F] pr-4 pl-2 py-1 -ml-2 text-start items-center text-xs">
        guest@term
      </span>
      <span className="flex bg-[#319CF7] rounded-tl-xl rounded-bl-xl pr-4 pl-2 py-1 -ml-2 mr-1/2 text-center items-center text-xs">
        ~/Desktop
      </span>
      <span className="flex bg-[#fff193] rounded-xl rounded-bl-xl pr-4 pl-2 py-1 -ml-2 text-center items-center text-xs">
        <CgGitBranch />
        main
      </span>

      <span className="text-[#c0c0c0] text-sm ml-4">{command}</span>
    </div>
  );
};

const Terminal = ({ func }) => {
  const [termInput, setTermInput] = useState("");
  const [cmds, setCmds] = useState([]);

  const onChange = (e) => {
    setTermInput(e.target.value);
  };

  const enterCmd = () => {
    let tmp = cmds;
    if (termInput === "exit") {
      func();
    }
    tmp.push(termInput);
    setCmds(tmp);
  };

  const handleOnKeyPress = (e) => {
    if (e.key === "Enter") {
      enterCmd();
      setTermInput("");
    }
  };

  return (
    <div className="fixed inset-0 m-auto flex flex-col bg-[#1c2431] shadow-2xl z-50 overflow-hidden h-[61vh] w-full text-black font-semibold rounded-xl max-w-[1000px] max-h-[650px]">
      <div className="absolute flex top-0 left-0 w-full h-5/2 z-20 pl-2 p-2 border-b border-b-white/15">
        <div
          className="bg-[#FC5959] w-[12px] h-[12px] rounded-xl mr-2"
          onClick={func}
        ></div>
        <div
          className="bg-[#FCBD29] w-[12px] h-[12px] rounded-xl mr-2"
          onClick={func}
        ></div>
        <div className="bg-[#36D141] w-[12px] h-[12px] rounded-xl mr-2"></div>
      </div>

      <div className="overflow-auto w-full h-screen px-3 mt-[30px]">
        {cmds.map((cmd, index) => (
          <CmdLine command={cmd} key={index} />
        ))}
      </div>

      <div className="flex items-center justify-center align-center border-t border-t-white/30 p-2">
        <span className="flex gap-2 text-[#DB666F] px-1 py-1 text-start items-center justify-center text-xs">
          guest@term
        </span>
        <FaCaretRight className="text-[#DB666F]" />
        <span className="flex text-[#319CF7] px-1 py-1 mr-1/2 text-center items-center text-xs">
          ~/Desktop
        </span>
        <FaCaretRight className="text-[#319CF7]" />
        <span className="flex text-[#fff193] px-1 py-1 text-center items-center text-xs">
          main
        </span>

        <FaCaretRight className="text-emerald-500" />
        <input
          type="text"
          name="term_input"
          className="flex w-full ml-2 bg-transparent text-sm text-[#efefef] focus:ring-0 outline-none"
          value={termInput}
          onChange={onChange}
          onKeyDown={handleOnKeyPress}
          autoFocus
        />
      </div>
    </div>
  );
};

export default Terminal;

/* terminal color theme */
// #DB666F // red
// #FFF193 // yellow
// #319CF7 // blue
// #49B16F // green
// #B263E2 // purple
// #02C5C8 // mint
// #EFEFEF // white
// #1c2431 // background
