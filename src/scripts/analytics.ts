import type { PostHog } from 'posthog-js';

type AnalyticsProperty = string | number | boolean | null | undefined | string[];
type AnalyticsProperties = Record<string, AnalyticsProperty>;

type QueuedEvent = {
  event: string;
  properties?: AnalyticsProperties;
};

const apiKey: string | undefined = import.meta.env.PUBLIC_POSTHOG_KEY;
const apiHost: string = import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

let client: PostHog | null = null;
let initialization: Promise<void> | null = null;
let failed = false;
let queue: QueuedEvent[] = [];

const flush = () => {
  if (!client) {
    return;
  }

  const events = queue;
  queue = [];

  events.forEach(event => client?.capture(event.event, event.properties));
};

const start = (): Promise<void> => {
  if (!apiKey || failed) {
    return Promise.resolve();
  }

  if (initialization) {
    return initialization;
  }

  initialization = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        cross_subdomain_cookie: true,
        disable_session_recording: true,
        persistence: 'localStorage+cookie',
        person_profiles: 'identified_only',
        respect_dnt: true,
      });

      posthog.register({
        surface: 'landing',
        locale: document.documentElement.lang,
      });

      client = posthog;
      flush();
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

const track = (event: string, properties?: AnalyticsProperties) => {
  if (!apiKey) {
    return;
  }

  if (client) {
    client.capture(event, properties);

    return;
  }

  if (failed) {
    return;
  }

  queue.push({ event, properties });
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
