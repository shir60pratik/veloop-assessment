import {
  BookOpen,
  CalendarX,
  ClipboardList,
  Dices,
  Download,
  MessageSquare,
  PlayCircle,
  Star,
  Trophy,
  Users,
  Video,
} from 'lucide-react';

const ICONS = {
  'play-circle': PlayCircle,
  'clipboard-list': ClipboardList,
  dices: Dices,
  users: Users,
  download: Download,
  'book-open': BookOpen,
  trophy: Trophy,
  'message-square': MessageSquare,
  video: Video,
  star: Star,
  'calendar-x': CalendarX,
};

export function taskIcon(name) {
  return ICONS[name] || ClipboardList;
}
