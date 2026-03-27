export const SERVICE_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
};

export const SERVICE_TYPES = [
  { value: "PET_WALKER", label: "Pet Walker" },
  { value: "VETERINARIAN", label: "Veterinarian" },
  { value: "PET_HOSPITAL", label: "Pet Hospital" },
  { value: "PET_DAYCARE", label: "Pet Daycare" },
  { value: "PET_TRAINER", label: "Pet Trainer" },
  { value: "PET_SELLER", label: "Pet Seller" },
  { value: "ADOPTION_CENTER", label: "Adoption Center" },
  { value: "GROOMER", label: "Groomer" },
  { value: "PET_BOARDING", label: "Pet Boarding" },
  { value: "PET_SITTER", label: "Pet Sitter" },
  { value: "BREEDER", label: "Breeder" },
  { value: "RESCUE_SHELTER", label: "Rescue Shelter" },
];

export const AD_PLAN_TYPES = [
  {
    value: "BASIC",
    label: "Basic",
    price: 19.99,
    durationDays: 7,
    description: "A one-week promotion for steady local visibility.",
  },
  {
    value: "BOOSTED",
    label: "Boosted",
    price: 39.99,
    durationDays: 14,
    description: "Two weeks of elevated placement for more discovery.",
  },
  {
    value: "PREMIUM",
    label: "Premium",
    price: 69.99,
    durationDays: 21,
    description: "Three weeks of stronger exposure for growing providers.",
  },
  {
    value: "FEATURED",
    label: "Featured",
    price: 99.99,
    durationDays: 30,
    description: "Maximum visibility for your listing all month.",
  },
];

export function getServiceTypeLabel(value) {
  return SERVICE_TYPES.find((item) => item.value === value)?.label || "Service Provider";
}

export function formatCurrency(value) {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
}

export function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getServiceLocation(profile) {
  return [profile?.city, profile?.state].filter(Boolean).join(", ");
}

export function getServiceDisplayLabel(profile) {
  if (!profile || profile.status !== SERVICE_STATUS.ACTIVE) return null;
  if (profile.displayLabel) return profile.displayLabel;
  const typeLabel = getServiceTypeLabel(profile.serviceType);
  const location = getServiceLocation(profile);
  return location ? `${typeLabel} • ${location}` : typeLabel;
}

export function getPetOwnerDisplayLabel(source) {
  const petsCount = Number(source?.petsCount || 0);
  if (petsCount <= 0) return "Pet owner";
  return `Owns ${petsCount} ${petsCount === 1 ? "pet" : "pets"}`;
}

export function getServiceStatusVariant(status) {
  switch (status) {
    case SERVICE_STATUS.ACTIVE:
      return "success";
    case SERVICE_STATUS.PENDING:
      return "warning";
    case SERVICE_STATUS.REJECTED:
      return "danger";
    case SERVICE_STATUS.SUSPENDED:
      return "secondary";
    default:
      return "light";
  }
}
