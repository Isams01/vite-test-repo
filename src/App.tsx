import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  MockDatabaseManager,
  RxDatabase,
  createMockDatabaseManager,
} from "@new-mareland/crystal-mirror";
import { getRxBrowserStorage } from "@new-mareland/crystal-mirror-browser-storage";
import { DateTime, Interval } from "luxon";
import { generateTestData } from "./helpers";
import { Map, List, Range } from "immutable";

type Stats = {
  samples: List<number>;
};

let statsByHint: Map<string, Stats> = Map();

async function profile<T>(f: () => Promise<T>, hint?: string) {
  const start = DateTime.utc();
  try {
    return await f();
  } finally {
    const elapsed = Interval.fromDateTimes(start, DateTime.utc()).toDuration();
    const k = hint ?? 'elapsed';
    statsByHint = statsByHint.update(k, (stats) => {
      if (stats === undefined) {
        return {
          samples: List([elapsed.as("milliseconds")]),
        };
      } else {
        stats.samples = stats.samples.push(elapsed.as("milliseconds"));
        return stats;
      }
    });
  }
}

function printStats() {
  statsByHint.forEach((stats, hint) => {
    const samples = stats.samples;
    const sum = samples.reduce((a, b) => a + b, 0);
    const mean = sum / samples.size;
    const variance =
      samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.size;
    const stdDev = Math.sqrt(variance);
    console.log(
      `Hint: ${hint} mean: ${mean.toFixed(
        2
      )}ms stdDev: ${stdDev.toFixed(2)}ms samples: ${samples.size}`
    );
  });
}

async function runCrystalMirrorTest(numberOfDevices: number, testRun: number) {
  if (testRun == 0) {
    // Delete database
    const opfsDir = await navigator.storage.getDirectory()
    try {
      await opfsDir.removeEntry('crystal_mirror.mock_crystal_mirror.db');
    } catch (err) {
      // ignore any errors
    }
  }

  return createMockDatabaseManager({
    storage: getRxBrowserStorage({
      workerDirUrl: "http://localhost:5173/worker",
    }),
  }).then(async (manager: MockDatabaseManager & { db?: RxDatabase }) => {
    await profile(async () => manager.start(), "Manager start");

    if (manager.collections === undefined) {
      throw new Error("collections is undefined");
    }

    if (testRun == 0) {
      const deviceCount = await manager.collections?.devices.count().exec();
      if (deviceCount === undefined) {
        throw new Error("device count is undefined");
      }

      if (deviceCount == 0) {
        console.log('generating test data');
        const { devices, assets, signals, signalStatuses } = generateTestData(numberOfDevices);
        console.log("devices length ", devices.length);
        console.log("assets length ", assets.length);
        console.log("signals length ", signals.length);
        console.log("signal statuses length ", signalStatuses.length);
        manager.pullQueues.devices((q) => q.concat(devices));
        manager.pullQueues.assets((q) => q.concat(assets));
        manager.pullQueues.signals((q) => q.concat(signals));
        manager.pullQueues.signalStatuses((q) => q.concat(signalStatuses));
      }
    }

    await profile(
      async () => manager.waitForInitialReplication(),
      "Initial replication"
    );
    await profile(
      async () => manager.createAssetLevelInfoMap(),
      "asset level info map"
    );
    await profile(
      async () => manager.createAssetStatusMap(),
      "asset status map"
    );
    await profile(() => manager.stop(), "manager stop");
  });
}

const runCrystalMirrorTests = async (numberOfDevices: List<number>, numTests: number) => {
  await numberOfDevices.reduce(async (p1, numDevices) => {
    console.log(`test with ${numDevices} devices`);
    await Range(0, numTests).reduce(async (p2, testNum) => {
      await p2;
      await runCrystalMirrorTest(numDevices, testNum);
    }, p1);
    printStats();
  }, Promise.resolve());
  console.log('done');
};

let started = false;
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) {
      started = true;
      console.log("hello from vite");

      runCrystalMirrorTests(List([100, 1_000, 10_000]), 100);
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>

        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
