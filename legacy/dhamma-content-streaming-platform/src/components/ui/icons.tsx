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
  ChevronDown,
  Home,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Filter,
  Rocket
} from "lucide-react";

export { Rocket };
export const ContentTypeIcons = {
  Video,
  Audio: Headphones,
  Ebook: BookOpen,
  Other: FileText
} as const;

export const FeatureIcons = {
  Meditation: User,
  Calendar,
  Globe,
  Clock,
  Search,
  Close: X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume: Volume2,
  Filter,
  Rocket
} as const;

export type ContentType = keyof typeof ContentTypeIcons;
export type FeatureIcon = keyof typeof FeatureIcons;
