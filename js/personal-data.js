/* =============================================================
   PERSONAL PAGE CONTENT (personal.html)
   Everything written on the page lives here, so you can change
   words without touching layout code.
   ============================================================= */

window.ME = {

  /* the line under "Hi, I'm Gauri" */
  tagline: "Mountains, beaches, mandalas and rom-coms. I talk a lot, dance more, and cannot sing.",

  /* the moving strip near the top */
  now: [
    "listening to: Tu Chahiye",
    "reading: Kafka on the Shore",
    "learning: German",
    "dreaming of: a trip to Greece"
  ],

  /* about me */
  about: [
    "Put me near a hill or a coastline and I'll stay a while.",
    "I draw mandalas, I take photos, I dance, and I'm at my funniest in Hindi, where the jokes actually land."
  ],

  /* small tags under the about text */
  facts: [
    "mountain person",
    "beach person too",
    "funniest in Hindi",
    "cannot sing, not even once",
    "will talk to anyone"
  ],

  /* the line at the top of the page */
  quote: {
    text: "Remember that wherever your heart is, there you will find your treasure.",
    by: "Paulo Coelho, The Alchemist"
  },

  /* THINGS I DO
     Each one gets a card. "art" draws a small animation:
     "mandala", "film", "dance", "talk". Use "" for a plain card. */
  things: [
    { title: "Photography", line: "I collect moments. Most of them are of the sky, or of people mid-laugh.", art: "lens" },
    { title: "Mandala art", line: "Circles, over and over, until the page feels finished.", art: "mandala" },
    { title: "Dancing", line: "Badly, loudly, and often. Usually while something is cooking.", art: "dance" },
    { title: "Cooking", line: "Recipes are suggestions. Mostly.", art: "cook" },
    { title: "Baking", line: "The one place I actually follow instructions.", art: "bake" },
    { title: "Listening to music", line: "Always on. Singing along is a crime I commit in private.", art: "music" },
    { title: "Rom-coms", line: "I know how it ends. I watch it anyway.", art: "film" },
    { title: "Talking", line: "My favourite sport. I can turn a two-minute story into twenty.", art: "talk" }
  ],

  /* PLACES I'VE BEEN
     Add a new line each time you travel somewhere. lat / lon: search
     "<place> coordinates" and copy the two numbers. */
  home: { place: "Uttarakhand", lat: 30.07, lon: 79.09 },
  visited: [
    { place: "Uttarakhand", lat: 30.07, lon: 79.09, note: "home" },
    { place: "Bhopal", lat: 23.26, lon: 77.41, note: "where I study" },
    { place: "Kashmir", lat: 34.08, lon: 74.80, note: "the mountains" },
    { place: "Punjab", lat: 31.63, lon: 74.87, note: "" },
    { place: "Bengaluru", lat: 12.97, lon: 77.59, note: "" },
    { place: "Chennai", lat: 13.08, lon: 80.27, note: "" },
    { place: "Pondicherry", lat: 11.93, lon: 79.83, note: "the sea" }
  ],

  /* A VIDEO OF ME TALKING
     Either put a file at assets/video.mp4, or paste a YouTube video ID
     (the part after v= in the link) into "youtube". Leave both empty
     and the page shows "coming soon". */
  video: { file: "assets/video.mp4", youtube: "", caption: "Two minutes of me, talking. Which, for me, is restraint." },

  /* GUESTBOOK
     Notes people send you arrive by email. Paste the ones you like here
     and they appear on the page:
     { name: "Aarav", line: "What they wrote." } */
  guestbook: [
  ],

  /* where guestbook notes are sent. The first message triggers a one-time
     activation email from FormSubmit: click the link in it once. */
  guestbookForm: "https://formsubmit.co/ajax/gaurimakker2006@gmail.com"
};