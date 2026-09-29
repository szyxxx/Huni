import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

export function facilityIcon(name: string): ComponentProps<typeof Feather>['name'] {
  const label = name.toLowerCase();
  if (/parkir|carport/.test(label)) return 'truck';
  if (/taman|bermain/.test(label)) return 'sun';
  if (/keamanan/.test(label)) return 'shield';
  if (/kolam/.test(label)) return 'droplet';
  if (/wifi/.test(label)) return 'wifi';
  if (/ac/.test(label)) return 'wind';
  if (/gym/.test(label)) return 'activity';
  if (/laundry/.test(label)) return 'refresh-cw';
  if (/dapur/.test(label)) return 'coffee';
  if (/jalan|akses/.test(label)) return 'navigation';
  return 'check';
}
