/**
 * The files of the page on the disk.
 *
 * @module
 */
import type { DiskFiles } from "../types.ts";

/**
 * Reads the files of the page from the disk and tells when they change. The
 * server uses it in development mode.
 */
export const diskFiles: DiskFiles = {
  read: (path) => Deno.readTextFile(path),
  stamp: async (paths) => {
    const stats = await Promise.all(paths.map((path) => Deno.stat(path)));
    return stats.map((stat) => stat.mtime?.getTime() ?? 0).join(",");
  },
};
