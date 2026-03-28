const PREFIX = "new-tab:" as const;

export interface SettingsSchema {
  wallpaperSource: string | null;
  showSearchBar: boolean;
}

export type SettingsKey = keyof SettingsSchema;

const DEFAULTS: SettingsSchema = {
  wallpaperSource: null,
  showSearchBar: true,
};

function keyFor<K extends SettingsKey>(k: K): string {
  return `${PREFIX}${k}`;
}

export function getSetting<K extends SettingsKey>(key: K): SettingsSchema[K] {
  const raw = localStorage.getItem(keyFor(key));
  if (raw === null) {
    return DEFAULTS[key];
  }
  try {
    return JSON.parse(raw) as SettingsSchema[K];
  } catch {
    return DEFAULTS[key];
  }
}

export function setSetting<K extends SettingsKey>(key: K, value: SettingsSchema[K]): void {
  localStorage.setItem(keyFor(key), JSON.stringify(value));
}
