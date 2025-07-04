import {
  Tv,
  Music,
  Youtube,
  Cloud,
  Gamepad2,
  Newspaper,
  ShoppingBag,
  Zap,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SubscriptionIconProps {
  name: string;
}

const getIconForSubscription = (name: string) => {
  const lowerCaseName = name.toLowerCase();

  const iconMappings: { keywords: string[]; icon: React.ElementType; color: string }[] = [
    { keywords: ["netflix", "hulu", "hbo", "disney", "apple tv", "plex", "crunchyroll"], icon: Tv, color: "bg-neon-magenta shadow-lg shadow-neon-magenta/30" },
    { keywords: ["spotify", "apple music", "tidal", "pandora", "soundcloud"], icon: Music, color: "bg-neon-green shadow-lg shadow-neon-green/30" },
    { keywords: ["youtube"], icon: Youtube, color: "bg-red-600 shadow-lg shadow-red-600/30" },
    { keywords: ["icloud", "dropbox", "google drive", "one", "onedrive"], icon: Cloud, color: "bg-neon-cyan shadow-lg shadow-neon-cyan/30" },
    { keywords: ["xbox", "playstation", "nintendo", "steam"], icon: Gamepad2, color: "bg-neon-purple shadow-lg shadow-neon-purple/30" },
    { keywords: ["new york times", "washington post", "wsj", "medium"], icon: Newspaper, color: "bg-gray-700 shadow-lg shadow-gray-700/30" },
    { keywords: ["amazon prime", "walmart+"], icon: ShoppingBag, color: "bg-neon-yellow shadow-lg shadow-neon-yellow/30" },
    { keywords: ["adobe", "figma", "canva", "notion", "office 365"], icon: Zap, color: "bg-neon-purple shadow-lg shadow-neon-purple/30" },
  ];

  for (const mapping of iconMappings) {
    if (mapping.keywords.some(keyword => lowerCaseName.includes(keyword))) {
      const Icon = mapping.icon;
      return (
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mapping.color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      );
    }
  }

  // Fallback to initials
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <Avatar className="h-10 w-10 rounded-lg">
      <AvatarFallback className="rounded-lg bg-primary/10 border border-primary/20 text-primary/80">{initials || <CreditCard />}</AvatarFallback>
    </Avatar>
  );
};

export function SubscriptionIcon({ name }: SubscriptionIconProps) {
  return getIconForSubscription(name);
}