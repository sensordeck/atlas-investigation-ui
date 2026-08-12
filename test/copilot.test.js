import test from "node:test"; import assert from "node:assert/strict"; import { parseArtifact } from "../src/parser.js"; import { answerCopilot } from "../src/copilot.js";
test("answers are guarded and disclose missing data",()=>{const x=answerCopilot("missing",parseArtifact({observed_topics:[]}),{});assert.match(x,/DRAFT \/ AI-assisted/);assert.match(x,/timing_relationships/);assert.match(x,/does not confirm root cause/);});
test("unknown actions are rejected",()=>assert.throws(()=>answerCopilot("hack",parseArtifact({}),{}),/Unknown/));
