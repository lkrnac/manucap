const initialState = {
    testValue: "initialTestValue"
};

type TestState = typeof initialState;

export interface TestAction {
    type: string;
    testValue: string;
}

const testReducer = (state = initialState, action: TestAction): TestState => {
    switch (action.type) {
        case "TEST_ACTION": return {...state, testValue: action.testValue};
    }
    return state;
};

export default testReducer;
