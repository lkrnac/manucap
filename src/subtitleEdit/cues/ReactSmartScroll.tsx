import React, {
    createRef,
    ReactElement,
    RefObject,
    useEffect,
    useRef,
    useState
} from "react";
import Bowser from "bowser";

export interface Item {
    id?: number;
}

// TODO Remove unknowns/any from this file
interface RowProps {
    data: Item;
    rowProps: unknown;
    Component: any;
    rowRef: unknown;
    rowIndex: number;
}

interface Props {
    className: string;
    data: Item[];
    row: unknown;
    rowProps: unknown;
    startAt: number | undefined;
}

const ReactSmartScrollRow = (props: RowProps): ReactElement => {
    return (
        <props.Component
            data={props.data}
            rowIndex={props.rowIndex}
            rowRef={props.rowRef}
            rowProps={props.rowProps}
        />
    );
};

console.log(Bowser.getParser(window.navigator.userAgent).getEngineName());
const mouseWheelStep = Bowser.getParser(window.navigator.userAgent).getEngineName() === "Gecko" ? 50: 500;
const cuesCountToRender = 20;
let shouldScroll = true;

const ReactSmartScroll = (props: Props): ReactElement => {
    const [refs, setRefs] = useState([] as RefObject<HTMLDivElement>[]);
    useEffect(() => {
        setRefs(
            Array(cuesCountToRender)
                .fill(undefined)
                .map(() => createRef())
        );
    }, []);

    const scrollRef = useRef(null as HTMLDivElement | null);
    const contentRef = useRef(null as HTMLDivElement | null);

    const [scroll, setScroll] = useState(0);
    useEffect(() => {
        const { current } = scrollRef;
        const onScroll = (
        ): void => {
            if (shouldScroll)
                setScroll(current ? current.scrollTop : 0);
            else {
                shouldScroll = true;
            }
        };
        if (current) {
            current.addEventListener("scroll", onScroll);
        }
    }, [scrollRef]);


    let idToScroll = props.startAt !== undefined
        ? props.startAt
        : Math.round(scroll/mouseWheelStep);
    idToScroll = idToScroll < props.data.length
        ? idToScroll
        : props.data.length;

    const endIndex = idToScroll + cuesCountToRender < props.data.length
        ? idToScroll + cuesCountToRender
        : props.data.length;
    const startIndex = endIndex > idToScroll - cuesCountToRender
        ? endIndex - cuesCountToRender
        : idToScroll;

    const upperGap = (startIndex - 1) * mouseWheelStep > 0 ? (startIndex - 1) * mouseWheelStep : 0;
    const belowGap = (props.data.length - endIndex) * mouseWheelStep;

    useEffect(
        () => {
            if (props.startAt !== undefined) {
                setScroll(props.startAt * mouseWheelStep);
                shouldScroll = false;
                refs[idToScroll - startIndex]?.current?.scrollIntoView();
            }
        },
        // This should be executed only if startAt is set -> e.g. user requires scroll via button or edits cue
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.startAt]
    );
    return (
        <div
            ref={scrollRef}
            className={props.className || ""}
            style={{ overflow: "auto" }}
        >
            <div style={{}} ref={contentRef}>
                <div style={{ minHeight: upperGap + "px" }} />
                {props.data.slice(startIndex, endIndex).map((item: Item, i) => (
                    <ReactSmartScrollRow
                        key={item.id || startIndex + i}
                        Component={props.row}
                        data={item}
                        rowIndex={startIndex + i}
                        rowProps={props.rowProps}
                        rowRef={refs[i]}
                    />
                ))}
            </div>
            <div style={{ minHeight: belowGap + "px" }} />
        </div>
    );
};

export default ReactSmartScroll;
