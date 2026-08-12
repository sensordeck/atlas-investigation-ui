export const prompts = ["Summarize this case","Explain the evidence","Why this Tier Candidate?","What evidence is missing?","Draft partner request","Recommend next investigation step"];

const missing = (c) => Object.entries(c.signals).filter(([,v])=>v === "Not produced").map(([k])=>k);
export function copilotAnswer(prompt, c) {
  const map = {
    "Summarize this case": [`${c.happened} Current status is ${c.status}; the next owner/action is: ${c.next}`, ["case.happened","case.status","case.next"]],
    "Explain the evidence": [`Available evidence is limited to: ${c.available} This describes observations, not cause.`, ["case.available","case.signals"]],
    "Why this Tier Candidate?": [`${c.tier} is a workflow candidate shown in sanitized demo data. It is not a confirmed classification and no engine decision is represented.`, ["case.tier","claim_boundary.root_cause_inferred"]],
    "What evidence is missing?": [`Not produced by this artifact: ${missing(c).join(", ") || "none of the displayed signal tracks"}. Absence is not negative evidence.`, ["case.signals"]],
    "Draft partner request": [`DRAFT partner request: Please review ${c.partner.model} interface metadata and provide only authorized evidence needed for: ${c.next} Do not include raw customer payloads.`, ["partner.model","case.next"]],
    "Recommend next investigation step": [`Recommended draft step: ${c.next} Human review is required before partner response or closure.`, ["case.next","case.status"]]
  };
  const [text, refs] = map[prompt] ?? [`I can only answer the six suggested questions in this deterministic preview.`, ["copilot.allowed_prompts"]];
  return {text, refs, confidence:"Boundary: sanitized demo fields only · root_cause_inferred=false", label:"DRAFT / AI-assisted"};
}
