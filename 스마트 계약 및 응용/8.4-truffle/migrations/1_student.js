const Student = artifacts.require("Student");

module.exports = function (deployer) {
  deployer.deploy(Student);
};
