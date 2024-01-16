# Rocket Pool rETH Exchange Rate Oracle for Arbitrum

This repository contains 2 main contracts. `RocketArbitrumPriceMessenger` which can be called by anyone to submit the current
rETH exchange rate (as reported by `RocketNetworkBalances`) to the `RocketArbitrumPriceOracle` contract which is deployed on
Arbitrum.

## Notice

Rocket Pool provides this exchange rate oracle as-is for convenience and offers no guarantee about its accuracy or the
freshness of the data. These contracts have not been formally audited for security or correctness.

## Usage

Calling `rate()` on `RocketArbitrumPriceOracle` will return the latest rETH exchange rate reported. This value is in the form
of the ETH value of 1 rETH. e.g. If 1 rETH is worth 1.5 ETH `rate()` will return 1.5e18. `lastUpdated()` can be called to
retrieve the timestamp that the rate was last updated.

## Deployments

Rocket Pool maintains a Goerli testnet instance of the protocol alongside our mainnet deployment which can be used for
integration testing before promotion to mainnet.

| Chain | RocketOvmPriceMessenger (EVM) | RocketOvmPriceOracle (Arbitrum) | RocketBalancerRateProvider (Arbitrum) |
| -- | -- | -- | -- |
| Mainnet | [0x312FcFB03eC9B1Ea38CB7BFCd26ee7bC3b505aB1](https://etherscan.io/address/0x312FcFB03eC9B1Ea38CB7BFCd26ee7bC3b505aB1) | [0x7EcCBbd05830EdF593d30005B8F69E965AF4D59f](https://arbiscan.io/address/0x7EcCBbd05830EdF593d30005B8F69E965AF4D59f) | [0xd4E96eF8eee8678dBFf4d535E033Ed1a4F7605b7](https://arbiscan.io/address/0xd4E96eF8eee8678dBFf4d535E033Ed1a4F7605b7) |
| Goerli | [0x2b52479F6ea009907e46fc43e91064D1b92Fdc86](https://goerli.etherscan.io/address/0x2b52479F6ea009907e46fc43e91064D1b92Fdc86) | [0x594Fb75D3dc2DFa0150Ad03F99F97817747dd4E1](https://goerli.arbiscan.io/address/0x594Fb75D3dc2DFa0150Ad03F99F97817747dd4E1) | tba |

## Deploying and Submitting

There is a simple deploy script (`deploy.js`) that can be run with `node deploy.js`. You will need to create a suitable
`.env` file first. Example `.env` file is available for Goerli and Mainnet.

There is a script which will execute the `submitRate` function on the `RocketArbitrumPriceMessenger` (`submit.js`). After
setting up a suitable `.env` file, run with `node submit.js`.
