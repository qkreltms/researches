## 5.1. Token Economy

- 공유 경제

  - 우버, 에어비엔비 진정한 공유 경제가 아니다. 회사를 거쳐서 거래하는 구조, 회사가 성장하면 회사만 이익보는 중앙화 구조
  - 기존의 공유 경제는 기여자 보다는 주체자에 이득이 더 많다.
  - 블록체인의 공유 경제는 소비자, 제공자의 직접적인 거래 가능해짐 이로인해 회사에사 가져가는 수수료를 제공자가 가져감

- Coin vs Token

  - Coin
    - 현금과 같음
    - 채굴 보상
  - Token
    - Gift card, point
    - 대게 스마트 콘트렉트에 의해 생성됨

- Blockchain based without central agency
- Allows you to specify usage and distribution rules for tokens
- Tokens are offered as rewards to elicit voluntary activities from users

## 5.2. ERC Standard

- Provides an interface for generating tokens
- ERC Standard이전에 다양한 형태의 거래 인터페이스로 token contracts가 개발 됐음
- 이 경우 토큰과 토큰 사이에 거래시 인터페이스가 맞지 않아 또 다른 인터페이스 필요
- To develop Ethereum token contract, 표준화된 토큰을 정의함, ERC standard라고 부름
- ERC-20
  - 가장 유명하고 널리 쓰임
  - contracts와 DApps이 어떻게 상호작용 할지 인터페이스 정의
- ERC-223
  - ERC-20 대안
  - ERC-20은 허용되지 않은 주소로 토큰을 보낼시 잃어버릴 수 있는 문제를 발생 시킬수 있음
- ERC-621
  - 토큰의 공급량을 조절할 수 있는 표준
  - 게임의 토큰 등, 수요와 공급을 예측할 수 없을 때 유용함
- ERC-721
  - 유일한 토큰 생성 가능
  - 주로 게임에 쓰임: Crypto Kitty
- ERC-777
  - ERC-20의 대안
  - 토큰 소실 문제 해결
  - 모든 사용자들이 smart contracts를 검증할 수 있음
  - ERC-20에 비해 새로운 함수 정의함
- ERC-1155
  - ERC-20 + ERC-721
  - People can issue unlimited types of tokens within a single smart contract

## 5.3. Stablecoin

- 기초 자산을 담보로한 암호화폐
- US Dollar or Euro와 같은 자산과 1:1 비율로 고정되어있음(Fiat-Collateralization)

  - 극단적인 가격변동이 일어나지 않음
  - Tether, USD Coin, TrueUSD, ...

- 금, 부동산, 상품 등을 담보로 할 수 있음(Commodity-collateralized Stablecoins)
- 암호화폐 담보로도 할 수 있음(Crypto-collateralized Stablecoins)
- 무담보(Non-Collateralized-Stablecoins)
  - 달러도 이전엔 금을 담보로 했지만 지금은 아님
  - 알고리즘에 의해 코인공급 제어 됨
  - 예: 수요가 늘면 새로운 stable coin이 만들어짐 만약 수요가 적어지면 유통되는 coin을 사들여 균형을 맞춤
  - 가장 독립적이고 분산화된 형태
  - Terra

## 5.4. CBDC(Central Bank Digital Currency)

- 중앙은행에서 발행하는 전자화폐
- 이용목적에 따라 거액, 소액 결제용으로 나눌 수 있다.
- 은행권 감소, 금융 접근 부족과 같은 문제를 해결하기 위해 등장하였다.
- 블록체인을 사용하는 이유
  - 신뢰성, 개인 정보 및 사용정보 보호
  - 프로그래밍 기능
  - 데이터 가용성, 복원력, 투명성
  - 대규모 분상형 청산소 및 자산 레지스터 역할을 하는 보안결제 시스템 구축을 간소화 함(기존 중앙은행 인프로 비효율성과 취약성 해결)
