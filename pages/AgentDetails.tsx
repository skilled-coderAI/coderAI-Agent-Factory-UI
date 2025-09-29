import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Bot, Settings, Trash2, Play, Pause, Zap, Activity } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agentData, isLoading } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => apiClient.getAgent(id!),
    enabled: !!id,
  });

  const deleteAgentMutation = useMutation({
    mutationFn: () => apiClient.deleteAgent(id!),
    onSuccess: () => {
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully deleted.",
      });
      navigate("/");
    },
    onError: (error) => {
      console.error("Failed to delete agent:", error);
      toast({
        title: "Failed to delete agent",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => apiClient.updateAgent(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", id] });
      toast({
        title: "Status updated",
        description: "Agent status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to update status:", error);
      toast({
        title: "Failed to update status",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-8 bg-slate-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Agent Not Found</h1>
        </div>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="text-center py-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
              <Bot className="w-16 h-16 text-red-400 mx-auto relative" />
            </div>
            <p className="text-slate-400 mb-4">The requested agent could not be found.</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agent = agentData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "processing":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "deployed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "error":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const handleStatusToggle = () => {
    const newStatus = agent.status === "ready" ? "deployed" : "ready";
    updateStatusMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      deleteAgentMutation.mutate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {agent.name}
        </h1>
        <Badge className={`${getStatusColor(agent.status || "ready")} border animate-pulse`}>
          {agent.status || "ready"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Bot className="w-5 h-5 mr-2 text-blue-400" />
                Agent Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Basic details about your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-slate-400">Type</label>
                  <p className="text-sm text-white">{agent.agent_type || "regular"}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-slate-400">Created</label>
                  <p className="text-sm text-white">{new Date(agent.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {agent.description && (
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-slate-400">Description</label>
                  <p className="text-sm text-white">{agent.description}</p>
                </div>
              )}

              <div className="bg-slate-900/50 p-3 rounded-lg">
                <label className="text-sm font-medium text-slate-400">Model</label>
                <p className="text-sm text-white">{agent.model}</p>
              </div>

              <div className="bg-slate-900/50 p-3 rounded-lg">
                <label className="text-sm font-medium text-slate-400">Temperature</label>
                <p className="text-sm text-white">{agent.temperature}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Settings className="w-5 h-5 mr-2 text-purple-400" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleStatusToggle}
                disabled={updateStatusMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300"
              >
                {agent.status === "ready" ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Deploy Agent
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Undeploy Agent
                  </>
                )}
              </Button>

              <Button 
                onClick={handleDelete}
                disabled={deleteAgentMutation.isPending}
                variant="destructive"
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Agent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}