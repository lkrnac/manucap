# vtms-subtitle-edit-ui

> 

[![NPM](https://img.shields.io/npm/v/vtms-subtitle-edit-ui.svg)](https://www.npmjs.com/package/vtms-subtitle-edit-ui) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save vtms-subtitle-edit-ui
```

## Usage

```tsx
import * as React from 'react'

import SubtitleEdit from "vtms-subtitle-edit-ui";

const Example = props => (
    <SubtitleEdit.VideoPlayer
        id="testvpid"
        poster="https://dotsub-encoded-media-dev.videotms.com/63a3ca2f-2134-4d02-b048-8140b4df391b/04e0db86-c8df-49ac-b532-47a2f826b485/2019-11-18T11:48:56.214950/6b5a7417-a6d4-4e99-898d-7aefec506065-04e0db86-c8df-49ac-b532-47a2f826b485.jpg"
        mp4="https://dotsub-encoded-media-dev.videotms.com/63a3ca2f-2134-4d02-b048-8140b4df391b/04e0db86-c8df-49ac-b532-47a2f826b485/2019-11-18T11:48:56.214950/6b5a7417-a6d4-4e99-898d-7aefec506065-04e0db86-c8df-49ac-b532-47a2f826b485.mp4"
    />
);
```

## Development

### Auto-reload in browser
When code is changed, it will rerender components in browser
```bash
npm run-script autoreload
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


## License

 © [Dotsub](https://github.com/dotsub)
