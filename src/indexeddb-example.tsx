import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { nanoid } from 'nanoid';
import {DateTime} from 'luxon';
import { Signal, createMockDatabaseManager } from '@new-mareland/crystal-mirror';
import { getRxStorageDexie } from '@new-mareland/crystal-mirror-dexie-storage';
import { List, Map, Range, Set } from 'immutable';

function App() {
  const [count, setCount] = useState(0)
  // useEffect(() => {
  //   const openreq = window.indexedDB.open('test', 1);
  //   openreq.onupgradeneeded = function() {
  //     console.log('onupgradeneeded');
  //     const db = openreq.result;
  //     if (!db.objectStoreNames.contains('signals')) { // if there's no "signals" store
  //       db.createObjectStore('signals', {keyPath: 'id'}); // create it
  //     }
  //   };
    
  //   openreq.onerror = function() {
  //     console.error("Error", openreq.error);
  //   };
    
  //   openreq.onsuccess = function() {
  //     const db = openreq.result;
  //     const tenThousandIds = new Array(10000).fill(0).map((_, i) => ({ id: nanoid(), value: i}));
  //     const startedTime = DateTime.now();
  //     console.log(`Started on - ${startedTime.toISO()}`);
  //     const transaction = db.transaction('signals', 'readwrite');
  //     const store = transaction.objectStore('signals');
  //     store.clear();
  //     let addedContacts = 0;
  //     const totalLength = tenThousandIds.length
  //     for (let i = 0; i < totalLength; i++ ) {
  //       const req = store.add(tenThousandIds[i]);
  //       req.onsuccess = () => {
  //           addedContacts++;
  //           console.log(`Contact - ${i + 1} added.`);
  //           if (i+1 === totalLength) {
  //               if (addedContacts === totalLength) {
  //                   console.log(`--------------------------------------------------------------------`);
  //                   console.log(`All contacts successfully added in DB.`);
  //                   const endedTime = DateTime.now();
  //                   console.log(`Ended on - ${endedTime}`);
  //                   console.log(`Total time taken - ${endedTime.toMillis() - startedTime.toMillis()} ms`);

  //               } else {
  //                   console.log(`--------------------------------------------------------------------`);
  //                   console.log(`Could not add every conatcts to the db. Some may be missing.`)
  //               }
  //           }            
  //       };
  //     }
  //     const startTime1 = DateTime.now();
  //     const allRecords = store.getAll();
  //     allRecords.onsuccess = function() {
  //         console.log(allRecords.result);
  //         const endTime1 = DateTime.now();
  //         console.log(`Total time taken to get all records - ${endTime1.toMillis() - startTime1.toMillis()} ms`);
  //     };

  //   };
  //   return () => {
  //     const deletedReq = window.indexedDB.deleteDatabase('test');
  //     deletedReq.onsuccess = function() {
  //       const db = deletedReq.result;
  //       db.deleteObjectStore('signals');
  //     };
  //   }
  // }, []);

  // function getAllRecords() {
  //   console.log('get all records');
  //   const openreq = window.indexedDB.open('test', 1);

  //   openreq.onupgradeneeded = function() {
  //     console.log('onupgradeneeded');
  //     const db = openreq.result;
  //     if (!db.objectStoreNames.contains('signals')) { // if there's no "signals" store
  //       db.createObjectStore('signals', {keyPath: 'id'}); // create it
  //     }
  //   };
    
  //   openreq.onsuccess = function() {
  //     const db = openreq.result;
  //     const transaction = db.transaction('signals', 'readwrite');
  //     const store = transaction.objectStore('signals');
  //     const startTime = DateTime.now();
  //     const allRecords = store.getAll();
  //     allRecords.onsuccess = function() {
  //         console.log(allRecords.result);
  //         const endTime = DateTime.now();
  //         console.log(`Total time taken to get all records - ${endTime.toMillis() - startTime.toMillis()} ms`);
  //     };
  //   }

  //   openreq.onerror = function() {
  //     console.error("Error", openreq.error);
  //   };
  // }
  const generateSignalData = (
    numRecords: number
  ): { documents: Signal[] } => {
    const start = DateTime.utc();
    const records = Range(0, numRecords).map((i) => ({
      hardpointId: i === 1 ? 'hardpoint-id-1' : null,
      deviceId: i !== 1 ? 'device-id-0' : null,
      formulaId: null,
      id: nanoid(),
      name: 'Write idle time',
      regular: true,
      samplePeriod: 'PT3600S',
      resolution: 'hour',
      writeThrottle: null,
      lastWriteTime: '1970-01-01T00:00:00.000Z',
      uom: 'time[second]',
      slug: '',
      updated: start.toISO() ?? '',
    }));
    return { documents: records.toJSON() };
  };
  // const getSignalsByIdList = async (
  //   signalIdsList: List<string>,
  //   collections: ReplicatedCollections | undefined
  // ) => {
  //   const signals = await collections?.signals
  //     .find({ selector: { id: { $in: signalIdsList.toArray() } } })
  //     .exec();
  //   return signals;
  // };
  const getSignalStatusesBySignalsWithMap = async (
    signalIdsList: List<string>,
    signalBySignalId: Map<string, Signal>
  ) => {
    const signals: Signal[] = [];
    for (const signalId of signalIdsList.toArray()) {
      const signalStatus = signalBySignalId.get(signalId);
      if (signalStatus) {
        signals.push(signalStatus);
      }
    }
    return signals;
  };
  useEffect(() => {
    createMockDatabaseManager({
      storage: getRxStorageDexie(),
    }).then(async (manager) => {
      const signals = generateSignalData(10000);
      await manager.start();
      manager.pullQueues.signals((q) =>
      q.concat(signals.documents as unknown as Signal[])
    );
    await manager.refreshEntities();
    let immutableSet = Set<string>();
    while (immutableSet.size < 500) {
      immutableSet = immutableSet.add(
        signals.documents[Math.floor(Math.random() * 10000)].id
      );
    }
    const idList = immutableSet.toArray();
    console.log('ids ', idList.length);
    const start = DateTime.utc();
    const allSignals = await manager.collections?.signals
      .find()
      .exec();
    const signalStatusesBySignalId: Map<string, Signal> | undefined = allSignals?.reduce((acc, s) => {
      return acc.set(s.id, s);
    }, Map<string, Signal>());

    if (!signalStatusesBySignalId) {
      throw new Error('signalStatusesBySignalId is undefined');
    }
    const s = await getSignalStatusesBySignalsWithMap(
      List(idList),
      signalStatusesBySignalId
    );
    const end = DateTime.utc();
    console.log('time to get 500 signals', end.diff(start).toMillis());
    console.log('signals', s);
    })
  },[])

  const getAllRecords = () => {
    console.log('get all records');
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
        <button onClick={getAllRecords}>
          Get all records
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
