/* =============================================================
   PERSONAL PAGE CONTENT (personal.html)
   Everything written on the page lives here.
   ============================================================= */

window.ME = {

  /* the line under "Hi, I'm Gauri" */
  tagline: "So....this is me. Could I be any more Somiii?",

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
    "I love talking, and I talk a lot"
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

  /* PLACES I'VE BEEN */
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

  /* A VIDEO OF ME TALKING */
  video: { file: "assets/video.mp4", youtube: "", caption: "My Story." },

  /* GUESTBOOK */
  guestbook: [
  ],

  /* where guestbook notes are sent. The first message triggers a one-time
     activation email from FormSubmit: click the link in it once. */
  guestbookForm: "https://formspree.io/f/xkjgbwkl"
};