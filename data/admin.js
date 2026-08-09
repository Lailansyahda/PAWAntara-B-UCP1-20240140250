const bcrypt = require("bcryptjs");

const username = process.env.ADMIN_USERNAME || "admin";
const plainPassword = process.env.ADMIN_PASSWORD || "admin123";

const passwordHash = bcrypt.hashSync(plainPassword, 10);

const admin = { username, passwordHash };

function verifyPassword(inputPassword) {
  return bcrypt.compareSync(inputPassword, admin.passwordHash);
}

module.exports = { admin, verifyPassword };