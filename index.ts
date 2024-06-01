import { File, Track, NoteOnEvent, NoteOffEvent, ControlEvent, EndOfTrackEvent, WriteStream } from "@perry-rylance/midi";

type WithAbsolute<T> = T & { absolute?: number };

const file = new File();
const track = new Track();

file.tracks.push(track);

const sustain = file.resolution.ticksPerQuarterNote / 8;
const duration = file.resolution.ticksPerQuarterNote * 4 * 128; // NB: 128 bars
const increment = (Math.SQRT2 - 1) / 100;
let index = 0;

const events: WithAbsolute<ControlEvent>[] = [];

for(let pitch = 84; pitch >= 48; pitch -= 2)
{
	const length = file.resolution.ticksPerQuarterNote * 2;
	const gap = length + (length * (increment * index));

	index++;

	let cursor = 0;

	while(cursor < duration)
	{
		const on: WithAbsolute<NoteOnEvent> = new NoteOnEvent();
		on.key = pitch;
		on.absolute = cursor;

		events.push(on);

		cursor += sustain;

		const off: WithAbsolute<NoteOffEvent> = new NoteOffEvent();
		off.key = pitch;
		off.absolute = cursor;

		events.push(off);

		cursor += (gap - sustain);
	}
}

events.sort((a, b) => a.absolute! - b.absolute!);

let prev = 0;

events.forEach(event => {

	event.delta = Math.round(event.absolute! - prev);
	prev = event.absolute!;

});

track.events = events;

track.events.push(new EndOfTrackEvent());

const stream = new WriteStream();

file.writeBytes(stream);

process.stdout.write(new Uint8Array(stream.toArrayBuffer()));