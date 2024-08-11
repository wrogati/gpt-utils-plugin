import { GPTSettings } from "main";
import OpenAI from "openai";

export class GPTService {
	private openai: OpenAI;

	constructor(settings: GPTSettings) {
		this.openai = new OpenAI({
			apiKey: settings.openaiApiKey,
			dangerouslyAllowBrowser: true,
		});
	}

	async textTranslate(textContent: string): Promise<string> {
		const completion = await this.openai.chat.completions.create({
			messages: [
				{ role: "system", content: "You are a translator." },
				{
					role: "user",
					content: `translate the text below to english: ${textContent}`,
				},
			],
			model: "gpt-4o",
		});

		//todo create a error exception for try/catch
		return completion.choices[0].message.content || "";
	}
}
