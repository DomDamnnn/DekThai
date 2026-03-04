import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import VideoStream from "@/components/VideoStream";
import { usePeerRoom } from "@/hooks/usePeerRoom";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Share2, Phone } from "lucide-react";
import { ROUTE_PATHS } from "@/lib";

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
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
    // ถ้า height > width มันก็ portrait (โทรศัพท์)
    // ถ้า width > height มันก็ landscape (คอมพิวเตอร์)
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

  if (!hasJoined) {
    return (
      <Layout>
        <div className="flex flex-col h-[calc(100vh-140px)] items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 max-w-sm text-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">ห้อง: {roomId}</h1>
              <p className="text-muted-foreground text-sm">พร้อมเข้าห้องสนทนาแล้วหรือยัง</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              กด "เข้าห้อง" เพื่อเปิดกล้อง ไมค์ และเริ่มสนทนากับคนอื่นในห้อง
            </p>

            <Button
              size="lg"
              onClick={handleJoinRoom}
              className="w-full rounded-lg"
            >
              เข้าห้อง
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-140px)] p-4 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">ห้อง: {roomId}</h1>
          {remotePeers.length > 0 && (
            <p className="text-sm text-muted-foreground">
              มีคน {remotePeers.length} คนอยู่ในห้อง
            </p>
          )}
        </div>

        {/* Local and Remote Video Grid */}
        <div className={`flex-1 flex ${isPortrait ? 'flex-col' : 'flex-row'} items-center justify-center gap-4`}>
          {/* Local Video */}
          <div className={`${isPortrait ? 'w-full' : 'flex-1 aspect-video'} bg-black rounded-lg overflow-hidden`}>
            <VideoStream stream={localStream} label="คุณ" muted onDimensionsChange={handleLocalDimensionsChange} />
          </div>

          {/* Remote Videos */}
          {remotePeers.length > 0 ? (
            <div className={`${isPortrait ? 'w-full' : 'flex-1 aspect-video'} bg-black rounded-lg overflow-hidden`}>
              <VideoStream stream={remotePeers[0]?.stream || null} label={remotePeers[0]?.peerId.substring(0, 8)} />
            </div>
          ) : (
            <div className={`${isPortrait ? 'w-full' : 'flex-1 aspect-video'} flex items-center justify-center bg-muted rounded-lg`}>
              <p className="text-muted-foreground">รอคนอื่นเข้าห้อง...</p>
            </div>
          )}
        </div>

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

          <Button
            size="lg"
            variant="secondary"
            onClick={shareScreen}
            className="rounded-full"
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="destructive"
            onClick={handleLeaveRoom}
            className="rounded-full"
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-center">
          <p className="text-sm font-medium">กดเข้ามาเพียงครั้งเดียว คนอื่นจะเห็นคุณโดยอัตโนมัติ</p>
          <p className="text-xs text-muted-foreground">
            ให้คนอื่นเข้าไปที่ห้อง <code className="bg-muted px-2 py-1 rounded">{roomId}</code> เดียวกัน
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ChatRoom;
