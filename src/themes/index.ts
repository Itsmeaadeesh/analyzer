import { ideaToBrandTheme } from './ideaToBrand';
import { ThemeConfig, RegionOption } from './types';

export const ALL_THEMES: Record<string, ThemeConfig> = {
  'idea-to-brand': ideaToBrandTheme,
};

export const DEFAULT_THEME_ID = 'idea-to-brand';

export const REGIONS: RegionOption[] = [
  { id: 'east-west-ping', label: 'East-West India (ping)', hashtag: '#ping_mcn', group: 'East-West' },
];

export function getThemeById(_themeId?: string): ThemeConfig {
  return ideaToBrandTheme;
}

export function getRegionHashtag(_regionLabel?: string, _theme?: ThemeConfig): string {
  return '#ping_mcn';
}

export function formatCaptionWithPlaceholders(template: string, gid: string, _regionLabel?: string, _theme?: ThemeConfig): string {
  const formattedGid = gid.trim() ? gid.trim() : 'YOUR-GID';
  return template
    .replace('{GID}', formattedGid)
    .replace('YOUR-GID', formattedGid)
    .replace('{REGION_HASHTAG}', '#ping_mcn')
    .replace('#CommuniqueIndia', '#ping_mcn');
}
