const test = require('node:test');
const assert = require('node:assert/strict');

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.children = [];
    this.className = '';
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.listeners = {};
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(eventName, handler) {
    this.listeners[eventName] = handler;
  }

  reset() {
    this.value = '';
  }

  classList = {
    add: () => {},
    remove: () => {},
  };
}

function createDocument() {
  const elements = {};
  const document = {
    getElementById(id) {
      if (!elements[id]) {
        elements[id] = new FakeElement(id);
      }
      return elements[id];
    },
    createElement(tagName) {
      return new FakeElement(tagName);
    },
    addEventListener() {},
  };

  return { document, elements };
}

test('refreshes the activities list after a successful signup', async () => {
  const { document, elements } = createDocument();
  const fetchCalls = [];
  const activities = {
    'Chess Club': {
      description: 'Test club',
      schedule: 'Fridays',
      max_participants: 12,
      participants: ['one@example.com'],
    },
  };

  global.document = document;
  global.window = { fetch: () => {} };

  const fetchImpl = async (url, options = {}) => {
    fetchCalls.push({ url, options });

    if (url === '/activities') {
      return {
        ok: true,
        json: async () => activities,
      };
    }

    if (url.includes('/signup')) {
      activities['Chess Club'].participants.push('two@example.com');
      return {
        ok: true,
        json: async () => ({ message: 'Signed up' }),
      };
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  global.fetch = fetchImpl;

  delete require.cache[require.resolve('../src/static/app.js')];
  const { setupActivityApp } = require('../src/static/app.js');
  setupActivityApp({ document, fetchImpl: fetchImpl });

  const signupForm = elements.signupForm || document.getElementById('signup-form');
  const submitHandler = signupForm.listeners.submit;

  await submitHandler({ preventDefault() {} });

  const activityFetches = fetchCalls.filter((call) => call.url === '/activities');
  assert.equal(activityFetches.length, 2, 'Expected the activities list to refresh after signup');
});
