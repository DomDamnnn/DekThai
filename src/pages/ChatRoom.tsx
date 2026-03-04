import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Lock } from "lucide-react";
import { Layout } from "@/components/Layout";
import VideoStream from "@/components/VideoStream";
import { usePeerRoom } from "@/hooks/usePeerRoom";
import { useChatRooms } from "@/hooks/useChatRooms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Share2, Phone } from "lucide-react";
import { ROUTE_PATHS } from "@/lib";
import { useLocale } from "@/hooks/useLocale";

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { tx } = useLocale();
  const { allRooms, canAccessRoom } = useChatRooms();

  const room = useMemo(() => {
    return allRooms.find((r) => r.id === roomId);
  }, [allRooms, roomId]);

  const canAccess = useMemo(() => {
    if (!room) return false;
    return canAccessRoom(room);
  }, [room, canAccessRoom]);

  const {
    peerId,
    isConnected,
    localStream,
    remotePeers,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    shareScreen,
    disconnect,
  } = usePeerRoom(roomId || "");

  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    if (hasJoined) {
      startLocalStream();
    }
    return () => {
      if (hasJoined) {
        stopLocalStream();
      }
    };
  }, [hasJoined, startLocalStream, stopLocalStream]);

  const handleJoinRoom = () => {
    setHasJoined(true);
    setIsVideoOn(true);
    toggleVideo(true);
    setIsAudioOn(true);
    toggleAudio(true);
  };

  const handleLocalDimensionsChange = (width: number, height: number) => {
    setIsPortrait(height > width);
  };

  const handleToggleVideo = () => {
    if (hasJoined) {
      setIsVideoOn(!isVideoOn);
      toggleVideo(!isVideoOn);
    }
  };

  const handleToggleAudio = () => {
    if (hasJoined) {
      setIsAudioOn(!isAudioOn);
      toggleAudio(!isAudioOn);
    }
  };

  const handleLeaveRoom = () => {
    disconnect();
    setHasJoined(false);
    navigate(ROUTE_PATHS.CHAT_ROOMS);
  };

  // Room not found
  if (!room) {
    return (
      <Layout>
        <div className="flex flex-col h-[calc(100vh-140px)] items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 max-w-sm text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <div>
              <h1 className="text-2xl font-bold mb-2">{tx("ไม่พบห้อง", "Room not found")}</h1>
              <p className="text-muted-foreground text-sm">
                {tx("ห้องที่คุณกำลังมองหาไม่มีอยู่", "The room you are looking for does not exist.")}
              </p>
            </div>
            <Button onClick={() => navigate(ROUTE_PATHS.CHAT_ROOMS)} className="w-full">
              {tx("กลับไปห้องสนทนา", "Back to Chat Rooms")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Access denied
  if (!canAccess) {
    return (
      <Layout>
        <div className="flex flex-col h-[calc(100vh-140px)] items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 max-w-sm text-center">
            <Lock className="w-12 h-12 mx-auto text-destructive" />
            <div>
              <h1 className="text-2xl font-bold mb-2">{tx("ไม่มีสิทธิ์เข้า", "Access denied")}</h1>
              <p className="text-muted-foreground text-sm">
                {room.scope === "school"
                  ? tx(
                      "คุณไม่อยู่ในโรงเรียนเดียวกันกับห้องนี้",
                      "You are not in the same school as this room."
                    )
                  : tx(
                      "คุณไม่อยู่ในห้องเรียนเดียวกันกับห้องนี้",
                      "You are not in the same classroom as this room."
                    )}
              </p>
            </div>
            <Button onClick={() => navigate(ROUTE_PATHS.CHAT_ROOMS)} className="w-full">
              {tx("กลับไปห้องสนทนา", "Back to Chat Rooms")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasJoined) {
    return (
      <Layout>
        <div className="flex flex-col h-[calc(100vh-140px)] items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 max-w-sm text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg mx-auto text-3xl" style={{ backgroundColor: room.color + "20" }}>
              {room.emoji || "💬"}
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{room.name}</h1>
              </div>
              <Badge variant="outline" className="mb-2">
                {room.scope === "app" && tx("ทั้งแอพ", "App-wide")}
                {room.scope === "school" && tx("ทั้งโรงเรียน", "School-wide")}
                {room.scope === "classroom" && tx("ในห้องเรียน", "Classroom")}
              </Badge>
              {room.description && (
                <p className="text-muted-foreground text-sm mt-3">{room.description}</p>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {tx("กด \"เข้าห้อง\" เพื่อเปิดกล้อง ไมค์ และเริ่มสนทนากับคนอื่นในห้อง", 'Click "Join Room" to enable camera, microphone, and start chatting with others.')}
            </p>

            <Button size="lg" onClick={handleJoinRoom} className="w-full rounded-lg">
              {tx("เข้าห้อง", "Join Room")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-140px)] p-4 space-y-4">
        {/* Room Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded text-lg" style={{ backgroundColor: room.color + "20" }}>
              {room.emoji || "💬"}
            </div>
            <h1 className="text-2xl font-bold">{room.name}</h1>
          </div>
          {remotePeers.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {tx(`มีคน ${remotePeers.length} คนอยู่ในห้อง`, `${remotePeers.length} people in this room`)}
            </p>
          )}
        </div>

        {/* Local and Remote Video Grid */}
        <div className={`flex-1 flex ${isPortrait ? "flex-col" : "flex-row"} items-center justify-center gap-4`}>
          {/* Local Video */}
          <div className={`${isPortrait ? "w-full" : "flex-1 aspect-video"} bg-black rounded-lg overflow-hidden`}>
            <VideoStream
              stream={localStream}
              label={tx("คุณ", "You")}
              muted
              onDimensionsChange={handleLocalDimensionsChange}
            />
          </div>

          {/* Remote Videos */}
          {remotePeers.length > 0 ? (
            <div className={`${isPortrait ? "w-full" : "flex-1 aspect-video"} bg-black rounded-lg overflow-hidden`}>
              <VideoStream
                stream={remotePeers[0]?.stream || null}
                label={remotePeers[0]?.peerId.substring(0, 8)}
              />
            </div>
          ) : (
            <div className={`${isPortrait ? "w-full" : "flex-1 aspect-video"} flex items-center justify-center bg-muted rounded-lg`}>
              <p className="text-muted-foreground">{tx("รอคนอื่นเข้าห้อง...", "Waiting for others...")}</p>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 pb-4">
          <Button
            size="lg"
            variant={isVideoOn ? "default" : "secondary"}
            onClick={handleToggleVideo}
            className="rounded-full"
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            size="lg"
            variant={isAudioOn ? "default" : "secondary"}
            onClick={handleToggleAudio}
            className="rounded-full"
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button size="lg" variant="secondary" onClick={shareScreen} className="rounded-full">
            <Share2 className="w-5 h-5" />
          </Button>

          <Button size="lg" variant="destructive" onClick={handleLeaveRoom} className="rounded-full">
            <Phone className="w-5 h-5" />
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-center">
          <p className="text-sm font-medium">{tx("กดเข้ามาเพียงครั้งเดียว คนอื่นจะเห็นคุณโดยอัตโนมัติ", "Join once, others see you automatically")}</p>
          <p className="text-xs text-muted-foreground">
            {tx("ให้คนอื่นเข้าไปที่ห้อง", "Share room:")} <code className="bg-muted px-2 py-1 rounded">{roomId}</code>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ChatRoom;

