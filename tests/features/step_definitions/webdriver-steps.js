import {When, Then} from 'cucumber';
import expect from 'expect';
import browser from '../../../chimp/cucumber/browser';

When(/^I visit "([^"]*)"$/, async function (url) {
  await browser.url(url);
});

Then(/^I see the title of "([^"]*)"$/, async function (title) {
  expect(await browser.getTitle()).toEqual(title);
});
