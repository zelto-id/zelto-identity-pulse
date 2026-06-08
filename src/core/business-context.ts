export type BusinessContextEnvironment =
  | "production"
  | "staging"
  | "development"
  | "sandbox"
  | "unknown";

export interface BusinessContextUserPopulation {
  customers?: number;
  workforce?: number;
  admins?: number;
  partners?: number;
  [key: string]: number | undefined;
}

export interface BusinessContextCriticalApplication {
  name: string;
  provider?: string;
  businessCriticality?: string;
  dataSensitivity?: string;
}

export type BusinessContextDesignDecisionEffect =
  | "suppress-finding"
  | "context-note";

export interface BusinessContextDesignDecisionAppliesTo {
  findingIds?: string[];
  categories?: string[];
  keywords?: string[];
}

export interface BusinessContextDesignDecision {
  id: string;
  provider?: "auth0" | "okta" | "all";
  title?: string;
  decision: string;
  rationale?: string;
  owner?: string;
  effect?: BusinessContextDesignDecisionEffect;
  appliesTo?: BusinessContextDesignDecisionAppliesTo;
}

export interface BusinessContextProfile {
  organizationType?: string;
  environment?: BusinessContextEnvironment;
  industry?: string;
  regulatedData?: boolean;
  identityUseCase?: string;
  userPopulation?: BusinessContextUserPopulation;
  criticalApplications?: BusinessContextCriticalApplication[];
  riskTolerance?: string;
  complianceDrivers?: string[];
  businessPriorities?: string[];
  designDecisions?: BusinessContextDesignDecision[];
}

export const BUSINESS_CONTEXT_ENVIRONMENTS: BusinessContextEnvironment[] = [
  "production",
  "staging",
  "development",
  "sandbox",
  "unknown"
];

export function normalizeBusinessContextProfile(
  input: unknown
): BusinessContextProfile | undefined {
  if (!isPlainObject(input)) return undefined;

  const profile: BusinessContextProfile = {};
  profile.organizationType = optionalString(input.organizationType);
  profile.environment = optionalEnvironment(input.environment);
  profile.industry = optionalString(input.industry);
  profile.regulatedData =
    typeof input.regulatedData === "boolean" ? input.regulatedData : undefined;
  profile.identityUseCase = optionalString(input.identityUseCase);
  profile.userPopulation = normalizeUserPopulation(input.userPopulation);
  profile.criticalApplications = normalizeCriticalApplications(
    input.criticalApplications
  );
  profile.riskTolerance = optionalString(input.riskTolerance);
  profile.complianceDrivers = normalizeStringArray(input.complianceDrivers);
  profile.businessPriorities = normalizeStringArray(input.businessPriorities);
  profile.designDecisions = normalizeDesignDecisions(input.designDecisions);

  return hasBusinessContext(profile) ? profile : undefined;
}

export function hasBusinessContext(
  profile: BusinessContextProfile | undefined
): profile is BusinessContextProfile {
  if (!profile) return false;
  return Object.values(profile).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (isPlainObject(value)) return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== "";
  });
}

export function buildBusinessContextAssumptions(
  profile: BusinessContextProfile | undefined
): string[] {
  if (!hasBusinessContext(profile)) return [];

  const assumptions: string[] = [];
  const summary = [
    profile.organizationType,
    profile.industry,
    profile.identityUseCase,
    profile.riskTolerance ? `${profile.riskTolerance} risk tolerance` : undefined
  ].filter((item): item is string => Boolean(item));

  assumptions.push(
    summary.length > 0
      ? `Business context profile provided: ${summary.join(", ")}. Context changes interpretation and prioritization language only when deterministic rules support it.`
      : "Business context profile provided. Context changes interpretation and prioritization language only when deterministic rules support it."
  );

  if (profile.regulatedData || hasHighSensitivityApplication(profile)) {
    assumptions.push(
      "Business context indicates regulated data, high-sensitivity data, or critical applications are in scope; remediation planning should prioritize identity controls that reduce account takeover, privileged access, logging, and application/API exposure risk."
    );
  }

  if ((profile.complianceDrivers ?? []).length > 0) {
    assumptions.push(
      `Compliance drivers considered for report wording and prioritization: ${profile.complianceDrivers!.join(", ")}.`
    );
  }

  const criticalApps = profile.criticalApplications ?? [];
  if (criticalApps.length > 0) {
    assumptions.push(
      `Critical applications in business context: ${criticalApps
        .slice(0, 3)
        .map(formatCriticalApplication)
        .join("; ")}${criticalApps.length > 3 ? `; +${criticalApps.length - 3} more` : ""}.`
    );
  }

  if ((profile.businessPriorities ?? []).length > 0) {
    assumptions.push(
      `Business priorities considered: ${profile.businessPriorities!.join("; ")}.`
    );
  }

  if ((profile.designDecisions ?? []).length > 0) {
    assumptions.push(
      `Design decisions provided: ${profile.designDecisions!
        .map(formatDesignDecision)
        .join("; ")}. Matching findings can be suppressed or reframed only when the decision targets deterministic rule IDs, categories, or keywords.`
    );
  }

  return assumptions;
}

