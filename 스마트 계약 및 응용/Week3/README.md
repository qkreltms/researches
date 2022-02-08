## 3.1. Pay-to-Script-Hash (P2SH)

- Multisignature의 2-of-2 transaction에서는 Alice와 Bob, Carol 모두의 signature가 필요한 transaction을 만들려면 두 명의 public key가 locking script에 포함되어 사이즈가 길어지는 불편이 있습니다.
- 그리고 Alice가 M, N값을 설정해야 한다. 이런 불편을 코인을 보내는 쪽이 아닌 코인을 받는 쪽으로 옮기 위해서 등장한 것이 Pay-to-script hash이다.
- ![1](./1.png)
- P2SH에서는 복잡한 locking script 대신에 script의 hash를 사용한다. 그렇기 때문에 UTXO의 locking script에는 script hash값 20byte만이 포함된다. 따라서 Alice는 Bob과 Carol의 관계나 이들의 public key에 대해 알 필요가 없고 script hash로 표현되는 비트코인 어드레스에 지불하기만 하면 된다.
- ![1](./2.png)
- 대신에 Bob과 Carol의 이 UTXO를 사용할 때 좀 더 복잡한 과정을 거치게 된다.
- ![1](./3.png)
- 이제 다음의 부분은 multisignature의 경우처럼 bob, carol의 signature과 0이 unlocking script에 들어가게 된다.
- 차이가 있다면 hash 값을 구하는데 사용했던 원래 script를 unlocking script 뒤에 붙이게 된다. 이것을 redeem(상환) script라고 한다.(multisignature에서 Alice의 locking script을 hash로 대채하고 Bob과 Carol이 Alice의 해시로 대채되었던 스크립트를 가져야 한다.)
- ![1](./4.png)
  이게 합리적인 이유는 Alice가 고객이고 Bob과 Carol이 온라인 상점을 운영하는 경우라면 Alice의 입장에서는 1-of-2 transaction을 원하는지 2-of-2 transaction을 원하는지에 상관없이 둘의 공동 계좌에 지불하면 그만이기 때문.

- 여기서 script hash가 공동계좌 역할을 하는 것이다.
- 어떻게 평가(evaluation)하는 가?
- ![1](./5.png)
- 먼저 순서대로 unlocking script에 있는 모든 값들이 stack에 저장된다.
- 그림에서처럼 redeem script는 op_pushdata에 의해 하나의 데이터로 stack에 놓이게 된다.
- ![1](./6.png)
- 이제 다른 transaction과는 조금 다르게 평가되는데
- 제일 먼저 현재 locking script가 P2SH인지를 확인한다.
- 어떤 특별한 코드가 있는 것이 아니고 hash 연산자 - 20 byte script hash, equal 연산자 순으로 오면 이를 P2SH로 판단한다.
- 그렇다면 stack에서 script를 꺼내서 이의 hash값을 구해서 locking script에 있는 hash 값과 동일한지 비교한다.
- ![1](./7.png)
- 비교 결과 같게 나오면 이 redeem script가 locking script처럼 실행된다.
- 먼저 M, public key, N이 stack에 쌓이고 마지막으로 checkmultisig 연산자가 값들을 읽어서 조건에 맞는지 확인한다.
- 조건에 맞으면 stack에 1이 남아 script valid한 것으로 확인되어 이 코인을 사용할 수 있게 된다.
- 다만, 조심할 점은 P2SH를 사용하면 지불할 때는 스크립트의 해시만을 사용하고 실제로 UTXO의 coin을 사용할 때에서야 스크립트를 제시할 때 스크립트가 블록체인에 기록되기 때문에 즉, 스크립트의 어드레스로 지불하는 시점에는 스크립트에 오류가 있어도 알 길이 없다.
- 만약에 스크립트에 오류가 있더라도 그 스크립트 hash로의 지불은 정상적으로 처리될 것이고 나중에 사용할 때에야 오류 때문에 사용할 수 없음을 알게 될 수도 있다. 이 경우 해당 UTXO는 아무도 못쓰게 될 수도 있으니 주의를 기울여야한다.
- ![1](./8.png)

## 3.2. 2-of-3 Transactions

- 1명이 3명에게 코인전달 후 다시 1명에게 코인 전달하는 예제 구현
- ![1](./9.png)
- 3명의 private, public key를 만든다
- ![1](./10.png)
- 이제 3사람의 public key를 사용해서 2 of 3 transaction(최소 2개의 private key가 있어야 사용가능)을 구현한다.
- ![1](./11.png)
- ![1](./12.png)
- 이제 Alice가 코인을 보내는 코드를 구현한다.
- ![1](./13.png)
- Alice는 이 어드레스로 코인을 보내게 된다.
- ![1](./20.png)
- ![1](./14.png)
- 기존의 400만 사토시 중 100만 + 요금을 제외하고 남은 잔돈은 Alice에게 돌아온다.
- ![1](./15.png)
- Pay to Script Hash(P2SH) 방식을 사용한다.
- ![1](./16.png)
- 이제 Ellen의 private, public key, address를 만든다.
- ![1](./17.png)
- 이때 처음 Alice의 거래는 index가 0인 것을 알수 있다.
- ![1](./18.png)
- 그러면 input에 index 값을 0으로 설정하고 백만 사토시를 value로 적는다.
- ![1](./19.png)
- Alice의 UTXO를 살펴보면 잔돈 2890000 사토시가 있는 것을 확인할 수 있다.
- 다시 3명이 Ellen에게 수수료 5000 사토시를 제외한 전부를 보내게 설정한다.
- ![1](./21.png)
- Bob과 David의 transaction을 자신들의 private key로 sign해서 signature을 만들고 최적저으로 transaction의 script에 추가한 후에 testnet에 publish한다.
- ![1](./22.png)
- Ellen의 어드레스를 보면 새로운 코인이 추가되었음을 UTXO를 통해서 알 수 있다.
- ![1](./23.png)
- 이제 unlocking 스크립트를 만든다. Bob과 Carol의 서명에 redeem script를 붙여서 만들게 된다.
- ![1](./24.png)
- 멀티시그니처 실용방안
- 기존에 비트코인은 어드레스에 해당하는 private key가 한 개씩 존재하고 이 키를 사용해서 transaction을 signing하게 되는데 도난, 분실 당할경우 리스크가 크다는 단점이 있다.
- 예를 들어 3개의 private key를 만들고 여러 곳에 분배하여 사용한다면 1개 보다는 안전하다.
- ![1](./25.png)
