import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Zap, Activity, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function Analytics() {
  const { data: agentsData } = useQuery({
    queryKey: ["agents"],
    queryFn: () => apiClient.listAgents(0, 100),
  });

  const agents = Array.isArray(agentsData) ? agentsData : [];
  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent: any) => agent.status === "ready").length;
  const processingAgents = agents.filter((agent: any) => agent.status === "processing").length;
  const errorAgents = agents.filter((agent: any) => agent.status === "error").length;

  const agentsByType = agents.reduce((acc: any, agent: any) => {
    const type = agent.agent_type || agent.type || 'regular';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate success rate
  const successRate = totalAgents > 0 ? Math.round(((totalAgents - errorAgents) / totalAgents) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text animate-pulse">Analytics</h1>
          <p className="text-slate-400 mt-2 text-lg gradient-text-subtle">Monitor your AI agents performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass vibe-bg shadow-xl rounded-2xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-slate-300">Total Agents</CardTitle>
            <BarChart3 className="h-8 w-8 text-blue-400 animate-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">{totalAgents}</div>
            <p className="text-sm text-slate-400">All time created</p>
          </CardContent>
        </Card>

        <Card className="glass vibe-bg shadow-xl rounded-2xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-slate-300">Active Agents</CardTitle>
            <TrendingUp className="h-8 w-8 text-green-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400">{activeAgents}</div>
            <p className="text-sm text-slate-400">Currently running</p>
          </CardContent>
        </Card>

        <Card className="glass vibe-bg shadow-xl rounded-2xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-slate-300">Processing</CardTitle>
            <Zap className="h-8 w-8 text-yellow-400 animate-spin" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-400">{processingAgents}</div>
            <p className="text-sm text-slate-400">Being created</p>
          </CardContent>
        </Card>

        <Card className="glass vibe-bg shadow-xl rounded-2xl border-0 transform transition-all duration-300 hover:scale-105 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-slate-300">Success Rate</CardTitle>
            <Users className="h-8 w-8 text-purple-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-400">{successRate}%</div>
            <p className="text-sm text-slate-400">Agent creation success</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 vibe-bg rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Agents by Type</CardTitle>
            <CardDescription className="text-slate-400">
              Distribution of agent types in your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(agentsByType).length > 0 ? (
              <div className="space-y-5">
                {Object.entries(agentsByType).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl">
                    <span className="text-lg font-medium capitalize text-white">
                      {type.replace("_", " ")}
                    </span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${(count / totalAgents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-lg text-slate-300 min-w-[3rem] text-right font-bold">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-10 text-lg">
                No agents created yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 vibe-bg rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Agent Status Overview</CardTitle>
            <CardDescription className="text-slate-400">
              Current status of all your agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl">
                <span className="text-lg font-medium text-green-400">Ready</span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: totalAgents > 0 ? `${(activeAgents / totalAgents) * 100}%` : "0%" }}
                    ></div>
                  </div>
                  <span className="text-lg text-slate-300 min-w-[3rem] text-right font-bold">{activeAgents}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl">
                <span className="text-lg font-medium text-yellow-400">Processing</span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: totalAgents > 0 ? `${(processingAgents / totalAgents) * 100}%` : "0%" }}
                    ></div>
                  </div>
                  <span className="text-lg text-slate-300 min-w-[3rem] text-right font-bold">{processingAgents}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl">
                <span className="text-lg font-medium text-red-400">Error</span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: totalAgents > 0 ? `${(errorAgents / totalAgents) * 100}%` : "0%" }}
                    ></div>
                  </div>
                  <span className="text-lg text-slate-300 min-w-[3rem] text-right font-bold">{errorAgents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 vibe-bg rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-400" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-slate-400">
            Latest agent creation and deployment activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length > 0 ? (
            <div className="space-y-4">
              {agents.slice(0, 5).map((agent: any, index: number) => (
                <div key={agent.id} className="flex items-center justify-between py-5 px-6 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:bg-slate-900/70 transition-all duration-300 animate-in slide-in-from-left duration-500 glass-hover" style={{ animationDelay: `${index * 100}ms` }}>
                  <div>
                    <p className="text-lg font-bold text-white">{agent.name}</p>
                    <p className="text-sm text-slate-400">
                      Created {new Date(agent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-bold border ${
                      agent.status === "ready" ? "bg-green-500/20 text-green-300 border-green-500/30" :
                      agent.status === "processing" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                      agent.status === "error" ? "bg-red-500/20 text-red-300 border-red-500/30" :
                      "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    }`}>
                      {agent.status || "ready"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-10 text-lg">
              No agents created yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}