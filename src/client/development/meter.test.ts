/**
 * Unit tests for `Meter`.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { FakeTime } from "@std/testing/time";
import { METER_INTERVAL_MS, METER_TICK_MS } from "../constants.ts";
import {
  createFakeSurface,
  fake,
  installFakeAnimationFrames,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Meter } from "./meter.ts";

Deno.test("Meter", async (t) => {
  const target = fake<HTMLElement>({ textContent: "" });
  const fakeSurface = createFakeSurface();
  const meter = new Meter(target, fakeSurface.surface);

  const frames = installFakeAnimationFrames();
  const observers = installFakeResizeObserver();
  using time = new FakeTime();
  try {
    meter.start();

    /** Let one interval of the meter pass, in steps of one tick. */
    const passInterval = async (): Promise<void> => {
      for (
        let passed = 0;
        passed < METER_INTERVAL_MS;
        passed += METER_TICK_MS
      ) {
        await time.tickAsync(METER_TICK_MS);
      }
    };

    await t.step("it shows nothing before the first interval ends", () => {
      assertEquals(target.textContent, "");
    });

    await t.step(
      "it counts the frames and the ticks of the interval",
      async () => {
        frames.step(1000);
        frames.step(1016);
        frames.step(1033);
        await passInterval();
        const lines = String(target.textContent).split("\n");
        assertEquals(lines[0], "frames/s 3");
        assertEquals(lines[1], "ticks/s 10 (10 is normal)");
      },
    );

    await t.step(
      "it starts to count again after it shows the numbers",
      async () => {
        frames.step(1050);
        await passInterval();
        assertEquals(String(target.textContent).split("\n")[0], "frames/s 1");
      },
    );

    await t.step("it keeps the longest wait between two frames", async () => {
      frames.step(1550);
      frames.step(1566);
      await passInterval();
      assertEquals(
        String(target.textContent).split("\n")[3],
        "worst frame gap 500 ms",
      );
    });

    await t.step("the longest wait does not become smaller", async () => {
      frames.step(1582);
      await passInterval();
      assertEquals(
        String(target.textContent).split("\n")[3],
        "worst frame gap 500 ms",
      );
    });

    await t.step("it keeps the longest wait between two ticks", async () => {
      await passInterval();
      assertEquals(
        String(target.textContent).split("\n")[4],
        `worst tick gap ${METER_TICK_MS} ms`,
      );
    });

    await t.step("it counts the size reports", async () => {
      observers.resize(fakeSurface.surface, 800, 600);
      observers.resize(fakeSurface.surface, 810, 600);
      await passInterval();
      assertEquals(String(target.textContent).split("\n")[2], "size reports 2");
    });

    await t.step("it shows the size of the canvas", async () => {
      fakeSurface.surface.width = 1600;
      fakeSurface.surface.height = 1200;
      await passInterval();
      assertEquals(
        String(target.textContent).split("\n")[5],
        "canvas 1600x1200",
      );
    });
  } finally {
    observers.restore();
    frames.restore();
  }
});

Deno.test("two meters show their own numbers", async () => {
  const first = fake<HTMLElement>({ textContent: "" });
  const second = fake<HTMLElement>({ textContent: "" });
  const frames = installFakeAnimationFrames();
  const observers = installFakeResizeObserver();
  using time = new FakeTime();
  try {
    new Meter(first, createFakeSurface().surface).start();
    frames.step(1000);
    new Meter(second, createFakeSurface().surface).start();
    frames.step(1016);
    for (let passed = 0; passed < METER_INTERVAL_MS; passed += METER_TICK_MS) {
      await time.tickAsync(METER_TICK_MS);
    }
    assertEquals(String(first.textContent).split("\n")[0], "frames/s 2");
    assertEquals(String(second.textContent).split("\n")[0], "frames/s 1");
  } finally {
    observers.restore();
    frames.restore();
  }
});
