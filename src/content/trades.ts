/** Subcontract trades / scopes, shared by bid opportunities and subcontractor registration. */
export const trades = [
  "Asphalt Paving",
  "Concrete Flatwork & Curb",
  "Directional Drilling",
  "Dewatering",
  "Electrical",
  "Fencing & Guardrail",
  "Landscaping & Restoration",
  "Materials Supply",
  "Pavement Markings",
  "Surveying & Layout",
  "Traffic Control",
  "Trucking & Hauling",
] as const;

export type Trade = (typeof trades)[number];
