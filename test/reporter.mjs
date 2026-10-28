// Prints each test once, with its message and nothing else.
export default async function* reporter(source) {
  let passed = 0;
  let failed = 0;

  for await (const event of source) {
    // console.log output and load errors (e.g. a syntax error) are shown as they are.
    if (event.type === 'test:stdout' || event.type === 'test:stderr') {
      yield event.data.message;
      continue;
    }

    if (event.data?.details?.type === 'suite') {
      continue;
    }

    if (event.type === 'test:pass') {
      passed++;
      yield `  PASS  ${event.data.name}\n`;
    }

    if (event.type === 'test:fail') {
      failed++;
      const error = event.data.details.error;
      const message = (error.cause ?? error).message ?? String(error);
      yield `  FAIL  ${event.data.name}\n\n${indent(message)}\n\n`;
    }
  }

  yield `\n${passed} passed, ${failed} failed\n`;
}

const indent = (text) => text.split('\n').map((line) => `        ${line}`).join('\n');
