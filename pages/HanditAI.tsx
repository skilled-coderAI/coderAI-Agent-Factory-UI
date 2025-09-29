import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  TrendingUp, 
  TrendingDown,
  Zap, 
  Eye,
  TestTube,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Lightbulb,
  Activity
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";

interface HanditInfo {
  message: string;
  version: string;
  description: string;
  features: string[];
  status: any;
  capabilities: Record<string, string>;
}

interface AgentMetrics {
  agent_name: string;
  period_days: number;
  total_executions: number;
  successful_executions: number;
  error_rate: number;
  average_duration_ms: number;
  evaluation_metrics?: {
    total_evaluations: number;
    average_score: number;
    score_trend: number[];
    criteria_breakdown: Record<string, { average: number; trend: number[] }>;
  };
}

interface TrackedAgent {
  name: string;
  total_executions: number;
  successful_executions: number;
  error_count: number;
  success_rate: number;
  last_execution: string;
}

interface EvaluationResult {
  evaluation_id: string;
  execution_id: string;
  score: number;
  criteria: Record<string, number>;
  feedback: string;
  suggestions: string[];
  confidence: number;
  status: string;
  timestamp: string;
}

interface ImprovementSuggestion {
  suggestion_id: string;
  agent_name: string;
  type: string;
  current_value: string;
  suggested_value: string;
  reasoning: string;
  confidence: number;
  estimated_impact: number;
}

