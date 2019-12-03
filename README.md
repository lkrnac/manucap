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
        poster="http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
        mp4="http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4"
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
