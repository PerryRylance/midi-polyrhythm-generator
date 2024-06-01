import { File, Track, NoteOnEvent, NoteOffEvent, ControlEvent, EndOfTrackEvent, WriteStream } from "@perry-rylance/midi";
import { writeFileSync } from "fs";

type WithAbsolute<T> = T & { absolute?: number };

type GenerateArguments = {
	count: number;
	layers: number;
	push: number;
	window: number;
	intervals: string;
	duration: number;
	root: number;
	output: string;
};

export default class Generator
{
	private normalizeAbsoluteTimes(events: WithAbsolute<ControlEvent>[], totalDuration: number): void
	{
		const max = events.reduce((a, b) => Math.max(a, b.absolute!), 0);
		const scale = totalDuration / max;

		events.forEach(event => event.absolute! *= scale);
	}

	private generateEvents(args: GenerateArguments): WithAbsolute<ControlEvent>[]
	{
		const totalDuration = args.count * args.duration;
		const events: WithAbsolute<ControlEvent>[] = [];
		const intervals: number[] = args.intervals.split(",").map(value => parseInt(value));

		let pitch = args.root;

		for(let layer = 0; layer < args.layers; layer++)
		{
			const noteOnCountForLayer = args.count + (args.push * layer);
			const eventsOnLayer: WithAbsolute<ControlEvent>[] = [];

			for(let i = 0; i < noteOnCountForLayer; i++)
			{
				const on: WithAbsolute<NoteOnEvent> = new NoteOnEvent();

				on.key = pitch;
				on.absolute = i * args.duration;

				eventsOnLayer.push(on);

				const off: WithAbsolute<NoteOffEvent> = new NoteOffEvent();

				off.key = pitch;
				off.absolute = on.absolute + args.duration * args.window;

				eventsOnLayer.push(off);
			}

			if(args.window < 1.0)
			{
				// NB: Window will mess up time normalization, so add a dummy event in here
				const dummy: WithAbsolute<NoteOffEvent> = new NoteOffEvent();

				dummy.key = 0;
				dummy.absolute = noteOnCountForLayer * args.duration;

				eventsOnLayer.push(dummy);
			}

			this.normalizeAbsoluteTimes(eventsOnLayer, totalDuration);

			events.push(...eventsOnLayer);

			pitch += intervals[layer % intervals.length];
		}

		return events;
	}

	private addDeltaTimes(events: WithAbsolute<ControlEvent>[]): void
	{
		events.sort((a, b) => a.absolute! - b.absolute!);

		let prev = 0;
		
		events.forEach(event => {
		
			event.delta = Math.round(event.absolute! - prev);
			prev = event.absolute!;
		
		});
	}

	private generateFile(events: WithAbsolute<ControlEvent>[]): File
	{
		const file = new File();
		const track = new Track();
		
		file.tracks.push(track);

		track.events = events;

		track.events.push(new EndOfTrackEvent());

		return file;
	}

	generate(args: GenerateArguments): void
	{
		const stream = new WriteStream();
		const events = this.generateEvents(args);
		
		this.addDeltaTimes(events);

		const file = this.generateFile(events);

		file.writeBytes(stream);

		const data = new Uint8Array(stream.toArrayBuffer());

		if(args.output === "stdout")
			process.stdout.write(data);
		else
			writeFileSync(args.output, data);
	}
}