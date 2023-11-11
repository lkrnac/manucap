# manucap

## Install

```bash
npm install --save manucap
```

## Usage

```tsx
import * as React from 'react'

import ManuCap from "manucap";

const Example = props => (
    <ManuCap.VideoPlayer
        id="testvpid"
        // TODO Provide thumbnail file
        poster="https://media.xiph.org/sintel/sintel-1080-png/00002771.png"
        mp4="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    />
);
```

## Development

### Auto-reload in browser
When code is changed, it will rerender components in browser
```bash
npm run autoreload
```

### Auto-build library
When code is changed, it will automatically create distribution package
```bash
npm start
```

### Continuous unit testing
When code is changed, all tests are rerun
```bash
npm test
```
