import React from "react";
import Card from "../elements/Card";

const dummyData = [
  { id: 1, title: "Card 1", imageUrl: "/placeholder.jpg" },
  { id: 2, title: "Card 2", imageUrl: "/placeholder.jpg" },
  { id: 3, title: "Card 3", imageUrl: "/placeholder.jpg" },
  { id: 4, title: "Card 4", imageUrl: "/placeholder.jpg" },
  { id: 5, title: "Card 5", imageUrl: "/placeholder.jpg" },
  { id: 6, title: "Card 6", imageUrl: "/placeholder.jpg" },
];

const DynamicCardGrid = () => {
  return (
    <div className="h-full overflow-auto bg-gray-100 p-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-12 justify-items-center">
        {dummyData.map((card) => (
          <Card key={card.id} title={card.title} imageUrl={card.imageUrl} />
        ))}
      </div>
    </div>
  );
};

export default DynamicCardGrid;
