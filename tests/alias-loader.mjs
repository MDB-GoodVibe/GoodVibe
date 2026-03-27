import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const basePath = path.join(projectRoot, specifier.slice(2));
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      path.join(basePath, "index.ts"),
      path.join(basePath, "index.tsx"),
    ];

    for (const candidate of candidates) {
      try {
        const stats = await fs.stat(candidate);

        if (stats.isFile()) {
          return {
            shortCircuit: true,
            url: pathToFileURL(candidate).href,
          };
        }
      } catch {
        continue;
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
