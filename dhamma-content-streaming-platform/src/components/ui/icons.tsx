import {
  Video,
  Headphones,
  BookOpen,
  FileText,
  User,
  Calendar,
  Globe,
  Clock,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Filter
} from "lucide-react";

export const ContentTypeIcons = {
  video: Video,
  audio: Headphones,
  ebook: BookOpen,
  other: FileText
} as const;

export const FeatureIcons = {
  meditation: User,
  calendar: Calendar,
  globe: Globe,
  clock: Clock,
  search: Search,
  close: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  home: Home,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  play: Play,
  pause: Pause,
  skipBack: SkipBack,
  skipForward: SkipForward,
  volume: Volume2,
  filter: Filter
} as const;

export type ContentType = keyof typeof ContentTypeIcons;
export type FeatureIcon = keyof typeof FeatureIcons;
