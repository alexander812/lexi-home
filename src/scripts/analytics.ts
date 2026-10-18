type AmplitudeModule = typeof import('@amplitude/analytics-browser');

type AnalyticsProperty = string | number | boolean | null | undefined | string[];
type AnalyticsProperties = Record<string, AnalyticsProperty>;

type QueuedEvent = {
  event: string;
  properties: AnalyticsProperties;
};

const apiKey: string | undefined = import.meta.env.PUBLIC_AMPLITUDE_KEY;
const serverZone: 'EU' | 'US' =
  import.meta.env.PUBLIC_AMPLITUDE_SERVER_ZONE === 'EU' ? 'EU' : 'US';
const analyticsIdCookie = 'lexi_analytics_id';
const analyticsIdStorage = 'lexi.analytics.id';

const isDntEnabled = (): boolean => {
  const windowWithDnt = window as Window & { doNotTrack?: string };

  return navigator.doNotTrack === '1' || windowWithDnt.doNotTrack === '1';
};

const canTrack = Boolean(apiKey) && !isDntEnabled();

const readCookie = (name: string): string | null => {
  const prefix = `${name}=`;
  const part = document.cookie.split('; ').find(item => item.startsWith(prefix));

  return part ? decodeURIComponent(part.slice(prefix.length)) : null;
};

const writeCookie = (name: string, value: string): void => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const host = window.location.hostname;
  const domain = host === 'lexi.casa' || host.endsWith('.lexi.casa') ? '; Domain=.lexi.casa' : '';

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}${domain}`;
};

const readStoredId = (): string | null => {
  try {
    return window.localStorage.getItem(analyticsIdStorage);
  } catch {
    return null;
  }
};

const storeId = (id: string): void => {
  try {
    window.localStorage.setItem(analyticsIdStorage, id);
  } catch {
    return;
  }
};

const createId = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
};

const ensureAnalyticsId = (): string => {
  const cookieId = readCookie(analyticsIdCookie);

  if (cookieId) {
    storeId(cookieId);
    return cookieId;
  }

  const storedId = readStoredId();

  if (storedId) {
    writeCookie(analyticsIdCookie, storedId);
    return storedId;
  }

  const id = createId();
  storeId(id);
  writeCookie(analyticsIdCookie, id);

  return id;
};

const baseTraits = (): AnalyticsProperties => ({
  surface: 'landing',
  platform: 'web',
  host: window.location.hostname,
});

const traits: AnalyticsProperties = baseTraits();
let sdk: AmplitudeModule | null = null;
let initialization: Promise<void> | null = null;
let failed = false;
let queue: QueuedEvent[] = [];

const flushQueue = (module: AmplitudeModule): void => {
  const events = queue;
  queue = [];

  events.forEach(item => module.track(item.event, item.properties));
};

const start = (): Promise<void> => {
  if (!apiKey || !canTrack || failed) {
    return Promise.resolve();
  }

  if (initialization) {
    return initialization;
  }

  initialization = import('@amplitude/analytics-browser')
    .then(module => {
      const deviceId = ensureAnalyticsId();

      module.init(apiKey, {
        serverZone,
        deviceId,
        autocapture: false,
        identityStorage: 'localStorage',
        enableDiagnostics: false,
        enableRequestBodyCompression: false,
        flushIntervalMillis: 1500,
        flushQueueSize: 10,
        remoteConfig: { fetchRemoteConfig: false },
        trackingOptions: { ipAddress: false },
        transport: { type: 'fetch', enableKeepalive: true },
        logLevel: module.Types.LogLevel.None,
      });
      module.setDeviceId(deviceId);

      sdk = module;
      flushQueue(module);

      track('landing_viewed', {
        path: window.location.pathname,
        locale: document.documentElement.lang,
        referrer: document.referrer || undefined,
      });
    })
    .catch(() => {
      failed = true;
      queue = [];
    });

  return initialization;
};

const track = (event: string, properties?: AnalyticsProperties): void => {
  if (!canTrack) {
    return;
  }

  const eventProperties = { ...traits, ...properties };

  if (sdk) {
    sdk.track(event, eventProperties);
    return;
  }

  if (failed) {
    return;
  }

  queue.push({ event, properties: eventProperties });
  void start();
};

document.addEventListener('click', event => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const control = target.closest<HTMLElement>('[data-analytics-event]');
  const name = control?.dataset.analyticsEvent;

  if (!control || !name) {
    return;
  }

  track(name, {
    placement: control.dataset.analyticsPlacement,
    locale: document.documentElement.lang,
    target: control.getAttribute('href'),
  });
});

if (window.requestIdleCallback) {
  window.requestIdleCallback(() => void start());
} else {
  window.setTimeout(() => void start(), 1);
}
