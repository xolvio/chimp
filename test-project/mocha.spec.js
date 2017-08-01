import expect from 'expect';
import browser from 'chimp/mocha/browser';

describe('Chimp Mocha', function () {
  it('browser should navigate', async function () {
    await browser.url('https://google.com/');

    const title = await browser.getTitle();

    expect(title).toEqual('Google');
  });
});
