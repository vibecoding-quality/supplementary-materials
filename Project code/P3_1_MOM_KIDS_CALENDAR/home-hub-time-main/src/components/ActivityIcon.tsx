import footballIcon from "@/assets/activities/football-icon.png";
import basketballIcon from "@/assets/activities/basketball-icon.png";
import musicIcon from "@/assets/activities/music-icon.png";
import schoolIcon from "@/assets/activities/school-icon.png";
import trainingIcon from "@/assets/activities/training-icon.png";
import swimmingIcon from "@/assets/activities/swimming-icon.png";
import danceIcon from "@/assets/activities/dance-icon.png";
import otherIcon from "@/assets/activities/other-icon.png";
import type { Database } from "@/integrations/supabase/types";

type ActivityType = Database["public"]["Enums"]["activity_type"];

interface ActivityIconProps {
  type: ActivityType;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Map specific keywords in titles to more specific icons
const getIconForTitle = (title: string, type: ActivityType): string => {
  const lowerTitle = title.toLowerCase();
  
  // Sports-specific icons
  if (lowerTitle.includes("football") || lowerTitle.includes("soccer")) {
    return footballIcon;
  }
  if (lowerTitle.includes("basketball") || lowerTitle.includes("basket")) {
    return basketballIcon;
  }
  if (lowerTitle.includes("swim") || lowerTitle.includes("pool")) {
    return swimmingIcon;
  }
  if (lowerTitle.includes("dance") || lowerTitle.includes("ballet")) {
    return danceIcon;
  }
  if (lowerTitle.includes("tennis") || lowerTitle.includes("gym") || lowerTitle.includes("training")) {
    return trainingIcon;
  }
  
  // Music-related
  if (lowerTitle.includes("piano") || lowerTitle.includes("guitar") || lowerTitle.includes("music") || 
      lowerTitle.includes("violin") || lowerTitle.includes("drum") || lowerTitle.includes("singing")) {
    return musicIcon;
  }
  
  // School-related
  if (lowerTitle.includes("school") || lowerTitle.includes("class") || lowerTitle.includes("math") ||
      lowerTitle.includes("english") || lowerTitle.includes("science") || lowerTitle.includes("homework") ||
      lowerTitle.includes("exam") || lowerTitle.includes("test")) {
    return schoolIcon;
  }
  
  // Fall back to activity type
  switch (type) {
    case "school":
      return schoolIcon;
    case "music":
      return musicIcon;
    case "training":
      return trainingIcon;
    default:
      return otherIcon;
  }
};

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export const ActivityIcon = ({ type, title = "", size = "md", className = "" }: ActivityIconProps) => {
  const iconSrc = getIconForTitle(title, type);
  
  return (
    <img 
      src={iconSrc} 
      alt={`${type} activity`}
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};

// Export all icons for direct use
export const activityIcons = {
  football: footballIcon,
  basketball: basketballIcon,
  music: musicIcon,
  school: schoolIcon,
  training: trainingIcon,
  swimming: swimmingIcon,
  dance: danceIcon,
  other: otherIcon,
};
