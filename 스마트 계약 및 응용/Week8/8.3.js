window.addEventListener("load", async () => {
  // 소켓 기반으로 변경, 단 실무에서는 HTTPProvider 쓸듯...? (HTTPProvider는 deprecated 되었다고 하네..)
  web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545"));
  console.log("using web3 provider");

  // 내 지갑 정보를 가져온다.
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  console.log("Set the default account: ", accounts[0]);

  // 두개의 모듈 사이의 인터페이스, 블록체인 컨트렉트 타입 같은거라고 생각
  // 블록체인에 뭐 하나라도 추가되면 ABI업데이트 해줘야됨
  var StudentABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "f",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "firstName",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "lastName",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "dateOfBirth",
          type: "string",
        },
      ],
      name: "Added",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_firstName",
          type: "string",
        },
        {
          internalType: "string",
          name: "_lastName",
          type: "string",
        },
        {
          internalType: "string",
          name: "_dateOfBirth",
          type: "string",
        },
      ],
      name: "setStudent",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getStudent",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
        {
          internalType: "string",
          name: "",
          type: "string",
        },
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  StudentDetails = new web3.eth.Contract(
    StudentABI,
    // HACK: remix로 생성한 컨트렉트만 된다 왤까?
    // 꼭 첫번째 contract가 아니여도 됨
    // 실무에서는 뭘로?
    "0xc75a8B3337399C16744f8F53810E99f0BCA21Fd6"
  );

  refresh();

  // event
  console.log(StudentDetails);
  StudentDetails.events.Added({}, function (error, event) {
    if (!error) {
      refresh();
    } else {
      console.log(error);
    }
  });

  // 과거의 이벤트를 가져올 수 있다
  StudentDetails.getPastEvents("Added", {}, function (error, events) {
    if (error) {
      console.log(error);
      return;
    }
    events.forEach((event) => console.log(event.returnValues));
  });
});

function refresh() {
  console.log(StudentDetails.methods);
  StudentDetails.methods.getStudent().call((error, result) => {
    if (!error) {
      $("#instructor").html(
        "Enrolled " + result[0] + " " + result[1] + " with DOB " + result[2]
      );
      console.log(result);
    } else {
      console.log(error);
    }
  });
}

function Update() {
  StudentDetails.methods
    .setStudent($("#fname").val(), $("#lname").val(), $("#dob").val())
    .send({ from: web3.eth.defaultAccount }, (error, transactionHash) => {
      if (!error) {
        console.log(transactionHash);
      } else {
        console.log(error);
      }
    });
}
