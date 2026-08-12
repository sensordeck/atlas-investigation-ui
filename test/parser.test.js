import test from "node:test"; import assert from "node:assert/strict"; import { parseArtifact } from "../src/parser.js";
test("maps snake-case evidence without inventing missing fields",()=>{const p=parseArtifact({evidence:{observed_topics:["/imu"],classification_state:"eligible"}});assert.deepEqual(p.observedTopics,["/imu"]);assert.equal(p.classificationState,"eligible");assert.equal(p.timingRelationships,null);});
test("rejects non-object artifacts",()=>assert.throws(()=>parseArtifact([]),/JSON object/));
