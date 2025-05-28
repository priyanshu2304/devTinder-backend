const validator = require("validator");

const validateSignup = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Fields are missing");
  } else if (!validator.isEmail(email)) {
    throw new Error("Enter Valid mail address");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter Strong password");
  }
};

const validateEmail = (val) => {
  if (!validator.isEmail(val)) {
    throw new Error("Enter Valid mail address");
  }
};

const validateEditField = (req) => {
  const allowedEditField = [
    "firstName",
    "lastName",
    "email",
    "age",
    "skills",
    "about",
  ];

  const isEditAllowed = Object.keys(req).every((key) =>
    allowedEditField.includes(key)
  );

  if (!isEditAllowed) {
    throw new Error("Update contains disallowed fields");
  }

  req.email && validateEmail(req.email);

  return true;
};

const validateEditPassword = async (user, req) => {
  const { currentPassword, newPassword, newConfirmPassword } = req;
  const isPasswordVerified = await user.validatePassword(currentPassword);
  if (!isPasswordVerified) {
    throw new Error("Password is not correct");
  }

  if (newPassword !== newConfirmPassword) {
    throw new Error("Password is not confirmed");
  }

  if (!validator.isStrongPassword(newPassword)) {
    throw new Error("Enter Strong password");
  }

  return true;
};

module.exports = {
  validateSignup,
  validateEmail,
  validateEditField,
  validateEditPassword,
};
