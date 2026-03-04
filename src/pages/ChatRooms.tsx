import React from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib";
import { Layout } from "@/components/Layout";

// fixed room list as requested
const rooms = [
  { id: "chill", name: "ชิลล์" },
  { id: "tutor", name: "ติวหนังสือ" },
  { id: "read", name: "อ่านหนังสือ" },
  { id: "work", name: "ทำงาน" },
];

const ChatRooms: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">เลือกห้องสนทนา</h1>
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li key={room.id}>
              <Link
                to={ROUTE_PATHS.CHAT_ROOM.replace(":roomId", room.id)}
                className="block p-4 border rounded-lg hover:bg-muted"
              >
                {room.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default ChatRooms;
