"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LogoutButton from "@/components/logoutbutton/logout";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done";
  priority?: "low" | "medium" | "high";
  deadline?: string;
}

interface Column {
  id: "todo" | "inprogress" | "done";
  title: string;
  tasks: Task[];
}

export default function KanbanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inprogress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // Fetch tasks
  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to fetch tasks");
          return;
        }

        const tasksArray: Task[] = Array.isArray(data) ? data : data.tasks;

        const validStatuses = ["todo", "inprogress", "done"];

        tasksArray.forEach((t) => {
          t.status = t.status.toLowerCase().replace(/[\s-]/g, "") as
            | "todo"
            | "inprogress"
            | "done";
          if (!validStatuses.includes(t.status)) t.status = "todo";
        });

        const grouped = {
          todo: tasksArray.filter((t) => t.status === "todo"),
          inprogress: tasksArray.filter((t) => t.status === "inprogress"),
          done: tasksArray.filter((t) => t.status === "done"),
        };

        setColumns([
          { id: "todo", title: "To Do", tasks: grouped.todo },
          { id: "inprogress", title: "In Progress", tasks: grouped.inprogress },
          { id: "done", title: "Done", tasks: grouped.done },
        ]);
      } catch (err) {
        console.error("Fetch tasks error:", err);
        setError("Server error");
      }
    };

    fetchTasks();
  }, [token, id]);

  const handleAddTask = async () => {
    if (!newTaskTitle) {
      setError("Task title is required");
      return;
    }
    if (!token) {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          status: "todo",
          priority: newTaskPriority,
          deadline: newTaskDeadline ? newTaskDeadline.toISOString() : undefined,
          projectId: id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create task");
        return;
      }

      const createdTask: Task = { ...(data.task || data), status: "todo" };

      setColumns((prev) =>
        prev.map((col) =>
          col.id === "todo"
            ? { ...col, tasks: [...col.tasks, createdTask] }
            : col
        )
      );

      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("medium");
      setNewTaskDeadline(undefined);
      setDialogOpen(false);
    } catch (err) {
      console.error("Add task error:", err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    if (!token) return;

    const normalizedStatus = newStatus.toLowerCase().replace(/[\s-]/g, "") as
      | "todo"
      | "inprogress"
      | "done";

    const backendStatus =
      normalizedStatus === "inprogress" ? "in-progress" : normalizedStatus;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: backendStatus }),
      });

      if (!res.ok) {
        console.error("Failed to update status");
        return;
      }

      setColumns((prev) => {
        let taskToMove;
        const newColumns = prev.map((col) => {
          const tasksInCol = col.tasks.filter((t) => {
            if (t._id === taskId) {
              taskToMove = { ...t, status: normalizedStatus };
              return false;
            }
            return true;
          });
          return { ...col, tasks: tasksInCol };
        });

        if (taskToMove) {
          const targetColIndex = newColumns.findIndex(
            (c) => c.id === normalizedStatus
          );
          if (targetColIndex !== -1) {
            newColumns[targetColIndex].tasks.push(taskToMove);
          }
        }

        return newColumns;
      });
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t._id !== taskId),
        }))
      );
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const getPriorityBadgeClasses = (priority?: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "medium":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6 sm:p-10 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          Task Board
        </h1>

        <div className=" flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-5 py-2 bg-slate-800 text-white shadow-lg hover:bg-slate-900 active:scale-95 transition-all text-sm sm:text-base">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-xl shadow-2xl bg-white p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  Add New Task
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold text-sm">
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build user profile page"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="font-semibold text-sm"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of the task."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-sm">Priority</Label>
                    <Select
                      onValueChange={(value) =>
                        setNewTaskPriority(value as "low" | "medium" | "high")
                      }
                      defaultValue={newTaskPriority}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm">Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />{" "}
                          {newTaskDeadline
                            ? format(newTaskDeadline, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={newTaskDeadline}
                          onSelect={setNewTaskDeadline}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button
                  className="w-full py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors"
                  onClick={handleAddTask}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {columns.map((col) => (
          <Card
            key={col.id}
            className="bg-slate-200 border-none rounded-2xl shadow-xl flex flex-col p-4"
          >
            <CardHeader className="flex justify-between items-center pb-4">
              <CardTitle className="text-lg font-bold text-slate-800">
                {col.title}
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-slate-300 text-slate-600 font-semibold"
              >
                {col.tasks.length}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {col.tasks.length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-4">
                  No tasks in this column.
                </p>
              )}
              {col.tasks.map((task) => (
                <Card
                  key={task._id}
                  className={`p-4 bg-white rounded-xl shadow-md border-l-4 ${
                    task.priority === "high"
                      ? "border-l-red-400"
                      : task.priority === "medium"
                      ? "border-l-yellow-400"
                      : "border-l-green-400"
                  } hover:shadow-lg transition-all`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {task.title}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-600 mb-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <Badge
                      variant="outline"
                      className={`font-medium ${getPriorityBadgeClasses(
                        task.priority
                      )}`}
                    >
                      {task.priority} Priority
                    </Badge>
                    {task.deadline && (
                      <p className="text-xs text-slate-500 flex items-center">
                        <CalendarIcon className="w-3 h-3 inline-block mr-1" />
                        {format(new Date(task.deadline), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <Select
                    onValueChange={(value) =>
                      handleUpdateStatus(task._id, value)
                    }
                    defaultValue={task.status}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
