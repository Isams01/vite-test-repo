import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    navigator.storage.getDirectory().then(async (opfsRoot) => {
      const fileHandle = await opfsRoot.getFileHandle("my first file", {
        create: true,
      });
      console.log("file handle ", fileHandle);
      const contents = 'Some text';
      // Get a writable stream.
      const writable = await fileHandle.createWritable();
      // Write the contents of the file to the stream.
      await writable.write(contents);
      // Close the stream, which persists the contents.
      await writable.close();
      const file = await fileHandle.getFile();
      console.log('file contents: ', await file.text());
      const directoryHandle = await opfsRoot.getDirectoryHandle(
        "my first folder",
        { create: true }
      );
      const nestedFileHandle = await directoryHandle.getFileHandle(
        "my first nested file",
        { create: true }
      );
      console.log("nested file handle ", nestedFileHandle);
      const nestedDirectoryHandle = await directoryHandle.getDirectoryHandle(
        "my first nested folder",
        { create: true }
      );
      console.log("nested directory handle ", nestedDirectoryHandle);

      const existingFileHandle = await opfsRoot.getFileHandle("my first file");
      console.log("existing file handle ", existingFileHandle);
      const existingDirectoryHandle = await opfsRoot.getDirectoryHandle(
        "my first folder"
      );
      console.log("existing directory handle ", existingDirectoryHandle);
      return opfsRoot;
    });
    // A FileSystemDirectoryHandle whose type is "directory"
    // and whose name is "".
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
