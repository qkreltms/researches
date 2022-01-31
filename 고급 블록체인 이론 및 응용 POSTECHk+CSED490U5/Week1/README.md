## 1.1. Introduction to the Course

    - Advanced Consensus Algorithms
    - Blockchain Scalability
        - 확장성, 안정성, 탈중앙화 3가지를 동시에 만족시키기 어렵다.
        - 사용자가 늘더라도 TPS(Transaction per seconds)에 문제가 없도록 하는 방법 소개
    - Mining Pool Protocol
    - Ethereum 2.0
        - PoW => PoS
    - Decentralized Identity
        - 개인의 신원을 개인이 관리

## 1.2. Review of Basic Consensus Algorithms

- Needs of distributed consensus
  - 네트워크의 제약사항에도 불구하고 모두가 동일한 데이터를 갖고 있어야 한다.
- Proof of Work
  - https://namu.wiki/w/proof-of-work
  - 해시 함수를 계산하여 블록체인에 새로운 블록을 추가하는 방식으로 조폐와 송금을 한다. 이로써 화폐의 가치와 보안을 보장하는 방식이다.
  - 단점
    - 불필요한 전력소모
- Proof of Stake
  - https://www.youtube.com/watch?v=M3EFi_POhps&ab_channel=SimplyExplained
- Hybrid PoW/PoS
