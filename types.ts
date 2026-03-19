
export interface EventItem {
  id: string;
  name: string;
  date: string; // ISO string
  color?: string;
}

export interface CustomColors {
  past: string;
  future: string;
  weekend: string;
  today: string;
  target: string;
  event: string;
  special: string;
}

export interface MoodConfig {
  id: string;
  label: string;
  color: string;
}

export interface AppState {
  userName: string;
  startDate: string; // ISO string
  targetDate: string; // ISO string
  events: EventItem[];
  customColors: CustomColors;
  notes: Record<string, string>; 
  moods: Record<string, string | null>; // ID do humor
  images: Record<string, string[]>;
  moodConfigs: MoodConfig[];
}
