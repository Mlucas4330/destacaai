# DestacaAI — Developer Reference

## Trade-offs

### Persistence:

I will use chrome.storage.local for structured data like job metadata and settings. For binary files such as the uploaded CV, IndexedDB will be used instead.
Only IndexedDB would mean writing significantly more boilerplate for simple things like saving the API key, with no real benefit. The code complexity isn't worth it for data that's just a few kilobytes of JSON. However, chrome.storage.local requires base64 encoding for binary data, which inflates file size by ~33% and would quickly exhaust the 5MB quota.

### Device synchronization:

Data won't synchronyze through devices and if storage is cleaned, previously generated CVs will be lost.

### BYOK (Bring Your Own Key) vs self-hosted LLM:

There are three main points I considered.

1. **Cost**: A self-hosted LLM would need a backend service and a VPS for hosting, which exceeds the budget.
2. **Quality**: Output quality depends on the provider the user chooses. GPT-4 and Claude Sonnet will produce better results than smaller models.
3. **Security**: The API key will be exposed in the extension's storage. Anyone who knows how to inspect Chrome extensions can find it.

I acknowledge those, but accept the tradeoff for MVP simplicity.

### CV generation approach:

The LLM returns structured JSON via Vercel AI SDK's `generateText()`, validated against a Zod schema. The structured data is passed directly to `CVTemplatePDF`, a `@react-pdf/renderer` component that generates a downloadable PDF client-side via `pdf().toBlob()`.

Note: `html2pdf.js` was replaced by `@react-pdf/renderer` after the Chrome Web Store rejected the extension for referencing a remote CDN URL (`cdnjs.cloudflare.com/pdfobject`) inside html2pdf's bundle — a Manifest V3 violation. `@react-pdf/renderer` is fully self-contained and uses standard PDF fonts with no network calls.

### Retry logic:

The LLM call will have retry logic at the client level to handle network errors. Future plans include more robust retry logic, request queues for high request volume, and observability, all of which would require a backend service and will be implemented based on the project's growth.

---

## State Management

State is split between React local state (in-memory while popup is open)
and persistent storage. React state is just a cache - chrome.storage.local
and IndexedDB are the source of truth.

**Config Page:**

- API Key - read from chrome.storage.local on mount, written back on change
- Provider - same as above (OpenAI, Anthropic, Gemini)
- CV - stored as a PDF Blob in IndexedDB

**Home Page / Job Page:**

- Jobs list - read from chrome.storage.local on mount
- Empty state - derived from jobs list length, no separate state needed
- Job - passed as prop from parent component, owned by the Jobs list

---

## Component Structure

Components are split by feature. Shared components are reused across features.

```
src/
├── features/
│   ├── jobs/
│   │   ├── components/    # Jobs, Job, AddJob, EmptyState
│   │   ├── hooks/         # useJobs, useSelectedJob
│   │   └── index.ts
│   └── config/
│       ├── components/    # ConfigForm, CVUpload, ApiKeyInput
│       ├── hooks/         # useConfig, useCV
│       └── index.ts
├── shared/
│   ├── components/        # Button, IconButton, Input
│   └── hooks/             # useStorage, useIndexedDB
└── App.tsx
```

---

## Libraries

- **@react-pdf/renderer** - client-side PDF generation from `CVTemplatePDF`, a React component using `Document`/`Page`/`View`/`Text` primitives; uses built-in standard PDF fonts (Times-Roman) with no remote calls, fully Manifest V3 compliant
- **Vercel AI SDK** (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`) -
  provider abstraction for LLM calls; `generateObject()` returns structured JSON
  validated against a Zod schema; switching providers requires changing only the
  model constructor, keeping the rest of the codebase provider-agnostic
- **Zod** - schema validation for structured output via Vercel AI SDK
- **Tailwind CSS** - utility-first styling
- **ESLint** - static analysis and code consistency
- **Lucide React** - beautiful icons
- **React Hot Toast** - for notifications
- **Framer Motion** - for animations
- **React Router DOM** - navigation between Home and Config screens

---

## Styles

**Tailwind CSS v4** with `@theme` tokens for all design decisions —
no custom CSS files, no constant variables. All styles are colocated
with components using utility classes.

**Design tokens:**

- Warm off-white background with dark navy text and yellow as the primary accent
- Typography: DM Sans (UI) + DM Mono (code/keys)
- Border radius: xl to 3xl - rounded buttons and cards throughout
- Popup constrained to 360px width

**Motion:** Framer Motion handles all transitions - button press feedback
with `whileTap`, page transitions with `AnimatePresence`, and list item
stagger animations on mount.

**Notifications:** React Hot Toast with custom styling matching the dark
theme, positioned at the bottom center of the popup.

---

## Code Rules

- UI components must not contain business logic. Services, LLM calls
  and data transformations belong in the feature's service or custom hooks.
- Helper functions that are used by a single component can live in the
  same file. If used by two or more, move to a shared location.
- Config constants (providers, limits, feature flags) belong in
  `@shared/constants.ts`, not inside components.
  No external style constant files.

