import { useEffect, useRef, useState, useCallback } from "react";
import Peer, { DataConnection, MediaConnection } from "peerjs";

interface RemotePeer {
  peerId: string;
  stream?: MediaStream;
  dataConn?: DataConnection;
}

const STORAGE_KEY = "dekthai_peer_id";

export const usePeerRoom = (roomId: string) => {
  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [peerId, setPeerId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const remoteConnectionsRef = useRef<Map<string, MediaConnection>>(new Map());
  const connectedPeersRef = useRef<Set<string>>(new Set());

  // Get or create Peer ID from localStorage
  const getOrCreatePeerId = useCallback((): string => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  }, []);

  // Initialize Peer connection
  useEffect(() => {
    const peerId = getOrCreatePeerId();
    setPeerId(peerId);

    if (!peerRef.current) {
      const peer = new Peer(peerId);
      peerRef.current = peer;

      peer.on("open", (id) => {
        setIsConnected(true);
        console.log("Peer connection opened with ID:", id);

        // Broadcast this peer's ID to other tabs/windows in same room
        if (broadcastRef.current) {
          broadcastRef.current.postMessage({
            type: "peer_joined",
            peerId: id,
            roomId: roomId,
          });
        }
      });

      peer.on("error", (error) => {
        console.error("Peer error:", error);
      });

      // Handle incoming calls
      peer.on("call", (call) => {
        if (localStreamRef.current && !connectedPeersRef.current.has(call.peer)) {
          call.answer(localStreamRef.current);

          call.on("stream", (remoteStream) => {
            setRemotePeers((prev) => {
              const exists = prev.some((p) => p.peerId === call.peer);
              if (!exists) {
                return [...prev, { peerId: call.peer, stream: remoteStream }];
              }
              return prev;
            });
            connectedPeersRef.current.add(call.peer);
          });

          call.on("close", () => {
            setRemotePeers((prev) =>
              prev.filter((p) => p.peerId !== call.peer)
            );
            connectedPeersRef.current.delete(call.peer);
          });

          remoteConnectionsRef.current.set(call.peer, call);
        }
      });
    }

    // Setup Broadcast Channel for communication between tabs
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel(`dekthai_room_${roomId}`);
      broadcastRef.current = bc;

      bc.onmessage = (event) => {
        const { type, peerId: remotePeerId } = event.data;

        if (type === "peer_joined" && peerId !== remotePeerId) {
          // Auto-call the new peer
          if (peerRef.current && localStreamRef.current) {
            setTimeout(() => {
              if (!connectedPeersRef.current.has(remotePeerId)) {
                const call = peerRef.current!.call(
                  remotePeerId,
                  localStreamRef.current!
                );

                call.on("stream", (remoteStream) => {
                  setRemotePeers((prev) => {
                    const exists = prev.some((p) => p.peerId === remotePeerId);
                    if (!exists) {
                      return [...prev, { peerId: remotePeerId, stream: remoteStream }];
                    }
                    return prev;
                  });
                  connectedPeersRef.current.add(remotePeerId);
                });

                call.on("close", () => {
                  setRemotePeers((prev) =>
                    prev.filter((p) => p.peerId !== remotePeerId)
                  );
                  connectedPeersRef.current.delete(remotePeerId);
                });

                remoteConnectionsRef.current.set(remotePeerId, call);
              }
            }, 500);
          }
        }
      };

      // Notify other tabs that this peer is in the room
      bc.postMessage({
        type: "peer_joined",
        peerId: peerId,
        roomId: roomId,
      });
    }

    return () => {
      if (broadcastRef.current) {
        broadcastRef.current.close();
      }
    };
  }, [roomId, getOrCreatePeerId]);

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

      const screenTrack = screenStream.getVideoTracks()[0];
      remoteConnectionsRef.current.forEach((conn) => {
        const sender = conn
          .peerConnection!.getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

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
    connectedPeersRef.current.clear();
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
    disconnect,
  };
};
