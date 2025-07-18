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
    { keywords: ["netflix", "hulu", "hbo", "disney", "apple tv", "plex", "crunchyroll"], icon: Tv, color: "bg-red-500" },
    { keywords: ["spotify", "apple music", "tidal", "pandora", "soundcloud"], icon: Music, color: "bg-green-500" },
    { keywords: ["youtube"], icon: Youtube, color: "bg-red-600" },
    { keywords: ["icloud", "dropbox", "google drive", "one", "onedrive"], icon: Cloud, color: "bg-blue-500" },
    { keywords: ["xbox", "playstation", "nintendo", "steam"], icon: Gamepad2, color: "bg-indigo-500" },
    { keywords: ["new york times", "washington post", "wsj", "medium"], icon: Newspaper, color: "bg-gray-700" },
    { keywords: ["amazon prime", "walmart+"], icon: ShoppingBag, color: "bg-yellow-500" },
    { keywords: ["adobe", "figma", "canva", "notion", "office 365"], icon: Zap, color: "bg-purple-500" },
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
      <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">{initials || <CreditCard />}</AvatarFallback>
    </Avatar>
  );
};

export function SubscriptionIcon({ name }: SubscriptionIconProps) {
  return getIconForSubscription(name);
}