export function findBusinessContextDesignDecisionForFinding(input: {
  provider: "auth0" | "okta";
  findingId: string;
  category: string;
  title: string;
  businessContext?: BusinessContextProfile;
  effect?: BusinessContextDesignDecisionEffect;
}): BusinessContextDesignDecision | undefined {
  const profile = input.businessContext;
  if (!hasBusinessContext(profile)) return undefined;

  return (profile.designDecisions ?? []).find((decision) => {
    const effect = decision.effect ?? "suppress-finding";
    if (input.effect && effect !== input.effect) return false;
    if (
      decision.provider &&
      decision.provider !== "all" &&
      decision.provider !== input.provider
    ) {
      return false;
    }
    return designDecisionMatchesFinding(decision, input);
  });
}

export function buildBusinessContextFindingNotes(input: {
  provider: "auth0" | "okta";
  findingId?: string;
  category: string;
  title: string;
  severity: string;
  businessContext?: BusinessContextProfile;
}): string[] {
  const profile = input.businessContext;
  if (!hasBusinessContext(profile)) return [];

  const notes: string[] = [];
  const searchable = `${input.provider} ${input.category} ${input.title}`.toLowerCase();
  const highSensitivity = profile.regulatedData || hasHighSensitivityApplication(profile);

  if (highSensitivity && matchesAny(searchable, HIGH_SENSITIVITY_CATEGORIES)) {
    notes.push(
      "Business context includes regulated/high-sensitivity data or critical applications; prioritize this finding when it affects those user journeys, admin paths, or application/API boundaries."
    );
  }

  if (
    input.provider === "auth0" &&
    contains(profile.identityUseCase, "customer") &&
    matchesAny(searchable, AUTH0_CUSTOMER_IDENTITY_CATEGORIES)
  ) {
    notes.push(
      "Customer-identity context makes this finding commercially relevant because authentication, application, API, and connection controls can directly affect customer account takeover and service trust."
    );
  }

  if (
    input.provider === "okta" &&
    contains(profile.identityUseCase, "workforce") &&
    matchesAny(searchable, OKTA_WORKFORCE_CATEGORIES)
  ) {
    notes.push(
      "Workforce identity context makes this finding operationally relevant because policy, application, user lifecycle, and privileged-access controls affect employee access governance."
    );
  }

  if (
    (profile.complianceDrivers ?? []).length > 0 &&
    matchesAny(searchable, AUDIT_READINESS_CATEGORIES)
  ) {
    notes.push(
      `Compliance context (${profile.complianceDrivers!.join(", ")}) increases the need to document validation evidence and remediation ownership for this finding.`
    );
  }

  if (
    contains(profile.riskTolerance, "low") &&
    (input.severity === "critical" || input.severity === "high")
  ) {
    notes.push(
      "Low risk tolerance in the business context supports treating this high-impact finding as an early remediation priority."
    );
  }

  const contextNoteDecision = input.findingId
    ? findBusinessContextDesignDecisionForFinding({
        provider: input.provider,
        findingId: input.findingId,
        category: input.category,
        title: input.title,
        businessContext: profile,
        effect: "context-note"
      })
    : undefined;
  if (contextNoteDecision) {
    notes.push(
      `Business design decision \`${contextNoteDecision.id}\`: ${contextNoteDecision.decision}${contextNoteDecision.rationale ? ` Rationale: ${contextNoteDecision.rationale}` : ""}`
    );
  }

  return unique(notes);
}

function normalizeUserPopulation(
  input: unknown
): BusinessContextUserPopulation | undefined {
  if (!isPlainObject(input)) return undefined;
  const population: BusinessContextUserPopulation = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      population[key] = Math.floor(value);
    }
  }
  return Object.keys(population).length > 0 ? population : undefined;
}

function normalizeCriticalApplications(
  input: unknown
): BusinessContextCriticalApplication[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const apps = input
    .filter(isPlainObject)
    .map((item) => ({
      name: optionalString(item.name) ?? "",
      provider: optionalString(item.provider),
      businessCriticality: optionalString(item.businessCriticality),
      dataSensitivity: optionalString(item.dataSensitivity)
    }))
    .filter((item) => item.name.length > 0);
  return apps.length > 0 ? apps : undefined;
}

function normalizeDesignDecisions(
  input: unknown
): BusinessContextDesignDecision[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const decisions = input
    .filter(isPlainObject)
    .map((item) => {
      const id = optionalString(item.id) ?? "";
      const decision = optionalString(item.decision) ?? "";
      const normalized: BusinessContextDesignDecision = {
        id,
        provider: normalizeDesignDecisionProvider(item.provider),
        title: optionalString(item.title),
        decision,
        rationale: optionalString(item.rationale),
        owner: optionalString(item.owner),
        effect: normalizeDesignDecisionEffect(item.effect),
        appliesTo: normalizeDesignDecisionAppliesTo(item.appliesTo)
      };
      return normalized;
    })
    .filter(
      (item) =>
        item.id.length > 0 &&
        item.decision.length > 0 &&
        hasDesignDecisionTarget(item.appliesTo)
    );
  return decisions.length > 0 ? decisions : undefined;
}

