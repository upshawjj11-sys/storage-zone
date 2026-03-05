import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Plus, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminTeam() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });

  const handleInvite = async () => {
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole === "editor" ? "user" : inviteRole);
    // Update the invited user's role to editor if needed
    setInviting(false);
    setShowInvite(false);
    setInviteEmail("");
    queryClient.invalidateQueries({ queryKey: ["team-members"] });
  };

  const roleColors = {
    admin: "bg-red-100 text-red-700",
    editor: "bg-blue-100 text-blue-700",
    user: "bg-gray-100 text-gray-600",
  };

  const roleIcons = {
    admin: Shield,
    editor: UserCheck,
    user: Users,
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1">Manage who can access the admin panel.</p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Plus className="w-4 h-4" /> Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No team members yet.</div>
          ) : (
            <div className="divide-y">
              {users.map((user) => {
                const RoleIcon = roleIcons[user.role] || Users;
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-sm">
                        {(user.full_name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || "Unnamed"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`border-0 ${roleColors[user.role] || roleColors.user}`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {user.role || "user"}
                      </Badge>
                      <Select
                        value={user.role || "user"}
                        onValueChange={(v) => updateRoleMutation.mutate({ id: user.id, role: v })}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Invite someone to help manage your storage website.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="team@example.com"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin – Full access</SelectItem>
                  <SelectItem value="editor">Editor – Can edit content</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full rounded-full"
              style={{ background: "#E8792F" }}
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
            >
              {inviting ? "Sending Invite..." : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}