import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { JSDOM } from "jsdom";
import { configure } from "enzyme";

new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>");

configure({ adapter: new Adapter() });

global.window.scrollTo = jest.fn();
