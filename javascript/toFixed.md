# toFixed 분석

toFixed를 사용하다가 예상치 못한 결과를 맞딱뜨렸다.

```jsx
console.log(100.15.toFixed(1)) // 100.2 (OK)
console.log(123.45.toFixed(1)) // 123.5 (OK)
console.log(50.65.toFixed(1)) // 50.6 (What??)
```

구글 서치 결과 stack overflow에서도 나와 같은 사람이 많았다. 여기서 해답을 얻고 더 궁금해져서 이것저것 찾아보다가 정리한 글을 소개한다.

글에서는 1. 원인이 무엇인지? 2. 왜 이렇게 했을까? 3. 해결 방법은 무엇인지? 4. 결론 순으로 진행한다.

# 원인이 무엇인가?

[TC39](https://tc39.es/ecma262/#sec-number.prototype.tofixed)에서 toFixed 명세서를 찾아봤다.

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

알 수 없는 외계어(?) 같지만 천천히 읽어 보겠다. 추측하자면 1~11까지 사전 작업으로 보이고...

우리가 필요한 것은 11번째부터 이다.

```jsx
a. Let n be an integer for which n / 10^f - x is as close to zero as possible. 
If there are two such n, pick the larger n.
```

1. 해석하면 `int n`이 있고 이 값을 `n / 10^f - x` 식에 대입해 `0`에 가장 가깝게 만들어라
2. 만약 n이 2개 값이라면 가장 큰 n 값을 택하라

왜 이러한 알고리즘이 나왔는지는 아래에서 좀 더 구체적으로 알아보도록 하고 계속 이어가겠다.

TC39에 명세 되어있는 대로 하자면,  만약 아래와 같을 때

```jsx
50.65.toFixed(1) 
```

11.a에서 `x = 50.65; f = 1; int n`이 되고 n에 어떤 integer값을 넣었을 때 최대한 0에 가깝게 하라고 했으니

`n = 505`일 때 `-0.1499999`

`n = 506`일 때 `-0.049999...`

`n = 507`일 때 `0.050000...`

가 나오니 가장 가까운 값은 `n = 506`

다음으로

11.b에 따라 `n ≠ 0` 이므로 `m = '506'`이 됩니다.

3.iii에 따라 `a = '50'`

iv.에 따라 `b = '6'` 이 되고

v.에 따라 `m = '50.6`'이 되고

12번째에서 최종적으로 `'50.6'`이 반환 됩니다.

# 2. 왜 이러한 알고리즘일까?

간단 요약: 무한한 real number가 유한한 기계에서 표현해야 하기 때문에. 

예를 들어

[https://www.youtube.com/watch?v=vOO-oLS0H68](https://www.youtube.com/watch?v=vOO-oLS0H68)

0.1 ⇒ binary, real number

32비트, 64비트에 따라 영역이 제한됨

메모리에 표시할 수 있는 한계가 있다. 

그래서 어떻게 표현할까?

# 컴퓨터의 부동 소수점 표현 방식

Fixed Point & Floating Point

Fixed Point

Floating Point

[https://corona-world.tistory.com/18](https://corona-world.tistory.com/18)

소수점 계산 방법

```
  e=5;  s=1.234567
+ e=−3; s=9.876543
```

```
  e=5;  s=1.234567
+ e=5;  s=0.00000009876543 (after shifting)
----------------------
  e=5;  s=1.23456709876543 (true sum)
  e=5;  s=1.234567         (after rounding and normalization) // 32bit, 64bit냐에 따라 다르게 계산됨
```

# 부동 소수점 연산시 나타날수 있는 에러

소수점 연산시 나타날수 있는 에러 [https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems](https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems)

1. rounding error ⇒ 무한수를 유한수로 표현시 끝 수를 rounding
2. Catastrophic cancellation [https://en.wikipedia.org/wiki/Catastrophic_cancellation](https://en.wikipedia.org/wiki/Catastrophic_cancellation)
- 소거: 거의 같은 두 값을 빼는 것은 정확성을 매우 많이 잃게 된다. 이 문제가 아마도 가장 일반적이고 심각한 정확도 문제이다.
- 정수로의 변환 문제: (63.0/9.0)을 정수로 변환하면 7이 되지만 (0.63/0.09)는 6이 된다. 이는 일반적으로 반올림 대신 버림을 하기 때문이다.
- 제한된 지수부: 결과값이 오버플로되어 무한대값이 되거나 언더플로되어 [비정규 값](https://ko.wikipedia.org/wiki/%EB%B9%84%EC%A0%95%EA%B7%9C_%EA%B0%92) 또는 0이 될 수 있다. 만약 [비정규 값](https://ko.wikipedia.org/wiki/%EB%B9%84%EC%A0%95%EA%B7%9C_%EA%B0%92)이 되면 유효숫자를 완전히 잃어버린다.
- 나눗셈이 안전한지 검사하는데 문제가 생김: 제수(나눗수)가 0이 아님을 검사하는 것이 나눗셈이 오버플로되고 무한대값이 되지 않는 걸 보장하지 않는다.
- 같음을 검사하는데 문제가 생김: 수학적으로 같은 계산결과가 나오는 두 계산 순서가 다른 부동소수점 값을 만들어낼 수 있다. 프로그래머는 어느정도의 허용 오차를 가지고 비교를 수행하지만, 그렇다고 해서 문제가 완전히 없어지지 않는다.

**IEEE 754에서 위와 같은 문제를 다룰 수 있도록 표준화를 했다.**

*JS 뿐만아니라 Python3의 경우도 같은 결과를 내놓습니다.

print(round(50.65, 1)) // 50.6

[https://www.programiz.com/python-programming/online-compiler/](https://www.programiz.com/python-programming/online-compiler/)

# 해결 방법

하지만 우리는 50.65가 50.7이되게 하고싶은데 어떻게 해야될까요?

[https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary/12830454#12830454](https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary/12830454#12830454)

```jsx
function round(num, decimalPlaces = 0) {
    var p = Math.pow(10, decimalPlaces);
    var m = Number((Math.abs(num) * p).toPrecision(15));
    return Math.round(m) / p * Math.sign(num);
}

round(50.65, 1) // 50.7
```

2가지의 라이브러리가 있습니다.

js에서 대한 lodash의 round(js에서 해결방법 제공하기)

lodash 음수 반올림이 다름

decimal.js

[https://mikemcl.github.io/decimal.js/](https://mikemcl.github.io/decimal.js/)

[https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero](https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero)

# 결론

github에서 chrome 코드를 살펴본 결과 grisu3 알고리즘 등과 같이 float을 어떻게 보여줄 것 인가에 대한 코드가 많음 결과적으로 주어진 값의 크기에 따라 특정한 알고리즘을 적용하여 구현했다. 성능을 지키면서 정확도를 지키기위한 것으로 보임

추가적으로 정수를 string으로 변환할때 toString보다는 toFixed가 정확하다.

```
(1000000000000000128).toString() // **"1000000000000000100"**
(1000000000000000128).toFixed(0) // **"1000000000000000128"**
```

참고: [https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary/12830454#12830454](https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary/12830454#12830454)

[https://stackoverflow.com/questions/66742034/tofixed-rounds-at-6-why-not-5](https://stackoverflow.com/questions/66742034/tofixed-rounds-at-6-why-not-5)

[https://ko.wikipedia.org/wiki/부동소수점](https://ko.wikipedia.org/wiki/%EB%B6%80%EB%8F%99%EC%86%8C%EC%88%98%EC%A0%90)

[https://tc39.es/ecma262/#sec-number.prototype.tofixed](https://tc39.es/ecma262/#sec-number.prototype.tofixed)

[https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems](https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems)

[https://en.wikipedia.org/wiki/Catastrophic_cancellation](https://en.wikipedia.org/wiki/Catastrophic_cancellation)

[https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero](https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero)