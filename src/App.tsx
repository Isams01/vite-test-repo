import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { createNetworkedDatabaseManager } from "@new-mareland/crystal-mirror";
import { getRxBrowserStorage } from "@new-mareland/crystal-mirror-browser-storage";
import { DateTime, Interval } from "luxon";

async function profile<T>(f: () => Promise<T>, hint?: string) {
  const start = DateTime.utc();
  try {
    return await f();
  } finally {
    const elapsed = Interval.fromDateTimes(start, DateTime.utc()).toDuration();
    console.log((hint ?? "elapsed") + ": " + elapsed.toISO());
  }
}

async function runCrystalMirrorTest(testNumber: string) {
  return createNetworkedDatabaseManager({
    storage: getRxBrowserStorage({
      workerDirUrl: "http://localhost:5173/worker",
    }),
    baseUrl: "http://localhost:5173/api/plugin-proxy/illumass-app/",
    networkAvailabilityPollInterval: 10_000,
    cacheSize: 100,
  }).then(async (manager) => {
    // manager.setGrafanaSessionId('be591cd4d9b98b555b6752119c2fde24')
    await profile(async () => manager.start(), "Manager start " + testNumber);
    await profile(
      async () => manager.waitForInitialReplication(),
      "Initial replication " + testNumber
    );
    await profile(
      async () => manager.createAssetLevelInfoMap(),
      "asset level info map " + testNumber
    );
    await profile(
      async () => manager.createAssetStatusMap(),
      "asset status map " + testNumber
    );
    await manager.stop();
    return manager;
  });
}

const runCrystalMirrorTests = async (numTests: number) => {
  const testArrayNums = Array.from(Array(numTests).keys());
  for (const testNum of testArrayNums) {
    await runCrystalMirrorTest(testNum.toString());
  }
};
let started = false;
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) {
      started = true;
      console.log("hello from vite");

      runCrystalMirrorTests(50);
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
