import { Activity, ActivityType } from '../types';

// Internal helpers to replace date-fns and avoid import errors
const parseISO = (dateStr: string): Date => {
  // If it contains T, it is YYYY-MM-DDTHH:mm, which new Date() parses as local.
  if (dateStr.includes('T')) return new Date(dateStr);
  // If it is YYYY-MM-DD, new Date() parses as UTC. We want local midnight.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addMinutes = (date: Date, amount: number): Date => {
  return new Date(date.getTime() + amount * 60000);
};

const isBefore = (date: Date, dateToCompare: Date): boolean => {
  return date.getTime() < dateToCompare.getTime();
};

const isSameDay = (dateLeft: Date, dateRight: Date): boolean => {
  const d1 = startOfDay(dateLeft);
  const d2 = startOfDay(dateRight);
  return d1.getTime() === d2.getTime();
};

const format = (date: Date, formatStr: string): string => {
  if (formatStr === 'MMM dd') {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }
  return date.toLocaleDateString();
};

export const calculatePriority = (activity: Omit<Activity, 'priorityScore' | 'isOverdue' | 'isToday'>): Activity => {
  const now = new Date();
  const todayStart = startOfDay(now);
  
  // For isToday, check strictly the date part
  const activityDateOnly = parseISO(activity.date);
  const isToday = isSameDay(activityDateOnly, todayStart);
  
  // For priority calculation, use full date and time for precision
  // Construct explicitly to ensure local time interpretation
  const [year, month, day] = activity.date.split('-').map(Number);
  const [hours, minutes] = activity.time.split(':').map(Number);
  const activityDateTime = new Date(year, month - 1, day, hours, minutes);
  
  // Calculate difference in floating point days
  const msDiff = activityDateTime.getTime() - now.getTime();
  const daysUntilFloat = msDiff / (1000 * 60 * 60 * 24);
  
  // Type weighting (Academic is generally higher priority for students)
  let typeWeight = 1;
  switch(activity.type) {
    case ActivityType.FINAL: typeWeight = 1.5; break;
    case ActivityType.MIDTERM: typeWeight = 1.4; break;
    case ActivityType.WORKSHOP: typeWeight = 1.1; break;
    default: typeWeight = 1;
  }

  // Time Urgency Component
  // Increases score as the deadline approaches with high precision.
  let timeComponent = 0;

  // Feature: Do not increase workshop score based on proximity.
  if (activity.type !== ActivityType.WORKSHOP) {
    if (daysUntilFloat < 0) {
       // Overdue items keep max urgency so they don't get buried
       timeComponent = 50;
    } else {
       // Formula: 50 / (daysUntil + 1).
       // Using float allows score to increase hourly as daysUntilFloat approaches 0.
       timeComponent = 50 / (daysUntilFloat + 1);
    }
  }

  // Calculate Priority Score
  const priorityScore = (activity.baseScore * typeWeight * 5) + timeComponent;

  return {
    ...activity,
    priorityScore,
    // Strictly overdue if current time is past activity time
    isOverdue: daysUntilFloat < 0,
    isToday
  };
};

export const checkOverlap = (newActivity: Omit<Activity, 'id' | 'priorityScore' | 'isOverdue' | 'isToday'>, existingActivities: Activity[]): boolean => {
  const newStart = parseISO(`${newActivity.date}T${newActivity.time}`);
  const newEnd = addMinutes(newStart, newActivity.durationMinutes);

  return existingActivities.some(existing => {
    if (existing.date !== newActivity.date) return false;
    
    const existingStart = parseISO(`${existing.date}T${existing.time}`);
    const existingEnd = addMinutes(existingStart, existing.durationMinutes);

    // Overlap logic: StartA < EndB && EndA > StartB
    return isBefore(newStart, existingEnd) && isBefore(existingStart, newEnd);
  });
};

export const sortActivities = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => b.priorityScore - a.priorityScore);
};

export const getActivitiesForChart = (activities: Activity[]): { date: string; load: number }[] => {
  const loadMap = new Map<string, number>();
  
  activities.forEach(act => {
    const current = loadMap.get(act.date) || 0;
    // Load is defined by duration * priority roughly
    loadMap.set(act.date, current + (act.durationMinutes)); 
  });

  const data = Array.from(loadMap.entries()).map(([date, load]) => ({
    date: format(parseISO(date), 'MMM dd'),
    load
  }));

  // Sort by date string (simple approximation, ideally would parse date to sort)
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};