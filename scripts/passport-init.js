// Description:
//   Sets up passport for use in OAuth integrations like GitHub and G Suite.
const passport = require("passport")

module.exports = function (robot) {
  robot.router.use(passport.initialize())
}
