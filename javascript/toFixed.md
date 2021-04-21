# 50.65.toFixed(1) = 50.6(????)
## @deprecated 이 글은 [여기](https://haragoo30.medium.com/50-65-tofixed-1-50-6-b8f837b7cdc8?postPublishedType=repub)로 이전됐습니다.

toFixed를 사용하다가 예상치 못한 결과를 맞닥뜨렸다.

```jsx
console.log(100.15.toFixed(1)) // 100.2 (OK)
console.log(123.45.toFixed(1)) // 123.5 (OK)
console.log(50.65.toFixed(1)) // 50.6 (What??)
```

구글 서치 결과 stack overflow에서도 나와 같은 사람이 많았다. 여기서 해답을 얻고 더 궁금해져서 이것저것 찾아보다가 정리한 글을 소개한다.

# 왜 이러한 결과가 나왔나?

먼저 [TC39](https://tc39.es/ecma262/#sec-number.prototype.tofixed)에서 toFixed 명세서를 찾아봤다.

```jsx
1. Let x be ? thisNumberValue(this value).
2. Let f be ? ToIntegerOrInfinity(fractionDigits).
3. Assert: If fractionDigits is undefined, then f is 0.
4. If f is not finite, throw a RangeError exception.
5. If f < 0 or f > 100, throw a RangeError exception.
6. If x is not finite, return ! Number::toString(x).
7. Set x to ℝ(x).
8. Let s be the empty String.
9. If x < 0, then
a. Set s to "-".
b. Set x to -x.
10. If x ≥ 1021, then
a. Let m be ! ToString(𝔽(x)).
11. Else,
a. Let n be an integer for which n / 10^f - x is as close to zero as possible. If there are two such n, pick the larger n.
b. If n = 0, let m be the String "0". Otherwise, let m be the String value consisting of the digits of the decimal representation of n (in order, with no leading zeroes).
c. If f ≠ 0, then
i. Let k be the length of m.
ii. If k ≤ f, then
1. Let z be the String value consisting of f + 1 - k occurrences of the code unit 0x0030 (DIGIT ZERO).
2. Set m to the string-concatenation of z and m.
3. Set k to f + 1.
iii. Let a be the first k - f code units of m.
iv. Let b be the other f code units of m.
v. Set m to the string-concatenation of a, ".", and b.
12. Return the string-concatenation of s and m
```

알 수 없는 외계어(?) 같지만, 천천히 읽어 보겠다. 추측하자면 1~11까지 사전 작업으로 보이고...

우리가 필요한 줄은 11번째부터 이다.

```jsx
a. Let n be an integer for which n / 10^f - x is as close to zero as possible. 
If there are two such n, pick the larger n.
```

1. 해석하면 `int n`이 있고 이 값을 `n / 10^f - x` 식에 대입해 `0`에 가장 가깝게 만들어라
2. 만약 n이 2개 값이라면 가장 큰 n 값을 택하라

왜 이러한 알고리즘이 나왔는지는 아래에서 좀 더 구체적으로 알아보도록 하고 계속 이어가겠다.

예를 들어 만약 아래와 같을 때

```jsx
50.65.toFixed(1) 
```

11.a에서 변수를 정의하면 `x = 50.65; f = 1; int n`이 되고 n에 어떤 integer값을 넣었을 때 최대한 0에 가깝게 하라고 했으니...

`n = 505`일 때 `-0.1499999`

`n = 506`일 때 `-0.049999...`

`n = 507`일 때 `0.050000...`

위와 같이 나오고, 여기서 가장 0에 가까운 값은 `n = 506`

다음 줄을 계속 진행하면

11.b에 따라 `n ≠ 0` 이므로 `m = '506'`이 된다.

3.iii에 따라 `a = '50'`

iv.에 따라 `b = '6'` 이 되고

v.에 따라 `m = '50.6`'이 되고

12번째에서 최종적으로 `'50.6'`이 반환 된다.

11.a의 알고리즘이 왜 이러한 형태인지 궁금해져서 찾아본 결과

근삿값을 구하는 반올림에는 여러 모드가 존재한다. (Rounding towards zero, Rounding half away from zero, Rounding half to even(Banker's rounding)[[참고1](https://floating-point-gui.de/errors/rounding/),[2](https://www.freeism.co.kr/wp/archives/1792), [3](https://en.wikipedia.org/wiki/Rounding#Rounding_to_the_nearest_integer)])  

또 이것들을 구현하기 위한 여러 알고리즘이 존재한다는 것을 알았고 이번에 floating point에 대해서 다시 공부했다. (floating point에 대해서는 추후 블로그 올릴 계획)

그 결과 `50.6`이 나온 이유를 **추측하자면**

 

`50.65`를 64 bit 컴퓨터에서 표현하면 아래와 같다. [참고](https://www.cs.uaf.edu/2004/fall/cs301/notes/node49.html)

50.65 값을 bit로 변환 시키고 floating point를 적용 시킨 후 다시 10진수로 표현하면 아래와 같다.

$50.65_{(10)} = 50.6499999999999985789_{(10)}$ 

`50.64.toFixed(1)` 을 하면 반올림하고자 하는 곳이 `50.64`에서 `4`이므로 `50.6`이 나왔다.

다른 예로 `7.55`, `8.55`가 있는데 각각 아래와 같이 컴퓨터에서 표현된다.

$7.55_{(10)} = 7.54999999999999982236_{(10)}$

$8.55_{(10)} = 8.55000000000000071054_{(10)}$

둘 다 `7.55.toFixed(1)`, `8.55.toFixed(1)`을 적용하면

각각 `7.5`, `8.6`이 나오는 이유는

`7.55`의 경우 반올림 위치가 소수점에서 오른쪽 두 번째 위치인 `4`인 반면

`8.55`의 경우 `5`이기 때문에 그렇다.

[한 가지 재밌는 것은 어떤 JS 엔진을 사용하느냐에 따라 값이 위와 다르게 나올 수 있다는 것이다.](https://stackoverflow.com/questions/19166098/number-prototype-tofixed-amazingly-correct-in-internet-explorer/19302869#19302869) Chrome의 경우 충실하게 TC39 명세서를 따랐지만 다른 브라우저는 그렇지 않은 것도 있기 때문이다.

# 50.7이 나오게 하기 위한 방법

위에 같음에도 불구하고 50.7이 나오게 하려면 어떻게 해야 할까?

바닐라 JS로 구현:

```jsx
// 참고: [https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary/12830454#12830454](https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary/12830454#12830454)

function round(num, decimalPlaces = 0) {
    var p = Math.pow(10, decimalPlaces);
    var m = Number((Math.abs(num) * p).toPrecision(15));
    return Math.round(m) / p * Math.sign(num);
}

round(50.65, 1) // 50.7
```

라이브러리 사용:

1. [lodash의 round함수](https://lodash.com/docs/4.17.15#round)
2. [decimal.js](https://mikemcl.github.io/decimal.js/)

위 방법들은 실수를($\mathbb{R}$) integer 또는 string으로 변환 시키는 등의 어떤 알고리즘을 사용해 해결한다.

# 정리

10진수를 2진수로 변환하는 과정에서 생성되는 bit를 다 표현하기에는 실수($\mathbb{R}$)를 공간이 유한한 컴퓨터에서 다 표현할 수 없다. 그 과정에서 여러가지 예상치 못한 상황이 발생하는데 $\mathbb{R}$값을 다룬다면 이 점을 주의해야 된다. 