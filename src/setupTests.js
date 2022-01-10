import { enableMapSet } from "immer";
import "@testing-library/jest-dom/extend-expect";
// https://stackoverflow.com/questions/48828759/unit-test-raises-error-because-of-getcontext-is-not-implemented
import "jest-canvas-mock";

// TODO: enableMapSet is needed to workaround draft-js type issue.
//  https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43426
//  Can be removed once fixed.
enableMapSet();
