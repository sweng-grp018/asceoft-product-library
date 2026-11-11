import type { ComponentType } from "react";
import {
  CameraIcon,
  DrillIcon,
  GlassesIcon,
  PackageIcon,
  RulerIcon,
  VideoIcon,
  WrenchIcon,
} from "lucide-react";

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

const CATEGORY_ICONS: Record<string, IconComponent> = {
  "Power tools": DrillIcon,
  "Hand tools": WrenchIcon,
  "Measuring tools": RulerIcon,
  "Safety equipment": GlassesIcon,
  "Imaging equipment": VideoIcon,
  "Inspection equipment": CameraIcon,
};

/** Category icons stay out of the row model: the record owns data, this owns presentation. */
export function categoryIcon(category: string): IconComponent {
  return CATEGORY_ICONS[category] ?? PackageIcon;
}
