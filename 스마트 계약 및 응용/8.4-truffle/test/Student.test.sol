pragma solidity ^0.8.13;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Student.sol";

// Solidity를 이용한 테스트코드, 솔리디티 사용하면 속도가 엄청 느린것 같다..?
contract TestStudent {
    function testInitialState() public {
        // DeployedAddresses 라이브러리 이용
        Student student = Student(DeployedAddresses.Student());

        (string memory fname, string memory lname, string memory dob) = student
            .getStudent();

        Assert.equal(fname, "", "");
        Assert.equal(lname, "", "");
        Assert.equal(dob, "", "");
    }
}
