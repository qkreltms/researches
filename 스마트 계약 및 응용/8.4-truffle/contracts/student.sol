pragma solidity ^0.8.13;

contract Student {
    string firstName;
    string lastName;
    string dateOfBirth;

    // memory: 프로그램이 동작될 때만 임시적으로 기억, storage가 default. storage는 모든 컨트렉트에 있는 영역
    function setStudent(
        string memory _firstName,
        string memory _lastName,
        string memory _dateOfBirth
    ) public {
        firstName = _firstName;
        lastName = _lastName;
        dateOfBirth = _dateOfBirth;
        emit Added(msg.sender, _firstName, _lastName, _dateOfBirth);
    }

    function getStudent()
        public
        view
        returns (
            string memory,
            string memory,
            string memory
        )
    {
        return (firstName, lastName, dateOfBirth);
    }

    // event에서는 memory keyword가 안된다.
    event Added(
        address indexed f,
        string firstName,
        string lastName,
        string dateOfBirth
    );
}
