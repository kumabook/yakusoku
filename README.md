# yakusoku

[![Build Status](https://travis-ci.org/kumabook/yakusoku.svg?branch=master)](https://travis-ci.org/kumabook/yakusoku) [![Coverage Status](https://coveralls.io/repos/github/kumabook/yakusoku/badge.svg?branch=master)](https://coveralls.io/github/kumabook/yakusoku?branch=master)

Yakusoku is a simple promise library.

It aims to work in es3 and be light-weight, the size is 3.79KB

It is compatible with [Promise API](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise):

- `Promise#then(onFulfilled, onRejected)`
- `Promise#catch(onRejected)` or `Promise.prototype.rescue(onRejected)`
  - `catch` is a reserved word in IE<9,
    therefore `promise.catch(func)` throws a syntax error.
    In order to deal with it, yakusoku provides alias `Promise#rescue`
- `Promise.all(iterable)`
- `Promise.race(iterable)`
- `Promise.reject(reason)`
- `Promise.resolve(value)`

## Developement & Testing

```shell
yarn install
npm test
```

## License

MIT License

Copyright (c) 2017 Hiroki Kumamoto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
