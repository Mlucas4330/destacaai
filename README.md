# DestacaAI

DestacaAI is an extension micro-saas that solves the problem of having generic CVs by generating a custom one for the specific position you're applying to.

# Problem

Sometimes you're a skilled developer with great side projects and experience, however, is still not getting the job you wanted. That happens with all of us. The problem is not you, it's how you're showing it. Nowadays companies are using AI ATS (Applicant Tracking System), automatically filtering you for not using specific keywords related to the job requirements.

Even though you're aware of those filtering methods and manually customize your CV for the position you want, how much time per day can you realistically spend doing this?

# Solution

DestacaAI can use your generic CV to generate a custom one to match the requirements of the position, using the right structure, sections and keywords found in the job description.

Template created by DevCelio: https://github.com/celiobjunior/resume-template

# Project

At the beginning, I wanted to create a solution for the step after the application: How could you reach out the recruiters responsible for that position in order to stand out? Premium LinkedIn users can send AI-generated messages directly to recruiters, giving them an enormous advantage over other candidates. You can find recruiters without premium, but it's hard to know how to approach them. Should the message be friendly? Professional? About previous experiences? How do you show interest without looking desperate?

Even with tools like Claude, Gemini or ChatGPT available, it's easy to
lose track of what you sent and whether it's consistent with your information.

This is the first sketch I did for the project.
![Sketch](./public/sketch.png)

The idea was pretty much the same as now, a Chrome extension that automatically reads job descriptions, finds the company's recruiters on LinkedIn, and generates a personalized outreach message based on your CV, keeping your approach consistent across every application. The problem was that I wouldn't know who's specifically responsible for the position and even though I knew, how long would take for the person to accept the connection invitation? How could this be tracked?

While thinking on how to address those problems, I had an even better idea: What if I pivot my solution to the previous step?

Based on this new idea, I created this User Flow:
![User Flow](./public/user-flow.png)

## Functional Requirements

- User can see all saved jobs when opening the extension
- User can delete a saved job from the dropdown
- Saving the same job twice is prevented by checking the job ID
- Limited to 5 saved jobs
- If the API key is invalid or quota is exceeded, the user is notified
- User can clear all data
- If no jobs are saved, an empty state message is shown
- Config auto-saves without a Save button
- Auto-navigation to Add Job on right-click
- Form state survives popup close/reopen

## Non-Functional Requirements

- Jobs and custom cvs are deleted after 10 days
- Extension only works on LinkedIn job posting pages
- Only Chrome is supported
- CV upload format: PDF
- Max file size: 10mb
- LLM providers: ChatGPT, Claude, Gemini
- Expected CV generation time: 2 minutes

## Tradeoffs

### Local storage vs backend:

chrome.storage.local was chosen over IndexedDB because persistence
isn't a core requirement. Generated CVs are meant to be used and
discarded after applying. The 5MB quota is acceptable given the
short data lifecycle.

### Device synchronization:

Data won't synchronyze through devices and if storage is cleaned, previously generated CVs will be lost.

### BYOK (Bring Your Own Key) vs self-hosted LLM:

There are three main points I considered.

1. **Cost**: A self-hosted LLM would need a backend service and a VPS for hosting, which exceeds the budget.
2. **Quality**: Output quality depends on the provider the user chooses. GPT-4 and Claude Sonnet will produce better results than smaller models.
3. **Security**: The API key will be exposed in the extension's storage. Anyone who knows how to inspect Chrome extensions can find it.

I acknowledge those, but accept the tradeoff for MVP simplicity.

### CV generation approach:

The CV generation will use an optimized template, adapting for the specific job, without having to create structure from scratch, reducing the model's workload.

### Retry logic:

The LLM call will have retry logic at client level, in case of some network error with the provider. A more robust retry logic would need a backend. Based on this project growth, this robust retry logic, queues for large amount of requests and observability will be implemented.

