"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, AlertTriangle, Clock, Eye, RefreshCw, WifiOff } from "lucide-react"

interface CollaborationBannerProps {
  msid: string
  currentUser: string
}

// Mock collaboration data
const mockCollaborationData = {
  activeUsers: [
    {
      id: "user1",
      name: "Dr. Sarah Chen",
      email: "s.chen@university.edu",
      avatar: "/avatars/sarah.jpg",
      section: "QC Checks",
      lastActivity: "2024-01-20T14:30:00Z",
      isEditing: true,
      cursor: { x: 150, y: 200 },
    },
    {
      id: "user2",
      name: "Dr. Michael Torres",
      email: "m.torres@institute.org",
      avatar: "/avatars/michael.jpg",
      section: "Figures",
      lastActivity: "2024-01-20T14:28:00Z",
      isEditing: false,
      cursor: null,
    },
  ],
  conflicts: [
    {
      id: "conflict1",
      type: "concurrent_edit",
      field: "notes",
      conflictedBy: "Dr. Sarah Chen",
      timestamp: "2024-01-20T14:25:00Z",
      resolved: false,
      localVersion:
        "Requires additional validation for protein structure data. Missing figure legends for panels C-E. Updated methodology section.",
      remoteVersion:
        "Requires additional validation for protein structure data. Missing figure legends for panels C-E. Author contacted for clarification on methodology section.",
    },
  ],
  versionInfo: {
    currentVersion: "v1.2.3",
    lastSyncedVersion: "v1.2.2",
    hasUnsyncedChanges: true,
    lastSynced: "2024-01-20T14:20:00Z",
  },
  connectionStatus: "connected",
}

export function CollaborationBanner({ msid, currentUser }: CollaborationBannerProps) {
  const [collaborationData, setCollaborationData] = useState(mockCollaborationData)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [showUsersDialog, setShowUsersDialog] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborationData((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers.map((user) => ({
          ...user,
          lastActivity: user.isEditing ? new Date().toISOString() : user.lastActivity,
        })),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const otherActiveUsers = collaborationData.activeUsers.filter((user) => user.name !== currentUser)
  const hasConflicts = collaborationData.conflicts.some((c) => !c.resolved)
  const isOffline = collaborationData.connectionStatus === "disconnected"

  const handleResolveConflict = (conflictId: string, resolution: "local" | "remote") => {
    setCollaborationData((prev) => ({
      ...prev,
      conflicts: prev.conflicts.map((conflict) =>
        conflict.id === conflictId ? { ...conflict, resolved: true } : conflict,
      ),
    }))
  }

  const handleForceSync = () => {
    setCollaborationData((prev) => ({
      ...prev,
      versionInfo: {
        ...prev.versionInfo,
        hasUnsyncedChanges: false,
        lastSynced: new Date().toISOString(),
        lastSyncedVersion: prev.versionInfo.currentVersion,
      },
    }))
  }

  if (otherActiveUsers.length === 0 && !hasConflicts && !isOffline) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Connection Status */}
      {isOffline && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Connection lost - working offline</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleForceSync}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Users Banner */}
      {otherActiveUsers.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-500" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-700">
                    {otherActiveUsers.length === 1
                      ? `${otherActiveUsers[0].name} is also editing this manuscript`
                      : `${otherActiveUsers.length} others are editing this manuscript`}
                  </span>
                  <div className="flex -space-x-2">
                    {otherActiveUsers.slice(0, 3).map((user) => (
                      <div
                        key={user.id}
                        className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                        title={user.name}
                      >
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    ))}
                    {otherActiveUsers.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center text-xs text-white font-medium">
                        +{otherActiveUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Active Users</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    {collaborationData.activeUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm text-white font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isEditing ? "default" : "secondary"} className="text-xs">
                            {user.section}
                          </Badge>
                          {user.isEditing && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600">Editing</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts Banner */}
      {hasConflicts && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">
                  {collaborationData.conflicts.filter((c) => !c.resolved).length} editing conflict
                  {collaborationData.conflicts.filter((c) => !c.resolved).length !== 1 ? "s" : ""} detected
                </span>
              </div>
              <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Resolve
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Resolve Editing Conflicts</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-4">
                      {collaborationData.conflicts
                        .filter((c) => !c.resolved)
                        .map((conflict) => (
                          <Card key={conflict.id}>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">Field: {conflict.field}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Conflict with {conflict.conflictedBy} at{" "}
                                      {new Date(conflict.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant="destructive" className="text-xs">
                                    Unresolved
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-green-700">Your Version:</p>
                                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                                      {conflict.localVersion}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResolveConflict(conflict.id, "local")}
                                      className="w-full"
                                    >
                                      Keep My Version
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-blue-700">Their Version:</p>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                      {conflict.remoteVersion}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResolveConflict(conflict.id, "remote")}
                                      className="w-full"
                                    >
                                      Keep Their Version
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version Sync Status */}
      {collaborationData.versionInfo.hasUnsyncedChanges && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">You have unsynced changes</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {collaborationData.versionInfo.currentVersion}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleForceSync}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
