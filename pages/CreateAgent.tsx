import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bot, FileText, Globe, Sparkles, Zap, Brain, Code, Search, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function CreateAgent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agentCategory, setAgentCategory] = useState<'regular' | 'specialized' | 'semantic'>('specialized');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    agent_type: "",
    templateId: "",
    requirementsText: "",
    scrapeUrl: "",
    model: "gpt-4o",
    temperature: 0.7,
    project_path: "",
    mcp_servers: [] as string[],
  });

  const { data: templatesData } = useQuery({
    queryKey: ["templates"],
    queryFn: () => apiClient.listTemplates(),
  });

  const { data: specializedTypes } = useQuery({
    queryKey: ["specialized-agent-types"],
    queryFn: () => apiClient.getSpecializedAgentTypes(),
    enabled: agentCategory === 'specialized',
  });

  const { data: semanticTypes } = useQuery({
    queryKey: ["semantic-agent-types"],
    queryFn: () => apiClient.getSemanticAgentTypes(),
    enabled: agentCategory === 'semantic',
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (agentCategory === 'semantic') {
        return apiClient.createSemanticAgent({
          name: data.name,
          agent_type: data.agent_type as 'semantic_generator' | 'semantic_refactorer' | 'semantic_analyzer',
          description: data.description,
          model: data.model,
          temperature: data.temperature,
          project_path: data.project_path || undefined,
        });
      } else if (agentCategory === 'specialized') {
        return apiClient.createSpecializedAgent({
          name: data.name,
          agent_type: data.agent_type,
          description: data.description,
          model: data.model,
          temperature: data.temperature,
          mcp_servers: data.mcp_servers,
        });
      } else {
        return apiClient.createAgent({
          name: data.name,
          description: data.description,
          instructions: data.requirementsText || `You are ${data.name}, ${data.description}`,
          tools: [],
          model: data.model,
          temperature: data.temperature,
        });
      }
    },
    onSuccess: (response) => {
      toast({
        title: "Agent created successfully",
        description: `${response.name} has been created and is ready for use.`,
      });
      navigate(`/agents/${response.id}`);
    },
    onError: (error) => {
      console.error("Failed to create agent:", error);
      toast({
        title: "Failed to create agent",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: (url: string) => apiClient.startCrawl({ url, formats: ["markdown"] }),
    onSuccess: (response: any) => {
      setFormData(prev => ({
        ...prev,
        requirementsText: response.data?.markdown || "",
      }));
      setStep(3);
      toast({
        title: "Website scraped successfully",
        description: "Content has been extracted and added to your requirements.",
      });
    },
    onError: (error) => {
      console.error("Failed to scrape website:", error);
      toast({
        title: "Failed to scrape website",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your agent.",
        variant: "destructive",
      });
      return;
    }

    createAgentMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type || "general",
      templateId: formData.templateId ? parseInt(formData.templateId) : undefined,
      requirementsText: formData.requirementsText || undefined,
    });
  };

  const handleScrape = () => {
    if (!formData.scrapeUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please provide a URL to scrape.",
        variant: "destructive",
      });
      return;
    }

    scrapeMutation.mutate(formData.scrapeUrl);
  };

  const templates = templatesData || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")} 
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center">
          Create AI Agent
          <Sparkles className="w-8 h-8 ml-3 text-blue-400 animate-pulse" />
        </h1>
      </div>

      {/* Agent Category Selection */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Choose Agent Type</CardTitle>
          <CardDescription className="text-slate-400">
            Select the type of agent you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={agentCategory} onValueChange={(value: any) => setAgentCategory(value)} className="space-y-4">
            <TabsList className="grid grid-cols-3 bg-slate-700">
              <TabsTrigger value="regular" className="data-[state=active]:bg-slate-600">
                <Bot className="w-4 h-4 mr-2" />
                Regular Agent
              </TabsTrigger>
              <TabsTrigger value="specialized" className="data-[state=active]:bg-slate-600">
                <Zap className="w-4 h-4 mr-2" />
                Specialized Agent
              </TabsTrigger>
              <TabsTrigger value="semantic" className="data-[state=active]:bg-slate-600">
                <Brain className="w-4 h-4 mr-2" />
                Semantic Agent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular" className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Regular AI Agent</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Basic AI agent with customizable instructions and capabilities. Perfect for general-purpose tasks.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-400">Custom Instructions</Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">Flexible Tools</Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">General Purpose</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specialized" className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Specialized Agent (DeepCode Integration)</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Pre-configured agents with specific roles and capabilities for advanced workflows.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-green-500 text-green-400">MCP Integration</Badge>
                  <Badge variant="outline" className="border-green-500 text-green-400">Predefined Roles</Badge>
                  <Badge variant="outline" className="border-green-500 text-green-400">Workflow Optimized</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="semantic" className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Semantic Agent (Serena Integration)</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Advanced code-aware agents with semantic understanding and LSP integration.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-purple-500 text-purple-400">LSP Integration</Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">Symbol-Level Editing</Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">Code Intelligence</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Agent Configuration Form */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Agent Configuration</CardTitle>
          <CardDescription className="text-slate-400">
            Configure your {agentCategory} agent settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., CodeMaster Pro"
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="model" className="text-slate-300">Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your agent will do..."
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          {/* Agent Type Specific Fields */}
          {agentCategory === 'specialized' && specializedTypes && (
            <div>
              <Label htmlFor="agent_type" className="text-slate-300">Specialized Type</Label>
              <Select
                value={formData.agent_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, agent_type: value }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select specialized type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Object.entries(specializedTypes).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.agent_type && specializedTypes[formData.agent_type] && (
                <div className="mt-2 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-300 text-sm mb-2">
                    {specializedTypes[formData.agent_type].instructions}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {specializedTypes[formData.agent_type].capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                        {cap.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {agentCategory === 'semantic' && semanticTypes && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="semantic_type" className="text-slate-300">Semantic Type</Label>
                <Select
                  value={formData.agent_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, agent_type: value }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select semantic type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {Object.entries(semanticTypes).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-2">
                          {type === 'semantic_generator' && <Code className="w-4 h-4" />}
                          {type === 'semantic_refactorer' && <RefreshCw className="w-4 h-4" />}
                          {type === 'semantic_analyzer' && <Search className="w-4 h-4" />}
                          <span className="capitalize">{type.replace('semantic_', '')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.agent_type && semanticTypes[formData.agent_type] && (
                  <div className="mt-2 p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-300 text-sm mb-2">
                      {semanticTypes[formData.agent_type].instructions}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {semanticTypes[formData.agent_type].semantic_features?.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs border-purple-500 text-purple-400">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="project_path" className="text-slate-300">Project Path (Optional)</Label>
                <Input
                  id="project_path"
                  value={formData.project_path}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_path: e.target.value }))}
                  placeholder="/path/to/your/project"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                />
                <p className="text-slate-400 text-xs mt-1">
                  Link this agent to a specific codebase for enhanced semantic understanding
                </p>
              </div>
            </div>
          )}

          {agentCategory === 'regular' && (
            <div>
              <Label htmlFor="requirements" className="text-slate-300">Instructions</Label>
              <Textarea
                id="requirements"
                value={formData.requirementsText}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementsText: e.target.value }))}
                placeholder="Define the specific instructions, behaviors, and capabilities your agent should have..."
                rows={6}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>
          )}

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature" className="text-slate-300">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <p className="text-slate-400 text-xs mt-1">
                Controls randomness: 0 = focused, 1 = balanced, 2 = creative
              </p>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.agent_type || createAgentMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
            >
              {createAgentMutation.isPending ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Agent
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
