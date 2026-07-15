import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Target, Settings, HelpCircle, Layers, FileText, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Card, CardContent } from '../components/common/Card';

const LandingPage = () => {
  const [goal, setGoal] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState(0);
  const navigate = useNavigate();

  const planningSteps = [
    'Analyzing goal semantic structure...',
    'Fetching regulatory knowledge bases...',
    'Resolving cross-department dependencies...',
    'Constructing administrative workflow DAG...',
    'Finalizing personalized journey...'
  ];

  const getApiUrl = (path) => {
    const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'http://localhost:5000';
    return `${base}${path}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsPlanning(true);
    setPlanningStep(0);
    
    // Smooth loader state progression in parallel with API call
    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, planningSteps.length - 2);
      setPlanningStep(step);
    }, 700);

    try {
      const response = await fetch(getApiUrl('/api/journeys'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goal: goal.strip ? goal.strip() : goal.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to create journey pipeline on backend.');
      }

      const data = await response.json();
      
      clearInterval(interval);
      setPlanningStep(planningSteps.length - 1); // Mark as done
      
      setTimeout(() => {
        navigate('/journeys', { state: { journeyId: data.journey.id, goal: data.journey.goal_text } });
      }, 500);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      alert(err.message || 'An error occurred while communicating with the server.');
      setIsPlanning(false);
    }
  };

  const setSuggestedGoal = (suggested) => {
    setGoal(suggested);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="space-y-24 py-6 md:py-12">
      {/* 1. Hero & Goal Input Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto space-y-8"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-xs font-semibold">
            <Sparkles size={14} />
            <span>AI-Powered Administrative Planning</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-emerald-850 to-teal-700 dark:from-zinc-100 dark:via-emerald-400 dark:to-teal-500 bg-clip-text text-transparent leading-none">
            From Goals to Government
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            JanSaarthi transforms your entrepreneurial aspirations into a clear, step-by-step journey through regulatory requirements. We translate bureaucratic red tape into a simple workflow.
          </p>
        </motion.div>

        {/* Goal Input form card */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!isPlanning ? (
              <motion.div
                key="input-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card variant="glass" className="p-2">
                  <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                      <Input
                        placeholder="I want to start a small bakery..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="flex-1 focus:ring-emerald-500"
                        leftIcon={<Target size={18} />}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        rightIcon={<ArrowRight size={16} />}
                        disabled={!goal.trim()}
                      >
                        Plan Journey
                      </Button>
                    </form>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
                      <span>Try suggesting:</span>
                      <button
                        onClick={() => setSuggestedGoal('Start a small bakery')}
                        className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-600 dark:text-zinc-450 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-emerald-500/5 dark:hover:text-emerald-400 transition-colors font-medium"
                      >
                        Start a small bakery
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="planning-loader"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card variant="default" className="border-emerald-500/20 dark:border-emerald-500/10">
                  <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
                    {/* Spinning loader */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
                      <Sparkles className="text-emerald-500" size={24} />
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-200">
                        Planning Administrative Path
                      </h3>
                      {/* Active step message */}
                      <p className="text-sm text-emerald-650 dark:text-emerald-450 font-medium animate-pulse">
                        {planningSteps[planningStep]}
                      </p>
                    </div>

                    {/* Progress tracking dots */}
                    <div className="flex gap-2 justify-center">
                      {planningSteps.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                            i <= planningStep ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      {/* 2. How It Works Section */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">How It Works</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Three simple layers that bridge goals to government processes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Input Plain Goal',
              description: 'Enter your target objective, like starting a food business or setting up a local storefront.',
              icon: Target,
            },
            {
              step: '02',
              title: 'Dependency Resolution',
              description: 'Our engine identifies department rules, resolving which permissions you need first.',
              icon: Layers,
            },
            {
              step: '03',
              title: 'Actionable Workflow',
              description: 'Access a visual, chronological checklist complete with required document forms and timelines.',
              icon: FileText,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} variant="default" className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-emerald-500/10 dark:text-emerald-500/5">{item.step}</span>
                    <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500">
                      <Icon size={24} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{item.title}</h3>
                  <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Key Features Section */}
      <section className="space-y-12 bg-zinc-100/50 dark:bg-zinc-900/10 -mx-4 px-4 py-12 rounded-3xl border border-zinc-200/40 dark:border-zinc-800/40">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Engineered for Frictionless Setup</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            JanSaarthi focuses on structure, dependencies, and actionable steps, not chat loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: 'Directed Acyclic Graphs (DAG)',
              description: 'We represent administrative rules as a topological dependency graph. You never waste time trying to apply for a permit that requires an unobtained license.',
            },
            {
              title: 'Cross-Department Sync',
              description: 'One cohesive timeline containing steps across Municipality, Health, Fire Service, and Tax departments.',
            },
            {
              title: 'Declarative Knowledge Rules',
              description: 'Driven by strict knowledge template schemas, mapping specific compliance steps based on localized regulations.',
            },
            {
              title: 'Semantic Goal Context',
              description: 'LLM reasoning maps your plain language words to standardized administrative processes and templates.',
            },
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-4 items-start p-2">
              <div className="p-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500 shrink-0 mt-0.5">
                <CheckCircle size={18} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-zinc-850 dark:text-zinc-150 text-base">{feature.title}</h3>
                <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Call To Action (CTA) Section */}
      <section className="relative rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 md:p-12 overflow-hidden shadow-xl shadow-emerald-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="relative max-w-2xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Ready to Plan Your Business Journey?
          </h2>
          <p className="text-emerald-50 text-sm md:text-base leading-relaxed">
            Specify your business goals and start resolving regulatory requirements instantly. Start with our "Small Bakery" module today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setSuggestedGoal('Start a small bakery')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/25 text-white"
            >
              Suggest "Small Bakery"
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
