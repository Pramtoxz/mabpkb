import React from 'react';
import Svg, {Path, Rect, Circle} from 'react-native-svg';
import {Colors} from '../constants';

interface IconProps {
  size?: number;
  color?: string;
}

export function StarIcon({size = 20, color = Colors.badgeStar}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
      />
    </Svg>
  );
}

export function ShieldCheckIcon({size = 20, color = Colors.badgeShield}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z"
        fill={color}
      />
      <Path
        d="M9 11.5L11 13.5L15 9.5"
        stroke={Colors.surface}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LeafIcon({size = 20, color = Colors.badgeLeaf}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25M17 8C14 8.5 11 10.5 9 13.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 8C14.5 11 11 15 6 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChartBarIcon({size = 20, color = Colors.badgeChart}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="14" width="4" height="7" rx="1.5" fill={color} />
      <Rect x="10" y="8" width="4" height="13" rx="1.5" fill={color} />
      <Rect x="17" y="3" width="4" height="18" rx="1.5" fill={color} />
    </Svg>
  );
}

export function HeartIcon({size = 20, color = Colors.badgePink}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
      />
    </Svg>
  );
}

export function ClockIcon({size = 20, color = Colors.badgeOrange}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Path
        d="M12 7v5l3 3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FlameIcon({size = 14, color = Colors.badgeOrange}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c-.5 2-2 4-4 6-2 2-3 4-3 6a7 7 0 0014 0c0-3-2-5-4-7-1-1-2-3-2-5 0 0-1 0-1 0z"
        fill={color}
      />
    </Svg>
  );
}

export function CrownIcon({size = 18, color = Colors.badgeChart}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 19h20v2H2v-2zM2 5l5 7 5-7 5 7 5-7v11H2V5z"
        fill={color}
      />
    </Svg>
  );
}

export function ChevronRightIcon({size = 18, color = Colors.textTertiary}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ScannerButtonIcon({size = 18, color = Colors.emerald}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8V5C4 4.45 4.45 4 5 4H8"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M16 4H19C19.55 4 20 4.45 20 5V8"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M4 16V19C4 19.55 4.45 20 5 20H8"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M16 20H19C19.55 20 20 19.55 20 19V16"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M7 12H17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ArrowRightIcon({size = 18, color = Colors.surface}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12H19"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 6L19 12L13 18"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
