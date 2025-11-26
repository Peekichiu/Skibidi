import React, { useState } from 'react';
import { Activity, ActivityType } from '../types';
import { checkOverlap } from '../utils/scheduler';
import { PlusCircle, AlertTriangle } from 'lucide-react';

interface ActivityFormProps {
  onAdd: (activity: Omit<Activity, 'id' | 'priorityScore' | 'isOverdue' | 'isToday'>) => void;
  existingActivities: Activity[];
}

// Define fixed ranges for each activity type
const SCORE_RANGES: Record<ActivityType, { min: number; max: number; default: number; label: string }> = {
  [ActivityType.FINAL]: { min: 8, max: 10, default: 10, label: "Critical (8-10)" },
  [ActivityType.MIDTERM]: { min: 6, max: 9, default: 8, label: "High (6-9)" },
  [ActivityType.WORKSHOP]: { min: 3, max: 7, default: 5, label: "Medium (3-7)" },
  [ActivityType.CLUB]: { min: 1, max: 10, default: 5, label: "Flexible (1-10)" },
  [ActivityType.PERSONAL]: { min: 1, max: 10, default: 5, label: "Flexible (1-10)" },
  [ActivityType.OTHER]: { min: 1, max: 10, default: 5, label: "Flexible (1-10)" },
};

// Generate duration options: 15 min to 6 hours
const DURATION_OPTIONS = Array.from({ length: 24 }, (_, i) => (i + 1) * 15);

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${h} hr${h > 1 ? 's' : ''} ${m} min`;
};

const ActivityForm: React.FC<ActivityFormProps> = ({ onAdd, existingActivities }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ActivityType>(ActivityType.OTHER);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  // Initialize score based on default type
  const [score, setScore] = useState(SCORE_RANGES[ActivityType.OTHER].default);
  const [error, setError] = useState<string | null>(null);

  const currentRange = SCORE_RANGES[type];

  const handleTypeChange = (newType: ActivityType) => {
    setType(newType);
    // Automatically reset score to the default of the new type to ensure it's valid
    setScore(SCORE_RANGES[newType].default);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !date || !time) {
      setError("Please fill in all required fields.");
      return;
    }

    const newActivity = {
      name,
      type,
      date,
      time,
      durationMinutes: duration,
      baseScore: score
    };

    if (checkOverlap(newActivity, existingActivities)) {
      setError("This activity overlaps with an existing schedule item!");
      return;
    }

    onAdd(newActivity);
    
    // Reset form
    setName('');
    // Reset score to the default of the currently selected type
    setScore(SCORE_RANGES[type].default);
    setTime(''); 
    setDuration(60);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-indigo-500" />
        Add Activity
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Activity Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            placeholder="e.g., Calc 101 Final"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ActivityType)}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.values(ActivityType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Importance <span className="text-xs text-gray-500 font-normal">({currentRange.label})</span>
            </label>
            <input
              type="number"
              min={currentRange.min}
              max={currentRange.max}
              value={score}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setScore(val);
              }}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DURATION_OPTIONS.map((mins) => (
              <option key={mins} value={mins}>
                {formatDuration(mins)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800/50 text-red-400 p-3 rounded-md text-sm flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm active:transform active:scale-95"
        >
          Add to Schedule
        </button>
      </form>
    </div>
  );
};

export default ActivityForm;