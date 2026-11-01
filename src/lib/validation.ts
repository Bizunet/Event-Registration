export type AttendeeInput = {
  full_name: string;
  student_id: string;
  department: string;
  year_semester: string;
  email: string;
  phone: string;
};

export type ValidationResult =
  | { success: true; data: AttendeeInput }
  | { success: false; message: string };

export function validateAttendee(value: unknown): ValidationResult {
  if (!value || typeof value !== "object") {
    return { success: false, message: "Please complete all required fields." };
  }
  const record = value as Record<string, unknown>;
  const fields: (keyof AttendeeInput)[] = [
    "full_name",
    "student_id",
    "department",
    "year_semester",
    "email",
    "phone",
  ];
  const sanitized = {} as AttendeeInput;

  for (const field of fields) {
    if (typeof record[field] !== "string") {
      return { success: false, message: "Please complete all required fields." };
    }
    const text = record[field].trim().replace(/\s+/g, " ");
    if (!text || text.length > (field === "full_name" ? 160 : field === "email" ? 254 : 120)) {
      return { success: false, message: `Please check the ${field.replaceAll("_", " ")} field.` };
    }
    sanitized[field] = text;
  }

  sanitized.email = sanitized.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
    return { success: false, message: "Enter a valid email address." };
  }
  if (!/^[+()\d.\-\s]{7,32}$/.test(sanitized.phone)) {
    return { success: false, message: "Enter a valid phone number." };
  }
  if (sanitized.student_id.length > 80 || sanitized.department.length > 120 || sanitized.year_semester.length > 80) {
    return { success: false, message: "One or more fields are too long." };
  }

  return { success: true, data: sanitized };
}
