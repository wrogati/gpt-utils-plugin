import { GPTSettings, TranslationOptionsSettings } from "src/main";
import OpenAI from "openai";

export class GPTService {
	private openai: OpenAI;
	private translateSettings: TranslationOptionsSettings;

	constructor(
		settings: GPTSettings,
		translateSettings: TranslationOptionsSettings
	) {
		if (settings.openaiApiKey.trim().length === 0) {
			throw new OpenAIAPIKeyMisConfigurationException();
		}

		this.openai = new OpenAI({
			apiKey: settings.openaiApiKey,
			dangerouslyAllowBrowser: true,
		});

		this.translateSettings = translateSettings;
	}

	async textTranslate(textContent: string): Promise<string> {
		if (this.translateSettings.targetLang.isoCode.trim().length === 0) {
			throw new TargetLangMisConfigurationException();
		}

		try {
			let userContent = `translate the text below to ${this.translateSettings.targetLang.label} (${this.translateSettings.targetLang.isoCode}): \n${textContent}`;

			const completion = await this.openai.chat.completions.create({
				messages: [
					{ role: "system", content: "You are a translator." },
					{
						role: "user",
						content: userContent,
					},
				],
				model: "gpt-4o",
			});

			return completion.choices[0].message.content || "";
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("Incorrect api key provided")) {
					throw new OpenAIAPIKeyMisConfigurationException(
						error.stack
					);
				}
			}
			throw error;
		}
	}
}

export class TargetLangMisConfigurationException extends Error {
	constructor() {
		super("Target language is not defined");
	}
}

export class OpenAIAPIKeyMisConfigurationException extends Error {
	constructor(stack?: string) {
		super("OpenAI api key is not defined or is invalid");
	}
}
