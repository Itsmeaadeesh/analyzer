import { ideaToBrandTheme } from './ideaToBrand';
import { fundMyCrazyTheme } from './fundMyCrazy';
import { ThemeConfig, RegionOption } from './types';

export const ALL_THEMES: Record<string, ThemeConfig> = {
  'idea-to-brand': ideaToBrandTheme,
  'fund-my-crazy': fundMyCrazyTheme,
};

export const DEFAULT_THEME_ID = 'idea-to-brand';

export const REGIONS: RegionOption[] = [
  { id: 'east-west-ping', label: 'East-West India (ping)', hashtag: '#ping_mcn', group: 'East-West' },
  { id: 'north-india', label: 'North India', hashtag: '#CommuniqueIndia', group: 'North-South' },
  { id: 'south-india', label: 'South India', hashtag: '#CommuniqueIndia', group: 'North-South' },
  { id: 'north-south-communique', label: 'North-South India (Communique)', hashtag: '#CommuniqueIndia', group: 'North-South' },
  { id: 'east-india', label: 'East India', hashtag: '#ping_mcn', group: 'East-West' },
  { id: 'west-india', label: 'West India', hashtag: '#ping_mcn', group: 'East-West' },
];

export function getThemeById(themeId?: string): ThemeConfig {
  if (themeId && ALL_THEMES[themeId]) {
    return ALL_THEMES[themeId];
  }
  return ideaToBrandTheme;
}

export function getRegionHashtag(regionLabel: string, theme?: ThemeConfig): string {
  if (theme && theme.regionHashtagMap && theme.regionHashtagMap[regionLabel]) {
    return theme.regionHashtagMap[regionLabel];
  }
  const match = REGIONS.find(r => r.label.toLowerCase() === (regionLabel || '').toLowerCase());
  if (match) return match.hashtag;
  if ((regionLabel || '').toLowerCase().includes('east') || (regionLabel || '').toLowerCase().includes('west') || (regionLabel || '').toLowerCase().includes('ping')) {
    return '#ping_mcn';
  }
  return '#CommuniqueIndia';
}

export function formatCaptionWithPlaceholders(template: string, gid: string, regionLabel: string, theme: ThemeConfig): string {
  const hashtag = getRegionHashtag(regionLabel, theme);
  const formattedGid = gid.trim() ? gid.trim() : 'YOUR-GID';
  return template
    .replace('{GID}', formattedGid)
    .replace('YOUR-GID', formattedGid)
    .replace('{REGION_HASHTAG}', hashtag)
    .replace('#ping_mcn', hashtag)
    .replace('#CommuniqueIndia', hashtag);
}
