import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { JSDOM } from "jsdom";
import { configure } from "enzyme";
import fetchMock from 'jest-fetch-mock';
import { createCanvas } from 'canvas';

Object.defineProperty(global.HTMLCanvasElement.prototype, 'getContext', {
    value: () =>  createCanvas(300, 150).getContext('2d')
});

new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>");

configure({ adapter: new Adapter() });

global.window.scrollTo = jest.fn();
fetchMock.enableMocks();
