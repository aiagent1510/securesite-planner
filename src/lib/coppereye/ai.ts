import ZAI from "z-ai-web-dev-sdk"
import { CATEGORY_LABEL } from "./categories"

const SYSTEM_SURVEYOR =
  "You are CopperEye's AI security surveyor — a highly experienced UK security installer who has fitted thousands of CCTV systems, intruder alarms, gate automation, access control and commercial security. You give practical, specific, safety-aware guidance in British English. You never invent equipment brand prices. You keep recommendations realistic for a professional installer to quote from."

export interface PhotoAnalysisInput {
  stepTitle: string
  category: string
  notes?: string
  dataUrl: string
}

/** Analyse one walk-round photo and return a short observation relevant to the install. */
export async function analyzePhoto(input: PhotoAnalysisInput): Promise<string> {
  const zai = await ZAI.create()
  const prompt = [
    `You are surveying a property for a ${CATEGORY_LABEL[input.category] ?? input.category} installation.`,
    `This photo was taken by the customer during a guided walk-round at the step: "${input.stepTitle}".`,
    input.notes ? `The customer added these notes: "${input.notes}".` : "",
    "In no more than 90 words, list what you can see that matters for planning this installation:",
    "surfaces and mounting points, heights if estimable, cable route options, power availability, obstructions, risks, coverage opportunities.",
    "Be concrete (e.g. 'rendered wall, approx 4m eaves, gutter line clear for a corner camera').",
    "If the image is unclear or irrelevant, say so briefly.",
  ]
    .filter(Boolean)
    .join(" ")

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const completion = await zai.chat.completions.createVision({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: input.dataUrl } },
            ],
          },
        ],
        thinking: { type: "disabled" },
      })
      const content = completion.choices[0]?.message?.content
      if (content && content.trim().length > 0) return content.trim()
    } catch (err) {
      console.error(`analyzePhoto attempt ${attempt} failed:`, err)
      if (attempt === 2) throw err
      await new Promise((r) => setTimeout(r, 1200))
    }
  }
  throw new Error("Photo analysis failed")
}

export interface BriefInput {
  category: string
  title: string
  description?: string | null
  propertyType?: string | null
  postcode: string
  town?: string | null
  budget?: string | null
  steps: { id: string; title: string }[]
  answers: Record<string, string>
  photoNotes: { stepTitle: string; note: string }[]
}

/** Turn walk-round answers + photo observations into a structured engineer-ready job brief. */
export async function generateBrief(input: BriefInput): Promise<string> {
  const zai = await ZAI.create()

  const answerLines = input.steps
    .map((s) => {
      const answer = input.answers[s.id]
      if (!answer || !answer.trim()) return `- ${s.title}: (no notes given)`
      return `- ${s.title}: ${answer.trim()}`
    })
    .join("\n")

  const photoLines =
    input.photoNotes.length > 0
      ? input.photoNotes.map((p) => `- [${p.stepTitle}] ${p.note}`).join("\n")
      : "(no photos analysed)"

  const userPrompt = `Job: ${input.title}
Category: ${CATEGORY_LABEL[input.category] ?? input.category}
Property type: ${input.propertyType ?? "not stated"}
Location: ${input.town ?? ""} ${input.postcode}, UK
Customer budget: ${input.budget ?? "flexible"}
Customer description: ${input.description ?? "(none)"}

WALK-ROUND ANSWERS:
${answerLines}

AI PHOTO OBSERVATIONS:
${photoLines}

Write an installation survey brief for a professional engineer who has never visited the site and wants to quote accurately without a call-out. Use markdown with these exact sections:

## Overview
2-3 sentences summarising the property and what the customer wants.

## Recommended positions
A numbered list of every camera/sensor/gate/panel position. For each: where to mount (wall/pier/room), height, angle or coverage area, and why. Be specific to what the photos and answers show. CCTV: state each camera's purpose (e.g. front door coverage, numberplate capture, garden boundary).

## Cable routes & power
How cabling could run, where power is needed, any armoured/outdoor cable requirements.

## Connectivity & setup notes
Recorder/panel placement, router proximity, app/remote-viewing considerations.

## Risks & access
Working at height, ladders, pets, children, parking, business hours, anything that affects quoting.

## Suggested kit & quantities
A realistic quantity list (e.g. "4x dome cameras, 1x 8-channel NVR + 2TB drive, 40m Cat6 outdoor cable, 4x PIR, 2x door contact, 1x panel, 1x bell box, intercom..."). Generic categories, not brand orders.

## Open questions for the engineer
3-5 sharp questions the engineer should confirm with the customer before finalising the quote.

Rules: only use facts from the answers and photo notes; do not invent measurements that were not given (estimate with "approx" where sensible); British English; concise but complete.`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "assistant", content: SYSTEM_SURVEYOR },
      { role: "user", content: userPrompt },
    ],
    thinking: { type: "disabled" },
  })

  const content = completion.choices[0]?.message?.content
  if (!content || content.trim().length === 0) throw new Error("Brief generation failed")
  return content.trim()
}

/** Fallback brief when AI is unavailable — still useful, built purely from answers. */
export function fallbackBrief(input: BriefInput): string {
  const answerLines = input.steps
    .map((s) => {
      const answer = input.answers[s.id]
      return answer && answer.trim() ? `- **${s.title}:** ${answer.trim()}` : ""
    })
    .filter(Boolean)
    .join("\n")
  return [
    `## Overview`,
    `${input.title} — ${CATEGORY_LABEL[input.category] ?? input.category} job at ${input.town ?? ""} ${input.postcode}.`,
    input.description ? `Customer says: ${input.description}` : "",
    ``,
    `## Walk-round notes (customer provided)`,
    answerLines || "(no notes provided)",
    ``,
    `## Note`,
    `AI analysis was unavailable when this survey was submitted. Use the customer's walk-round notes and photos to quote; confirm any details by phone.`,
  ]
    .filter(Boolean)
    .join("\n\n")
}
