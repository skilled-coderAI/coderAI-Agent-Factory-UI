import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Activity, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Agent } from "@/lib/api-client";

export function Dashboard() {
  // Fetch only regular agents for now since that's what's working
  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => apiClient.listAgents(0, 10),
  });

  const agentsArray = Array.isArray(agents) ? agents : [];
  const totalAgents = agentsArray.length;
  const activeAgents = agentsArray.filter(agent => agent.status === "ready" || !agent.status).length;
  const processingAgents = agentsArray.filter(agent => agent.status === "processing").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="glass animate-pulse vibe-bg shadow-xl rounded-2xl">
              <CardHeader>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text animate-pulse">Dashboard</h1>
          <p className="text-slate-400 mt-2 gradient-text-subtle">Manage your AI agents</p>
        </div>
        <Link to="/create-agent">
          <Button className="btn-vibe shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-3 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass vibe-bg shadow-xl rounded-2xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Agents</CardTitle>
            <Bot className="h-5 w-5 text-blue-400 animate-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text" data-testid="total-agents">{totalAgents}</div>
            <p className="text-xs text-slate-400">AI agents created</p>
          </CardContent>
        </Card>

        <Card className="glass vibe-bg shadow-xl rounded-2xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active</CardTitle>
            <Activity className="h-5 w-5 text-green-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{activeAgents}</div>
            <p className="text-xs text-slate-400">Ready to use</p>
          </CardContent>
        </Card>

        <Card className="glass vibe-bg shadow-xl rounded-2xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Processing</CardTitle>
            <Clock className="h-5 w-5 text-yellow-400 animate-spin" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{processingAgents}</div>
            <p className="text-xs text-slate-400">Being created</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card className="glass vibe-bg-dark shadow-xl rounded-2xl border-0">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Your Agents</CardTitle>
          <CardDescription className="text-slate-400">
            Manage and monitor your AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agentsArray.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-20 h-20 text-slate-600 mx-auto mb-6 animate-bounce" />
              <h3 className="text-2xl font-bold gradient-text mb-3">No agents yet</h3>
              <p className="text-slate-400 mb-8 text-lg">
                Get started by creating your first AI agent
              </p>
              <Link to="/create-agent">
                <Button className="btn-vibe shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 py-4 text-lg">
                  Create Your First Agent
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentsArray.map((agent: Agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Simplified AgentCard component
function AgentCard({ agent }: { agent: Agent }) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />;
      default:
        return <Activity className="w-5 h-5 text-blue-400 animate-pulse" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "processing":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "error":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <Link to={`/agent/${agent.id}`}>
      <Card className="glass vibe-bg shadow-lg rounded-xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">
                {agent.name}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              {getStatusIcon(agent.status)}
            </div>
          </div>
          <CardDescription className="text-slate-400 line-clamp-2 mt-2">
            {agent.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(agent.status)} border rounded-full px-3 py-1`}>
              {agent.status || "ready"}
            </Badge>
            <div className="text-xs text-slate-400">
              {new Date(agent.created_at || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}