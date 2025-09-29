import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export default function CreateTeamAgent() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    requirementsText: ''
  });

  const { data: templatesData } = useQuery({
    queryKey: ["templates"],
    queryFn: () => apiClient.listTemplates(),
  });

  const createTeamAgentMutation = useMutation({
    mutationFn: (data: any) => apiClient.createTeam(data),
    onSuccess: (response: any) => {
      toast({
        title: "Team agents created successfully",
        description: `A team of 15 specialized agents has been created with roles: 1 Product Manager, 1 Frontend Team Lead, 1 Backend Team Lead, 2 Architects, and 10 Developers. The team is ready for configuration and deployment.`,
      });
      navigate(`/team/${response.id || 'team-1'}`);
    },
    onError: (error) => {
      console.error("Failed to create team agents:", error);
      toast({
        title: "Failed to create team agents",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your agent team.",
        variant: "destructive",
      });
      return;
    }

    createTeamAgentMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      templateId: formData.templateId ? parseInt(formData.templateId) : undefined,
      requirementsText: formData.requirementsText || undefined,
    });
  };

  const templates = Array.isArray(templatesData) ? templatesData : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")} 
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
          data-testid="back-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center">
          Create AI Agent Team
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 ml-3 text-blue-400 animate-pulse">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-blue-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Team Agent Details
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Provide basic information about your AI agent team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-300">Team Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Web Development Team"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what your agent team will do..."
                    rows={3}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="template" className="text-slate-300">Template (Optional)</Label>
                  <Select
                    value={formData.templateId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
                  >
                    <SelectTrigger id="template" className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 transition-all duration-300">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.length > 0 ? (
                        templates.map((template: any) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-templates" disabled>
                          No templates available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-slate-400">Select a template to pre-configure your agent team</p>
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-slate-300">Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirementsText}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirementsText: e.target.value }))}
                    placeholder="Describe the requirements for your agent team..."
                    rows={5}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 transition-all duration-300"
                  />
                  <p className="mt-1 text-sm text-slate-400">These requirements will be used to configure all agents in the team</p>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={() => setStep(2)} variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300">
                    Next
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createTeamAgentMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                  >
                    {createTeamAgentMutation.isPending ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 animate-spin">
                          <path d="M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9m9 9a9 9 0 0 0 9-9M15 3a9 9 0 0 0-9 9"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                          <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                        </svg>
                        Create Agent Team
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-green-400">
                    <path d="M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9m9 9a9 9 0 0 0 9-9M15 3a9 9 0 0 0-9 9"></path>
                  </svg>
                  Team Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your team of 15 specialized agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3">Team Structure</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">1</span>
                      <span className="text-slate-300">Product Manager</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">1</span>
                      <span className="text-slate-300">Frontend Team Lead</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">1</span>
                      <span className="text-slate-300">Backend Team Lead</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">2</span>
                      <span className="text-slate-300">Architects (1 Frontend, 1 Backend)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">10</span>
                      <span className="text-slate-300">Developers</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3">Team Capabilities</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Full Stack Web Development</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Architecture Design</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Project Management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Code Generation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Code Review</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Testing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Deployment</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Debugging</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Performance Optimization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Security</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Integration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Database</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fuchsia-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">API Design</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">User Experience</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400">
                        <path d="M12 20v-6M6 18l4-2M18 18l-4-2M6 14l6-4 6 4-4 2v6"></path>
                      </svg>
                      <span className="text-slate-300">Research</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3">EXA Tool Integration</h3>
                  <p className="text-slate-400 mb-3">Your agent team has built-in integration with EXA tool for web search capabilities.</p>
                  <div className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                      <path d="M20 10h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z"></path>
                      <path d="M4 10h-0a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h0"></path>
                      <path d="M14 8v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2z"></path>
                      <path d="M6 8v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2z"></path>
                    </svg>
                    <div>
                      <p className="text-slate-300 font-medium">Web Search Capabilities</p>
                      <p className="text-slate-400 text-sm">Each agent can search the web to gather information and insights</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={() => setStep(1)} variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createTeamAgentMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                  >
                    {createTeamAgentMutation.isPending ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 animate-spin">
                          <path d="M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9m9 9a9 9 0 0 0 9-9M3 12a9 9 0 0 0 9 9"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                          <path d="M20 10h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z"></path>
                          <path d="M4 10h-0a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h0"></path>
                          <path d="M14 8v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2z"></path>
                          <path d="M6 8v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2z"></path>
                        </svg>
                        <span>Create Team of 15 Agents</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg text-white">Creation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`flex items-center space-x-3 transition-all duration-300 ${step >= 1 ? "text-blue-400" : "text-slate-500"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${step >= 1 ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "bg-slate-700 text-slate-400"}`}>
                    1
                  </div>
                  <span className="text-sm">Team Details</span>
                </div>
                <div className={`flex items-center space-x-3 transition-all duration-300 ${step >= 2 ? "text-green-400" : "text-slate-500"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${step >= 2 ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg" : "bg-slate-700 text-slate-400"}`}>
                    2
                  </div>
                  <span className="text-sm">Team Configuration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}