---
name: reverse-engineering-finished-ui
description: Use when the user is asking for UI, design direction, visual communication, finished HTML, references, inspiration boards, composition studies, or when they care more about what the eye understands first than about textual explanation.
---

# Reverse Engineering Finished UI

## Overview
Treat visual design as primary cognition, not decoration. Start from the finished artifact or the closest available visual reference, then work backward into hierarchy, components, interactions, and implementation.

Core principle:

`finished artifact -> composition -> meaning -> components -> hierarchy -> implementation`

## When to Use

Use this when:
- The user asks for UI, visual direction, layout, aesthetic, or design language
- The user shares screenshots, sites, mood references, galleries, trailers, storefronts, or finished HTML
- The user is reacting to look/feel rather than asking for code structure
- The user wants a planning or builder tool that should begin from image/composition instead of text
- A text-first response would be too abstract to be useful

Do not use this when:
- The user asks for purely technical backend behavior
- The task is implementation-only and the visual direction is already locked

## Non-Negotiables

- Do not lead with a wall of text
- Do not start with Mermaid, boxes, wireframe chrome, or utilitarian controls unless the user explicitly asks for them
- Do not flatten meaning into same-sized labeled boxes when the visual hierarchy should do that work
- Do not explain the artifact before showing the artifact
- Form is function here; visual treatment changes meaning

## Workflow

1. **Start from the finished level**
   - Use the user's screenshots, live pages, HTML, brand refs, or public references first
   - If nothing visual exists, gather 3-6 strong references before proposing structure

2. **Build a visual board first**
   - Prefer a gallery of compositions, crops, variants, or image/caption cards
   - Let the user choose, circle, crop, reject, or cluster before asking abstract questions
   - Keep chrome minimal; the board should feel like a visual surface, not a developer tool

3. **Extract meaning from the chosen visual**
   - Write editable note regions that reverse-engineer the selection:
     - pattern
     - foreground/background
     - center of gravity
     - scale and depth
     - implied components
     - interaction model
     - what should remain silent

4. **Only then derive structure**
   - Infer the components and hierarchy from the chosen composition
   - Move from artifact to system, not system to artifact

5. **Translate into implementation**
   - After alignment, describe the HTML/CSS/components needed to recreate the chosen visual logic
   - Preserve the composition logic during implementation

## Preferred Output Shape

Default output order:

1. Visual board or browser mockup
2. Short captions under each composition
3. Editable reverse-spec regions for the selected option
4. Brief structural interpretation
5. Implementation notes only after visual agreement

## Browser Guidance

When the browser is available:
- Open or create a visual surface early
- Show references side by side when comparison matters
- Make selection direct: click, crop, annotate, cluster
- Use text as captioning and extraction, not as the main medium

Use these supporting files when needed:
- [browser-checklist.md](browser-checklist.md)
- [caption-library.md](caption-library.md)
- [reference-board-template.html](reference-board-template.html)

## Caption Pattern

Use short captions like:
- `World before interface`
- `Object with tension`
- `Mass carries meaning`
- `Navigation as whisper`

Captions should name what the composition is doing, not describe implementation.

## Reverse-Spec Questions

After the user chooses a visual, extract:
- What pattern is carrying the meaning?
- How does the background dictate the foreground?
- Where does the eye land first, second, third?
- What scale relationships create importance?
- Which parts are content, and which parts are chrome?
- What UI components are implied by this composition?

## Failure Modes

- Leading with explanation instead of examples
- Treating text as clearer than images for visual tasks
- Using equal-sized boxes for unequal concepts
- Designing a tool surface before understanding the desired artifact
- Showing planning syntax instead of visual outcomes

## Example

Bad:
- “Here is a Mermaid diagram and an explanation of the flow.”

Good:
- “Here are four crops/compositions from your reference. Pick one. I’ll generate the reverse-spec notes and component hierarchy from that.”
