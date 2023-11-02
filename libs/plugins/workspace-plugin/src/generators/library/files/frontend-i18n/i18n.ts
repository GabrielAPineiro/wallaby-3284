import { InjectionToken } from '@angular/core';
import { transformObjectToPaths } from '@exclaimer/common/utils';
import { enUsJson as commonEnUS } from '@exclaimer/shared/common';
import enUS from './translations/en-us.json';

export type TranslationKeys = typeof enUS & typeof commonEnUS;

/**
 * Translation keys object for every translation.
 */
export const TRANSLATION_KEYS: TranslationKeys = transformObjectToPaths<TranslationKeys>('', { ...enUS, ...commonEnUS });

/**
 * Injection token for providing i18n translation keys.
 */
export const I18N_TOKEN = new InjectionToken<TranslationKeys>('<%= normalizedDomain %>TranslationKeys');
