export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export const DUMMY_TRACKS: Track[] = [
  {
    id: "1",
    title: "Neon Drive",
    artist: "AI Synthwave Alpha",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "2",
    title: "Cybernetic Pulse",
    artist: "AI Synthwave Beta",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "3",
    title: "Digital Horizon",
    artist: "AI Synthwave Gamma",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];
