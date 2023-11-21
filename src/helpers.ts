import { AlarmConfig, Asset, Device, EntityRef, Signal, SignalStatus } from '@new-mareland/crystal-mirror';
import { List, Range } from 'immutable';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';

export const generateAlarmConfig = (): AlarmConfig => ({
  limit: 100,
  enabled: true,
  hysteresis: 100,
  minCrossSeconds: 100,
  minUncrossSeconds: 100,
});
const signalNames = [
  'ambient temperature',
  'battery charge available',
  'battery current',
  'battery voltage',
  'pressure sensor drive voltage',
  'pressure sensor output voltage',
  'pressure sensor temperature voltage',
  'sensor temperature',
  'solar charge voltage',
  'device uptime',
  'function',
  'network bit error rate',
  'network data time',
  'network power on time',
  'network registration time',
  'network status code',
  'signal strength',
  'pressure',
];

function generateTestAssets(assetsSoFar: List<Asset>, parent: EntityRef | null, depth: number): List<Asset> {
  if (depth >= 3) {
    return assetsSoFar;
  }

  return Range(0, 3).reduce((acc, i) => {
    const child: Asset = {
      parent: parent,
      id: nanoid(),
      name: `${parent?.shortName ?? 'root'}-${i}`,
      slug: `${parent?.shortName ?? 'root'}-${i}`,
      assetType: {
        entityType: 'asset-type',
        id: nanoid(),
        shortName: 'assetType',
        slug: 'assetType',
      },
      updated: DateTime.utc(1990, 1, 1).plus({ hours: i }).toISO() ?? '',
    };

    const childRef: EntityRef = {
      entityType: 'asset',
      id: child.id,
      shortName: child.name,
      slug: child.slug,
    };

    const assetsWithChild = acc.push(child);
    return generateTestAssets(assetsWithChild, childRef, depth + 1);
  }, assetsSoFar);
}

function generateDevices(numDevices: number, parentAsset: Asset): Device[] {
  const records = Range(0, numDevices).map((i) => {
    return {
      id: nanoid(),
      serialNumber: 'TIP-' + i,
      slug: 'device-slug-' + i,
      asset: {
        entityType: 'asset',
        id: parentAsset.id,
        shortName: parentAsset.name,
        slug: parentAsset.slug,
      },
      position: null,
      updated: DateTime.utc(1990, 1, 1).toISO() ?? '', //.plus({ hours: i }).toISO() ?? '',
    };
  });
  return records.toJSON() as Device[];
}

function generateSignals(devices: Device[]): [Signal[], SignalStatus[]] {
  //generate 18 signals per device
  const signals = devices.reduce((acc, device) => {
    const records: Signal[] = signalNames.map((signalName, i) => {
      const alarmConfig = generateAlarmConfig();
      return {
        id: nanoid(),
        name: signalName,
        slug: 'device-slug-' + device.id + '-' + signalName,
        regular: true,
        samplePeriod: 'PT1S',
        resolution: '1s',
        writeThrottle: null,
        lastWriteTime: null,
        uom: 'voltage',
        origin: {
          entityType: 'device',
          id: device.id,
          shortName: device.serialNumber,
          slug: device.slug,
        },
        alarmConfig: {
          high: alarmConfig,
          highHigh: alarmConfig,
          low: alarmConfig,
          lowLow: alarmConfig,
        },
        updated: DateTime.utc(1990, 1, 1).plus({ hours: i }).toISO() ?? '',
      };
    });
    return acc.concat(records);
  }, [] as Signal[]);

  const signalStatuses: SignalStatus[] = signals.map((signal, i) => {
    return {
      id: signal.id,
      last: {
        t: '2023-03-20T18:47:38.678Z',
        y: 0,
      },
      alertGroupCount: 0,
      maxSeverity: 0,
      alarming: false,
      updated: DateTime.utc(1990, 1, 1).plus({ hours: i }).toISO() ?? '',
    };
  });

  return [signals, signalStatuses];
}

function generateTestData(numDevices: number) {
  const assets = generateTestAssets(List(), null, 0).toArray();
  const devices = generateDevices(numDevices, assets[1]);
  const [signals, signalStatuses] = generateSignals(devices);

  return { assets, devices, signals, signalStatuses };
}

export { generateTestData };