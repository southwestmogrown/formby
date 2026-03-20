// Field types the builder supports
export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "number"
  | "date";

// A single form field definition
export interface FormField {
  id: string;           // nanoid, stable identifier
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];   // for select, radio, checkbox fields
  helpText?: string;
}

// A full form definition
export interface Form {
  id: string;
  user_id: string;
  name: string;
  description: string;
  fields: FormField[];
  published: boolean;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

// A form submission
export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, string | string[] | boolean>;
  created_at: string;
}

// Request to /api/generate
export interface GenerateRequest {
  description: string;
  isDemo?: boolean;
}

// Response from /api/generate
export interface GenerateResponse {
  name: string;         // suggested form name
  fields: FormField[];
}

// Demo session stored in sessionStorage
export interface DemoSession {
  generationsUsed: number;  // max 3
  startedAt: string;
}
