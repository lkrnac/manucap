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
        poster="https://archive.org/download/ElephantsDream/ElephantsDream.thumbs/ed_1024_000090.jpg"
        mp4="https://ia801209.us.archive.org/17/items/ElephantsDream/ed_1024.mp4"
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
