
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import yargonaut from "yargonaut";
import Generator from "./src/Generator";

yargonaut
    .helpStyle('green')
    .errorsStyle('red.bold');

const argv = yargs(hideBin(process.argv))
	.option("count", {
		alias: "c",
		describe: "Number of root events to generate",
		type: "number",
		demandOption: true,
		requiresArg: true
	})
	.option("layers", {
		alias: "l",
		describe: "Number of layers to generate",
		type: "number",
		demandOption: true,
		requiresArg: true
	})
	.option("push", {
		alias: "p",
		describe: "Number of events to push per layer",
		type: "number",
		default: 1,
		requiresArg: true
	})
	.option("window", {
		alias: "w",
		describe: "Window between events to sustain for, 0.0 is instantaneous notes, 1.0 is no gaps",
		type: "number",
		default: 0.5,
		requiresArg: true
	})
	.option("intervals", {
		alias: "i",
		describe: "Semitones to increment per layer, supports negative and comma-separated values",
		type: "string",
		default: "1",
		requiresArg: true
	})
	.option("duration", {
		alias: "d",
		describe: "Duration between root layer note-on events",
		type: "number",
		default: 480,
		requiresArg: true
	})
	.option("root", {
		alias: "r",
		describe: "MIDI pitch of the root note",
		default: 60,
		requiresArg: true
	})
	.option("output", {
		alias: "o",
		describe: "File to output to",
		default: "stdout",
		type: "string",
		requiresArg: true
	})
	.parseSync();

const generator = new Generator();

generator.generate(argv);