"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CheckCircle,
  ListTodo,
  Hourglass,
  PlusCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  projectId: string;
  deadline?: string;
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  return res.json();
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const projRes = await apiFetch("/projects");
        const projectList: Project[] = projRes.projects || projRes;
        setProjects(projectList);

        const allTasks: Task[] = [];
        for (const project of projectList) {
          const taskRes = await apiFetch(`/tasks/${project._id}`);
          const taskList: Task[] = taskRes.tasks || taskRes;
          allTasks.push(...taskList);
        }
        setTasks(allTasks);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const totalTasks = tasks.length;
  // const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const completionPercentage = totalTasks
    ? Math.round((doneCount / totalTasks) * 100)
    : 0;

  const upcomingDeadlines = tasks
    .filter((t) => t.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    )
    .slice(0, 5);

  const handleAddProject = async () => {
    try {
      const newProject = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: `New Project ${projects.length + 1}`,
          description: `Created at ${new Date().toLocaleTimeString()}`,
        }),
      });
      setProjects((prev) => [...prev, newProject]);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <LayoutDashboard className="inline-block h-6 w-6 sm:h-8 sm:w-8 mr-2 text-slate-800" />
            Project Dashboard
          </h1>
          {isLoading && (
            <div className="flex items-center text-slate-600">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="font-medium">Loading...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <ListTodo className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Tasks
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doneCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Hourglass className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <LayoutDashboard className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <Progress value={completionPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>⏳ Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((task) => (
                <div
                  key={task._id}
                  className="flex justify-between py-2 border-b last:border-b-0"
                >
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(task.deadline!).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500">
                No upcoming deadlines.
              </p>
            )}
          </CardContent>
        </Card>
        <h2 className="text-3xl font-bold mt-10 mb-6 flex items-center">
          <ListTodo className="h-6 w-6 mr-2 text-slate-800" />
          Your Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id}>
              <CardHeader>
                <CardTitle className="text-xl truncate">
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  {project.description}
                </p>
                <Button
                  className="w-full bg-slate-800 text-white"
                  onClick={() =>
                    (window.location.href = `/projects/${project._id}/kanban`)
                  }
                >
                  Open Board <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && !isLoading && (
            <div className="md:col-span-3 flex flex-col items-center justify-center py-10">
              <p className="text-slate-500">You dont have any projects yet.</p>
              <Button
                onClick={handleAddProject}
                className="mt-4 bg-slate-800 text-white"
              >
                <PlusCircle className="mr-2" /> Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
