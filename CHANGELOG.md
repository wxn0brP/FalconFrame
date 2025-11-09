# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.3](https://github.com/wxn0brP/FalconFrame/compare/v0.5.2...v0.5.3) (2025-11-09)


### Features

* allow res.render to access FalconFrame instance ([0c1ed58](https://github.com/wxn0brP/FalconFrame/commit/0c1ed58d0bbbdda91a7df204ba29c245a78f8896))

### [0.5.2](https://github.com/wxn0brP/FalconFrame/compare/v0.5.1...v0.5.2) (2025-11-09)


### Features

* render data ([58cccc3](https://github.com/wxn0brP/FalconFrame/commit/58cccc3c65d96347eb62bf28c865281051d50ca0))

### [0.5.1](https://github.com/wxn0brP/FalconFrame/compare/v0.5.0...v0.5.1) (2025-10-15)


### Features

* improve render in static files handler ([fc272be](https://github.com/wxn0brP/FalconFrame/commit/fc272beb047b09d95eecf65b09a2e5566aa43f81))
* render options ([1b443d9](https://github.com/wxn0brP/FalconFrame/commit/1b443d99624e6bb9638f9a01d73dfe974aabd6a1))

## [0.5.0](https://github.com/wxn0brP/FalconFrame/compare/v0.4.1...v0.5.0) (2025-10-12)


### ⚠ BREAKING CHANGES

* remove old plugin system

### Features

* app.l(port) ([58e8ce8](https://github.com/wxn0brP/FalconFrame/commit/58e8ce84893955fc5529cb8698fca18806ca46f5))
* remove old plugin system ([00728e6](https://github.com/wxn0brP/FalconFrame/commit/00728e6d0c9f10c1c6c7e93e8568f4c100a0779f))

### [0.4.1](https://github.com/wxn0brP/FalconFrame/compare/v0.4.0...v0.4.1) (2025-10-12)


### Features

* app.setOrigin ux ([751d7ff](https://github.com/wxn0brP/FalconFrame/commit/751d7ff1167602c4911bc89ee94a37c80c9282b6))
* router.router(path) ([90743ac](https://github.com/wxn0brP/FalconFrame/commit/90743ace2127e3c1f78b3fe94b37f5995b7187ae))

## [0.4.0](https://github.com/wxn0brP/FalconFrame/compare/v0.3.0...v0.4.0) (2025-09-30)


### ⚠ BREAKING CHANGES

* sse update

### Features

* add body parser logs ([b69ad76](https://github.com/wxn0brP/FalconFrame/commit/b69ad7663390e625f676b9da3970875a0b62ebd0))
* layout ([9eb8b49](https://github.com/wxn0brP/FalconFrame/commit/9eb8b49dad2153d56844fcdaa327540f263ab191))
* sse update ([c7ac498](https://github.com/wxn0brP/FalconFrame/commit/c7ac49873c7041c77978ead73a7a00143a40eb68))

## [0.3.0](https://github.com/wxn0brP/FalconFrame/compare/v0.2.1...v0.3.0) (2025-09-28)


### ⚠ BREAKING CHANGES

* update body parsers

### Features

* custom parser opts ([b03f5b1](https://github.com/wxn0brP/FalconFrame/commit/b03f5b1e6eda1f0b9cc1c9dbd20ec8c8ef4fce06))
* endpoint custom parser ([54d1043](https://github.com/wxn0brP/FalconFrame/commit/54d1043de276a55896b42f5da26fbe1f7c679fc8))
* opts - disable default body parsers ([943f419](https://github.com/wxn0brP/FalconFrame/commit/943f419731cab4496d21b15435e500cd38d471c7))
* update body parsers ([88b08e6](https://github.com/wxn0brP/FalconFrame/commit/88b08e601fd0a928b91425004404bc0680a7816e))


### Bug Fixes

* custom parser opts ([858dc4b](https://github.com/wxn0brP/FalconFrame/commit/858dc4b9dce5055fa0dbeca251a7c446c36a36f9))
* logger opts & req ([df8e67a](https://github.com/wxn0brP/FalconFrame/commit/df8e67a383c1a23936715f6c6284e7b2203adfec))

### [0.2.1](https://github.com/wxn0brP/FalconFrame/compare/v0.2.0...v0.2.1) (2025-09-27)


### Features

* app.listen(port: number | string) ([314f12b](https://github.com/wxn0brP/FalconFrame/commit/314f12b2d794cfc62e48ffb6452af7f5415a4593))
* PluginSystem in router.use ([ad9469d](https://github.com/wxn0brP/FalconFrame/commit/ad9469d2d8b217490d6bdaf4f907e87c783fb4d3))


### Bug Fixes

* serve static file ([5bc6800](https://github.com/wxn0brP/FalconFrame/commit/5bc6800b45fc8231a5f6e95d1db43251649ff507))

## [0.2.0](https://github.com/wxn0brP/FalconFrame/compare/v0.1.0...v0.2.0) (2025-09-22)


### ⚠ BREAKING CHANGES

* update render
* update plugin api

### Features

* don't parse body if method is GET, HEAD, OPTIONS ([f9e16a3](https://github.com/wxn0brP/FalconFrame/commit/f9e16a3ecbbb12510819d4630fce95c86badf378))
* ETag support ([17e0e72](https://github.com/wxn0brP/FalconFrame/commit/17e0e72ffe2736a3c963f628b33c054d59e111e1))
* update cors ([8f25e63](https://github.com/wxn0brP/FalconFrame/commit/8f25e63bab825e65f5331f191d6f5a2b4e2790e4))
* update plugin api ([55ea1e3](https://github.com/wxn0brP/FalconFrame/commit/55ea1e368684fb7d840d08a2c187c49923a2c5e4))
* update render ([fac91d1](https://github.com/wxn0brP/FalconFrame/commit/fac91d1fde1267d391c13dd5d12de5b484b732d6))


### Bug Fixes

* typo in import ([bcc026f](https://github.com/wxn0brP/FalconFrame/commit/bcc026f5587e05b27ccdebd40ede37ed230b8694))

## [0.1.0](https://github.com/wxn0brP/FalconFrame/compare/v0.0.21...v0.1.0) (2025-09-20)


### ⚠ BREAKING CHANGES

* body limit & break FF opts api

### Features

* body limit & break FF opts api ([c97b832](https://github.com/wxn0brP/FalconFrame/commit/c97b832332d0692e205cbe3bf10c40fafe93f28e))
* custom body parse ([b0b2d6f](https://github.com/wxn0brP/FalconFrame/commit/b0b2d6faae1ac69a24322f3fd1e86880b5fc70ce))
* render path ([7f8b305](https://github.com/wxn0brP/FalconFrame/commit/7f8b30520cfa0f2e2f70910b17e05e77b0634828))
* vars ([714f241](https://github.com/wxn0brP/FalconFrame/commit/714f24117584b390cbd9173e8093e56394bce710))


### Bug Fixes

* render path ([b8ac022](https://github.com/wxn0brP/FalconFrame/commit/b8ac022728ce340969a7deb360bc59f8d4995918))
* vars ([bac9f96](https://github.com/wxn0brP/FalconFrame/commit/bac9f9694ae7e16c47c02262ba671399c4faa044))

### [0.0.21](https://github.com/wxn0brP/FalconFrame/compare/v0.0.20...v0.0.21) (2025-08-03)


### Features

* handleStaticFiles try .html ([c4990f4](https://github.com/wxn0brP/FalconFrame/commit/c4990f40da32c0ea3aedf0aca8dd4fc9d86cbf50))

### [0.0.20](https://github.com/wxn0brP/FalconFrame/compare/v0.0.19...v0.0.20) (2025-07-24)


### Bug Fixes

* decodeURIComponent ([82d98b8](https://github.com/wxn0brP/FalconFrame/commit/82d98b854a6376c5cae84c43bdfaf782355ea4b8))

### [0.0.19](https://github.com/wxn0brP/FalconFrame/compare/v0.0.18...v0.0.19) (2025-07-21)


### Features

* listen console log ([b06fd7d](https://github.com/wxn0brP/FalconFrame/commit/b06fd7d98ce9090e33911d133b6cae5b1b367848))

### [0.0.18](https://github.com/wxn0brP/FalconFrame/compare/v0.0.17...v0.0.18) (2025-07-10)


### Features

* refactor, error handling, docs ([b3b49d5](https://github.com/wxn0brP/FalconFrame/commit/b3b49d56d6d3435ff62177ae4e0228b9153a718d))
* sse support ([e45c71b](https://github.com/wxn0brP/FalconFrame/commit/e45c71bfedca2c104579d4035724e8e114f12f04))

### [0.0.17](https://github.com/wxn0brP/FalconFrame/compare/v0.0.16...v0.0.17) (2025-07-08)


### Bug Fixes

* getMiddlewares ([289f3dd](https://github.com/wxn0brP/FalconFrame/commit/289f3dd0ad7f0825e0f77d109a57ddd8d0c77c6c))

### [0.0.16](https://github.com/wxn0brP/FalconFrame/compare/v0.0.15...v0.0.16) (2025-07-06)


### Bug Fixes

* getMiddlewares ([c015f75](https://github.com/wxn0brP/FalconFrame/commit/c015f75102b91bbe921b2a702763ac7a711eb5e1))
* static files ([79a8894](https://github.com/wxn0brP/FalconFrame/commit/79a889408db339ff77909df1946a8ec1bf3d7c59))

### [0.0.15](https://github.com/wxn0brP/FalconFrame/compare/v0.0.14...v0.0.15) (2025-07-05)


### Features

* routers ([f9d6500](https://github.com/wxn0brP/FalconFrame/commit/f9d65005ecd5018dfe2cc1a9f9d94f0dfe6c7294))
* static files ux ([c80df87](https://github.com/wxn0brP/FalconFrame/commit/c80df87a915beeb69f0fd345454c6ba864daf327))
* ux ([aec1a56](https://github.com/wxn0brP/FalconFrame/commit/aec1a56eeed4fda06486736ba3b709c0c2dd6f44))


### Bug Fixes

* routers ([f4f1db2](https://github.com/wxn0brP/FalconFrame/commit/f4f1db21363fc3a9e563b00a6a134b0bf7dc5546))

### [0.0.14](https://github.com/wxn0brP/FalconFrame/compare/v0.0.13...v0.0.14) (2025-06-22)

### [0.0.13](https://github.com/wxn0brP/FalconFrame/compare/v0.0.12...v0.0.13) (2025-06-20)


### Bug Fixes

* **plugin:** cors OPTIONS method ([a479887](https://github.com/wxn0brP/FalconFrame/commit/a479887ef604b94125a14a6f2b4d0dd687469c98))

### [0.0.12](https://github.com/wxn0brP/FalconFrame/compare/v0.0.11...v0.0.12) (2025-06-18)


### Features

* AfterHandleRequest ([5de6efa](https://github.com/wxn0brP/FalconFrame/commit/5de6efadc8331bb77e9140d50f1bdb08ba60d620))

### [0.0.11](https://github.com/wxn0brP/FalconFrame/compare/v0.0.10...v0.0.11) (2025-06-17)

### [0.0.10](https://github.com/wxn0brP/FalconFrame/compare/v0.0.9...v0.0.10) (2025-06-17)


### Bug Fixes

* url parse ([94cadf4](https://github.com/wxn0brP/FalconFrame/commit/94cadf43718077d2af511e1edb6500ae7ca02b0a))

### [0.0.9](https://github.com/wxn0brP/FalconFrame/compare/v0.0.8...v0.0.9) (2025-06-17)


### Bug Fixes

* url parse ([dcf180c](https://github.com/wxn0brP/FalconFrame/commit/dcf180c42f974b8ed173d07bcb09597f712bb219))

### [0.0.8](https://github.com/wxn0brP/FalconFrame/compare/v0.0.7...v0.0.8) (2025-06-14)


### Bug Fixes

* **plugin:** cors * ([66e114e](https://github.com/wxn0brP/FalconFrame/commit/66e114e90fe79cc89dcdf7f121ca08809018548f))

### [0.0.7](https://github.com/wxn0brP/FalconFrame/compare/v0.0.6...v0.0.7) (2025-06-12)


### Features

* update plugins ([0bcf546](https://github.com/wxn0brP/FalconFrame/commit/0bcf546c68bbd74ba61ba3e19bf567d352aeaeb3))

### [0.0.6](https://github.com/wxn0brP/FalconFrame/compare/v0.0.5...v0.0.6) (2025-06-04)


### Features

* add central plugin/middleware system ([4dea405](https://github.com/wxn0brP/FalconFrame/commit/4dea4053ef8bfbd8294c2706134fde6fd9628320))

### [0.0.5](https://github.com/wxn0brP/FalconFrame/compare/v0.0.4...v0.0.5) (2025-06-01)


### Features

* add simple template render ([1a54833](https://github.com/wxn0brP/FalconFrame/commit/1a54833fe5e08b7814105f7b6a88db87aa37eeb5))


### Bug Fixes

* type ([c22fe7c](https://github.com/wxn0brP/FalconFrame/commit/c22fe7c3a0a4f1d3dbb1e9041eb857691600f96c))

### [0.0.4](https://github.com/wxn0brP/FalconFrame/compare/v0.0.3...v0.0.4) (2025-05-16)


### Features

* change logger ([f570aef](https://github.com/wxn0brP/FalconFrame/commit/f570aef5000d274ece6ac2f8b68b9d8621a08283))

### [0.0.3](https://github.com/wxn0brP/FalconFrame/compare/v0.0.2...v0.0.3) (2025-05-15)

### 0.0.2 (2025-05-15)


### Features

* add alternative export ([4e69a6b](https://github.com/wxn0brP/FalconFrame/commit/4e69a6b0fa771c35d9aef2270174cba3026251c3))
* add build workflow ([d89bd23](https://github.com/wxn0brP/FalconFrame/commit/d89bd2385a4e5855cfa4205c86563ba65f89c978))
* add simple valid function ([8c247d2](https://github.com/wxn0brP/FalconFrame/commit/8c247d2610c78c748fca4efc25840b51359e9490))
* add type export ([0ef9d6c](https://github.com/wxn0brP/FalconFrame/commit/0ef9d6cd61221c88c79f25b07b3240bec379ca76))
* enhance middlewares ([3c2063b](https://github.com/wxn0brP/FalconFrame/commit/3c2063b6366514b55e2ac19a83b1dba9d42072cb))
* make public ([63b38fc](https://github.com/wxn0brP/FalconFrame/commit/63b38fc5fdfbacef9e2e9be2c4ffd0d66553443c))
* refactor engine ([d2a40c4](https://github.com/wxn0brP/FalconFrame/commit/d2a40c471195ea8a0bfdbfd5edeebc2dcd4a438d))
* return server on listen ([f98e6c9](https://github.com/wxn0brP/FalconFrame/commit/f98e6c931e0afd4b5627b363707d0bf3460b5770))
* update exports ([2feac36](https://github.com/wxn0brP/FalconFrame/commit/2feac36f12de6e06f1d023d5964eefe271c49f4f))
