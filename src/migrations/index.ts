import * as migration_20261018_182644_initial from './20261018_182644_initial';
import * as migration_20261019_115704_business_lunch from './20261019_115704_business_lunch';
import * as migration_20261019_120637_page_sections from './20261019_120637_page_sections';
import * as migration_20261019_131244_banquets_hero_image from './20261019_131244_banquets_hero_image';
import * as migration_20261025_194311_business_lunch_days from './20261025_194311_business_lunch_days';

export const migrations = [
  {
    up: migration_20261018_182644_initial.up,
    down: migration_20261018_182644_initial.down,
    name: '20261018_182644_initial',
  },
  {
    up: migration_20261019_115704_business_lunch.up,
    down: migration_20261019_115704_business_lunch.down,
    name: '20261019_115704_business_lunch',
  },
  {
    up: migration_20261019_120637_page_sections.up,
    down: migration_20261019_120637_page_sections.down,
    name: '20261019_120637_page_sections',
  },
  {
    up: migration_20261019_131244_banquets_hero_image.up,
    down: migration_20261019_131244_banquets_hero_image.down,
    name: '20261019_131244_banquets_hero_image',
  },
  {
    up: migration_20261025_194311_business_lunch_days.up,
    down: migration_20261025_194311_business_lunch_days.down,
    name: '20261025_194311_business_lunch_days'
  },
];
