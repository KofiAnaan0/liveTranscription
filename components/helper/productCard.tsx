"use client";

import React from "react";
import H3 from "../ui/H3";
import { Button } from "../ui/Button";

type ProductProps = {
  title: string;
  description: string[];
  color: string;
  textColor: string;
};

const ProductCard = ({
  title,
  description,
  color,
  textColor,
}: ProductProps) => {
  return (
    <div
      className="flex flex-col justify-center items-center w-[384px] md:w-[448px] rounded-md p-4 gap-4"
      style={{ backgroundColor: color }}
    >
      {/* title */}
      <H3 style={{ color: textColor }}>{title}</H3>

      {/* description */}
      <ul className="list-disc list-inside space-y-2 text-sm">
        {description.map((item, index) => (
          <li key={index} style={{ color: textColor }}>
            {item}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex items-center justify-center mt-auto">
        <Button
          style={{ backgroundColor: textColor, color: color }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent("openChatWidget"));
          }}
        >
          Call Us
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
