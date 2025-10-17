import { useEffect } from "react";

const Meetings = () => {
  useEffect(() => {
    document.title = "Meetings";
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Meetings</h1>
      <p className="text-gray-600">This page is under construction.</p>
    </div>
  );
};

export default Meetings;
