/* =============================================================
   SITE CONTENT
   Everything written about you lives in this file, so you can
   edit text without touching layout code.
   Search for "PLACEHOLDER" to find the bits only you can fill in.
   ============================================================= */

window.SITE = {

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

  /* Each project gets a panel on the home page and its own case-study page
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
      role: "PLACEHOLDER: what you personally built.",
      hard: "Getting the model to say \"that isn't in the document\" instead of guessing, and choosing chunk sizes so the right passage can actually be retrieved.",
      differently: "PLACEHOLDER: add your own reflection."
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
      role: "PLACEHOLDER: e.g. \"I designed and built it.\"",
      hard: "An LLM that invents a shelter name during a flood is dangerous. So the LLM never writes the warning: it only picks from fixed lists (hazard type, recommended actions) and copies text that really exists in the official alert. Anything it can't point to in the source is thrown away.",
      differently: "PLACEHOLDER: add your own reflection."
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
      role: "Solo project.",
      hard: "Speed. Every pixel needs many rays, and every ray has to ask what it hit. The BVH is what turns \"check everything\" into \"check almost nothing\".",
      differently: "PLACEHOLDER: add your own reflection."
    },
    {
      slug: "dungeon-engine",
      title: "Game engine & dungeon",
      kind: "Systems",
      oneLine: "A 2D engine written from scratch in C++17, and a procedurally generated dungeon crawler built on it.",
      tags: ["C++17", "SFML", "CMake"],
      team: false,
      visual: "cave",
      image: null,
      links: { code: "https://github.com/makkergauri/dungeon-engine" },
      problem: "Game engines hide a lot of decisions. I wanted to make them myself.",
      approach: "The engine knows nothing about dungeons: it provides an entity-component system, a fixed-timestep loop, a batching renderer, AABB physics, input and audio. The game has two level generators, BSP rooms and cellular-automata caves; every floor is flood-filled to guarantee it's connected, and repaired rather than regenerated if it isn't. All art and sound is generated in code, with no asset files.",
      role: "Solo project.",
      hard: "Enemies that path-find without clipping through doorways or eating the frame budget: A* with a binary heap, corner-cut prevention and path smoothing, skipped when there's a clear line to the player and capped at four searches per step.",
      differently: "PLACEHOLDER: add your own reflection."
    },
    {
      slug: "scheduler-scope",
      title: "Scheduler Scope",
      kind: "Visualisation",
      oneLine: "Six CPU scheduling algorithms, animated tick by tick, with the reasoning left in.",
      tags: ["TypeScript"],
      team: false,
      visual: "gantt",
      image: null,
      links: { code: "https://github.com/makkergauri/OS-Visual-Scheduler", live: "https://os-visual-scheduler.vercel.app/" },
      problem: "Operating systems courses teach scheduling with finished Gantt charts: the answer, with the reasoning removed. You rarely see when a preemption happens or why the same algorithm looks brilliant on one workload and poor on another.",
      approach: "All six algorithms run on one shared simulation engine that owns the clock, arrivals, idle gaps, quantum expiry and metrics. Each algorithm contributes a single pick(ready) function plus two optional flags, preemptive and quantum. The difference between SJF and SRTF is one flag.",
      role: "Solo project.",
      hard: "Explaining each decision in plain language at the exact moment it happens.",
      differently: "PLACEHOLDER: add your own reflection."
    }
  ],

  notes: [
    { title: "Why CommBot's LLM never writes the warning", blurb: "On trusting models with the one message that can't be wrong." },
    { title: "What building a BVH taught me", blurb: "The fastest check is the one you never make." },
    { title: "Telling football teams apart without labels", blurb: "Clustering embeddings when nobody tells you which shirt is which." }
  ]
};
