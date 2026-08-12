const missing = (p) => [
  ["observed_topics", p.observedTopics], ["topic eligibility/classification", p.topicClassification],
  ["timing_relationships", p.timingRelationships], ["governance/evidence windows", p.evidenceWindows],
  ["classification_state", p.classificationState]
].filter(([, v]) => v === null).map(([k]) => k);
const count = (v) => Array.isArray(v) ? v.length : v && typeof v === "object" ? Object.keys(v).length : v === null ? 0 : 1;
const safe = (v) => v === null ? "not produced" : typeof v === "string" ? v : JSON.stringify(v, null, 2);

export function answerCopilot(action, p, run = {}) {
  const lead = "DRAFT / AI-assisted — Deterministic response based only on the loaded JSON artifact. ";
  const gaps = missing(p);
  const answers = {
    summarize: `The artifact contains ${count(p.observedTopics)} observed topic item(s), ${count(p.topicClassification)} topic classification item(s), and ${count(p.timingRelationships)} timing relationship item(s). Classification state: ${safe(p.classificationState)}. Run status: ${run.status ?? "not run"}.`,
    evidence: `Evidence windows: ${safe(p.evidenceWindows)}. Topic eligibility/classification: ${safe(p.topicClassification)}.`,
    timing: `Timing relationships: ${safe(p.timingRelationships)}. No causal interpretation is added.`,
    missing: gaps.length ? `Not produced by this baseline: ${gaps.join(", ")}.` : "All fields displayed by this MVP are present; this does not establish completeness or root cause.",
    next: gaps.length ? `Recommended next validation step: run the documented public SDK canary baseline in Local Live Mode and check whether it produces: ${gaps.join(", ")}.` : "Recommended next validation step: independently validate the artifact against the public SDK baseline and review its logs before any investigation decision."
  };
  if (!answers[action]) throw new Error("Unknown copilot action");
  return lead + answers[action] + " This response does not confirm root cause.";
}
