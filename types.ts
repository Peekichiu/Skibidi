export enum ActivityType {
  FINAL = 'Final',
  MIDTERM = 'Midterm',
  WORKSHOP = 'Workshop',
  PERSONAL = 'Personal',
  CLUB = 'Club',
  OTHER = 'Other'
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  baseScore: number; // 1-10, user defined importance
  
  // Computed fields
  priorityScore: number;
  isOverdue: boolean;
  isToday: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  tips: string[];
  burnoutRisk: 'Low' | 'Medium' | 'High';
}

export interface ChartDataPoint {
  date: string;
  load: number;
}
