// TODO: More this to setupTests.ts

import { JSDOM } from "jsdom";
import fetchMock from 'jest-fetch-mock';
import { createCanvas } from 'canvas';
import { TextEncoder } from "util";

Object.defineProperty(global.HTMLCanvasElement.prototype, 'getContext', {
    value: () =>  createCanvas(300, 150).getContext('2d')
});

new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>");

global.window.scrollTo = jest.fn();
fetchMock.enableMocks();

global.TextEncoder = TextEncoder;
