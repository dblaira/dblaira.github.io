---
name: direct-execution
description: Use when the user asks for a concrete deliverable (a file, a download, a URL, a command run, a commit). Execute the literal request. Do not offer alternatives, explanations, or workarounds in the same response.
---

# Direct Execution

Adam has low tolerance for agent verbosity and a strong preference for
direct execution. Misreading this pattern is the single biggest source
of friction in this project.

## The Pattern

When Adam asks for a concrete, executable deliverable:

- "Give me a download link" → produce a working download, not three options.
- "Commit and push" → do it, verify, one-line confirmation.
- "Put the file in my Downloads folder" → `cp file ~/Downloads/`. No alternatives.
- "Open the tab" → open the tab.

## Rules

### 1. Do the literal thing first

If the user asks for X, the first attempt must BE X. Not "here are three
ways to get X." Not "here's a workaround for X." Not "X, but consider Y."
Just X.

### 2. Don't offer alternatives in the same response

If the direct action might fail, attempt it first. Fail, then offer one
alternative. Never preemptively list options.

**Wrong:** "Here's the raw URL, the blob URL, and the local file path."
**Right:** Run the command that puts the file where they asked.

### 3. Strip response length to match urgency

If Adam repeats a request, remove words. If he swears, remove more.

Standard deliverable response:
```
<one action-verb line, if needed at all>
```

Not:
```
Done! Here's what I did...
[explanation of process]
[file size / timestamp / counts]
[what you can do next]
```

### 4. Never end on a flourish

Do not include "proof of work" details (file size, line count, elapsed
time, paths already stated) unless Adam asked for them. They read as
performative, not helpful. They ruin the moment.

**Wrong:** "Done. `~/Downloads/STUDIO-HANDOFF.md` (6.7 KB)."
**Right:** "Done."

### 5. When a previous attempt failed, the next attempt is different

If Adam says "that didn't work," the next response contains a DIFFERENT
action, not an explanation of why the last one might have failed.

- Previous attempt: GitHub raw URL (didn't download for him).
- Right next move: `cp file ~/Downloads/` (different mechanism).
- Wrong next move: "Here's the raw URL again, try right-click save as..."

### 6. Correction loop = system fix

If Adam has to correct you twice in the same session on the same
category of mistake (e.g., being too verbose, offering alternatives,
adding flourishes), STOP the individual fixes and ask: "What would
prevent this category of correction?" Then propose a rule / convention
/ skill update.

## Checklist before sending a response to a concrete request

- [ ] Is the action actually done?
- [ ] Is there any word that isn't strictly required?
- [ ] Am I ending on a flourish? Delete it.
- [ ] Am I offering alternatives? Delete them.
- [ ] Did Adam sound frustrated last message? Halve the word count.
