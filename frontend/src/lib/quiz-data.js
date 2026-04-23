// Quiz questions spec — EU AI Act Annex III / Art 5 / Art 52-55
export const QUESTIONS = [
  {
    id: "q1",
    label: "Art 5 / Prohibited",
    text: "Does your AI system use subliminal, manipulative, or deceptive techniques that materially distort a person's behavior?",
    hint: "e.g., dark patterns targeting vulnerabilities, subliminal audio/visual cues.",
    type: "yesno",
  },
  {
    id: "q2",
    label: "Art 5 / Prohibited",
    text: "Does it perform real-time remote biometric identification in publicly accessible spaces for law enforcement?",
    hint: "Live facial recognition on CCTV in public areas.",
    type: "yesno",
  },
  {
    id: "q3",
    label: "Annex III / High-Risk",
    text: "Does it use remote biometric identification or biometric categorization of natural persons?",
    hint: "Post-remote biometrics, emotion recognition outside medical contexts.",
    type: "yesno",
  },
  {
    id: "q4",
    label: "Annex III / High-Risk",
    text: "Is it a safety component of critical infrastructure (energy, water, gas, digital, road/rail/air)?",
    type: "yesno",
  },
  {
    id: "q5",
    label: "Annex III / High-Risk",
    text: "Is it used for education, vocational training, employment, or worker-management scoring?",
    hint: "CV screeners, grading, promotion decisions.",
    type: "yesno",
  },
  {
    id: "q6",
    label: "Annex III / High-Risk",
    text: "Does it evaluate creditworthiness, insurance risk, or access to essential public/private services?",
    type: "yesno",
  },
  {
    id: "q7",
    label: "Art 52-55 / GPAI",
    text: "Is your model a General-Purpose AI (GPAI) — trained with ≥10²⁵ FLOPs or having systemic capabilities?",
    hint: "Large foundation models, LLMs, multimodal GPAI.",
    type: "yesno",
  },
  {
    id: "q8",
    label: "Art 10 / Data",
    text: "Does your system process sensitive personal data (biometric, health, genetic)?",
    type: "yesno",
  },
  {
    id: "q9",
    label: "Art 2 / Scope",
    text: "Is the system deployed in the EU, or does it affect users located in the EU?",
    type: "yesno",
  },
  {
    id: "q10",
    label: "Art 14 / Oversight",
    text: "Do you already have human oversight, bias testing, and cybersecurity controls in place?",
    type: "yesno",
  },
];

export const DPDP_QUESTIONS = [
  { id: "d1", text: "Do you obtain free, informed, specific consent under DPDP Sec 6?", type: "yesno" },
  { id: "d2", text: "Have you documented a clear purpose limitation for the personal data processed?", type: "yesno" },
  { id: "d3", text: "Is a Data Protection Officer / grievance contact published?", type: "yesno" },
  { id: "d4", text: "Are cross-border transfers limited to notified permitted countries?", type: "yesno" },
];

export const RISK_META = {
  prohibited: { label: "Prohibited", color: "#DC2626", copy: "Banned under Art 5. Must cease use in the EU." },
  high_risk: { label: "High-Risk", color: "#EA580C", copy: "Full Annex III obligations. FRIA & conformity required." },
  gpai: { label: "GPAI", color: "#2563EB", copy: "General-Purpose AI model obligations (Art 52–55)." },
  limited: { label: "Limited-Risk", color: "#EAB308", copy: "Transparency obligations under Art 50." },
  minimal: { label: "Minimal-Risk", color: "#16A34A", copy: "No mandatory obligations; voluntary codes recommended." },
};
