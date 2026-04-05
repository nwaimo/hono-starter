import { SpanStatusCode, context, propagation, trace, type TextMapGetter } from '@opentelemetry/api';
import { createMiddleware } from 'hono/factory';
import { TRACING } from '../../lib/constants.js';
import { randomString } from '../../util/string.js';

const tracer = trace.getTracer('hono');

const headerGetter: TextMapGetter<Headers> = {
  get(carrier, key) {
    return carrier.get(key) ?? undefined;
  },
  keys(carrier) {
    return [...carrier.keys()];
  },
};

export const tracing = createMiddleware(async (c, next) => {
  c.set(TRACING, randomString(10));

  const parentCtx = propagation.extract(context.active(), c.req.raw.headers, headerGetter);
  const span = tracer.startSpan(
    `${c.req.method} ${c.req.path}`,
    {
      attributes: {
        'http.method': c.req.method,
        'http.url': c.req.url,
        'http.route': c.req.path,
        'http.user_agent': c.req.header('user-agent') ?? '',
      },
    },
    parentCtx,
  );

  try {
    await context.with(trace.setSpan(parentCtx, span), () => next());
    span.setAttribute('http.status_code', c.res.status);
    if (c.res.status >= 500) {
      span.setStatus({ code: SpanStatusCode.ERROR });
    }
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
    span.recordException(err as Error);
    throw err;
  } finally {
    span.end();
  }
});
