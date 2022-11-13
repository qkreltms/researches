const Student = artifacts.require("Student");

contract("Student", function (accounts) {
  it("should init with empty values", () => {
    return Student.deployed().then((instance) =>
      instance.getStudent().then((result) => {
        assert.equal(result["0"], "");
        assert.equal(result["1"], "");
        assert.equal(result["2"], "");
      })
    );
  });
});
