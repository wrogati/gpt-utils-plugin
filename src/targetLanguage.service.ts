import { langOptions } from "src/main";
import { LANG_OPTIONS } from "./constants/settings";

export class TargetLanguageService {
	public async setLabelTargetLang(isoCode: string): Promise<any> {
		const label = LANG_OPTIONS.find((item: langOptions) => {
			if (item.isoCode === isoCode) return item;
		});

		return label?.label;
	}
}
