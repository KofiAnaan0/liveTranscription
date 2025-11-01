import React from "react";
import { approachData } from "@/data/approachData";
import ApproachCard from "../helper/ApproachCard";

const Approach = () => {
  return (
    <>
      {approachData.map((item, index) => (
        <div
          key={item.id}
          className="sticky"
          style={{ top: `${80 + index * 20}px` }}
        >
          <ApproachCard reversed={index % 2 != 0} {...item} />
        </div>
      ))}
    </>
  );
};

export default Approach;