export function HanditAI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [evaluationDays, setEvaluationDays] = useState(7);

  // Fetch Handit AI info
  const { data: handitInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["handit-info"],
    queryFn: () => apiClient.get("/api/handit-ai/") as Promise<HanditInfo>,
  });

  // Fetch tracked agents
  const { data: trackedAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ["handit-tracked-agents"],
    queryFn: () => apiClient.get("/api/handit-ai/agents") as Promise<{
      tracked_agents: string[];
      total_count: number;
      agent_statistics: TrackedAgent[];
    }>,
  });

  // Fetch system overview
  const { data: systemOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ["handit-overview"],
    queryFn: () => apiClient.get("/api/handit-ai/overview"),
  });

  // Fetch agent metrics
  const { data: agentMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["handit-agent-metrics", selectedAgent, evaluationDays],
    queryFn: () => selectedAgent ? apiClient.get(`/api/handit-ai/metrics/${selectedAgent}?days=${evaluationDays}`) as Promise<AgentMetrics> : null,
    enabled: !!selectedAgent,
  });

  // Fetch agent evaluations
  const { data: agentEvaluations } = useQuery({
    queryKey: ["handit-agent-evaluations", selectedAgent],
    queryFn: () => selectedAgent ? apiClient.get(`/api/handit-ai/evaluations/${selectedAgent}`) as Promise<{
      agent_name: string;
      total_evaluations: number;
      evaluations: EvaluationResult[];
    }> : null,
    enabled: !!selectedAgent,
  });

  // Improve agent mutation
  const improveAgentMutation = useMutation({
    mutationFn: (agentName: string) => 
      apiClient.post("/api/handit-ai/improve", { agent_name: agentName }) as Promise<ImprovementSuggestion[]>,
    onSuccess: (data) => {
      toast({
        title: "Improvement Suggestions Generated",
        description: `Generated ${data.length} optimization suggestions`,
      });
      queryClient.invalidateQueries({ queryKey: ["handit-agent-metrics"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate improvement suggestions",
        variant: "destructive",
      });
    },
  });

  // Reset data mutation
  const resetDataMutation = useMutation({
    mutationFn: () => apiClient.delete("/api/handit-ai/reset"),
    onSuccess: () => {
      toast({
        title: "Data Reset",
        description: "All Handit AI tracking data has been reset",
      });
      queryClient.invalidateQueries({ queryKey: ["handit-"] });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-500";
    if (score >= 0.8) return "text-blue-500";
    if (score >= 0.7) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.9) return "bg-green-500/20 text-green-300 border-green-500/30";
    if (score >= 0.8) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (score >= 0.7) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  if (infoLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Handit AI Integration</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="glass animate-pulse">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Handit AI Integration
          </h1>
          <p className="text-slate-400 mt-1">
            Auto-improvement engine for continuous agent optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={handitInfo?.status?.handit_integration?.enabled ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}>
            <Activity className="h-3 w-3 mr-1" />
            {handitInfo?.status?.handit_integration?.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Tracked Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(systemOverview as any)?.handit_integration?.total_tracked_agents || 0}
            </div>
            <p className="text-xs text-slate-400">Active monitoring</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(systemOverview as any)?.handit_integration?.total_executions || 0}
            </div>
            <p className="text-xs text-slate-400">Lifetime tracking</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(systemOverview as any)?.handit_integration?.total_evaluations || 0}
            </div>
            <p className="text-xs text-slate-400">Quality assessments</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(systemOverview as any)?.handit_integration?.total_improvement_suggestions || 0}
            </div>
            <p className="text-xs text-slate-400">Optimization suggestions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
          <TabsTrigger 
            value="agents" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger 
            value="metrics"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger 
            value="evaluation"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
          >
            <Target className="w-4 h-4 mr-2" />
            Evaluation Hub
          </TabsTrigger>
          <TabsTrigger 
            value="optimization"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            <Brain className="w-4 h-4 mr-2" />
            Optimization
          </TabsTrigger>
          <TabsTrigger 
            value="testing"
            className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"
          >
            <TestTube className="w-4 h-4 mr-2" />
            A/B Testing
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Tracked Agents
              </CardTitle>
              <CardDescription className="text-slate-400">
                Agents currently monitored by Handit AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-slate-400 mt-2">Loading agents...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trackedAgents?.agent_statistics?.map((agent) => (
                    <Card 
                      key={agent.name}
                      className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-700 ${
                        selectedAgent === agent.name ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedAgent(agent.name)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-medium">{agent.name}</h3>
                          <Badge className={getScoreBadgeVariant(agent.success_rate)}>
                            {(agent.success_rate * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Executions:</span>
                            <span className="text-white">{agent.total_executions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Errors:</span>
                            <span className="text-white">{agent.error_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Last Run:</span>
                            <span className="text-white text-xs">
                              {agent.last_execution ? new Date(agent.last_execution).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-slate-400">No tracked agents found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation Hub Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Evaluation Hub
              </CardTitle>
              <CardDescription className="text-slate-400">
                Continuous quality assessment and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Evaluation Hub Dashboard</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Continuous monitoring and quality assessment for all agents
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-slate-400 text-sm">Quality Score</span>
                      </div>
                      <div className="text-xl font-bold text-white">87.5%</div>
                      <div className="text-xs text-slate-500">System-wide</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-400 text-sm">Active Pipelines</span>
                      </div>
                      <div className="text-xl font-bold text-white">2</div>
                      <div className="text-xs text-slate-500">Running evaluations</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-400 text-sm">Insights</span>
                      </div>
                      <div className="text-xl font-bold text-white">12</div>
                      <div className="text-xs text-slate-500">Quality insights</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-slate-400 text-sm">Alerts</span>
                      </div>
                      <div className="text-xl font-bold text-white">3</div>
                      <div className="text-xs text-slate-500">Require attention</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-xs text-slate-500">
                  Comprehensive evaluation pipelines with automated quality assessment and continuous improvement recommendations
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metrics" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-slate-400">
                Detailed performance analytics for selected agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-64 bg-slate-900 border-slate-600">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {trackedAgents?.tracked_agents?.map((agentName) => (
                      <SelectItem key={agentName} value={agentName}>
                        {agentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={evaluationDays.toString()} onValueChange={(value) => setEvaluationDays(parseInt(value))}>
                  <SelectTrigger className="w-32 bg-slate-900 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedAgent && agentMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-400 text-sm">Executions</span>
                      </div>
                      <div className="text-xl font-bold text-white">{agentMetrics.total_executions}</div>
                      <div className="text-xs text-slate-500">
                        {agentMetrics.successful_executions} successful
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-slate-400 text-sm">Success Rate</span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {((1 - agentMetrics.error_rate) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-500">
                        {(agentMetrics.error_rate * 100).toFixed(1)}% errors
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-400 text-sm">Avg Duration</span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {agentMetrics.average_duration_ms.toFixed(0)}ms
                      </div>
                      <div className="text-xs text-slate-500">per execution</div>
                    </CardContent>
                  </Card>

                  {agentMetrics.evaluation_metrics && (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-purple-400" />
                          <span className="text-slate-400 text-sm">Quality Score</span>
                        </div>
                        <div className={`text-xl font-bold ${getScoreColor(agentMetrics.evaluation_metrics.average_score)}`}>
                          {(agentMetrics.evaluation_metrics.average_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {agentMetrics.evaluation_metrics.total_evaluations} evaluations
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {selectedAgent && agentEvaluations && agentEvaluations.evaluations.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Recent Evaluations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {agentEvaluations.evaluations.slice(0, 5).map((evaluation) => (
                        <div key={evaluation.evaluation_id} className="p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getScoreBadgeVariant(evaluation.score)}>
                              {(evaluation.score * 100).toFixed(1)}% Score
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {new Date(evaluation.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{evaluation.feedback}</p>
                          {evaluation.suggestions.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-xs text-slate-400">Suggestions:</span>
                              {evaluation.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="text-xs text-slate-300 flex items-center gap-1">
                                  <Lightbulb className="w-3 h-3 text-yellow-400" />
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Agent Optimization
              </CardTitle>
              <CardDescription className="text-slate-400">
                Generate AI-powered improvements for your agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-64 bg-slate-900 border-slate-600">
                    <SelectValue placeholder="Select agent to optimize" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {trackedAgents?.tracked_agents?.map((agentName) => (
                      <SelectItem key={agentName} value={agentName}>
                        {agentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => selectedAgent && improveAgentMutation.mutate(selectedAgent)}
                  disabled={!selectedAgent || improveAgentMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {improveAgentMutation.isPending ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Generate Improvements
                    </>
                  )}
                </Button>
              </div>

              {selectedAgent && (
                <div className="text-sm text-slate-400">
                  Generate AI-powered optimization suggestions for <span className="text-white font-medium">{selectedAgent}</span> based on performance data and evaluation results.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TestTube className="w-5 h-5 text-orange-400" />
                A/B Testing Framework
              </CardTitle>
              <CardDescription className="text-slate-400">
                Intelligent A/B testing with statistical analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create A/B Test Section */}
              <div className="border border-slate-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-orange-400" />
                  Create New A/B Test
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Agent to Test</label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger className="bg-slate-900 border-slate-600">
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {trackedAgents?.tracked_agents?.map((agentName) => (
                          <SelectItem key={agentName} value={agentName}>
                            {agentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Test Duration (hours)</label>
                    <Input 
                      type="number" 
                      defaultValue="24" 
                      className="bg-slate-900 border-slate-600" 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    disabled={!selectedAgent}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Create A/B Test
                  </Button>
                </div>
              </div>

              {/* Active Tests */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  Active A/B Tests
                </h3>
                <div className="space-y-3">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">Test: Code Generation Agent v2</h4>
                          <p className="text-sm text-slate-400">Testing prompt optimization improvements</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Active
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Original Score:</span>
                          <div className="text-white font-medium">78.5%</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Improved Score:</span>
                          <div className="text-white font-medium">82.3%</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Confidence:</span>
                          <div className="text-white font-medium">91.2%</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Time Left:</span>
                          <div className="text-white font-medium">14h 32m</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          Traffic Split: 50/50 • Sample Size: 156 executions
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-600">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center py-6 text-slate-400 text-sm">
                    No other active A/B tests
                  </div>
                </div>
              </div>

              {/* Test Results History */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Recent Test Results
                </h3>
                <div className="space-y-3">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">Test: Data Analysis Agent</h4>
                          <p className="text-sm text-slate-400">Completed 2 days ago</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Winner: Improved
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-300">
                        <strong>Result:</strong> Improved version showed 12.4% performance increase with 95.8% statistical confidence.
                        <br />
                        <strong>Recommendation:</strong> Deploy improved configuration to production.
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="text-center py-4 text-slate-400 text-sm">
                    View more test results
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Actions */}
      <Card className="glass border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Admin Actions
          </CardTitle>
          <CardDescription className="text-slate-400">
            Dangerous actions that affect all Handit AI data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => resetDataMutation.mutate()}
            disabled={resetDataMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {resetDataMutation.isPending ? "Resetting..." : "Reset All Data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}