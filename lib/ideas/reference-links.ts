export const IDEA_REFERENCE_LINK_DELIMITER = "\n|||GV-LINK|||\n";

function normalizeReferenceLink(value: string) {
  return value.trim();
}

export function isValidIdeaReferenceLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseIdeaReferenceLinks(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(IDEA_REFERENCE_LINK_DELIMITER)
    .map(normalizeReferenceLink)
    .filter(Boolean);
}

export function serializeIdeaReferenceLinks(values: string[]) {
  return values.join(IDEA_REFERENCE_LINK_DELIMITER);
}

export function collectIdeaReferenceLinks(
  values: FormDataEntryValue[],
): { links: string[]; hasInvalidLink: boolean } {
  const normalizedLinks = values
    .map((value) => String(value ?? ""))
    .map(normalizeReferenceLink)
    .filter(Boolean);

  const uniqueLinks = [...new Set(normalizedLinks)];

  if (uniqueLinks.some((link) => !isValidIdeaReferenceLink(link))) {
    return {
      links: [],
      hasInvalidLink: true,
    };
  }

  return {
    links: uniqueLinks,
    hasInvalidLink: false,
  };
}
