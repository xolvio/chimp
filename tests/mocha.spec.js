import expect from 'expect';
import browser from '../chimp/mocha/browser';

describe('my webdriverio tests', function () {
  it('google test', async function () {
    await browser.url('https://google.com/');

    const title = await browser.getTitle();

    expect(title).toEqual('Google');
  });
});
