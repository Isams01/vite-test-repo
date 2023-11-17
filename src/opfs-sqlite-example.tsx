import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [dbWorker, setDbWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const url = new URL("./worker.ts", import.meta.url)
    console.log('worker url ', url);
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.postMessage({ type: 'open' })
    worker.onmessage = function ({ data }) {
      console.log("data from worker ", data);
      // Handle the messages received from the worker
    };
    setDbWorker(worker);

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    // send test message to worker
    if (dbWorker) {
      dbWorker.postMessage({ data: "test message" });
    }
  }, [dbWorker]);

  function insertSql() {
    if (!dbWorker) throw new Error('dbWorker not initialized');
    const queries = [];
    for (let i = 0; i < 100; i++) {
      queries.push({
        sql: `INSERT INTO t(a,b) VALUES (?,?)`,
        args: [i, i * 10],
      });
    }
    dbWorker.postMessage({ type: 'exec', queries });
  }

  function truncateTable() {
    if (!dbWorker) throw new Error('dbWorker not initialized');
    const queries = [{
      sql: `DELETE FROM t`,
    }];
    dbWorker.postMessage({ type: 'exec', queries });
  }

  function queryTable() {
    if (!dbWorker) throw new Error('dbWorker not initialized');
    const sqlQuery = [{
      sql: `SELECT * FROM t`,
      args: [],
    }];
    console.log('running select query', sqlQuery);
    dbWorker.postMessage({ type: 'exec', queries: sqlQuery });
  }

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
        <button onClick={insertSql}>insert sql</button>
        <button onClick={queryTable}>
          query table
        </button>
        <button onClick={truncateTable}>
          truncate table
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
