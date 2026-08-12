import test from "node:test"; import assert from "node:assert/strict"; import { CanaryRunner, extractJson } from "../src/runner.js";
test("captures output, exit status, and final JSON line",async()=>{const r=await new CanaryRunner({command:process.execPath,args:["-e",'console.log(`log\\n{\\"observed_topics\\":[\\"/x\\"]}`)']}).run();assert.equal(r.status,"PASS");assert.equal(r.exitCode,0);assert.deepEqual(r.artifact.observed_topics,["/x"]);});
test("enforces timeout",async()=>{const r=await new CanaryRunner({command:process.execPath,args:["-e","setTimeout(()=>{},1000)"],timeoutMs:20}).run();assert.equal(r.status,"FAIL");assert.equal(r.timedOut,true);});
test("extractJson ignores ordinary log lines",()=>assert.equal(extractJson("hello\nworld"),null));
test("rejects concurrent runs",async()=>{const runner=new CanaryRunner({command:process.execPath,args:["-e","setTimeout(()=>{},80)"]});const first=runner.run();await assert.rejects(()=>runner.run(),/already in progress/);await first;});
