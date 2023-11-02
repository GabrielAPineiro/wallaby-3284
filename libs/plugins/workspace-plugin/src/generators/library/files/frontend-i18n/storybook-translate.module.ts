import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SupportedLanguage } from '@exclaimer/common/i18n';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { I18N_TOKEN, TRANSLATION_KEYS } from './i18n';
import { deJson, enUsJson, esJson, frJson, itJson, nlJson, ptJson } from './translations';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule.forRoot({
			defaultLanguage: SupportedLanguage.enGb,
			useDefaultLang: true,
			isolate: true,
			loader: {
				provide: TranslateLoader,
				useValue: {
					getTranslation: (lang: SupportedLanguage): Observable<typeof enUsJson> =>
						of(
							(
								{
									[SupportedLanguage.enGb]: enUsJson,
									[SupportedLanguage.enUs]: enUsJson,
									[SupportedLanguage.es]: esJson,
									[SupportedLanguage.fr]: frJson,
									[SupportedLanguage.de]: deJson,
									[SupportedLanguage.pt]: ptJson,
									[SupportedLanguage.nl]: nlJson,
									[SupportedLanguage.it]: itJson,
								} as Record<SupportedLanguage, typeof enUsJson>
							)[lang],
						),
				},
			},
		}),
	],
	providers: [{ provide: I18N_TOKEN, useValue: TRANSLATION_KEYS }],
	exports: [TranslateModule],
})
export class StorybookTranslateModule {}
