const aliases = (o, names) => names.find((n) => o?.[n] !== undefined);

export function parseArtifact(input) {
  const raw = typeof input === "string" ? JSON.parse(input) : input;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Artifact must be a JSON object");
  const evidence = raw.evidence ?? raw.result ?? raw;
  const value = (names) => {
    const key = aliases(evidence, names) ?? aliases(raw, names);
    return key ? (evidence[key] ?? raw[key]) : null;
  };
  return {
    observedTopics: value(["observed_topics", "observedTopics"]),
    topicClassification: value(["topic_eligibility", "topic_classification", "topicEligibility", "topicClassification"]),
    timingRelationships: value(["timing_relationships", "timingRelationships"]),
    evidenceWindows: value(["governance_evidence_windows", "evidence_windows", "governance_windows", "evidenceWindows"]),
    classificationState: value(["classification_state", "classificationState"]),
    raw
  };
}

export function hasEvidence(parsed) {
  return [parsed.observedTopics, parsed.topicClassification, parsed.timingRelationships,
    parsed.evidenceWindows, parsed.classificationState].some((x) => x !== null);
}
