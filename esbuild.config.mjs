import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { spawn } from "child_process";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/	
`;

const prod = process.argv[2] === "production";

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins,
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
});

/**
 * Function that executes a terminal command using spawn.
 *
 * @param command Command to be executed in the terminal.
 * @param args List of arguments for the command.
 * @returns Promise that resolves with the command's output or rejects in case of an error.
 */
async function executeCommandWithSpawn(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args);

		let output = "";
		child.stdout.on("data", (data) => {
			output += data.toString();
		});

		child.stderr.on("data", (data) => {
			reject(`Stderr: ${data.toString()}`);
		});

		child.on("close", (code) => {
			if (code !== 0) {
				reject(`Process end with code ${code}`);
				return;
			}
			resolve(output);
		});
	});
}

if (prod) {
	console.log(`Building...`);
	await context.rebuild();

	try {
		//This procedure exists only to make easy local tests
		console.log(`Installing plugin...`);
		const destination = `${process.env.OBSIDIAN_VAULT_BASE_PATH}/.obsidian/plugins/gpt-utils-plugin`;
		await executeCommandWithSpawn("cp", [
			"main.js",
			"styles.css",
			"manifest.json",
			destination,
		]);
		console.log(`Installed successfully!`);
	} catch (e) {
		console.error(`Error copying files to plugin folder: ${e}`);
	}

	process.exit(0);
} else {
	await context.watch();
}
