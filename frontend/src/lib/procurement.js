// Vendor questionnaire template for the AI supply chain.
// Maps requirements to Art 9–15 (high-risk requirements) and Art 53 (GPAI).
// Used by the Procurement CSV export on the paid report page.

export const PROCUREMENT_QUESTIONS = [
  // Art 9 — Risk management
  { article: "Art 9", requirement: "Risk management system", question: "Do you maintain a documented, continuous risk management system covering the full AI lifecycle? Please attach the latest version." },
  { article: "Art 9", requirement: "Residual risk acceptance", question: "How is residual risk evaluated and accepted? Who signs off?" },
  // Art 10 — Data & governance
  { article: "Art 10", requirement: "Training data provenance", question: "Describe the provenance of training, validation, and test datasets, including sourcing, licensing, and any consent basis." },
  { article: "Art 10", requirement: "Bias mitigation", question: "What bias detection and mitigation procedures do you run? Provide latest test results." },
  { article: "Art 10", requirement: "Special categories", question: "If special-category personal data (biometric, health, etc.) is processed, what legal basis and safeguards apply?" },
  // Art 11 — Technical documentation
  { article: "Art 11", requirement: "Technical documentation", question: "Can you provide Annex IV-compliant technical documentation prior to contract signing?" },
  // Art 12 — Logging
  { article: "Art 12", requirement: "Automatic logging", question: "Does the system automatically log events with timestamps, traceability, and tamper-evidence? Log retention period?" },
  // Art 13 — Transparency
  { article: "Art 13", requirement: "Instructions for use", question: "Provide instructions for use covering intended purpose, performance limits, foreseeable misuse, and human oversight mechanisms." },
  // Art 14 — Human oversight
  { article: "Art 14", requirement: "Human oversight", question: "Describe human-in-the-loop or human-on-the-loop controls, override mechanisms, and stop conditions." },
  // Art 15 — Accuracy, robustness, cybersecurity
  { article: "Art 15", requirement: "Accuracy metrics", question: "State accuracy, precision, recall, and false-positive/negative rates on representative data." },
  { article: "Art 15", requirement: "Robustness", question: "Describe adversarial, drift, and edge-case robustness testing performed." },
  { article: "Art 15", requirement: "Cybersecurity", question: "Summarise cybersecurity controls, vulnerability disclosure, and incident response SLAs." },
  // Art 17 — Quality management
  { article: "Art 17", requirement: "Quality management system", question: "Confirm an ISO 9001 / ISO/IEC 42001-aligned quality management system is in place." },
  // Art 26/27 — Deployer obligations / FRIA
  { article: "Art 27", requirement: "FRIA support", question: "Can you supply the inputs needed for our Fundamental Rights Impact Assessment (system description, intended use, stakeholders impacted)?" },
  // Art 49 — EU database registration
  { article: "Art 49", requirement: "EU database registration", question: "Is the system registered in the EU database of high-risk AI systems? Provide registration ID if applicable." },
  // Art 50 — Transparency (deepfakes / chatbots)
  { article: "Art 50", requirement: "Transparency to end-users", question: "How are end users informed that they are interacting with an AI system (Art 50 §1-4)?" },
  // Art 53 — GPAI
  { article: "Art 53", requirement: "Training data summary", question: "Is a public training data summary available? Provide link." },
  { article: "Art 53", requirement: "Copyright policy", question: "What is your copyright compliance policy for training data?" },
  { article: "Art 53", requirement: "Downstream documentation", question: "Can you provide downstream technical documentation for integrators?" },
  // Art 55 — Systemic-risk GPAI
  { article: "Art 55", requirement: "Systemic risk evaluation", question: "If the model exceeds 10^25 FLOPs or is designated systemic, provide latest systemic-risk evaluation and red-team report." },
  // Commercial / legal wrap
  { article: "Contractual", requirement: "Liability & indemnity", question: "What indemnity do you offer for regulatory fines caused by non-compliant AI outputs?" },
  { article: "Contractual", requirement: "Change notifications", question: "What is your process for notifying us of substantial modifications (Art 43 §4)?" },
];
