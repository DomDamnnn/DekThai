import { useEffect, useRef, useState, useCallback } from "react";
import Peer, { DataConnection, MediaConnection } from "peerjs";

interface RemotePeer {
  peerId: string;
  stream?: MediaStream;
  dataConn?: DataConnection;
}

export const usePeerConnection = (roomId: string) => {
  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [peerId, setPeerId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const remoteConnectionsRef = useRef<Map<string, MediaConnection>>(new Map());

  // Initialize Peer connection
  useEffect(() => {
    if (!peerRef.current) {
      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", (id) => {
        setPeerId(id);
        setIsConnected(true);
        console.log("Peer connection opened with ID:", id);
      });

      peer.on("error", (error) => {
        console.error("Peer error:", error);
      });

      peer.on("call", (call) => {
        // Answer incoming call with local stream
        if (localStreamRef.current) {
          call.answer(localStreamRef.current);

          call.on("stream", (remoteStream) => {
            setRemotePeers((prev) => [
              ...prev,
              { peerId: call.peer, stream: remoteStream },
            ]);
          });

          call.on("close", () => {
            setRemotePeers((prev) =>
              prev.filter((p) => p.peerId !== call.peer)
            );
          });

          remoteConnectionsRef.current.set(call.peer, call);
        }
      });
    }

    return () => {
      // Cleanup on unmount
    };
  }, []);

  // Get local media stream
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = enabled));
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = enabled));
    }
  }, []);

  // Share screen
  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Replace video tracks in all connections
      const screenTrack = screenStream.getVideoTracks()[0];
      remoteConnectionsRef.current.forEach((conn) => {
        const sender = conn
          .peerConnection!.getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // Stop screen sharing when done
      screenTrack.onended = () => {
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          remoteConnectionsRef.current.forEach((conn) => {
            const sender = conn
              .peerConnection!.getSenders()
              .find((s) => s.track?.kind === "video");
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });
        }
      };
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  }, []);

  // Call another peer
  const callPeer = useCallback(
    (remotePeerId: string) => {
      if (peerRef.current && localStreamRef.current) {
        const call = peerRef.current.call(remotePeerId, localStreamRef.current);

        call.on("stream", (remoteStream) => {
          setRemotePeers((prev) => [
            ...prev,
            { peerId: call.peer, stream: remoteStream },
          ]);
        });

        call.on("close", () => {
          setRemotePeers((prev) =>
            prev.filter((p) => p.peerId !== call.peer)
          );
        });

        remoteConnectionsRef.current.set(remotePeerId, call);
      }
    },
    []
  );

  // Disconnect all
  const disconnect = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    stopLocalStream();
    setRemotePeers([]);
    setPeerId("");
    setIsConnected(false);
  }, [stopLocalStream]);

  return {
    peerId,
    isConnected,
    localStream,
    remotePeers,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    shareScreen,
    callPeer,
    disconnect,
  };
};
