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
  Brain, 
  Plus, 
  FileText, 
  Settings, 
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Workflow,
  FolderOpen,
  Code,
  Search,
  Target
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient, type DeepAgent } from "@/lib/api-client";

interface DeepAgentInfo {
  message: string;
  version: string;
  description: string;
  features: string[];
  available_agents: DeepAgentType[];
  total_agents: number;
  builtin_tools: string[];
  capabilities: Record<string, string>;
}

interface DeepAgentType {
  name: string;
  title: string;
  description: string;
  capabilities: string[];
  tools: string[];
  subagents: string[];
  human_in_the_loop?: boolean;
}

interface SubAgent {
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
}

export function DeepAgents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);
  const [humanInLoop, setHumanInLoop] = useState(false);
  
  // Custom agent form
  const [customName, setCustomName] = useState("");
  const [customInstructionsCustom, setCustomInstructionsCustom] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedSubagents, setSelectedSubagents] = useState<string[]>([]);

  // Plan creation
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planSteps, setPlanSteps] = useState<string[]>([""]);

  // Fetch deep agents info
  const { data: deepInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["deepAgentsInfo"],
    queryFn: () => apiClient.getDeepAgentsInfo()
  });

  // Fetch available subagents
  const { data: subagents, isLoading: subagentsLoading } = useQuery({
    queryKey: ["availableSubagents"],
    queryFn: () => apiClient.listAvailableSubagents()
  });

  // Create deep agent mutation
  const createDeepAgentMutation = useMutation({
    mutationFn: (data: any) => apiClient.createDeepAgent(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deep agent created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setSelectedAgent("");
      setCustomInstructions("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deep agent",
        variant: "destructive"
      });
    }
  });

  // Create custom deep agent mutation
  const createCustomDeepAgentMutation = useMutation({
    mutationFn: (data: any) => apiClient.createCustomDeepAgent(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Custom deep agent created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setCustomName("");
      setCustomInstructionsCustom("");
      setSelectedTools([]);
      setSelectedSubagents([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create custom deep agent",
        variant: "destructive"
      });
    }
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPlan(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan created successfully!"
      });
      setPlanTitle("");
      setPlanDescription("");
      setPlanSteps([""]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive"
      });
    }
  });

  const handleCreateDeepAgent = () => {
    if (!selectedAgent) {
      toast({
        title: "Error",
        description: "Please select a deep agent type",
        variant: "destructive"
      });
      return;
    }

    createDeepAgentMutation.mutate({
      agent_name: selectedAgent,
      custom_instructions: customInstructions || undefined,
      model: selectedModel,
      temperature: temperature,
      human_in_the_loop: humanInLoop
    });
  };

  const handleCreateCustomAgent = () => {
    if (!customName || !customInstructionsCustom || selectedTools.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createCustomDeepAgentMutation.mutate({
      name: customName,
      instructions: customInstructionsCustom,
      tools: selectedTools,
      subagents: selectedSubagents.map(name => ({
        name,
        description: subagents?.find(s => s.name === name)?.description || "",
        prompt: `You are a ${name} specialized for specific tasks.`
      })),
      model: selectedModel,
      temperature: temperature,
      human_in_the_loop: humanInLoop
    });
  };

  const handleCreatePlan = () => {
    if (!planTitle || !planDescription || planSteps.filter(s => s.trim()).length === 0) {
      toast({
        title: "Error",
        description: "Please fill in plan details and at least one step",
        variant: "destructive"
      });
      return;
    }

    createPlanMutation.mutate({
      agent_id: "demo-agent-id", // In real implementation, select from created agents
      title: planTitle,
      description: planDescription,
      steps: planSteps.filter(s => s.trim())
    });
  };

  const addPlanStep = () => {
    setPlanSteps([...planSteps, ""]);
  };

  const updatePlanStep = (index: number, value: string) => {
    const newSteps = [...planSteps];
    newSteps[index] = value;
    setPlanSteps(newSteps);
  };

  const removePlanStep = (index: number) => {
    if (planSteps.length > 1) {
      setPlanSteps(planSteps.filter((_, i) => i !== index));
    }
  };

  const getAgentIcon = (agentName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      research_deep_agent: <Search className="w-4 h-4 text-blue-400" />,
      development_deep_agent: <Code className="w-4 h-4 text-green-400" />,
      analysis_deep_agent: <Target className="w-4 h-4 text-purple-400" />,
      safe_deep_agent: <CheckCircle className="w-4 h-4 text-orange-400" />
    };
    return iconMap[agentName] || <Brain className="w-4 h-4 text-gray-400" />;
  };

  if (infoLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Deep Agents</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-slate-700 rounded"></div>
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
            <Brain className="w-6 h-6 text-blue-400" />
            Deep Agents
          </h1>
          <p className="text-slate-400 mt-1">
            Advanced AI agents with planning tools, sub-agents, and virtual file systems
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Deep Agent Capabilities
          </CardTitle>
          <CardDescription className="text-slate-400">
            {deepInfo?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deepInfo?.features?.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger 
            value="create" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300"
          >
            Create Agent
          </TabsTrigger>
          <TabsTrigger 
            value="custom"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300"
          >
            Custom Agent
          </TabsTrigger>
          <TabsTrigger 
            value="planning"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Planning
          </TabsTrigger>
          <TabsTrigger 
            value="filesystem"
            className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"
          >
            File System
          </TabsTrigger>
        </TabsList>

        {/* Create Pre-built Deep Agent */}
        <TabsContent value="create" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Create Deep Agent
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose from pre-configured deep agents with specialized capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Available Agents */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">
                  Available Deep Agents
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deepInfo?.available_agents?.map((agent: DeepAgentType) => (
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
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability) => (
                              <Badge 
                                key={capability} 
                                className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                              >
                                {capability}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs">
                                +{agent.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                          {agent.subagents.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Users className="w-3 h-3" />
                              {agent.subagents.length} sub-agents
                            </div>
                          )}
                          {agent.human_in_the_loop && (
                            <div className="flex items-center gap-1 text-xs text-orange-400">
                              <CheckCircle className="w-3 h-3" />
                              Human oversight
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Model
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Custom Instructions (Optional)
                </label>
                <Textarea
                  placeholder="Additional instructions to customize the agent's behavior..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="humanInLoop"
                  checked={humanInLoop}
                  onChange={(e) => setHumanInLoop(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800"
                />
                <label htmlFor="humanInLoop" className="text-sm text-slate-300">
                  Enable human-in-the-loop (requires approval for actions)
                </label>
              </div>

              <Button 
                onClick={handleCreateDeepAgent}
                disabled={!selectedAgent || createDeepAgentMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createDeepAgentMutation.isPending ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Deep Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Custom Deep Agent */}
        <TabsContent value="custom" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-400" />
                Create Custom Deep Agent
              </CardTitle>
              <CardDescription className="text-slate-400">
                Build a custom deep agent with your own configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Agent Name *
                </label>
                <Input
                  placeholder="Enter agent name..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Instructions *
                </label>
                <Textarea
                  placeholder="Detailed instructions for your custom agent..."
                  value={customInstructionsCustom}
                  onChange={(e) => setCustomInstructionsCustom(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Tools * (Select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["ExaTools", "DuckDuckGoTools", "FileTools", "PythonTools"].map((tool) => (
                    <div key={tool} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={tool}
                        checked={selectedTools.includes(tool)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTools([...selectedTools, tool]);
                          } else {
                            setSelectedTools(selectedTools.filter(t => t !== tool));
                          }
                        }}
                        className="rounded border-slate-600 bg-slate-800"
                      />
                      <label htmlFor={tool} className="text-sm text-slate-300">
                        {tool}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Sub-agents (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subagents?.map((subagent: SubAgent) => (
                    <div key={subagent.name} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={subagent.name}
                        checked={selectedSubagents.includes(subagent.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubagents([...selectedSubagents, subagent.name]);
                          } else {
                            setSelectedSubagents(selectedSubagents.filter(s => s !== subagent.name));
                          }
                        }}
                        className="rounded border-slate-600 bg-slate-800"
                      />
                      <div>
                        <label htmlFor={subagent.name} className="text-sm text-slate-300">
                          {subagent.name}
                        </label>
                        <p className="text-xs text-slate-400">{subagent.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateCustomAgent}
                disabled={!customName || !customInstructionsCustom || selectedTools.length === 0 || createCustomDeepAgentMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {createCustomDeepAgentMutation.isPending ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Custom Deep Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planning Tools */}
        <TabsContent value="planning" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-400" />
                Planning Tools
              </CardTitle>
              <CardDescription className="text-slate-400">
                Create structured plans for complex tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Plan Title *
                </label>
                <Input
                  placeholder="Enter plan title..."
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Plan Description *
                </label>
                <Textarea
                  placeholder="Describe the overall goal and approach..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Plan Steps *
                </label>
                <div className="space-y-2">
                  {planSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder={`Step ${index + 1}...`}
                          value={step}
                          onChange={(e) => updatePlanStep(index, e.target.value)}
                          className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                        />
                      </div>
                      {planSteps.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePlanStep(index)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPlanStep}
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Step
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleCreatePlan}
                disabled={!planTitle || !planDescription || planSteps.filter(s => s.trim()).length === 0 || createPlanMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {createPlanMutation.isPending ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Create Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File System */}
        <TabsContent value="filesystem" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-orange-400" />
                Virtual File System
              </CardTitle>
              <CardDescription className="text-slate-400">
                Explore agent file systems and context management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  File System Explorer
                </h3>
                <p className="text-slate-400 mb-4">
                  Create an agent first to explore its virtual file system
                </p>
                <Button variant="outline" className="border-orange-500/30 text-orange-400">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}