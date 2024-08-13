import GTPUtilPlugin from "src/main";
import { App, Modal, Setting } from "obsidian";
import { TranslateContentCommand } from "src/features/translate/translateContent.command";

export class OpenAIAPIKeySettingModal extends Modal {
	selectedOption: string;

	constructor(app: App, private plugin: GTPUtilPlugin) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "GPT Utils" });

		contentEl.createEl("p", {
			text: "Please review your OpenAI API Key update this configuration",
		});

		new Setting(contentEl)
			.setName("Your OpenAI API Key")
			.setDesc("API Key for OpenAI")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.gptSettings.openaiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.gptSettings.openaiApiKey = value;
						await this.plugin.saveSettings();
						const translateContentCommand =
							new TranslateContentCommand(
								this.plugin,
								this.app,
								this.plugin.settings
							);

						await translateContentCommand.register();
					})
			);

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
