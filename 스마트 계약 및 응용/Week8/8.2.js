window.addEventListener("load", async () => {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  console.log("using web3 provider");

  // 내 지갑 정보를 가져온다.
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  console.log("Set the default account: ", accounts[0]);

  // 두개의 모듈 사이의 인터페이스, 블록체인 컨트렉트 타입 같은거라고 생각

  var StudentABI = [
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
    "0xE453ea2D26585E3315ea919aaBc8Fe7687F7917F"
  );

  refresh();
});

function refresh() {
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
