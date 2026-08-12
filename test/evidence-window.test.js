import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const app=await readFile('public/app.js','utf8');
const snapshotBytes=await readFile('public/data/lidar_case1_frozen_v0.1.0/ui_snapshot.json');
const manifestBytes=await readFile('public/data/lidar_case1_frozen_v0.1.0/manifest.json');

test('English and Chinese EP views define all five evidence windows',()=>{
  for(const label of ['Pre-event Window','Near-event Window','Canonical Event T0','Post-event Window','Post-event Guard Window']){
    assert.ok(app.includes(label),`missing English evidence window: ${label}`);
  }
  for(const label of ['事件前窗口','临近事件窗口','事件锚点 T0','事件后窗口','事件后保护窗口']){
    assert.ok(app.includes(label),`missing Chinese evidence window: ${label}`);
  }
  assert.ok(app.includes("notProvided:'Not provided by snapshot'"));
  assert.ok(app.includes("notProvided:'快照未提供'"));
});

test('alignment and frozen-boundary explanations are bilingual',()=>{
  for(const text of ['五段证据窗口以事件锚点 T0 对齐。T0 是一个时间点，不代表完整异常持续时段，也不代表根因发生时刻。','本冻结快照仅显示已提交的时间边界；未提供的分段时间不作推算。','按冻结规则选定的异常对齐时刻','The five evidence windows are aligned to Event T0. T0 is a timestamp—not the complete anomaly duration or a confirmed root-cause time.','Event alignment timestamp selected by the frozen policy','This frozen snapshot displays only submitted time boundaries; missing segment times are not inferred.'])assert.ok(app.includes(text));
});

test('the five-window display retains the original time_window disclosure',()=>{
  assert.match(app,/evidenceTimeline\(val\)/);
  assert.match(app,/JSON\.stringify\(timeWindow,null,2\)/);
  assert.match(app,/time-window-original/);
});

test('frozen JSON SHA-256 values remain unchanged',()=>{
  assert.equal(createHash('sha256').update(snapshotBytes).digest('hex'),'fe2c4cdd21262a6b365453683fc60c9a04cd6dc41c9eaf20e81c782468aeec24');
  assert.equal(createHash('sha256').update(manifestBytes).digest('hex'),'1df2f8928aadf7cacd37db98cf10a97efe1ff8012a0bea189886dee710ce8ffd');
});
