import GPTUtilPlugin from "src/main";
import { App, Modal, Setting } from "obsidian";
import { TargetLanguageService } from "src/features/translate/targetLanguage.service";
import { LANG_OPTIONS } from "../../constants/settings";

export class TargetLanguageSettingModal extends Modal {
	selectedOption: string;
	private targetLanguageService: TargetLanguageService;

	constructor(app: App, private plugin: GPTUtilPlugin) {
		super(app);
		this.selectedOption = LANG_OPTIONS[0].isoCode; // default value
		this.targetLanguageService = new TargetLanguageService();
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "GPT utils" });

		contentEl.createEl("p", {
			text: "For make translation please choose the target language to translate and try again.",
		});

		new Setting(contentEl)
			.setName("Select target language option")
			.addDropdown((dropdown) => {
				LANG_OPTIONS.forEach((option) => {
					dropdown.addOption(option.isoCode, option.label);
				});

				dropdown
					.setValue(this.selectedOption)
					.onChange(async (value) => {
						this.plugin.settings.translationOptionsSettings.targetLang.isoCode =
							value;

						this.plugin.settings.translationOptionsSettings.targetLang.label =
							await this.targetLanguageService.setLabelTargetLang(
								value
							);
						await this.plugin.saveSettings();
					});
			});

		new Setting(contentEl).addButton((button) =>
			button
				.setButtonText("Close")
				.setCta()
				.onClick(() => {
					this.close();
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
