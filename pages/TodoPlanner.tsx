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
  Bot, 
  Plus, 
  Users, 
  Target, 
  Workflow, 
  BarChart3, 
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Lightbulb,
  Zap
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Enhanced API functions with error handling
const todoApi = {
  async getTodoPlannerInfo() {
    try {
      const response = await fetch('/api/todo-planner/');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Failed to fetch todo planner info:', error);
      throw new Error('Failed to fetch todo planner information');
    }
  },

  async createTodoPlannerAgent(data: any) {
    try {
      const response = await fetch('/api/todo-planner/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create todo planner agent:', error);
      throw error;
    }
  },

  async createPlanningTeam(data: any) {
    try {
      const response = await fetch('/api/todo-planner/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create planning team:', error);
      throw error;
    }
  },

  async executeCollaborativePlanning(data: any) {
    try {
      const response = await fetch('/api/todo-planner/teams/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to execute collaborative planning:', error);
      throw error;
    }
  },

  async listActiveTeams() {
    try {
      const response = await fetch('/api/todo-planner/teams');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      throw new Error('Failed to fetch teams');
    }
  },

  async chatWithAgent(agentName: string, message: string, projectContext?: string) {
    try {
      const response = await fetch(`/api/todo-planner/agents/${agentName}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, project_context: projectContext })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to chat with agent:', error);
      throw error;
    }
  },

  async createWorkflow(data: any) {
    try {
      const response = await fetch('/api/todo-planner/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  },

  async executeWorkflow(workflowId: string, context?: any) {
    try {
      const response = await fetch(`/api/todo-planner/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: workflowId, execution_context: context })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  },

  async getSystemHealth() {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error('Failed to get system health:', error);
      throw error;
    }
  }
};

interface TodoPlannerAgent {
  name: string;
  title: string;
  description: string;
  capabilities: string[];
  tools: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  agent_count: number;
  agents: string[];
  capabilities: string[];
  status: string;
  created_at: string;
}

