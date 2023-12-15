import React from "react";

//@ts-ignore
const BarGraph = ({ pro, con }) => {
  return (
    <div className="flex w-1/2 bg-gray-200 rounded-md overflow-hidden h-10">
      <div
        style={{ width: `${pro}%` }}
        className="bg-green-400 text-white flex items-center justify-center text-sm"
      >
        Approve {pro}%
      </div>
      <div
        style={{ width: `${con}%` }}
        className="bg-red-500 text-white flex items-center justify-center text-sm"
      >
        Disapprove {con}%
      </div>
    </div>
  );
};

export default BarGraph;
