# MEERA Creative Studio 🎬

An independent, static creative-video workspace hosted under `/studio/`.

## What works now
- Multi-scene storyboards and short-form shot planning
- Character, world and consistency bibles
- Camera preset, duration, dialogue and ambient-sound editor
- Cinematic per-shot prompt composer (including prompt for Google Flow)
- Browser-local project autosave and JSON import/export
- Per-scene image reference preview (current browser tab only)
- Lightweight offline template-based chat helper (NOT a generative AI model)
- Direct links to official Google Flow and ChatGPT after copying prompts
- Real animated storyboard WebM export **where MediaRecorder WebM is supported**;
  it is a motion-graphics animatic, NOT AI-generated movie footage.
- Preloaded Forest Messenger / Itashi example project

## How to open
After GitHub Pages publishes the new folder:
`https://harikishan1233wysgshbsna.github.io/meera-production-app/studio/`

The factory entry app remains at the original root path and is not modified
by the studio folder.

## How to make an AI video
1. Edit the project title, character/world bible and a scene.
2. Click `Copy Shot Prompt`.
3. Click `Open Google Flow` (official service) and paste the prompt there.
4. Upload the reference image to Flow manually, if using image-to-video.
5. Generate, then download your clip on the provider site.
6. Repeat per scene to keep the same actors/locations/camera grammar.

## For real ChatGPT-like replies *inside* the studio
Use a private backend that authenticates users, rate-limits usage, stores API
keys in server-side secrets, and sends only permitted project text to the
chosen LLM API. Never place API keys in a public GitHub Pages HTML file.

## For real text/image-to-video *inside* the studio
Build a private backend integration, for example with the supported Gemini
video generation API (not the private Google Flow website). Implement
asynchronous generation jobs, usage/quota limits, billing controls and a media
storage bucket. Expose endpoints for `create job`, `job status`, and
`download result` with authorization. Do not assume Flow has a public
integration endpoint that accepts direct website prompts.

The current OpenAI Videos API/Sora 2 API was deprecated and removed in Sep
2026, so don't add code that calls those discontinued video endpoints.

## Data security
The studio is separate from production and does not have access to the
PRODUCTION DATA sheet or factory user sessions. Project text is local to the
browser until exported by the user. Reference photos use ephemeral blob URLs
and are never uploaded by this page. No provider API keys are embedded.
