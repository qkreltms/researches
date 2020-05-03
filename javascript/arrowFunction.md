
# ES6: Arrow function
#### 목차
1. 쓰는 방법
2. 쓰는 이유
3. Arrow function을 사용하지 않는다면…?
4. Arrow function과 Closure의 연관관계

#### 1) 쓰는 방법

    (param1, param2, …, paramN) => { statements }
    (param1, param2, …, paramN) => expression
    // 다음과 동일함:  => { return expression; }
    
    // 매개변수가 하나뿐인 경우 괄호는 선택사항:
    (singleParam) => { statements }
    singleParam => { statements }
    
    // 매개변수가 없는 함수는 괄호가 필요:
    () => { statements }
    [출처](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Functions/%EC%95%A0%EB%A1%9C%EC%9A%B0_%ED%8E%91%EC%85%98)

#### 2) 쓰는 이유

1. 코드 수 줄이기.
2. this를 바인딩 하지 않아도 된다.


`this는 어떤것을 가리킬지 함수를 호출한 방법에 의하여 결정된다.`[참고](https://www.zerocho.com/category/JavaScript/post/5b0645cc7e3e36001bf676eb)

#### 3) Arrow function을 사용하지 않는다면...?
ECMAScript 3/5
[예제 코드 실행](https://codepen.io/qkreltms/pen/bOqpmW?editors=0012)

 

      function Person() {
      var that = this; // window를 가리킴 
      that.age = 0;
    
      setInterval(function growUp() {
        // 콜백은  `that` 변수를 참조하고 이것은 값이 기대한 객체이다. 
        // 사실 둘 다 전역 컨텍스트 안이므로 이 코드에서 that을 사용하지 않아도 된다.
        that.age++;
        console.log(this.age)
      }, 1000);
    }
    
    Person()

아니면 [call](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/call), apply 또는 ES5에서는 bind 함수를 사용할 수도 있다.
[예제 코드 실행](https://codepen.io/qkreltms/pen/yGMOjv?editors=0011)

    function Person() {
      var age = 0;
      growUp.call(this)
      function growUp() {
        age++;
        console.log(age)
      }
      
      setInterval(growUp, 1000);
    }
    
    Person()


#### 4)Arrow function과 Closure의 연관관계

Arrow function는 전역 컨텍스트에서 실행될 때 this를 새로 정의하지 않고, 해당 코드영역 바깥의 함수 혹은 class의 this 값이 사용된다. 이것은 this를 클로저 값으로 처리하는 것과 같다고 한다. [출처](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Functions/%EC%95%A0%EB%A1%9C%EC%9A%B0_%ED%8E%91%EC%85%98)


[에제 코드 실행](https://codepen.io/qkreltms/pen/MZpyZX?editors=0011)
	

	//method와 다르게 function은 전역 컨텍스트에서 코드를 사용할 수 있게해준다. 
     var a = {
            name: "a object",
    
            logThis: function (arr) {
                arr.forEach(function() {
                    console.log(this + this.name) //window.name 값을 가져옴
                });
            }
        }
       
      a.logThis([1, 2, 3])
    
        var b = {
            name: "b object",
    
            logThis: function (arr) {
                arr.forEach(item => {
                    console.log(this + this.name) //b의 name을 가져옴
                });
            }
        }
      b.logThis([1, 2, 3])


[클로저란?](https://opentutorials.org/course/743/6544)(또는 [이 블로그](https://medium.com/@khwsc1/%EB%B2%88%EC%97%AD-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%8A%A4%EC%BD%94%ED%94%84%EC%99%80-%ED%81%B4%EB%A1%9C%EC%A0%80-javascript-scope-and-closures-8d402c976d19))

    클로저(closure)는 내부함수가 외부함수의 맥락(context)에 접근할 수 있는 것을 가르킨다. `클로저는 자바스크립트를 이용한 고난이도의 테크닉을 구사하는데 필수적인 개념으로 활용된다.`  

즉, 클로저는 내부함수에서 외부함수의 맥락에 접근할 수 있다는 점과, 위의 코드에서 b.name 값에 접근할 수 있다는  점에서 같다.

   
