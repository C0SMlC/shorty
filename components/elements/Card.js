import React from "react";
import Image from "next/image";

const Card = ({ title, imageUrl }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[240px] h-[450px]">
    <div className="relative w-full h-[400px]">
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        style={{ objectFit: "cover" }}
      />
    </div>
    <div className="p-4">
      <h3 className="text-md font-bold truncate text-slate-950">{title}</h3>
    </div>
  </div>
);

export default Card;
