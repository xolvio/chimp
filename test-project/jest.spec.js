import expect from 'expect';
import browser from 'chimp/jest/browser';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;

describe('Chimp Jest', function () {
  it('browser should navigate', async function () {
    await browser.url('https://google.com/');

    const title = await browser.getTitle();

    expect(title).toEqual('Google');
  });
});
