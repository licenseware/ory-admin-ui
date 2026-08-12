# Changelog

## [0.4.0](https://github.com/licenseware/ory-admin-ui/compare/v0.3.0...v0.4.0) (2026-08-12)


### Features

* delete identity credential with confirmation modal ([#55](https://github.com/licenseware/ory-admin-ui/issues/55)) ([cf1cf55](https://github.com/licenseware/ory-admin-ui/commit/cf1cf5570a72993f65feb71df9dc9d690477690d))


### Bug Fixes

* **CI:** make release PR more verbose ([c7eb3ca](https://github.com/licenseware/ory-admin-ui/commit/c7eb3ca999522896ce362d7a48e49093171db9ba))
* document and skip real-ip vuln issue ([cb2db97](https://github.com/licenseware/ory-admin-ui/commit/cb2db97f166064417102fcb574dec2ed0609388d))
* **footer:** use commit-sha when not in stable release ([#93](https://github.com/licenseware/ory-admin-ui/issues/93)) ([80b6429](https://github.com/licenseware/ory-admin-ui/commit/80b6429ed35bcab3e74b2cc1fe56a6e07f5a708c))
* **go:** disable real-ip middleware by default ([c66da70](https://github.com/licenseware/ory-admin-ui/commit/c66da700b4aba614b1041182646474d6a4e5289f))
* run prettier on files changed ([b30d13f](https://github.com/licenseware/ory-admin-ui/commit/b30d13f301b10d887c698118fed1c41bd2765ef5))
* submit patch json for unblocking identities ([3a18a14](https://github.com/licenseware/ory-admin-ui/commit/3a18a14b48749e0e2373f6b4f38c6bb0210a873c))
* **UI:** fetch total identities from legacy API ([#57](https://github.com/licenseware/ory-admin-ui/issues/57)) ([c5a469b](https://github.com/licenseware/ory-admin-ui/commit/c5a469b9d728aafa46afe5313d0e104036787295))


### Build & Dependencies

* **deps:** update docker/login-action action to v4 ([#76](https://github.com/licenseware/ory-admin-ui/issues/76)) ([f3e5193](https://github.com/licenseware/ory-admin-ui/commit/f3e5193a92a3644cde4eb6c4fabffd2a356a9bb8))
* **deps:** update docker/setup-buildx-action action to v4 ([#77](https://github.com/licenseware/ory-admin-ui/issues/77)) ([bb55d4a](https://github.com/licenseware/ory-admin-ui/commit/bb55d4a1a223ec5a3e01552f74666b3c620d2b87))
* **deps:** update docker/setup-qemu-action action to v4 ([#78](https://github.com/licenseware/ory-admin-ui/issues/78)) ([0bb49ad](https://github.com/licenseware/ory-admin-ui/commit/0bb49ad4cd0f3b368e7ec9d5185e8e5a3921cfea))
* **deps:** update go dependencies ([#86](https://github.com/licenseware/ory-admin-ui/issues/86)) ([8ec2593](https://github.com/licenseware/ory-admin-ui/commit/8ec259325594c23f0acd0b9cb8b68234ad9b61cf))
* **deps:** update googleapis/release-please-action action to v5 ([#79](https://github.com/licenseware/ory-admin-ui/issues/79)) ([9dc6ca4](https://github.com/licenseware/ory-admin-ui/commit/9dc6ca4853f80530525139d00650235f9fbc3435))
* **deps:** update sigstore/cosign-installer action to v4 ([#92](https://github.com/licenseware/ory-admin-ui/issues/92)) ([f00c329](https://github.com/licenseware/ory-admin-ui/commit/f00c3290850d8c38fc981a16555ccfd4d8a3b12a))


### Chores

* **deps:** lock file maintenance ([#59](https://github.com/licenseware/ory-admin-ui/issues/59)) ([e190081](https://github.com/licenseware/ory-admin-ui/commit/e1900814bd8e1d1331948ac8aaaa75bae78741b5))
* **deps:** lock file maintenance ([#60](https://github.com/licenseware/ory-admin-ui/issues/60)) ([58de804](https://github.com/licenseware/ory-admin-ui/commit/58de804e8911da1eafc52c383e99bdbfd623f666))
* **deps:** update precommit hooks ([1476840](https://github.com/licenseware/ory-admin-ui/commit/1476840475c05db3ccf9120e24bbb3bf94ac2668))
* **deps:** upgrade js dependencies and update outdated code ([#85](https://github.com/licenseware/ory-admin-ui/issues/85)) ([a7db3f0](https://github.com/licenseware/ory-admin-ui/commit/a7db3f050e6ca7b7dcd21d548cfc0643aab3412c))

## [0.3.0](https://github.com/licenseware/ory-admin-ui/compare/v0.2.0...v0.3.0) (2026-04-06)


### Features

* add shareable URLs to user-facing endpoints ([#47](https://github.com/licenseware/ory-admin-ui/issues/47)) ([e3ccdf4](https://github.com/licenseware/ory-admin-ui/commit/e3ccdf4768253129ee82028f305c759a30eaca5c))

## [0.2.0](https://github.com/licenseware/ory-admin-ui/compare/v0.1.1...v0.2.0) (2026-03-18)


### Features

* add multi-profile support ([c95dde3](https://github.com/licenseware/ory-admin-ui/commit/c95dde3f1ed26540b9fd3bc3fc891f655c4a9cbe))
* add oathkeeper admin UI ([#37](https://github.com/licenseware/ory-admin-ui/issues/37)) ([f0c64e2](https://github.com/licenseware/ory-admin-ui/commit/f0c64e221bc846d76ee234fbd7dfe29d0f201d82))


### Bug Fixes

* **CI:** make tests happy ([e672f1a](https://github.com/licenseware/ory-admin-ui/commit/e672f1aafb38b683fcaa5ca7cf9748bdbdb17c7c))
* **CI:** update the final test evaluation ([fd6f7fd](https://github.com/licenseware/ory-admin-ui/commit/fd6f7fdba81b080ed2382478bf3a28f68d6ddd0d))
* **dev:** add x-total-count to cors exposed headers ([43063fc](https://github.com/licenseware/ory-admin-ui/commit/43063fc8def3cf0ba5b2f5dff3995cc5d7117a4b))
* remove obsolete dependency ([97a9d36](https://github.com/licenseware/ory-admin-ui/commit/97a9d362c9dadde4f555a159c68b79b0fb5819cd))

## [0.1.1](https://github.com/licenseware/ory-admin-ui/compare/v0.1.0...v0.1.1) (2026-02-09)


### Features

* **CI:** add unit and integration tests at ~40% coverage ([fe2a872](https://github.com/licenseware/ory-admin-ui/commit/fe2a872e54faaaa54c82f6a909a1f5268c12761d))


### Bug Fixes

* add health status for public api ([7697ef3](https://github.com/licenseware/ory-admin-ui/commit/7697ef33bbc110bab1ac0218a9030e4252646671))
* retrieve total count from response headers in list APIs ([e9ad5c7](https://github.com/licenseware/ory-admin-ui/commit/e9ad5c74590ffb1b46ee45f2dd9503d765f2cc1f))

## 0.1.0 (2026-02-07)

### Features

- accept env vars but enforce priority to cmd args ([d981cf8](https://github.com/licenseware/ory-admin-ui/commit/d981cf8ecf30267671d3acc57d2f7a18c13f6acf))
- add a few more middelwares and sign binaries with cosign ([46936c3](https://github.com/licenseware/ory-admin-ui/commit/46936c39936734e1b619aa29fed68e0c63d0d5f1))
- add compression and minifier to the build ([266ec60](https://github.com/licenseware/ory-admin-ui/commit/266ec60e32e2394fa8d8ccbf2820c400ad77bd91))
- add filters and sort to identities and sessions ([12b3744](https://github.com/licenseware/ory-admin-ui/commit/12b37445539b49f1bbf31aa0fe20a2aa750dfe72))
- add go to bundle dist into a single binary ([91d9e07](https://github.com/licenseware/ory-admin-ui/commit/91d9e071e1c339eea3a6d3f4382a25f2d07ac8c0))
- add goreleaser ([527aee2](https://github.com/licenseware/ory-admin-ui/commit/527aee20035695cf4098a5d45ab421bf26516028))
- add kratos public endpoint for schema ([b65d166](https://github.com/licenseware/ory-admin-ui/commit/b65d166e06520746f7b4273440db88d5d83bda54))
- add support for light mode ([972979a](https://github.com/licenseware/ory-admin-ui/commit/972979a57adac5639a987f26ecfd5afc40c7ca48))
- add tree inspector to schema ([42a3d18](https://github.com/licenseware/ory-admin-ui/commit/42a3d183c55f7100ff358f732ab15738b5519231))
- add zod validation ([3d507af](https://github.com/licenseware/ory-admin-ui/commit/3d507af752224e62fb28c6e66315b03e722f6be0))
- allow identity search on client-side as fallback ([1e8ed91](https://github.com/licenseware/ory-admin-ui/commit/1e8ed9172b455350b52fca6a738e481afbde3912))
- allow overriding the apiEndpoint from deployment ([879f8b6](https://github.com/licenseware/ory-admin-ui/commit/879f8b61284d81948c527be25582c198a148387a))
- **CI:** create release with goreleaser ([516d9b5](https://github.com/licenseware/ory-admin-ui/commit/516d9b57fea8f86de111a4188cbca703829f45fb))
- **CI:** perform a clean snapshot of goreleaser on dev ([aac1a85](https://github.com/licenseware/ory-admin-ui/commit/aac1a8544e72b1c6ff5e27cbc1260bef86090a60))
- ensure fully responsive UI in all views and components ([b2c5a65](https://github.com/licenseware/ory-admin-ui/commit/b2c5a65c21804f7a21574d5525e0175803964a6f))
- implement Ory Kratos Admin UI with Vue 3 and TypeScript ([2179210](https://github.com/licenseware/ory-admin-ui/commit/217921079688fddf83f94ec832fe6b7e0834dea4))
- initial structure ([93b9ad5](https://github.com/licenseware/ory-admin-ui/commit/93b9ad5967a595f8d519f67a93c6b2e62f469235))
- revamp UI with complete admin api implementation ([#4](https://github.com/licenseware/ory-admin-ui/issues/4)) ([d56e67b](https://github.com/licenseware/ory-admin-ui/commit/d56e67b014cb020bc4364d9ec978c5c4d3fa044d))
- **UI:** add reload button ([abc151a](https://github.com/licenseware/ory-admin-ui/commit/abc151a1a793bb187804b8b2f977f0d217f7a240))

### Bug Fixes

- add clearable to search inputs ([89e1423](https://github.com/licenseware/ory-admin-ui/commit/89e1423a0c1b1e2b0c3d639a02bccb1fa3d90a43))
- add cors to kratos ([6bec4de](https://github.com/licenseware/ory-admin-ui/commit/6bec4de9d258c692a47256bcea00df2d250cc85d))
- add latest vite vue plugin ([69a181e](https://github.com/licenseware/ory-admin-ui/commit/69a181e9fbfe49cfef2ee786337c5d20fee9c53c))
- add link for version to github release on footer and settings ([d02e49f](https://github.com/licenseware/ory-admin-ui/commit/d02e49f7743ac4e1aeb8faf746223f944c5942e3))
- add mb to identity cred and id ([f3c89e3](https://github.com/licenseware/ory-admin-ui/commit/f3c89e3ba95bfa9e01350a87aca8548eae942408))
- **CI:** add bun lock to docker context ([2e1f30d](https://github.com/licenseware/ory-admin-ui/commit/2e1f30d3e271037c2aeea29f387e714f680aca3d))
- **CI:** include vite ts in docker context ([8dacf29](https://github.com/licenseware/ory-admin-ui/commit/8dacf296e1c49cf58234ad75cd868490b2998364))
- **CI:** move workflow to github dir ([f0ec9d7](https://github.com/licenseware/ory-admin-ui/commit/f0ec9d79902a3ff232d8f918119dc736c8b52cff))
- **CI:** rename job to simulate ([d195728](https://github.com/licenseware/ory-admin-ui/commit/d195728473576f69f02b899affae2750c776e9f4))
- consolidate no-data and loading skeleton structure ([ad885a3](https://github.com/licenseware/ory-admin-ui/commit/ad885a3114d75ac2e2318345a4e0ef467316338b))
- **courier:** create separate type for sentinel value ([5685614](https://github.com/licenseware/ory-admin-ui/commit/56856143e6c92e1b98638ce8ea100b9f8736b490))
- **dev:** run dev on start subcommand ([1bbb27b](https://github.com/licenseware/ory-admin-ui/commit/1bbb27b6e1a66a1b14d3089b3742ac2af96e382f))
- **dev:** set up the local environment with supervisor ([27ab352](https://github.com/licenseware/ory-admin-ui/commit/27ab352399591a93533de1cdace97ba1a684424f))
- **docs:** update docker and badges after org transfer ([148f691](https://github.com/licenseware/ory-admin-ui/commit/148f69143750ebc92d26acf357dac26feeb892eb))
- handle offline api status issue ([4870219](https://github.com/licenseware/ory-admin-ui/commit/4870219d225299bb15e9f15a28ddc61da91cb6d1))
- handle ugly tabs in detail view ([cccd049](https://github.com/licenseware/ory-admin-ui/commit/cccd049538f42f0f6f5323f6f9ae9e647c70a308))
- make compiler happy ([8359bd0](https://github.com/licenseware/ory-admin-ui/commit/8359bd00de3956ef25f4a1e6424849d5bdddb2a4))
- only show the last 10 on dashboard for brevity ([7d941ad](https://github.com/licenseware/ory-admin-ui/commit/7d941ad63c3c4f8222d0d6f04eae54e52cbc29a0))
- reduce docker context with precise dockerignore ([2412d29](https://github.com/licenseware/ory-admin-ui/commit/2412d2948c9150072b9f547abe5a8419e4c5b8e8))
- specify 404 page as fallback ([71d6105](https://github.com/licenseware/ory-admin-ui/commit/71d610504e724ee3afad663c6b42c3988ca31e76))
- **UI:** add proper margin to list view ([1860138](https://github.com/licenseware/ory-admin-ui/commit/18601381c89285d08440cfc6226bee1634d8ae25))
- **UI:** remove version from hero ([c55f25f](https://github.com/licenseware/ory-admin-ui/commit/c55f25f467a896d4ddb93f1e58a0adc93ee07fed))
- update the repo url after ownership transfer ([0b6d424](https://github.com/licenseware/ory-admin-ui/commit/0b6d42451e8e3cd935c8bbb965c1e3cd4e397911))
- use app version from package.json for footer ([8a38ce5](https://github.com/licenseware/ory-admin-ui/commit/8a38ce53650979c486ec077d20be35326e8b89e6))
- use browser history for back navigation with parent as fallback ([7520927](https://github.com/licenseware/ory-admin-ui/commit/7520927b2294e8f13a50de17fe9c9fc8171b3d96))

### Miscellaneous Chores

- **docs:** add readme ([5430ea5](https://github.com/licenseware/ory-admin-ui/commit/5430ea5ad43d8d08e04d7f5580bfde6f12018e1e))
