import { langOptions } from "src/main";

export class TargetLanguageService {
	public async setLabelTargetLang(
		isoCode: string,
		langOptions: langOptions[]
	): Promise<any> {
		const label = langOptions.find((item: langOptions) => {
			if (item.isoCode === isoCode) return item;
		});

		return label?.label;
	}
}
