const houselakSongs = [
  { title: "HouseLak #1", src: "https://pub-23c7a67d9ab14022848bc8c2d1e9c57b.r2.dev/nst1.mp3", rainbow: false, category: "houselak" },
  { title: "HouseLak #24", src: "https://pub-23c7a67d9ab14022848bc8c2d1e9c57b.r2.dev/nst24.mp3", rainbow: false, category: "houselak" },
  { title: "nu-siu-a-hung-wayzee-scdler", src: "https://pub-17967b384d31452abcc6c0adb3cd8457.r2.dev/20250713-134904_nu-siu-a-hung-wayzee-scdler.mp3", rainbow: false, category: "houselak" },
  { title: "HouseLak #1", src: "https://jsosndkssk.7b2147a7b74be284b3e2ddcfd581b68e.r2.cloudflarestorage.com/5_6332225925517678891.mp3", rainbow: false, category: "houselak" },
].sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true })).map((song, index) => ({ ...song, title: `HouseLak #${index + 1}` }));
