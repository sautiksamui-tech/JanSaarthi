import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Shield, CheckCircle, Clock, Lock, ArrowRight, Play, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Timeline, TimelineItem } from '../components/common/Timeline';

const JourneyDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get journey ID from router state, fallback to localStorage
  const [journeyId, setJourneyId] = useState(() => {
    return location.state?.journeyId || localStorage.getItem('lastJourneyId') || null;
  });

  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStepId, setActiveStepId] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !journeyId) return;

    const query = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { sender: 'user', text: query }]);
    setChatLoading(true);

    const getApiUrl = (path) => {
      const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'http://localhost:5000';
      return `${base}${path}`;
    };

    try {
      const response = await fetch(getApiUrl(`/api/journeys/${journeyId}/chat`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          step_id: activeStepId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI reply.');
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: `Chat error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Synchronize journey ID to local storage when it arrives
  useEffect(() => {
    if (location.state?.journeyId) {
      localStorage.setItem('lastJourneyId', location.state.journeyId);
      setJourneyId(location.state.journeyId);
    }
  }, [location.state?.journeyId]);

  // Fetch journey plan on load
  useEffect(() => {
    if (!journeyId) {
      setLoading(false);
      return;
    }

    const fetchJourney = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(getApiUrl(`/api/journeys/${journeyId}`));
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Active journey plan not found. It may have been deleted or expired.');
          }
          throw new Error('Failed to load the administrative journey plan.');
        }
        const data = await response.json();
        setJourneyData(data);
        
        // Auto-select the first actionable step
        const nextPending = data.journey.steps.find(s => s.status === 'PENDING') || data.journey.steps[0];
        if (nextPending) {
          setActiveStepId(nextPending.id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [journeyId]);

  // Submit step completion to the backend planner API
  const handleCompleteStep = async (stepId) => {
    if (!journeyId) return;

    try {
      const response = await fetch(getApiUrl(`/api/journeys/${journeyId}/steps/${stepId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (!response.ok) {
        throw new Error('Failed to update compliance task status on server.');
      }

      const data = await response.json();
      setJourneyData(data);

      // Transition active focus to the next unlocked step
      const completedStep = data.journey.steps.find(s => s.id === stepId);
      const nextPending = data.journey.steps.find(s => s.status === 'PENDING');
      if (nextPending) {
        setActiveStepId(nextPending.id);
      }
    } catch (err) {
      alert(err.message || 'An error occurred while updating the status.');
    }
  };

  const toggleDoc = (docName) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const getBadgeVariant = (status) => {
    if (status === 'COMPLETED') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'IN_PROGRESS') return 'info';
    return 'locked';
  };

  // 1. Loading State Screen
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-sm text-zinc-550 dark:text-zinc-400 font-medium">
          Loading your administrative journey map...
        </p>
      </div>
    );
  }

  // 2. Error State Screen
  if (error) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card variant="default" className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="text-rose-500 mx-auto" size={36} />
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Error Loading Journey</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              {error}
            </p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Return to Planner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Empty State Screen
  if (!journeyId || !journeyData) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card variant="default" className="border-zinc-300 dark:border-zinc-800">
          <CardContent className="p-8 text-center space-y-4">
            <Compass className="text-zinc-400 mx-auto" size={36} />
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No Active Journey Found</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              You haven't defined a goal journey yet. Tell JanSaarthi your business goal to generate a step-by-step roadmap.
            </p>
            <Button onClick={() => navigate('/')} variant="primary" className="w-full">
              Create New Journey Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract variables from backend payload
  const { journey, health, next_best_action: nextBestAction } = journeyData;
  const steps = journey.steps;
  const activeStep = steps.find(s => s.id === activeStepId) || steps[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Compass size={18} className="text-emerald-500" />
            <span className="text-sm font-semibold uppercase tracking-wider">Active Journey Plan</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {journey.goal_text}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Personalized topological timeline mapping municipal, food safety, and trade certifications.
          </p>
        </div>

        {/* Journey Progress and Health Indicators */}
        <div className="w-full md:w-80 space-y-4">
          <ProgressBar value={health.progress_percentage} showLabel={true} />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex flex-col gap-0.5 shadow-sm">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">System Health</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2.5 h-2.5 rounded-full ${health.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={`text-xs font-bold ${health.status === 'healthy' ? 'text-emerald-605 dark:text-emerald-400' : 'text-amber-600'}`}>
                  {health.status === 'healthy' ? 'Optimal' : 'Stalled'}
                </span>
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex flex-col gap-0.5 shadow-sm">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Prerequisites Met</span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {health.completed_steps} / {health.total_steps} Steps
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Best Action Callout */}
      {nextBestAction ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5">
              <Play size={18} className="fill-current" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Next Best Action
              </span>
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm sm:text-base">
                Execute: {nextBestAction.title}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                Prerequisites satisfied. Begin document checklist compilation to submit this application.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setActiveStepId(nextBestAction.id)}
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight size={14} />}
            className="self-stretch sm:self-center shrink-0"
          >
            Start Task
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center space-y-3"
        >
          <CheckCircle size={32} className="text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Journey Fully Resolved!</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Congratulations, all required administrative steps to start your business have been successfully completed.
          </p>
        </motion.div>
      )}

      {/* Main Timeline + Details Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Timeline list */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="default">
            <CardHeader>
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Compass size={18} className="text-zinc-400" />
                Workflow DAG Timeline
              </h2>
            </CardHeader>
            <CardContent className="p-8">
              <Timeline>
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    className="cursor-pointer"
                  >
                    <TimelineItem
                      title={step.title}
                      department={step.authority}
                      status={step.status.toLowerCase()}
                      index={idx}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        activeStepId === step.id
                          ? 'bg-zinc-100/70 dark:bg-zinc-900/50 shadow-sm border border-zinc-200/40 dark:border-zinc-800/40'
                          : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10'
                      }`}
                    >
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {step.description.substring(0, 80)}...
                      </p>
                    </TimelineItem>
                  </div>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Task Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {activeStep && (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="sticky top-24 animate-fade-in"
              >
                <Card variant="default" className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                          Active Step Details
                        </span>
                        <Badge variant={getBadgeVariant(activeStep.status)}>
                          {activeStep.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                        {activeStep.title}
                      </h3>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Metadata Row */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-zinc-800/20">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase mb-0.5">Authority</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 break-words">{activeStep.authority}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-zinc-800/20">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase mb-0.5">Est. Timeline</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activeStep.estimated_time} Days</span>
                      </div>
                    </div>

                    {/* Task Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-wider">
                        Requirement Description
                      </h4>
                      <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
                        {activeStep.description}
                      </p>
                    </div>

                    {/* Dependency list */}
                    {activeStep.dependencies && activeStep.dependencies.length > 0 && (
                      <div className="p-3 rounded-xl bg-zinc-100/20 dark:bg-zinc-900/10 border border-zinc-200/30 dark:border-zinc-800/50 space-y-2">
                        <span className="text-[10px] text-zinc-450 dark:text-zinc-550 font-bold block uppercase tracking-wider">
                          DAG Prerequisites
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {activeStep.dependencies.map(depId => {
                            const dep = steps.find(s => s.id === depId);
                            return dep ? (
                              <div key={depId} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-600 dark:text-zinc-400">{dep.title}</span>
                                <Badge variant={getBadgeVariant(dep.status)} size="sm">
                                  {dep.status}
                                </Badge>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Required Documents Checklists */}
                    {activeStep.documents && activeStep.documents.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-wider flex items-center justify-between">
                          <span>Required Papers Checklist</span>
                          <span className="text-[10px] text-zinc-400 normal-case font-normal">Check items to compile</span>
                        </h4>
                        <div className="space-y-2.5">
                          {activeStep.documents.map((doc, idx) => (
                            <label
                              key={idx}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                                checkedDocs[doc]
                                  ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-800 dark:text-zinc-200'
                                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!checkedDocs[doc]}
                                onChange={() => toggleDoc(doc)}
                                className="w-4 h-4 rounded text-emerald-600 border-zinc-350 focus:ring-emerald-500 mt-0.5"
                              />
                              <span className="leading-tight">{doc}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  {/* Card Footer action button */}
                  <CardFooter className="flex justify-end gap-3">
                    {activeStep.status === 'LOCKED' ? (
                      <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/40 text-xs text-zinc-450 dark:text-zinc-550 border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Lock size={14} className="shrink-0" />
                        <span>Unlock this step by completing all prerequisites first.</span>
                      </div>
                    ) : activeStep.status === 'COMPLETED' ? (
                      <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-450 border border-emerald-500/10">
                        <CheckCircle size={14} className="shrink-0" />
                        <span>This requirement is already completed.</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleCompleteStep(activeStep.id)}
                        variant="primary"
                        className="w-full"
                        rightIcon={<CheckCircle size={16} />}
                      >
                        Mark Requirement Met
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Compliance Chat Assistant Card */}
          <Card variant="default" className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="py-3 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/20 dark:bg-zinc-900/10">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Compliance Assistant
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Chat Scrollbox */}
              <div className="h-44 overflow-y-auto space-y-3 pr-1 text-xs border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl p-3 scrollbar-thin">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-center px-4 leading-normal">
                    Have questions about {activeStep ? `"${activeStep.title}"` : "this step"}? Ask me anything about fees, documents, or online portals!
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-2.5 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'ml-auto bg-emerald-500 text-white rounded-br-none shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <span className="font-semibold text-[9px] uppercase tracking-wider mb-0.5 opacity-60">
                        {msg.sender === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex flex-col max-w-[85%] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl p-2.5 rounded-bl-none animate-pulse border border-zinc-200 dark:border-zinc-700">
                    <span className="font-semibold text-[9px] uppercase tracking-wider mb-0.5 opacity-60">
                      Assistant
                    </span>
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input Row */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask a question about ${activeStep ? activeStep.title : "this step"}...`}
                  disabled={chatLoading}
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-60"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-3"
                >
                  Ask
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default JourneyDashboard;
