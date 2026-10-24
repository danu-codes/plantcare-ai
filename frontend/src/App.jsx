
import { useEffect, useRef, useState } from "react";
import {
  Leaf,
  ShieldCheck,
  ScanLine,
  Sparkles,
  ArrowRight,
  Upload,
  BrainCircuit,
  ChartNoAxesCombined,
  AlertCircle,
} from "lucide-react";

import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import PredictionResults from "./components/PredictionResults";

import {
  predictDisease,
  getHealth,
} from "./services/api";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload an image",
    description:
      "Choose a clear photograph of a plant leaf from your device.",
  },
  {
    icon: BrainCircuit,
    number: "02",
    title: "AI analyzes it",
    description:
      "Our trained CNN processes the image and calculates classification scores.",
  },
  {
    icon: ChartNoAxesCombined,
    number: "03",
    title: "Explore results",
    description:
      "View the most likely class and the top alternative predictions.",
  },
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("checking");

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let active = true;

    getHealth()
      .then((data) => {
        if (active) {
          setServerStatus(
            data.model_loaded ? "online" : "offline"
          );
        }
      })
      .catch(() => {
        if (active) setServerStatus("offline");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  function cancelRequest() {
    requestIdRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoading(false);
  }

  function handleSelect(file) {
    cancelRequest();
    setSelectedFile(file);
    setResult(null);
    setError("");
  }

  function handleRemove() {
    cancelRequest();
    setSelectedFile(null);
    setResult(null);
    setError("");
  }

  async function handleAnalyze() {
    if (!selectedFile || loading) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictDisease(
        selectedFile,
        controller.signal
      );

      if (requestId !== requestIdRef.current) return;

      setResult(data);
      setServerStatus("online");
    } catch (err) {
      if (
        requestId !== requestIdRef.current ||
        err.name === "AbortError"
      ) {
        return;
      }

      setError(
        err.message || "Something went wrong."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main id="home">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
          <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-green-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#318154] shadow-sm">
              <Sparkles size={15} />
              AI-POWERED PLANT LEAF CLASSIFICATION
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-[#153f2b] sm:text-5xl lg:text-6xl">
              Healthy plants begin with
              <span className="block text-[#28965a]">
                better understanding.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#6c8473] sm:text-lg">
              Discover what your trained AI model predicts
              from a plant leaf photo. Upload an image,
              analyze it, and explore the results.
            </p>

            <a
              href="#analyze"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#176a43] px-8 py-3.5 font-semibold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#105135]"
            >
              Analyze a leaf
              <ArrowRight size={19} />
            </a>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-[#62816c] sm:gap-7">
              <span className="flex items-center gap-2">
                <Leaf size={16} className="text-green-700" />
                PlantVillage classes
              </span>

              <span className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-green-700" />
                Custom-trained CNN
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-700" />
                Educational prototype
              </span>
            </div>
          </div>
        </section>

        {/* Analysis workspace */}
        <section
          id="analyze"
          className="scroll-mt-24 px-5 pb-24 sm:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                  AI Analysis Workspace
                </p>

                <h2 className="text-2xl font-extrabold text-[#193e2d] sm:text-3xl">
                  Plant disease detection
                </h2>
              </div>

              <div
                className="flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm text-[#52705c]"
                title="Status of the FastAPI model server"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    serverStatus === "online"
                      ? "bg-green-500"
                      : serverStatus === "offline"
                        ? "bg-red-500"
                        : "bg-amber-400"
                  }`}
                />

                {serverStatus === "online"
                  ? "AI server online"
                  : serverStatus === "offline"
                    ? "AI server offline"
                    : "Checking server..."}
              </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-2">
              <ImageUploader
                selectedFile={selectedFile}
                preview={preview}
                onSelect={handleSelect}
                onRemove={handleRemove}
                onAnalyze={handleAnalyze}
                loading={loading}
              />

              <div>
                {error && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertCircle
                      size={20}
                      className="shrink-0"
                    />
                    <span>{error}</span>
                  </div>
                )}

                <PredictionResults result={result} />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-white px-5 py-20 sm:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                Simple Process
              </p>

              <h2 className="text-3xl font-extrabold text-[#173d2a]">
                How PlantCare AI works
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="rounded-[26px] border border-[#e2ecdf] bg-[#f8fbf6] p-8"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div className="rounded-2xl bg-[#e2f0e1] p-4 text-green-700">
                        <Icon size={27} />
                      </div>

                      <span className="text-3xl font-extrabold text-[#d6e6d6]">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#214b34]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#728878]">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-7xl rounded-3xl bg-[#eaf3e8] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <ScanLine
                size={26}
                className="shrink-0 text-green-700"
              />

              <div>
                <h3 className="font-bold text-[#245137]">
                  About this AI model
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#5d7765]">
                  PlantCare AI is a machine learning practice
                  project trained on labeled plant leaf images.
                  It may misclassify unfamiliar photographs.
                  The results should not be used as the sole
                  basis for agricultural treatment decisions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#143e2a] px-5 py-8 text-center text-sm text-green-100/75">
        <p className="flex items-center justify-center gap-2">
          <Leaf size={18} />
          PlantCare AI
        </p>

        <p className="mt-3">
          Built with React, FastAPI and TensorFlow.
        </p>
      </footer>
    </div>
  );
}
