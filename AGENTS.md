<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:code-quality-rules -->

# Code Quality Standards

Every file in this repository must follow these rules without exception.

## Simplicity

- Write the minimum code that correctly solves the problem. If a simpler approach exists, use it.
- Do not add abstractions or generalisations unless required by the current task.
- Do not install a library if a native browser API or built-in Node.js module achieves the same result.

## Readability and Clarity

- Name variables, functions, and components after what they do, not how they do it.
- Keep functions and components small and single-purpose. If a function does two things, split it.
- Avoid abbreviations unless universally understood (e.g. `id`, `url`, `api`).
- Do not over-comment. Code should explain itself. Only add a comment when the _why_ is not obvious from the _what_.

## Error Handling

- Every API call, server action, and async operation must have explicit error handling.
- Never let an unhandled rejection or uncaught exception reach the user silently.
- Always show a human-readable error message in the UI when something fails. Never expose raw error objects or stack traces.
- Handle these failure cases explicitly for every AI API call: network failure, timeout, malformed response, and empty response.

## UI Standards

- Every interactive element must be reachable by keyboard.
- Use semantic HTML (`<button>`, `<main>`, `<section>`, `<label>`) instead of styled `<div>` elements where a semantic alternative exists.
- Every async operation visible to the user requires a loading state. The user must always know when something is happening.
- Do not add animations or visual effects unless they communicate a state change. Style serves clarity, not decoration.
<!-- END:code-quality-rules -->
