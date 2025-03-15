"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { updateGoal } from "@/store/slices/roomSlice";

const RoomPage = () => {
  const { roomId, goal } = useAppSelector((state) => state.room);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [editableGoal, setEditableGoal] = useState(goal || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleEditGoal = () => {
    setIsEditing(true);
    setEditableGoal(goal || "");
  };

  const handleSaveGoal = () => {
    if (editableGoal.trim()) {
      dispatch(updateGoal(editableGoal.trim()));
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full flex justify-center items-center min-h-[80vh]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Waiting Room</CardTitle>
          <CardDescription className="text-center">
            Configure your brainstorming session
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center">
              <Label className="text-lg">Goal</Label>
            </div>
            {isEditing ? (
              <div className="flex gap-2 mt-2">
                <Input
                  value={editableGoal}
                  onChange={(e) => setEditableGoal(e.target.value)}
                />
                <Button onClick={handleSaveGoal}>Save</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 mt-2 p-4 rounded-lg border">
                  <p className="text-gray-700">{goal || "No goal set"}</p>
                </div>
                <Button onClick={handleEditGoal} variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label className="text-lg">Members</Label>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="text-sm py-2 px-4">
                {user?.email || "You"} (You)
              </Badge>
            </div>
          </div>

          <Button asChild className="w-full">
            <Link href={`/room/${roomId}/session`}>Start Session</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomPage;
