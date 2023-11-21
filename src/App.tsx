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

async function profile<T>(f: () => Promise<T>, hint?: string) {
  const start = DateTime.utc();
  try {
    return await f();
  } finally {
    const elapsed = Interval.fromDateTimes(start, DateTime.utc()).toDuration();
    console.log((hint ?? "elapsed") + ": " + elapsed.toISO());
  }
}

// async function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

async function runCrystalMirrorTest(testNumber: string) {
  return createMockDatabaseManager({
    storage: getRxBrowserStorage({
      workerDirUrl: "http://localhost:5173/worker",
    }),
  }).then(async (manager: MockDatabaseManager & { db?: RxDatabase }) => {
    if (testNumber === "0") {
      const { devices, assets, signals, signalStatuses } = generateTestData(100);
      console.log("devices length ", devices.length);
      console.log("assets length ", assets.length);
      console.log("signals length ", signals.length);
      console.log("signal statuses length ", signalStatuses.length);
      manager.pullQueues.devices((q) => q.concat(devices));
      manager.pullQueues.assets((q) => q.concat(assets));
      manager.pullQueues.signals((q) => q.concat(signals));
      manager.pullQueues.signalStatuses((q) => q.concat(signalStatuses));
    }
    manager.collections?.signals.insert$.subscribe((signals) => {console.log('signals change', signals)});
    manager.collections?.signals.update$.subscribe((signals) => {console.log('signals update', signals)});
    await profile(async () => manager.start(), "Manager start " + testNumber);
    await profile(
      async () => manager.waitForInitialReplication(),
      "Initial replication " + testNumber
    );
    // await profile(
    //   async () => manager.createAssetLevelInfoMap(),
    //   "asset level info map " + testNumber
    // );
    // await profile(
    //   async () => manager.createAssetStatusMap(),
    //   "asset status map " + testNumber
    // );
    console.log("stopping");
    await profile(() => manager.stop(), "manager stop " + testNumber);
    console.log("stopped");
    // await sleep(5000)
    return manager;
  });
}

const runCrystalMirrorTests = async (numTests: number) => {
  const testArrayNums = Array.from(Array(numTests).keys());
  for (const testNum of testArrayNums) {
    console.log("running test ", testNum);
    await runCrystalMirrorTest(testNum.toString());
    console.log("done test", testNum);
  }
};
let started = false;
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) {
      started = true;
      console.log("hello from vite");

      runCrystalMirrorTests(100);
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
