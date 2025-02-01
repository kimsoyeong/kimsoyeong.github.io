import { useState, useEffect } from "react";
import { FaCaretRight } from "react-icons/fa";
import TopButtons from "./TopButtons";

const CmdLine = ({ command }) => {
  const commandSplit = command.split(" ");
  const [timestamp, setTimestamp] = useState("");

  function formatDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.toLocaleString("en-US", { month: "long" }); // Full month name (e.g., February)
    const day = now.getDate();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const period = hours < 12 ? "AM" : "PM";
    hours = hours % 12 || 12; // Convert 0 to 12 (Midnight case)

    return `${month} ${day}, ${year}, ${hours}:${minutes}:${seconds} ${period}`;
  }

  useEffect(() => {
    if (command === "date") {
      setTimestamp(formatDate());
    }
  }, [command]);

  return (
    <div className="flex flex-col text-xs">
      <div className="flex items-center gap-0.5">
        <span className="flex text-[#DB666F] py-1 text-start items-center">
          soyeong@world
        </span>
        <span className="text-white/45 pr-0.5">:</span>

        <span className="flex text-[#319CF7] rounded-tl-xl rounded-bl-xl py-1 text-center items-center">
          ~/Desktop
        </span>
        <FaCaretRight className="text-[#fff193]" />

        <span className="text-[#b1f9fa]">{command}</span>
      </div>

      {command === "help" ? (
        <div className="flex flex-col gap-0.5 text-white whitespace-pre">
          <p>Available commands:</p>
          <p>date{"     "}- Display current date and time</p>
          <p>echo{"     "}- Print a message</p>
          <p>exit{"     "}- Close the terminal</p>
        </div>
      ) : command === "date" ? (
        <p className="text-white">{timestamp}</p>
      ) : (
        commandSplit[0] === "echo" && (
          <p className="text-white">{commandSplit.slice(1).join(" ")}</p>
        )
      )}
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
    <div className="fixed inset-0 m-auto flex flex-col bg-[#1c2431] shadow-2xl z-50 overflow-hidden h-[61vh] w-full text-black font-semibold rounded-xl max-w-[1000px] max-h-[650px] font-source-code">
      <div className="absolute flex top-0 left-0 w-full h-5/2 z-20 px-2 py-1 border-b border-b-white/15">
        <TopButtons red={() => func()} />
      </div>

      <div className="flex flex-col overflow-auto w-full h-screen px-3 mt-10">
        <div className="pt-2 pb-6">
          <p className="text-sm text-white/80">
            Welcome to Soyeong's terminal
            <br />
            Type "help" to see available commands
          </p>
        </div>

        {cmds.map((cmd, index) => (
          <CmdLine command={cmd} key={index} />
        ))}
      </div>

      <div className="flex items-center justify-center align-center border-t border-t-white/30 p-2">
        <span className="flex gap-2 text-[#DB666F] px-1 py-1 text-start items-center justify-center text-xs">
          soyeong@world
        </span>
        <span className="text-white/45 pr-0.5">:</span>
        <span className="flex text-[#319CF7] px-1 py-1 mr-1/2 text-center items-center text-xs">
          ~/Desktop
        </span>
        <FaCaretRight className="text-[#fff193]" />
        <input
          type="text"
          name="term_input"
          className="flex w-full ml-1 bg-transparent text-sm text-[#efefef] focus:ring-0 outline-none"
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
// #5aebed // mint
// #EFEFEF // white
// #1c2431 // background
