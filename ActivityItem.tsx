import React from 'react';
import { Activity, ActivityType } from '../types';
import { Clock, Calendar, BarChart2, Trash2 } from 'lucide-react';

interface ActivityItemProps {
  activity: Activity;
  onDelete: (id: string) => void;
}

const getTypeColor = (type: ActivityType) => {
  switch (type) {
    case ActivityType.FINAL: return 'bg-red-900/40 text-red-300 border-red-800/50';
    case ActivityType.MIDTERM: return 'bg-orange-900/40 text-orange-300 border-orange-800/50';
    case ActivityType.WORKSHOP: return 'bg-blue-900/40 text-blue-300 border-blue-800/50';
    case ActivityType.CLUB: return 'bg-green-900/40 text-green-300 border-green-800/50';
    case ActivityType.PERSONAL: return 'bg-purple-900/40 text-purple-300 border-purple-800/50';
    default: return 'bg-gray-800 text-gray-300 border-gray-700';
  }
};

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onDelete }) => {
  return (
    <div className={`p-4 rounded-lg border shadow-sm transition-all hover:shadow-md bg-gray-900 relative group
      ${activity.isToday ? 'ring-2 ring-indigo-500/50 border-indigo-500/50' : 'border-gray-800'}
    `}>
      {activity.isToday && (
        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-sm z-10">
          Today
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getTypeColor(activity.type)}`}>
            {activity.type}
          </span>
          <h4 className="font-bold text-white mt-2 text-lg leading-tight">{activity.name}</h4>
        </div>
        <div className="text-right">
           <div className="text-2xl font-bold text-indigo-500 opacity-40 group-hover:opacity-100 transition-opacity">
              {Math.round(activity.priorityScore)}
           </div>
           <span className="text-xs text-gray-500">Priority</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mt-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{activity.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{activity.time} ({activity.durationMinutes}m)</span>
        </div>
        <div className="flex items-center gap-1 col-span-2">
          <BarChart2 className="w-4 h-4 text-gray-500" />
          <span>Importance: {activity.baseScore}/10</span>
        </div>
      </div>

      <button 
        onClick={() => onDelete(activity.id)}
        className="absolute bottom-2 right-2 p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ActivityItem;