function normalizeDesignDecisionProvider(
  input: unknown
): BusinessContextDesignDecision["provider"] {
  const provider = optionalString(input)?.toLowerCase();
  if (provider === "auth0" || provider === "okta" || provider === "all") {
    return provider;
  }
  return undefined;
}

function normalizeDesignDecisionEffect(
  input: unknown
): BusinessContextDesignDecisionEffect | undefined {
  const effect = optionalString(input)?.toLowerCase();
  if (effect === "suppress-finding" || effect === "context-note") {
    return effect;
  }
  return undefined;
}

function normalizeDesignDecisionAppliesTo(
  input: unknown
): BusinessContextDesignDecisionAppliesTo | undefined {
  if (!isPlainObject(input)) return undefined;
  const appliesTo: BusinessContextDesignDecisionAppliesTo = {
    findingIds: normalizeStringArray(input.findingIds)?.map((id) =>
      id.toUpperCase()
    ),
    categories: normalizeStringArray(input.categories)?.map((category) =>
      category.toLowerCase()
    ),
    keywords: normalizeStringArray(input.keywords)?.map((keyword) =>
      keyword.toLowerCase()
    )
  };
  return hasDesignDecisionTarget(appliesTo) ? appliesTo : undefined;
}

function hasDesignDecisionTarget(
  appliesTo: BusinessContextDesignDecisionAppliesTo | undefined
): appliesTo is BusinessContextDesignDecisionAppliesTo {
  return Boolean(
    appliesTo &&
      ((appliesTo.findingIds ?? []).length > 0 ||
        (appliesTo.categories ?? []).length > 0 ||
        (appliesTo.keywords ?? []).length > 0)
  );
}

function normalizeStringArray(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const values = unique(input.map(optionalString).filter((item): item is string => Boolean(item)));
  return values.length > 0 ? values : undefined;
}

function optionalString(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim();
  return value.length > 0 ? value : undefined;
}

function optionalEnvironment(
  input: unknown
): BusinessContextEnvironment | undefined {
  const value = optionalString(input)?.toLowerCase();
  if (!value) return undefined;
  if ((BUSINESS_CONTEXT_ENVIRONMENTS as string[]).includes(value)) {
    return value as BusinessContextEnvironment;
  }
  return undefined;
}

function hasHighSensitivityApplication(profile: BusinessContextProfile): boolean {
  return (profile.criticalApplications ?? []).some((app) => {
    const criticality = app.businessCriticality?.toLowerCase() ?? "";
    const sensitivity = app.dataSensitivity?.toLowerCase() ?? "";
    return (
      criticality === "high" ||
      criticality === "critical" ||
      sensitivity === "high" ||
      sensitivity === "regulated"
    );
  });
}

function formatCriticalApplication(
  app: BusinessContextCriticalApplication
): string {
  const details = [
    app.provider,
    app.businessCriticality,
    app.dataSensitivity
  ].filter((item): item is string => Boolean(item));
  return details.length > 0 ? `${app.name} (${details.join(", ")})` : app.name;
}

function formatDesignDecision(decision: BusinessContextDesignDecision): string {
  return `${decision.id} (${decision.effect ?? "suppress-finding"}): ${decision.decision}`;
}

function designDecisionMatchesFinding(
  decision: BusinessContextDesignDecision,
  finding: {
    findingId: string;
    category: string;
    title: string;
  }
): boolean {
  const appliesTo = decision.appliesTo;
  if (!hasDesignDecisionTarget(appliesTo)) return false;
  const findingId = finding.findingId.toUpperCase();
  const category = finding.category.toLowerCase();
  const searchable = `${finding.findingId} ${finding.category} ${finding.title}`.toLowerCase();

  return (
    (appliesTo.findingIds ?? []).includes(findingId) ||
    (appliesTo.categories ?? []).includes(category) ||
    (appliesTo.keywords ?? []).some((keyword) => searchable.includes(keyword))
  );
}

function contains(value: string | undefined, needle: string): boolean {
  return value?.toLowerCase().includes(needle) ?? false;
}

function matchesAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const HIGH_SENSITIVITY_CATEGORIES = [
  "mfa",
  "attack",
  "authentication",
  "policy",
  "admin",
  "privileged",
  "monitoring",
  "logs",
  "application",
  "api",
  "connection",
  "rbac",
  "authorization"
];

const AUTH0_CUSTOMER_IDENTITY_CATEGORIES = [
  "application",
  "api",
  "connection",
  "attack",
  "branding",
  "login",
  "organization",
  "tenant"
];

const OKTA_WORKFORCE_CATEGORIES = [
  "user",
  "lifecycle",
  "application",
  "sso",
  "policy",
  "authentication",
  "admin",
  "privileged",
  "monitoring",
  "logs"
];

const AUDIT_READINESS_CATEGORIES = [
  "monitoring",
  "logs",
  "admin",
  "privileged",
  "policy",
  "rbac",
  "authorization",
  "lifecycle"
];
