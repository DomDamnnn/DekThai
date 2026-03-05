import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, AlertCircle, Zap } from "lucide-react";
import { ROUTE_PATHS } from "@/lib";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useChatRooms } from "@/hooks/useChatRooms";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";

const ChatRooms: React.FC = () => {
  const { tx } = useLocale();
  const { student } = useAuth();
  const { rooms, hasClassroomAccess, canCreateRoom, createRoom } = useChatRooms();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createScope, setCreateScope] = useState<"app" | "classroom">("app");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#FF6B6B",
    emoji: "🎉",
  });

  const handleCreateRoom = () => {
    if (!formData.name.trim()) return;

    const newRoom = createRoom({
      name: formData.name,
      description: formData.description,
      scope: createScope,
      color: formData.color,
      emoji: formData.emoji,
    });

    if (newRoom) {
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", color: "#FF6B6B", emoji: "🎉" });
    }
  };

  // Helper to check if user should see classroom option to join
  const shouldPromptClassroomJoin = !hasClassroomAccess && rooms.length > 0;

  // Group rooms by scope
  const appRooms = rooms.filter((r) => r.scope === "app");
  const schoolRooms = rooms.filter((r) => r.scope === "school");
  const classroomRooms = rooms.filter((r) => r.scope === "classroom");

  return (
    <Layout>
      <div className="min-h-[80vh] py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tx("ห้องสนทนา", "Chat Rooms")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {student?.school && `${student.school} • ${student.classCode}`}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {tx("สร้างห้อง", "Create")}
          </Button>
        </div>

        <div className="space-y-8">
          {/* App-wide rooms */}
          {appRooms.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{tx("ทั้งแอพ", "App-wide")}</h2>
                <Badge variant="secondary" className="text-xs">
                  {appRooms.length}
                </Badge>
              </div>
              <div className="grid gap-3">
                {appRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={ROUTE_PATHS.CHAT_ROOM.replace(":roomId", room.id)}
                      className="block p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-lg text-lg flex-shrink-0"
                          style={{ backgroundColor: room.color + "20" }}
                        >
                          {room.emoji || "💬"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {room.name}
                          </h3>
                          {room.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{room.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* School-wide rooms */}
          {schoolRooms.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{tx("ทั้งโรงเรียน", "School-wide")}</h2>
                <Badge variant="outline" className="text-xs">
                  {schoolRooms.length}
                </Badge>
              </div>
              {!hasClassroomAccess && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">
                      {tx("เข้าห้องเรียนเพื่อเข้าถึง", "Join a classroom to access")}
                    </p>
                    <Link to={ROUTE_PATHS.CLASS_CODE}>
                      <Button size="sm" variant="outline" className="gap-1 mt-1 text-xs h-7">
                        <Zap className="w-3 h-3" />
                        {tx("เข้าห้องเรียน", "Join Classroom")}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              <div className="grid gap-3">
                {schoolRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={ROUTE_PATHS.CHAT_ROOM.replace(":roomId", room.id)}
                      className="block p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-lg text-lg flex-shrink-0"
                          style={{ backgroundColor: room.color + "20" }}
                        >
                          {room.emoji || "💬"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {room.name}
                          </h3>
                          {room.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{room.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Classroom-specific rooms */}
          {classroomRooms.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{tx("ห้องทั้งหมด", "Classroom")}</h2>
                <Badge variant="outline" className="text-xs">
                  {classroomRooms.length}
                </Badge>
              </div>
              <div className="grid gap-3">
                {classroomRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={ROUTE_PATHS.CHAT_ROOM.replace(":roomId", room.id)}
                      className="block p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-lg text-lg flex-shrink-0"
                          style={{ backgroundColor: room.color + "20" }}
                        >
                          {room.emoji || "💬"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {room.name}
                          </h3>
                          {room.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{room.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {rooms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground space-y-3">
              <p>{tx("ยังไม่มีห้องสนทนา", "No chat rooms available yet")}</p>
              {!hasClassroomAccess && (
                <p className="text-sm">
                  {tx(
                    "เข้าห้องเรียนเพื่อเข้าถึงห้องสนทนาทั้งโรงเรียนและห้องเรียน",
                    "Join a classroom to access school-wide and classroom chat rooms."
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{tx("สร้างห้องใหม่", "Create New Room")}</DialogTitle>
            <DialogDescription>
              {tx("ตั้งชื่อและตั้งค่าห้องสนทนาของคุณ", "Set up your new chat room")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Scope Selection */}
            <div className="space-y-2">
              <Label>{tx("ขอบเขต", "Scope")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={createScope === "app" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreateScope("app")}
                  disabled={!canCreateRoom("app")}
                >
                  {tx("ทั้งแอพ", "App-wide")}
                </Button>
                <Button
                  variant={createScope === "classroom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreateScope("classroom")}
                  disabled={!canCreateRoom("classroom")}
                >
                  {tx("ในห้องเรียน", "Classroom")}
                </Button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="room-name">{tx("ชื่อห้อง", "Room Name")}</Label>
              <Input
                id="room-name"
                placeholder={tx("เช่น แสนสนุก", "e.g., Awesome Room")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="room-desc">{tx("รายละเอียด", "Description")}</Label>
              <Textarea
                id="room-desc"
                placeholder={tx("บรรยายห้องของคุณ...", "Describe your room...")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Color & Emoji */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-color">{tx("สี", "Color")}</Label>
                <input
                  id="room-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded border border-border cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-emoji">{tx("อิโมจิ", "Emoji")}</Label>
                <Input
                  id="room-emoji"
                  maxLength={2}
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="text-center text-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {tx("ยกเลิก", "Cancel")}
            </Button>
            <Button onClick={handleCreateRoom} disabled={!formData.name.trim()}>
              {tx("สร้างห้อง", "Create Room")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ChatRooms;

