/**
 * The types and protocols of the Deno side.
 * A protocol is an `interface` that tells which methods an object must have.
 *
 * @module
 */

/** How a child process ended. */
export interface ProcessStatus {
  /** `true` if the process ended with the code 0. */
  readonly success: boolean;
  /** The exit code of the process. */
  readonly code: number;
}

/** A child process that the development runner started. */
export interface ChildProcess {
  /** The result. It is ready when the process ends. */
  readonly status: Promise<ProcessStatus>;
  /** Stop the process. Do nothing if it ended already. */
  kill(): void;
}

/** A function that starts `deno` with the given arguments as a child process. */
export type SpawnProcess = (args: readonly string[]) => ChildProcess;

/** The files of the page on the disk. The server reads them in development mode. */
export interface DiskFiles {
  /**
   * Read a text file.
   *
   * @param path - The path of the file, from the folder of the project.
   * @returns The text of the file.
   */
  read(path: string): Promise<string>;
  /**
   * Give one text that changes when any of the files changes.
   *
   * @param paths - The paths of the files, from the folder of the project.
   * @returns The text.
   */
  stamp(paths: readonly string[]): Promise<string>;
}
