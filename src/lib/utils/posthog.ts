import posthog from 'posthog-js';
export const track = (
  event: string,
  props?: Record<string, unknown>,
) => {
  if (typeof window !== 'undefined') posthog.capture(event, props);
};
