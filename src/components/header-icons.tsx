import {
  ChevronDown,
  ClipboardList,
  Handbag,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";

interface IconProps { size?: number }

const strokeWidth = 1.8;

export function SearchIcon({ size = 20 }: IconProps) {
  return <Search size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function PinIcon({ size = 20 }: IconProps) {
  return <MapPin size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function PhoneIcon({ size = 20 }: IconProps) {
  return <Phone size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function UserIcon({ size = 20 }: IconProps) {
  return <UserRound size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function BagIcon({ size = 20 }: IconProps) {
  return <Handbag size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function MenuIcon({ size = 20 }: IconProps) {
  return <Menu size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function CloseIcon({ size = 20 }: IconProps) {
  return <X size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function ChevronIcon({ size = 20 }: IconProps) {
  return <ChevronDown size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function OrdersIcon({ size = 20 }: IconProps) {
  return <ClipboardList size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function ChatIcon({ size = 20 }: IconProps) {
  return <MessageCircle size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
