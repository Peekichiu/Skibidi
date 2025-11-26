
import React, { useState, useEffect } from 'react';
import { Activity, ActivityType } from './types';
import { calculatePriority, sortActivities } from './utils/scheduler';
import ActivityForm from './components/ActivityForm';
import ActivityItem from './components/ActivityItem';
import AIAdvisor from './components/AIAdvisor';
import WorkloadChart from './components/WorkloadChart';
import { GraduationCap, Layout, ListFilter, Database } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'high-priority'>('all');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('skibidi_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Recalculate priorities immediately to ensure scores are up-to-date relative to *now*
      const refreshed = parsed.map((a: Activity) => calculatePriority(a));
      setActivities(sortActivities(refreshed));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('skibidi_data', JSON.stringify(activities));
  }, [activities]);

  const handleAddActivity = (newActivity: Omit<Activity, 'id' | 'priorityScore' | 'isOverdue' | 'isToday'>) => {
    const id = uuidv4();
    const activityWithId = { ...newActivity, id };
    
    // Calculate initial priority
    const prioritized = calculatePriority(activityWithId);
    
    setActivities(prev => sortActivities([...prev, prioritized]));
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleLoadDemoData = () => {
    const activityTypes = Object.values(ActivityType);
    const subjects = ['Calculus', 'Physics', 'History', 'Comp Sci', 'Literature', 'Economics'];
    const taskTypes = ['Homework', 'Project', 'Study Session', 'Exam Prep', 'Group Meeting', 'Lab Report'];

    const demoActivities = Array.from({ length: 20 }).map((_, i) => {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const task = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      
      const today = new Date();
      const daysOffset = Math.floor(Math.random() * 14); // Next 2 weeks
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysOffset);
      
      const hour = 9 + Math.floor(Math.random() * 10); // 9 AM - 7 PM
      
      const item = {
        id: uuidv4(),
        name: `${subject} ${task}`,
        type: type,
        date: targetDate.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        durationMinutes: [15, 30, 45, 60, 75, 90, 120][Math.floor(Math.random() * 5)],
        baseScore: Math.floor(Math.random() * 10) + 1
      };

      return calculatePriority(item);
    });

    setActivities(sortActivities(demoActivities));
  };

  // Re-calculate priorities frequently to keep proximity scores accurate
  useEffect(() => {
    // Update every minute (60000ms) so users can see score increases as time passes
    const interval = setInterval(() => {
      setActivities(prev => {
        const updated = prev.map(a => calculatePriority(a));
        return sortActivities(updated);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredActivities = activities.filter(a => {
    if (filter === 'today') return a.isToday;
    if (filter === 'high-priority') return a.priorityScore > 50;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 pb-12 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Skibidi</h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
             <button 
               onClick={handleLoadDemoData}
               className="flex items-center gap-2 hover:text-indigo-400 transition-colors px-3 py-1 rounded-md hover:bg-gray-800"
             >
               <Database className="w-4 h-4" />
               Load Demo Data
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & AI */}
          <div className="space-y-8 lg:col-span-5">
            <ActivityForm onAdd={handleAddActivity} existingActivities={activities} />
            <WorkloadChart activities={activities} />
            <AIAdvisor activities={activities} />
          </div>

          {/* Right Column: Schedule List */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Layout className="w-6 h-6 text-gray-400" />
                Your Priorities
              </h2>
              
              <div className="flex bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-1">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-indigo-900/50 text-indigo-300' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('today')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'today' ? 'bg-indigo-900/50 text-indigo-300' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setFilter('high-priority')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'high-priority' ? 'bg-indigo-900/50 text-indigo-300' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  High Priority
                </button>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-xl border border-dashed border-gray-800">
                <div className="mx-auto w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <ListFilter className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white">No activities found</h3>
                <p className="text-gray-400 mt-1">Adjust filters or add a new activity to get started.</p>
                <button 
                  onClick={handleLoadDemoData}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium underline"
                >
                  Generate Demo Schedule
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredActivities.map(activity => (
                  <ActivityItem 
                    key={activity.id} 
                    activity={activity} 
                    onDelete={handleDeleteActivity} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
