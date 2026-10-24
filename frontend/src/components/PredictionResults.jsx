
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Info,
  Leaf,
} from "lucide-react";

function formatName(name = "") {
  return name
    .replace("___", " - ")
    .replaceAll("_", " ");
}

function ScoreBar({ label, percentage, index }) {
  const safeScore = Math.min(
    100,
    Math.max(0, Number(percentage) || 0)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4 text-sm">
        <span className="flex min-w-0 gap-2 text-[#4b6654]">
          <span className="font-semibold text-[#8ba392]">
            {index + 1}.
          </span>
          <span className="break-words">{label}</span>
        </span>

        <span className="shrink-0 font-bold tabular-nums text-[#204d35]">
          {safeScore.toFixed(2)}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-[#e8f1e7]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            index === 0 ? "bg-[#258d53]" : "bg-[#9ccbaa]"
          }`}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

export default function PredictionResults({ result }) {
  if (!result) {
    return (
      <div className="flex min-h-[430px] flex-col items-center justify-center rounded-[28px] border border-[#e1ece0] bg-white p-8 text-center shadow-xl shadow-green-950/5">
        <div className="mb-5 rounded-3xl bg-green-50 p-6">
          <BrainCircuit
            size={46}
            strokeWidth={1.4}
            className="text-[#318f59]"
          />
        </div>

        <h2 className="text-xl font-bold text-[#214b35]">
          Your results appear here
        </h2>

        <p className="mt-3 max-w-xs text-sm leading-7 text-[#78907e]">
          Upload a plant leaf and click Analyze Plant Health
          to view predictions from your trained CNN.
        </p>

        <div className="mt-8 flex items-center gap-2 rounded-full bg-[#f2f7ef] px-4 py-2 text-xs font-medium text-[#578466]">
          <Leaf size={15} />
          PlantCare AI · Image classification
        </div>
      </div>
    );
  }

  const bestScore = Number(result.confidence_percentage) || 0;
  const isHealthy = result.predicted_class
    ?.toLowerCase()
    .includes("healthy");

  return (
    <div
      aria-live="polite"
      className="rounded-[28px] border border-[#e1ece0] bg-white p-5 shadow-xl shadow-green-950/5 sm:p-7"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-green-50 p-3 text-green-700">
          <Activity size={23} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#173f2b]">
            Analysis results
          </h2>
          <p className="mt-1 text-sm text-[#718678]">
            Predictions from your trained AI model
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#f1f8ef] p-5">
        <div className="mb-4 flex items-center gap-2 text-[#48845c]">
          {isHealthy ? (
            <CheckCircle2 size={19} />
          ) : (
            <AlertTriangle size={19} />
          )}

          <span className="text-xs font-bold uppercase tracking-wider">
            Highest-scoring class
          </span>
        </div>

        <h3 className="break-words text-2xl font-extrabold leading-snug text-[#17462f]">
          {result.predicted_label ||
            formatName(result.predicted_class)}
        </h3>

        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tabular-nums text-[#21834d]">
            {bestScore.toFixed(2)}%
          </span>
          <span className="text-sm text-[#699377]">
            model score
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#d8e9d9]">
          <div
            className="h-full rounded-full bg-[#268d54] transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, bestScore))}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-8">
        <h4 className="mb-5 flex items-center gap-2 font-bold text-[#204832]">
          <BrainCircuit size={19} className="text-green-700" />
          Top 5 predictions
        </h4>

        <div className="space-y-5">
          {result.predictions.map((item, index) => (
            <ScoreBar
              key={`${item.class_name}-${index}`}
              index={index}
              label={
                item.label ||
                formatName(item.class_name)
              }
              percentage={
                item.percentage ?? item.score * 100
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <Info
          size={20}
          className="mt-0.5 shrink-0 text-amber-700"
        />

        <p className="text-xs leading-6 text-amber-900">
          {result.disclaimer ||
            "AI-generated classification only. Not a confirmed plant disease diagnosis."}
          {" "}Model scores may be unreliable on outdoor or
          unfamiliar images. Consult a qualified agricultural
          expert before deciding on treatment.
        </p>
      </div>
    </div>
  );
}
