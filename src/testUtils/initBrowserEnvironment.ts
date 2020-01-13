import Adapter from "enzyme-adapter-react-16";
import { JSDOM } from "jsdom";
import { configure } from "enzyme";

new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>");

configure({ adapter: new Adapter() });
