"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EllipsisVertical, Plus, GanttChart, Trash2 } from "lucide-react";
import {  formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LogoutButton from "@/components/logoutbutton/logout";
interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setFetching(true);
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.projects)) setProjects(data.projects);
        else if (Array.isArray(data)) setProjects(data);
      } else {
        setError(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server error");
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = async () => {
    if (!newProjectName || !newProjectDesc) {
      setError("All fields are required");
      return;
    }
    if (!token) {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create project");
        return;
      }

      const createdProject = data.project || data;
      setProjects((prev) => [...prev, createdProject]);

      setNewProjectName("");
      setNewProjectDesc("");
      setDialogOpen(false);
    } catch (err) {
      console.error("Add project error:", err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
      } else {
        console.error("Delete failed");
        setError("Failed to delete project");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Projects</h1>
         <div className=" flex items-center gap-2">
           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-5 py-2 bg-slate-800 text-white shadow-lg hover:bg-slate-900 active:scale-95 transition-all text-sm sm:text-base">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                New Project
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDesc">Description</Label>
                <Textarea
                  id="projectDesc"
                  placeholder="Enter project description"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>
              <Button
                className="w-full text-white font-semibold"
                onClick={handleAddProject}
                disabled={loading}
              >
                {loading ? "Creating..." : "Add Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

            <LogoutButton />
         </div>
      </div>

      <Separator className="mb-6" />

      {fetching && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <GanttChart className="w-12 h-12 text-slate-400 animate-pulse" />
          <p className="text-slate-500 font-medium">Loading projects...</p>
        </div>
      )}

      {!fetching && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <GanttChart className="w-12 h-12 text-slate-400" />
          <h2 className="text-2xl font-semibold text-slate-700">No Projects Found</h2>
          <p className="text-slate-500">
            Create your first project to get started.
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="border border-slate-200 shadow-sm hover:shadow-lg rounded-xl transition-all duration-200 relative bg-white"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm">
                    {project.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project._id)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  {project.createdAt && (
                    <div className="text-xs text-slate-400 italic">
                      Created {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
                  <Button
                    className="w-full  text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition"
                    onClick={() => router.push(`/projects/${project._id}/kanban`)}
                  >
                    Open Kanban
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}