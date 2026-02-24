type ContactNumber = { countryCode?: string; number?: string };
type OrganizationFormValues = {
  gstin?: string;
  organizationType?: string;
  organizationName?: string;
  panCard?: string;
  aadhaarCard?: string;
  contactName?: string;
  contactNumber?: ContactNumber;
  email?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ORGANIZATION_FORM_DEFAULTS: OrganizationFormValues = {
  gstin: "",
  organizationType: "",
  organizationName: "",
  panCard: "",
  aadhaarCard: "",
  contactName: "",
  contactNumber: { countryCode: "+91", number: "" },
  email: "",
};

export const formatAadhaar = (value = "") => String(value).replace(/\D/g, "").slice(0, 12).replace(/(.{4})/g, "$1-").replace(/-$/, "");

export const normalizeOrganizationTypeValue = (organizationTypes: any[] = [], apiValue = "") => {
  const raw = String(apiValue || "").toLowerCase();
  const found = organizationTypes.find((item) => [item?.value, item?.label, item?.name].some((v) => String(v || "").toLowerCase() === raw));
  return found?.value || apiValue || "";
};

export const getOrganizationValidationErrors = (values: OrganizationFormValues = {}) => {
  const errors: Record<string, string> = {};
  if (String(values.gstin || "").trim().length !== 15) errors.gstin = "GSTIN must be 15 characters";
  if (!String(values.organizationType || "")) errors.organizationType = "Please select organization type";
  if (!String(values.organizationName || "").trim()) errors.organizationName = "Organization name is required";
  if (String(values.panCard || "").trim().length !== 10) errors.panCard = "PAN Card must be 10 characters";
  if (!/^\d{4}-\d{4}-\d{4}$/.test(String(values.aadhaarCard || ""))) errors.aadhaarCard = "Aadhaar Card must be in format XXXX-XXXX-XXXX";
  if (!String(values.contactName || "").trim()) errors.contactName = "Contact name is required";
  if (!String(values.contactNumber?.countryCode || "")) errors.contactNumberCountryCode = "Country code is required";
  if (String(values.contactNumber?.number || "").replace(/\D/g, "").length < 10) errors.contactNumber = "Phone number must be at least 10 digits";
  if (!EMAIL.test(String(values.email || "").trim())) errors.email = "Please enter a valid email address";
  return errors;
};

export const mapGstinDetailsToFormValues = (gstinDetails: any, organizationTypes: any[] = []) => {
  if (!gstinDetails) return { ...ORGANIZATION_FORM_DEFAULTS };
  const phone = String(gstinDetails?.contact?.phone || "").replace(/^\+91/, "");
  return {
    ...ORGANIZATION_FORM_DEFAULTS,
    gstin: String(gstinDetails?.gstin || "").toUpperCase(),
    organizationType: normalizeOrganizationTypeValue(organizationTypes, gstinDetails?.organizationType),
    organizationName: String(gstinDetails?.name || ""),
    panCard: String(gstinDetails?.pan || "").toUpperCase(),
    aadhaarCard: formatAadhaar(String(gstinDetails?.aadhaar || "")),
    contactName: String(gstinDetails?.contact?.name || ""),
    contactNumber: { countryCode: "+91", number: phone },
    email: String(gstinDetails?.contact?.email || ""),
  };
};

export const buildOrganizationPayload = (values: OrganizationFormValues = {}) => ({
  name: String(values.organizationName || "").trim(),
  gstin: String(values.gstin || "").trim().toUpperCase(),
  pan: String(values.panCard || "").trim().toUpperCase(),
  aadhaar: String(values.aadhaarCard || "").replace(/-/g, ""),
  organizationType: values.organizationType,
  contact: {
    name: String(values.contactName || "").trim(),
    email: String(values.email || "").trim(),
    phone: `${values.contactNumber?.countryCode || "+91"}${String(values.contactNumber?.number || "").replace(/\D/g, "")}`,
  },
});
