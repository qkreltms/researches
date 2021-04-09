# toFixed 분석

```jsx
console.log(100.15.toFixed(1)) // 100.2 (OK)
console.log(123.45.toFixed(1)) // 123.5 (OK)
console.log(50.65.toFixed(1)) // 50.6 (what??)
```

stack overflow에서도 나와 같은 사람이 많았고 여기서 해답을 얻고 정리해봄. 

어떠한 원리로 되어있길래?

# HOW?

명세서 찾아보기

[https://tc39.es/ecma262/#sec-number.prototype.tofixed](https://tc39.es/ecma262/#sec-number.prototype.tofixed)

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
a. Let n be an integer for which n / 10f - x is as close to zero as possible. If there are two such n, pick the larger n.
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
12. Return the string-concatenation of s and m.
```

```jsx
a. Let n be an integer for which n / 10f - x is as close to zero as possible.
```

이 문구 때문에 그렇다.

# ? (ReturnIfAbrupt)

> 1. Let hygienicTemp be AbstractOperation().
2. If hygienicTemp is an abrupt completion, return hygienicTemp.
3. Else if hygienicTemp is a Completion Record, set hygienicTemp to hygienicTemp.[[Value]].

hygienicTemp ⇒ 변수로 이해hygienicTemp ⇒ 변수로 이해

1. 어떤 변수에 함수를 담는다.
2. 변수가 abrupt completion(갑작스런 완료)라면, 매개변수를 반환한다.
3. 만약 변수가 Completion Record라면 변수를  어떤 ECMAScript Language Types 또는 빈 값의만약 변수가 Completion Record라면 변수를  어떤 ECMAScript Language Types 또는 빈 값의 변수로 설정한다(?) 

[[Value]]: [https://tc39.es/ecma262/#sec-property-attributes](https://tc39.es/ecma262/#sec-property-attributes)

대략 어떤 작업을 시작하거나 변수를 반환한다.

# Abrupt completion

The term “abrupt completion” refers to any completion with a [[Type]] value other than normal.

```cpp
Handle<Object> value = args.at(0);
  Handle<Object> fraction_digits = args.atOrUndefined(isolate, 1);

  // Unwrap the receiver {value}.
  if (value->IsJSPrimitiveWrapper()) {
    value = handle(Handle<JSPrimitiveWrapper>::cast(value)->value(), isolate);
  }
  if (!value->IsNumber()) {
    THROW_NEW_ERROR_RETURN_FAILURE(
        isolate, NewTypeError(MessageTemplate::kNotGeneric,
                              isolate->factory()->NewStringFromAsciiChecked(
                                  "Number.prototype.toFixed"),
                              isolate->factory()->Number_string()));
  }
  double const value_number = value->Number();
```

대략 AbstractOperation()이 true면 계속 진행하고  throw, return 등 하라는 소리

# Completion Record

데이터 전파와 제어 흐름을 설명할 때 쓰이는 테이블 

[https://tc39.es/ecma262/#sec-completion-record-specification-type](https://tc39.es/ecma262/#sec-completion-record-specification-type)

# !

Similarly, prefix **`!`** is used to indicate that the following invocation of an abstract or syntax-directed operation will never return an [abrupt completion](https://tc39.es/ecma262/#sec-completion-record-specification-type) and that the resulting [Completion Record](https://tc39.es/ecma262/#sec-completion-record-specification-type)'s [[Value]] field should be used in place of the return value of the operation. For example, the step:

1. 1. Let val be ! OperationName().

is equivalent to the following steps:

1. 1. Let val be OperationName().
2. 2. [Assert](https://tc39.es/ecma262/#assert): val is never an [abrupt completion](https://tc39.es/ecma262/#sec-completion-record-specification-type).
3. 3. If val is a [Completion Record](https://tc39.es/ecma262/#sec-completion-record-specification-type), set val to val.[[Value]].

Syntax-directed operations for [runtime semantics](https://tc39.es/ecma262/#sec-runtime-semantics) make use of this shorthand by placing **`!`** or **`?`** before the invocation of the operation:

1. 1. Perform ! SyntaxDirectedOperation of *NonTerminal*.

어떤 조건에 맞을 때만 실행하고 아니라면 변수를 반환하라

코드 발췌

```cpp
if (std::isinf(value_number)) {
    return (value_number < 0.0) ? ReadOnlyRoots(isolate).minus_Infinity_string()
                                : ReadOnlyRoots(isolate).Infinity_string();
  }
```

# V8, toFixed 구현

[https://github.com/v8/v8/blob/dc712da548c7fb433caed56af9a021d964952728/src/builtins/builtins-number.cc](https://github.com/v8/v8/blob/dc712da548c7fb433caed56af9a021d964952728/src/builtins/builtins-number.cc)

# Why?

```jsx
a. Let n be an integer for which n / 10f - x is as close to zero as possible.
```

위의 문구를 어떻게 구현했는지 모르겠음, but

살펴본 결과 grisu3 알고리즘 등과 같이 float을 어떻게 보여줄 것 인가에 대한 코드가 많음

결과적으로 성능을 위해 정확도를 포기한 것으로 보이고

JS 로는 정확한 소수점 계산 어렵다(?)