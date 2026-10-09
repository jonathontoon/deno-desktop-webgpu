/**
 * Unit tests for `diskFiles`. They replace the file functions of Deno with
 * stubs, so they read no file.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { stub } from "@std/testing/mock";
import { fake } from "../../testing/fakes.ts";
import { diskFiles } from "./disk.ts";

Deno.test("diskFiles", async (t) => {
  await t.step("read gives the text of the file", async () => {
    const paths: string[] = [];
    using _read = stub(Deno, "readTextFile", (path: string | URL) => {
      paths.push(String(path));
      return Promise.resolve("text of the file");
    });
    assertEquals(await diskFiles.read("src/a.css"), "text of the file");
    assertEquals(paths, ["src/a.css"]);
  });

  await t.step("stamp joins the times of the last change", async () => {
    const times: Record<string, Date | null> = {
      "a": new Date(1000),
      "b": new Date(2500),
      "c": null,
    };
    using _stat = stub(
      Deno,
      "stat",
      (path: string | URL) =>
        Promise.resolve(fake<Deno.FileInfo>({ mtime: times[String(path)] })),
    );
    assertEquals(await diskFiles.stamp(["a", "b", "c"]), "1000,2500,0");
  });

  await t.step("stamp changes when a file changes", async () => {
    let time = 1000;
    using _stat = stub(
      Deno,
      "stat",
      () => Promise.resolve(fake<Deno.FileInfo>({ mtime: new Date(time) })),
    );
    const before = await diskFiles.stamp(["a"]);
    time = 2000;
    assertEquals(before === await diskFiles.stamp(["a"]), false);
  });
});