export function TodoPlanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [chatMessage, setChatMessage] = useState("");
  const [projectContext, setProjectContext] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [planningRequest, setPlanningRequest] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [coordinationStrategy, setCoordinationStrategy] = useState("sequential");
  const [chatResponse, setChatResponse] = useState("");

  // Fetch todo planner info
  const { data: todoInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["todoInfo"],
    queryFn: todoApi.getTodoPlannerInfo
  });

  // Fetch active teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["activeTeams"],
    queryFn: todoApi.listActiveTeams
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: (data: any) => todoApi.createTodoPlannerAgent(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Todo planner agent created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive"
      });
    }
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: (data: any) => todoApi.createPlanningTeam(data),
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Planning team created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["activeTeams"] });
      setTeamName("");
      setTeamDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive"
      });
    }
  });

  // Execute planning mutation
  const executePlanningMutation = useMutation({
    mutationFn: (data: any) => todoApi.executeCollaborativePlanning(data),
    onSuccess: (result) => {
      toast({
        title: "Planning Complete",
        description: "Collaborative planning executed successfully!"
      });
      // Handle the planning result - you might want to show it in a modal or separate section
      console.log("Planning result:", result);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute planning",
        variant: "destructive"
      });
    }
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: ({ agentName, message, context }: any) => 
      todoApi.chatWithAgent(agentName, message, context),
    onSuccess: (result) => {
      setChatResponse(result.response);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to chat with agent",
        variant: "destructive"
      });
    }
  });

  const handleCreateAgent = () => {
    if (!selectedAgent) {
      toast({
        title: "Error",
        description: "Please select an agent type",
        variant: "destructive"
      });
      return;
    }

    createAgentMutation.mutate({
      agent_name: selectedAgent,
      project_context: projectContext || undefined
    });
  };

  const handleCreateTeam = () => {
    if (!teamName || !teamDescription) {
      toast({
        title: "Error",
        description: "Please provide team name and description",
        variant: "destructive"
      });
      return;
    }

    createTeamMutation.mutate({
      team_name: teamName,
      project_description: teamDescription,
      required_capabilities: ["project_planning", "priority_analysis", "workflow_design"]
    });
  };

  const handleExecutePlanning = () => {
    if (!selectedTeamId || !planningRequest) {
      toast({
        title: "Error",
        description: "Please select a team and provide planning request",
        variant: "destructive"
      });
      return;
    }

    executePlanningMutation.mutate({
      team_id: selectedTeamId,
      planning_request: planningRequest,
      coordination_strategy: coordinationStrategy
    });
  };

  const handleChat = () => {
    if (!selectedAgent || !chatMessage) {
      toast({
        title: "Error",
        description: "Please select an agent and enter a message",
        variant: "destructive"
      });
      return;
    }

    chatMutation.mutate({
      agentName: selectedAgent,
      message: chatMessage,
      context: projectContext || undefined
    });
  };

  const getAgentIcon = (agentName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      task_orchestrator: <Target className="w-5 h-5 text-purple-400" />,
      priority_manager: <BarChart3 className="w-5 h-5 text-blue-400" />,
      workflow_designer: <Workflow className="w-5 h-5 text-green-400" />,
      progress_tracker: <Clock className="w-5 h-5 text-orange-400" />,
      collaboration_facilitator: <Users className="w-5 h-5 text-pink-400" />,
      adaptive_planner: <Lightbulb className="w-5 h-5 text-yellow-400" />
    };
    return iconMap[agentName] || <Bot className="w-5 h-5 text-gray-400" />;
  };

  if (infoLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Todo Planner</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Todo Planner & Team Coordination</h1>
          <p className="text-slate-400 mt-1">Create specialized planning agents and coordinate team workflows</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          {todoInfo?.total_agents || 0} Planner Agents Available
        </Badge>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                Available Todo Planner Agents
              </CardTitle>
              <CardDescription className="text-slate-400">
                Specialized agents for different aspects of todo planning and project management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todoInfo?.available_agents?.map((agent: TodoPlannerAgent) => (
                  <Card 
                    key={agent.name}
                    className={`glass cursor-pointer transition-all duration-200 hover:bg-slate-800/50 ${
                      selectedAgent === agent.name ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent.name)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        {getAgentIcon(agent.name)}
                        <CardTitle className="text-sm text-white">{agent.title}</CardTitle>
                      </div>
                      <CardDescription className="text-xs text-slate-400 line-clamp-2">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 2).map((capability) => (
                          <Badge 
                            key={capability} 
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                          >
                            {capability.replace('_', ' ')}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 2 && (
                          <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs">
                            +{agent.capabilities.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Project Context (Optional)
                  </label>
                  <Textarea
                    placeholder="Describe your project context to customize the agent's behavior..."
                    value={projectContext}
                    onChange={(e) => setProjectContext(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>

                <Button 
                  onClick={handleCreateAgent}
                  disabled={!selectedAgent || createAgentMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createAgentMutation.isPending ? "Creating..." : "Create Selected Agent"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Create Planning Team
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Form a team of specialized agents for collaborative planning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Team Name
                  </label>
                  <Input
                    placeholder="Enter team name..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Project Description
                  </label>
                  <Textarea
                    placeholder="Describe the project this team will work on..."
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>

                <Button 
                  onClick={handleCreateTeam}
                  disabled={createTeamMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Active Teams
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {teams?.length || 0} active planning teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-800 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : teams?.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map((team: Team) => (
                      <Card key={team.id} className="bg-slate-800/30 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">{team.name}</h4>
                              <p className="text-sm text-slate-400">{team.agent_count} agents</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              {team.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No teams created yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Execute Collaborative Planning
              </CardTitle>
              <CardDescription className="text-slate-400">
                Run collaborative planning sessions with your teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Select Team
                  </label>
                  <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team: Team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Coordination Strategy
                  </label>
                  <Select value={coordinationStrategy} onValueChange={setCoordinationStrategy}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                      <SelectItem value="consensus">Consensus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Planning Request
                </label>
                <Textarea
                  placeholder="Describe what you want the team to plan..."
                  value={planningRequest}
                  onChange={(e) => setPlanningRequest(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white"
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleExecutePlanning}
                disabled={executePlanningMutation.isPending}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                {executePlanningMutation.isPending ? "Planning..." : "Execute Planning"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Chat with Todo Planner Agent
              </CardTitle>
              <CardDescription className="text-slate-400">
                Have a conversation with individual planning agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Select Agent
                </label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                    <SelectValue placeholder="Choose an agent to chat with..." />
                  </SelectTrigger>
                  <SelectContent>
                    {todoInfo?.available_agents?.map((agent: TodoPlannerAgent) => (
                      <SelectItem key={agent.name} value={agent.name}>
                        {agent.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Message
                </label>
                <Textarea
                  placeholder="Ask the agent about planning, priorities, workflows, etc..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleChat}
                disabled={chatMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {chatMutation.isPending ? "Sending..." : "Send Message"}
              </Button>

              {chatResponse && (
                <Card className="bg-slate-800/30 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Agent Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-white whitespace-pre-wrap">{chatResponse}</div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}