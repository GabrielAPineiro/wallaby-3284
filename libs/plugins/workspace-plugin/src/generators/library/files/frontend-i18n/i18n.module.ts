import { NgModule } from '@angular/core';
import { I18N_TOKEN, TRANSLATION_KEYS } from './i18n';

@NgModule({
	providers: [{ provide: I18N_TOKEN, useValue: TRANSLATION_KEYS }],
})
export class I18nModule {}
