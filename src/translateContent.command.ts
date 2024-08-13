import {
	GPTService,
	OpenAIAPIKeyMisConfigurationException,
	TargetLangMisConfigurationException,
} from "src/gtp.service";
import GTPUtilPlugin, { AppPluginSettings, langOptions } from "src/main";
import { App, Editor, EditorPosition, MarkdownView, Plugin } from "obsidian";
import { OpenAIAPIKeySettingModal } from "src/openAIApiKeySettings.modal";
import { TargetLanguageSettingModal } from "src/targetLanguage.modal";

export class TranslateContentCommand {
	constructor(
		private plugin: GTPUtilPlugin,
		private app: App,
		private settings: AppPluginSettings,
		private options: langOptions[]
	) {}

	async register() {
		const text = new GPTService(
			this.settings.gptSettings,
			this.settings.translationOptionsSettings
		);

		this.plugin.addCommand({
			id: "translate-content",
			name: "Translate Content",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const sel = editor.getSelection();

				try {
					const contentTranslated = await text.textTranslate(sel);

					const selectionStart = editor.getCursor("from");
					const selectionEnd = editor.getCursor("to");

					const insertionPos: EditorPosition =
						this.comparePositions(selectionStart, selectionEnd) > 0
							? selectionStart
							: selectionEnd;

					editor.replaceRange(
						`\n\n**Translated to ${this.settings.translationOptionsSettings.targetLang.label}:**\n${contentTranslated}`,
						insertionPos
					);
				} catch (e: any) {
					if (e instanceof TargetLangMisConfigurationException) {
						const targetLangModal = new TargetLanguageSettingModal(
							this.app,
							this.options,
							this.plugin
						);
						targetLangModal.open();
					}

					if (e instanceof OpenAIAPIKeyMisConfigurationException) {
						const openAIApiKeyModal = new OpenAIAPIKeySettingModal(
							this.app,
							this.plugin
						);
						openAIApiKeyModal.open();
					}
				}
			},
		});
	}

	/**
	 * Function to compare two positions in the editor.
	 *
	 * @param pos1 - First position to be compared.
	 * @param pos2 - Second position to be compared.
	 * @returns Positive number if pos1 is after pos2, negative if before, or 0 if they are equal.
	 */
	comparePositions(pos1: EditorPosition, pos2: EditorPosition): number {
		if (pos1.line === pos2.line) {
			return pos1.ch - pos2.ch;
		} else {
			return pos1.line - pos2.line;
		}
	}
}
