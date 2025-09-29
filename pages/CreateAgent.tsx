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
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300 rounded-full"
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-4xl font-bold gradient-text flex items-center animate-pulse">
          Create AI Agent
          <Sparkles className="w-10 h-10 ml-4 text-blue-400 animate-bounce" />
        </h1>
      </div>

      {/* Agent Category Selection */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm vibe-bg rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Choose Agent Type</CardTitle>
          <CardDescription className="text-slate-400">
            Select the type of agent you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={agentCategory} onValueChange={(value: any) => setAgentCategory(value)} className="space-y-4">
            <TabsList className="grid grid-cols-3 bg-slate-700/50 p-1 rounded-xl">
              <TabsTrigger value="regular" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-white rounded-lg py-3">
                <Bot className="w-5 h-5 mr-2" />
                Regular Agent
              </TabsTrigger>
              <TabsTrigger value="specialized" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white rounded-lg py-3">
                <Zap className="w-5 h-5 mr-2" />
                Specialized Agent
              </TabsTrigger>
              <TabsTrigger value="semantic" className="data-[state=active]:bg-pink-500/30 data-[state=active]:text-white rounded-lg py-3">
                <Brain className="w-5 h-5 mr-2" />
                Semantic Agent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular" className="space-y-4">
              <div className="bg-slate-700/50 p-6 rounded-xl vibe-bg">
                <h3 className="text-white font-bold text-xl mb-3">Regular AI Agent</h3>
                <p className="text-slate-300 text-base mb-4">
                  Basic AI agent with customizable instructions and capabilities. Perfect for general-purpose tasks.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-blue-500 text-blue-400 text-base px-3 py-1 rounded-full">Custom Instructions</Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-400 text-base px-3 py-1 rounded-full">Flexible Tools</Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-400 text-base px-3 py-1 rounded-full">General Purpose</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specialized" className="space-y-4">
              <div className="bg-slate-700/50 p-6 rounded-xl vibe-bg">
                <h3 className="text-white font-bold text-xl mb-3">Specialized Agent (DeepCode Integration)</h3>
                <p className="text-slate-300 text-base mb-4">
                  Pre-configured agents with specific roles and capabilities for advanced workflows.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-green-500 text-green-400 text-base px-3 py-1 rounded-full">MCP Integration</Badge>
                  <Badge variant="outline" className="border-green-500 text-green-400 text-base px-3 py-1 rounded-full">Predefined Roles</Badge>
                  <Badge variant="outline" className="border-green-500 text-green-400 text-base px-3 py-1 rounded-full">Workflow Optimized</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="semantic" className="space-y-4">
              <div className="bg-slate-700/50 p-6 rounded-xl vibe-bg">
                <h3 className="text-white font-bold text-xl mb-3">Semantic Agent (Serena Integration)</h3>
                <p className="text-slate-300 text-base mb-4">
                  Advanced code-aware agents with semantic understanding and LSP integration.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-purple-500 text-purple-400 text-base px-3 py-1 rounded-full">LSP Integration</Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-400 text-base px-3 py-1 rounded-full">Symbol-Level Editing</Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-400 text-base px-3 py-1 rounded-full">Code Intelligence</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Agent Configuration Form */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm vibe-bg rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Agent Configuration</CardTitle>
          <CardDescription className="text-slate-400">
            Configure your {agentCategory} agent settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-slate-300 text-lg">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., CodeMaster Pro"
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 text-lg p-6 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="model" className="text-slate-300 text-lg">Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white text-lg p-6 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                  <SelectItem value="gpt-4o" className="text-lg p-3">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4" className="text-lg p-3">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo" className="text-lg p-3">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus" className="text-lg p-3">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet" className="text-lg p-3">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300 text-lg">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your agent will do..."
              rows={4}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 text-lg p-6 rounded-xl"
            />
          </div>

          {/* Agent Type Specific Fields */}
          {agentCategory === 'specialized' && specializedTypes && (
            <div>
              <Label htmlFor="agent_type" className="text-slate-300 text-lg">Specialized Type</Label>
              <Select
                value={formData.agent_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, agent_type: value }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white text-lg p-6 rounded-xl">
                  <SelectValue placeholder="Select specialized type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                  {Object.entries(specializedTypes).map(([type, config]) => (
                    <SelectItem key={type} value={type} className="text-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="capitalize">{type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.agent_type && specializedTypes[formData.agent_type] && (
                <div className="mt-4 p-5 bg-slate-700/50 rounded-xl vibe-bg">
                  <p className="text-slate-300 text-base mb-3">
                    {specializedTypes[formData.agent_type].instructions}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specializedTypes[formData.agent_type].capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-base bg-slate-600 text-slate-300 px-3 py-1 rounded-full">
                        {cap.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {agentCategory === 'semantic' && semanticTypes && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="semantic_type" className="text-slate-300 text-lg">Semantic Type</Label>
                <Select
                  value={formData.agent_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, agent_type: value }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white text-lg p-6 rounded-xl">
                    <SelectValue placeholder="Select semantic type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                    {Object.entries(semanticTypes).map(([type, config]) => (
                      <SelectItem key={type} value={type} className="text-lg p-3">
                        <div className="flex items-center space-x-3">
                          {type === 'semantic_generator' && <Code className="w-5 h-5" />}
                          {type === 'semantic_refactorer' && <RefreshCw className="w-5 h-5" />}
                          {type === 'semantic_analyzer' && <Search className="w-5 h-5" />}
                          <span className="capitalize">{type.replace('semantic_', '')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.agent_type && semanticTypes[formData.agent_type] && (
                  <div className="mt-4 p-5 bg-slate-700/50 rounded-xl vibe-bg">
                    <p className="text-slate-300 text-base mb-3">
                      {semanticTypes[formData.agent_type].instructions}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {semanticTypes[formData.agent_type].semantic_features?.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-base border-purple-500 text-purple-400 px-3 py-1 rounded-full">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="project_path" className="text-slate-300 text-lg">Project Path (Optional)</Label>
                <Input
                  id="project_path"
                  value={formData.project_path}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_path: e.target.value }))}
                  placeholder="/path/to/your/project"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 text-lg p-6 rounded-xl"
                />
                <p className="text-slate-400 text-sm mt-2">
                  Link this agent to a specific codebase for enhanced semantic understanding
                </p>
              </div>
            </div>
          )}

          {agentCategory === 'regular' && (
            <div>
              <Label htmlFor="requirements" className="text-slate-300 text-lg">Instructions</Label>
              <Textarea
                id="requirements"
                value={formData.requirementsText}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementsText: e.target.value }))}
                placeholder="Define the specific instructions, behaviors, and capabilities your agent should have..."
                rows={8}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 text-lg p-6 rounded-xl"
              />
            </div>
          )}

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="temperature" className="text-slate-300 text-lg">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="bg-slate-900/50 border-slate-600 text-white text-lg p-6 rounded-xl"
              />
              <p className="text-slate-400 text-sm mt-2">
                Controls randomness: 0 = focused, 1 = balanced, 2 = creative
              </p>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.agent_type || createAgentMutation.isPending}
              className="btn-vibe shadow-xl hover:shadow-2xl px-8 py-4 text-xl rounded-full"
            >
              {createAgentMutation.isPending ? (
                <>
                  <Zap className="w-6 h-6 mr-3 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-3" />
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