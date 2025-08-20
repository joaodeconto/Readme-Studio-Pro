import posthog from 'posthog-js';
export const track = (event: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined') posthog.capture(event, props);
};