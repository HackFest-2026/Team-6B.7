import { createContext, useContext, useState, type ReactNode } from "react";
import { defaultPatient, scorePatient, type Patient, type Prediction } from "./model";
import { predict } from "./api";

type Ctx = {
  patient: Patient;
  setPatient: (p: Patient) => void;
  prediction: Prediction;
  assessed: boolean;
  loading: boolean;
  assess: () => Promise<void>;
  reset: () => void;
  patientLabel: string;
};

const AssessmentContext = createContext<Ctx | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<Patient>(defaultPatient);
  const [prediction, setPrediction] = useState<Prediction>(() => scorePatient(defaultPatient));
  const [assessed, setAssessed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientLabel, setLabel] = useState("New encounter");

  const setPatient = (p: Patient) => { setPatientState(p); setAssessed(false); setLabel("Custom encounter"); };
  const assess = async () => {
    setLoading(true);
    try { setPrediction(await predict(patient)); setAssessed(true); } finally { setLoading(false); }
  };
  const reset = () => { setPatientState(defaultPatient); setPrediction(scorePatient(defaultPatient)); setAssessed(false); setLabel("New encounter"); };

  return (
    <AssessmentContext.Provider value={{ patient, setPatient, prediction, assessed, loading, assess, reset, patientLabel }}>
      {children}
    </AssessmentContext.Provider>
  );
}

let fallbackCache: Ctx | null = null;
function FALLBACK(): Ctx {
  if (!fallbackCache) {
    fallbackCache = { patient: defaultPatient, setPatient: () => {}, prediction: scorePatient(defaultPatient), assessed: false, loading: false, assess: async () => {}, reset: () => {}, patientLabel: "New encounter" };
  }
  return fallbackCache;
}

export function useAssessment() {
  const c = useContext(AssessmentContext);
  // Fallback keeps the UI alive if a stale hot-reload renders outside the provider.
  return c ?? FALLBACK();
}
