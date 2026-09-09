import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const input=path.join(ROOT,'artifacts','weather-model-benchmark.json');
if(!fs.existsSync(input))throw new Error('Run npm run backtest:weather first.');
const r=JSON.parse(fs.readFileSync(input,'utf8'));
const base=r.baselineCandidate,wx=r.weatherCandidate,improve=r.medianErrorImprovementVsBasePct;
const checks={
  medianAbsoluteErrorImprovementAtLeast5Pct:improve>=5,
  meanAbsoluteErrorNoWorseThan2Pct:wx.meanAbsoluteError<=base.meanAbsoluteError*1.02,
  medianLogErrorNoWorse:wx.medianLogError<=base.medianLogError,
  peakClassificationWithin2Points:wx.peakClassificationAccuracyPct>=base.peakClassificationAccuracyPct-2,
  p10p90CoverageAtLeast80Pct:wx.p10p90CoveragePct>=80,
};
const accepted=Object.values(checks).every(Boolean);
const decision={accepted,decision:accepted?'PROMOTE_WEATHER_TO_ABUNDANCE':'KEEP_WEATHER_SEPARATE',checks,reason:accepted?'Weather cleared every pre-release performance guardrail.':'Weather did not clear the full multi-metric release gate, so it remains in movement potential, season timing and viewing outlook but does not alter modeled crane abundance.',metrics:{baseline:base,weather:wx,medianErrorImprovementVsBasePct:improve},rule:'Require at least 5% LOYO median-absolute-error improvement, mean absolute error no more than 2% worse, no worse median log error, peak classification within 2 percentage points, and p10-p90 coverage >=80%.'};
console.log(JSON.stringify(decision,null,2));
fs.writeFileSync(path.join(ROOT,'artifacts','weather-release-decision.json'),JSON.stringify(decision,null,2)+'\n');
