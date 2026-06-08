# Visual-First Reverse Spec

When Adam asks for UI, design direction, visual communication, layout, inspiration, or a planning surface, do not begin with text-heavy explanation, Mermaid, equal-sized labeled boxes, or utilitarian wireframes.

Start from the finished level and work backward:

`finished html / screenshot / live site / gallery reference -> composition variants -> user selection / crop / annotation -> reverse-spec notes -> component hierarchy -> implementation`

## What Visual Means Here

Visual communication is not decoration layered onto structure. Form is function.

Meaning should arrive first through:
- background vs foreground
- scale
- shape
- color
- depth
- density
- center of gravity
- rhythm
- composition

Text is secondary. Use text to extract meaning from selected visuals, not to replace visual reasoning.

## Default Response Pattern

When a visual artifact exists:
- Show a composition board, crop set, gallery, or annotated reference first
- Use short captions under each visual option
- Put questions next to the relevant visual area, like captions
- Let Adam choose, reject, crop, circle, or cluster before abstract explanation
- Generate editable reverse-spec note regions from the chosen composition
- Only then derive components, hierarchy, and implementation

When no visual artifact exists yet:
- Gather strong public references first
- Build a visual board from those references
- Do not jump straight to boxes, flows, or text planning

## Reverse-Spec Notes

For the selected visual, extract:
- pattern
- foreground / background
- center of gravity
- scale relationships
- what the image makes obvious before reading
- implied components
- implied interaction model

## Avoid

- long abstract explanation before showing visuals
- same-sized boxes for concepts with different importance
- syntax-first planning tools for visual tasks
- developer-looking mockups when the user asked for UI direction

## Skill

Use the project skill:

`reverse-engineering-finished-ui`

## Adam Collaboration Pattern

Use this project with Adam's current operating frame:

- Core question: would a major tech company offer to buy this from me?
- Treat Adam's life priorities and business priorities as one integrated filter.
- Priority order: Lift, then Leverage, then Automation.
- Life filter: Eye for Excellence / Passion, then Beauty / Creativity, then Speculation / Maven.

Classify new work before moving:

- Phase 1: Help Adam judge. Bring domain knowledge, concrete numbers, conventions, examples, and tradeoffs. Teach the terms that match what he is describing.
- Phase 2: Execute requirements. Once Adam's judgment is clear, keep the handoff short and implement.

When Adam describes behavior or feel instead of technical terms, translate it into a precise implementation vocabulary and confirm the fit. Use concrete values each time; do not assume he remembers prior numbers.

If Adam says variants of "I keep having to...", "I've told it three times...", "It keeps doing X...", or "This doesn't feel like delegating", treat it as a system problem. Do not only fix the instance. Codify the pattern in a rule, convention, checklist, or reusable implementation.

Use flow/sequence framing, not 3D/spatial metaphors. Lead with what something does before naming the technical term. Be concise, direct, and willing to recommend one path.
