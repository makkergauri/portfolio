/* =============================================================
   SITE CONTENT
   Everything written about you lives in this file, so you can
   edit text without touching layout code.
   Search for "PLACEHOLDER" to find the bits only you can fill in.
   ============================================================= */

window.SITE = {

  /* Your personal page (hobbies, writing, recommendations). It lives in this same site as personal.html.
     If you ever move it to its own address, put the full link here instead, e.g. "https://gauri.me". */
  personalSite: "personal.html",

  /* Your GitHub username: the "Live from GitHub" strip shows your latest pushed repos. */
  github: "makkergauri",

  /* Where "Leave a recommendation" messages are sent. FormSubmit forwards them to this email.
     The first message triggers a one-time activation email from FormSubmit: click it once. */
  recommendForm: "https://formsubmit.co/ajax/gaurimakker2006@gmail.com",

  experience: [
    {
      role: "AI Engineer Intern",
      org: "Neuronafence",
      dates: "Feb 2025 – Jul 2025",
      points: [
        "Built a retrieval-augmented generation (RAG) chatbot over 10,000+ internal company documents using Python, LangChain and Hugging Face Transformers.",
        "Designed the document ingestion pipeline (parsing, chunking, embedding) so the knowledge base could be updated without retraining."
      ]
    },
    {
      role: "Software Development & ML Intern",
      org: "Caliche Global",
      dates: "May 2024 – Jul 2024",
      points: [
        "Built REST APIs in Flask for a farm management system, including an ML model that provides soil-health insights.",
        "Wrote SDLC documentation and worked in Agile sprints with the client team."
      ]
    },
    {
      role: "President",
      org: "Notion Community Club, VIT Bhopal",
      dates: "Jul 2025 – Mar 2026",
      points: [
        "Led a 130+ member club; organised 10+ workshops and 2 hackathons with 300+ total participants.",
        "Joined as Creative Team Lead (2024), then Operations Manager, then President."
      ]
    },
    {
      role: "Student Internship Coordinator",
      org: "Institution's Innovation Council, VIT Bhopal",
      dates: "Apr 2025 – Sep 2026",
      points: [
        "Coordinated student participation in Ministry of Education innovation programmes: startup ideation contests, IPR sessions and industry mentorship."
      ]
    },
    {
      role: "National Level Exhibition (NLEPC)",
      org: "INSPIRE-MANAK, Government of India",
      dates: "2019",
      points: [
        "Advanced through the district and state rounds to the national exhibition with a school science project."
      ]
    }
  ],

  /* "role" is only shown for team projects (team: true).
     Each project gets a panel on the home page and its own case-study page
     (project.html?p=slug).
     visual: which drawing to show until you add a real image.
     image:  set to e.g. "assets/playvision.webp" to use a screenshot instead. */
  projects: [
    {
      slug: "playvision",
      title: "PlayVision",
      kind: "Computer vision",
      oneLine: "Football analytics from match video: who is where, which team they're on, and who has the ball.",
      tags: ["Python", "PyTorch", "YOLOv8", "ByteTrack", "SigLIP", "OpenCV"],
      team: true,
      visual: "radar",
      image: null,
      links: { code: "https://github.com/makkergauri/football_player_stats_tracker" },
      problem: "Match analysis is still largely done by hand: someone scrubs through footage to work out positions, possession and who covered which part of the pitch.",
      approach: "Two YOLOv8 models do the vision work. One detects players, referees and the ball; the other finds pitch keypoints, so camera coordinates can be transformed onto a flat, top-down pitch. ByteTrack keeps identities stable from frame to frame. Teams are identified without labelling any kits: each player crop is embedded with SigLIP, reduced with UMAP and clustered. The system then computes possession, player speed and territory control, and draws a tactical radar view.",
      role: "PLACEHOLDER: what you personally built, e.g. \"I built the team-identification step and the radar view.\"",
      hard: "Occlusion. When players cross or hide behind each other, the tracker can swap their identities. Running two models plus tracking fast enough to keep the frame rate up also took optimisation.",
      differently: "It was tested on our own footage, so other leagues, camera angles and lighting would likely need retraining. PLACEHOLDER: add your own reflection."
    },
    {
      slug: "emotion-weather-map",
      title: "Emotion Weather Map",
      kind: "NLP data visualisation",
      oneLine: "A world map that shows the mood of each country's news as weather: sunshine for good news, storms for bad.",
      tags: ["Python", "FastAPI", "VADER", "React", "TypeScript", "Leaflet"],
      team: false,
      visual: "weather",
      image: null,
      links: { code: "https://github.com/makkergauri/Emotion-Weather-Map" },
      problem: "Anyone curious how the news \"feels\" in different countries has to read dozens of feeds and still can't compare them at a glance. Sentiment analysis usually ends in a table of scores that nobody wants to read. I wanted to see whether a familiar visual language could make that comparison instant.",
      approach: "The backend fetches headlines for 12 countries and 57 cities, using Google News RSS for cities instead of a news API, because no free news API offers city-level search. Syndicated duplicates are removed before scoring, so one wire story reprinted by a dozen outlets doesn't get a dozen votes. Each headline is scored with VADER instead of a transformer model, because it's instant, needs no model download, and was designed for short text like headlines. Each region's average score is mapped to one of five weather conditions and cached in SQLite for four hours instead of fetched per visit, which keeps NewsAPI usage within its 100-requests-a-day free tier (at most 72). On the deployed backend, with NewsAPI switched off, all 12 countries report through the RSS fallback, verified through the live /api/health endpoint.",
      hard: "When I first ran the app, only 1 of 12 countries showed weather, even though my NewsAPI key was valid. A valid key working for one country ruled out authentication and pointed at coverage: NewsAPI simply had nothing for most of my countries. Instead of leaving them grey, I added a fallback to Google News RSS, and recorded which source each reading came from so the interface could say so honestly. After that, all 12 countries reported.",
      differently: "My weather thresholds are hand-set, not validated. There's no ground truth for \"news mood\", so I can't say how often VADER agrees with a human reader. With more time I'd hand-label a few hundred headlines to measure that agreement and calibrate the thresholds, and move the cache from SQLite to hosted Postgres so the 7-day trend survives redeploys on free hosting."
    },
    {
      slug: "commbot",
      title: "CommBot",
      kind: "Multilingual alerts",
      oneLine: "Official disaster warnings over SMS and phone calls, in your own language, when the internet isn't there.",
      tags: ["Python", "LLMs", "Twilio", "IVR"],
      team: false,
      visual: "sms",
      image: null,
      links: { code: "https://github.com/makkergauri/commbot" },
      problem: "During floods and storms, the people most at risk are often the ones without reliable internet, and official warnings don't always reach them in a form or language they can use.",
      approach: "CommBot reads official CAP alerts from NDMA's SACHET platform, IMD and state disaster authorities, along with rain forecasts. It extracts the facts, validates them against the source text, scores and targets each alert, and sends SMS built from phrase templates reviewed by native speakers. People can text back commands like STATUS or SHELTER, or call in and ask questions.",
      hard: "An LLM that invents a shelter name during a flood is dangerous. So the LLM never writes the warning: it only picks from fixed lists (hazard type, recommended actions) and copies text that really exists in the official alert. Anything it can't point to in the source is thrown away.",
      differently: "PLACEHOLDER: add your own reflection."
    },
    {
      slug: "lawbot",
      title: "LawBot",
      kind: "Retrieval-augmented generation",
      oneLine: "A legal assistant that answers only from the documents you give it.",
      tags: ["Python", "LangChain", "FAISS", "Ollama", "Groq", "Streamlit"],
      team: true,
      visual: "docs",
      image: null,
      links: { code: "https://github.com/makkergauri/lawbot" },
      problem: "General chatbots answer legal questions confidently whether or not the answer is in the document in front of you. For legal research, a made-up answer is worse than no answer.",
      approach: "Uploaded PDFs are extracted with PDFPlumber, split into overlapping chunks, embedded with nomic-embed-text and stored in a persistent FAISS index. A question retrieves the closest chunks, which go into a strict prompt that tells the model to answer only from that context. The LLM can run locally through Ollama or in the cloud through Groq.",
      role: "Document processing and vector search (vector_database.py), including PDF extraction, chunking, embedding and FAISS index management; prompt design (prompt.py) to make the model answer only from the retrieved context; and the Streamlit interface (app.py) that lets users upload documents, ask questions and see the retrieved context.",
      hard: "Getting the model to say \"that isn't in the document\" instead of guessing, and choosing chunk sizes so the right passage can actually be retrieved.",
      differently: "PLACEHOLDER: add your own reflection."
    },
    {
      slug: "dungeon-engine",
      title: "Dungeon",
      kind: "Game systems programming",
      oneLine: "A game engine I built in C++, and a dungeon game where every level is randomly generated but always solvable.",
      tags: ["C++17", "SFML", "CMake", "Catch2"],
      team: false,
      visual: "cave",
      image: null,
      links: { code: "https://github.com/makkergauri/dungeon-engine" },
      problem: "Randomly generated game levels tend to break in quiet ways, like a room with no door or an exit you can't reach, and the usual fix is to keep regenerating until one looks fine, which hides the bug instead of fixing it. I also wanted to understand what a game engine actually does underneath, instead of just using Unity or Godot and never seeing it.",
      approach: "Each floor starts from a random seed and is built by one of two algorithms: binary space partitioning for rooms and corridors, chosen over scattering random rooms because partitioning makes overlaps impossible and the tree itself says how to connect everything, or cellular automata for natural caves. I then flood-fill from the entrance, and if any floor tile is unreachable I carve a tunnel to it rather than throwing the map away, which keeps generation time bounded and a broken seed reproducible. The game runs on an entity-component system instead of a class hierarchy, so entities are built from parts and the logic can be tested without opening a window. Gameplay runs on a fixed 60 Hz timestep instead of the raw frame time, so physics behaves the same on every machine, and enemies use A* pathfinding that only runs when a wall blocks their view of the player. In automated tests, 240 out of 240 generated floors were fully connected, checked by flood-filling every floor across 120 seeds of each generator.",
      hard: "The code compiled fine on Linux, but on Windows CMake kept saying it couldn't find SFML even though I'd installed it through vcpkg. I tried reinstalling and pointing CMake at the files directly, and it got worse: a failed attempt had saved a broken path into CMake's cache, so every later command kept reading the bad value no matter what I passed in. Opening SFML's version file finally showed the real cause: vcpkg had quietly installed SFML 3.0.2, and the project needs 2.6, so CMake was correctly refusing it. I switched to the official 2.6 binaries, deleted the build folder to clear the cache, and it built.",
      differently: "I'd pin the dependency versions and set up automated builds on Windows and Linux from the start, because most of my time went into environment problems that a reproducible build would have caught immediately. I'd also fix the one inconsistency in how assets are handled: missing art and sound are generated automatically, but a missing font just blanks every menu, which looks like a crash to someone trying the game for the first time."
    },
    {
      slug: "scheduler-scope",
      title: "Scheduler Scope",
      kind: "Operating systems, interactive visualisation",
      oneLine: "An interactive website that animates how an operating system decides which program gets the processor next, and explains why.",
      tags: ["TypeScript", "React", "Framer Motion", "Tailwind CSS", "Vitest", "Web Speech API"],
      team: false,
      visual: "gantt",
      image: null,
      links: { code: "https://github.com/makkergauri/OS-Visual-Scheduler", live: "https://os-visual-scheduler.vercel.app/" },
      problem: "Students learn CPU scheduling from finished Gantt charts in textbooks, which show the final answer but hide the decisions that produced it. You can memorise that SRTF minimises waiting time without ever seeing the moment a preemption happens, or understanding why the same algorithm looks great on one workload and mediocre on another. I wanted a tool that makes those decisions visible as they happen.",
      approach: "The user enters processes or picks a preset, and a single simulation engine runs all six algorithms. Instead of writing six separate simulators, each algorithm is one small \"pick the next process\" function plugged into a shared engine, so SJF and SRTF differ by a single flag and adding a new algorithm means writing one function. The engine advances one time unit at a time rather than jumping between events, because that makes preemptions, arrivals and quantum expiries resolve at clear instants without special cases. The results feed an animated Gantt chart, a live ready queue, a six-way comparison table, and an explanation layer that derives its text from the simulation output rather than using fixed descriptions, so it stays accurate when the workload changes. On the convoy workload, preemptive SRTF cuts average waiting time from 14.00 to 3.50 units compared with FCFS, measured by the engine and backed by 28 unit tests with hand-computed expected results.",
      hard: "My first design narrated every scheduling decision aloud as the simulation played. It failed badly: when two processes arrived one tick apart, the second announcement cut off the first mid-sentence, because I was cancelling the previous speech whenever a new event happened. I realised the real problem was that speech is much slower than the simulation, so any per-event narration either lags behind the animation or gets truncated. I dropped live narration entirely and replaced it with a Listen button that reads a complete written summary of the run.",
      differently: "The simulation treats context switches as free, which flatters preemptive algorithms, since Round Robin needs twice as many switches as SRTF on the mixed workload. With more time I'd add a configurable switch cost so the comparison reflects real hardware, and implement aging so the priority schedulers can demonstrate the standard fix for starvation rather than just the problem."
    },
    {
      slug: "focus-farm",
      title: "Focus Farm",
      kind: "Browser extension, gamification",
      oneLine: "A browser add-on that grows a little pixel farm while you study and lets it wilt when you get distracted.",
      tags: ["JavaScript", "Chrome Extensions (MV3)", "HTML Canvas", "CSS", "Node.js"],
      team: false,
      visual: "farm",
      image: null,
      links: { code: "https://github.com/makkergauri/FOCUS-FARM-APP" },
      problem: "Students studying from online lectures often leave the video playing while they drift to WhatsApp or YouTube, so every time-tracker counts hours they didn't really study. Site blockers are easy to switch off and feel like fighting yourself, so people stop using them. I hit exactly this while preparing for GATE, and wanted something that made drifting visible rather than forbidden.",
      approach: "A background service worker watches which tab is in front, whether the window is focused, and whether I've touched the keyboard recently, and classifies each minute as focused, distracted or neither. I used focus plus input signals instead of just \"is the tab open\", because an open-but-buried lecture is precisely the case I was trying to catch. Those minutes feed a growth engine that raises or lowers each plant's growth and health, with a ramp so short breaks cost almost nothing and long lapses cost a lot. I kept that engine as pure functions instead of mixing in browser code, so I could simulate whole weeks in Node; this is how I found my first health rates were about 10× too harsh (one bad day killed a plant). After retuning, a simulated bad day leaves a plant at 67/100 health while five in a row kill it, verified by node tools/bench.mjs. Focused minutes also earn coins for seeds and new land, where each location multiplies a plant's own traits, so placement is a real choice. The farm is drawn with procedurally generated pixel art on a canvas instead of image files, so the new-tab page loads with nothing to decode.",
      hard: "Planting a plant looked completely broken: I'd type a name, click Plant, and nothing happened. I first suspected the save message wasn't reaching the background worker, but the worker was fine. The real cause was that the tracker writes to storage about once a minute, and every write re-rendered the panel, rebuilding the name box under my cursor, so the text vanished and the button I clicked was a brand-new element. The fix was to skip re-rendering while the input has focus, and mirror each keystroke into memory so the text survives any forced redraw.",
      differently: "The tracker still can't tell real studying from a lecture left running in front of me, and it treats all of YouTube as distraction even though half of GATE prep lives there. With more time I'd add finer signals, like whether the video is actually playing, or allow-listing specific study channels, without reading page content. I'd also test in the real browser from day one instead of relying on a headless renderer, which hid several integration bugs until late."
    },
    {
      slug: "path-tracer",
      title: "Path tracer",
      kind: "Rendering",
      oneLine: "A physically based renderer in C++ with no engine and no graphics library. The image at the top of this site is a small cousin of it.",
      tags: ["C++", "OpenMP", "CMake"],
      team: false,
      visual: "spheres",
      image: null,
      links: { code: "https://github.com/makkergauri/raytracer" },
      problem: "I wanted to understand what a renderer actually does, rather than just calling one.",
      approach: "Rays are traced from the camera through every pixel and bounced around the scene. It supports diffuse, metal and glass materials, depth of field, anti-aliasing and ACES tone mapping, runs across all CPU cores with OpenMP, and uses a bounding volume hierarchy (BVH) so each ray only tests a few objects.",
      hard: "Speed. Every pixel needs many rays, and every ray has to ask what it hit. The BVH is what turns \"check everything\" into \"check almost nothing\".",
      differently: "PLACEHOLDER: add your own reflection."
    }
  ],

  notes: [
    { title: "Why CommBot's LLM never writes the warning", blurb: "On trusting models with the one message that can't be wrong." },
    { title: "What building a BVH taught me", blurb: "The fastest check is the one you never make." },
    { title: "Telling football teams apart without labels", blurb: "Clustering embeddings when nobody tells you which shirt is which." }
  ],

  /* Recommendations you've received and have permission to publish.
     They only appear on the site once you add them here. Format:
     { name: "Dr. A. Sharma", role: "Professor, VIT Bhopal", text: "What they wrote.", link: "https://linkedin.com/in/..." }
     (link is optional) */
  recommendations: [
  ]
};