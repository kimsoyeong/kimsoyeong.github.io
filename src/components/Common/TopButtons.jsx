import { IoIosClose, IoIosRemove, IoIosExpand } from "react-icons/io";

const TopButtons = ({ red }) => {
  return (
    <div className="flex gap-2 px-2 py-2 group">
      <div
        className="flex justify-center items-center bg-[#FC5959] w-[12px] h-[12px] rounded-xl"
        onClick={() => red()}
      >
        <IoIosClose className="size-4 group-hover:text-[#a31212] text-[#FC5959]" />
      </div>
      <div className="flex justify-center items-center bg-[#FCBD29] w-[12px] h-[12px] rounded-xl">
        <IoIosRemove className="size-4 group-hover:text-[#a39012] text-[#FCBD29]" />
      </div>
      <div className="flex justify-center items-center bg-[#36D141] w-[12px] h-[12px] rounded-xl">
        <IoIosExpand className="size-4 p-0.5 group-hover:text-[#0e8732] text-[#36D141]" />
      </div>
    </div>
  );
};

export default TopButtons;
