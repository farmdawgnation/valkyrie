// Description:
//
// Recognizes any command passed by the listener, immediately followed by
//  "help", and re-sends the message to the robot in the correct syntax to
//  trigger help.
//
// Configuration: Listener middleware executes in the order in which it loads.
//   If you have other listener middleware that must run in a specific order
//   relative to this one, please rename your files accordingly to force them
//   to load in the correct order!
//   https://hubot.github.com/docs/scripting/#execution-process-and-api
//
// Commands:
//   hubot <command> help - redirects to `hubot help <command>`
//
// Author:
//   kb0rg

const { TextMessage } = require("hubot")

module.exports = function(robot) {
  robot.receiveMiddleware(function(context, next, done) {
    let robotRespondPatternInText =
      context.response.message.text &&
      context.response.message.text.match(robot.respondPattern(""))
    if (robotRespondPatternInText) {
      // Strip robot pattern from message, clean up for next steps.
      let messageText = context.response.message.text
        .replace(robotRespondPatternInText[0], "")
        .trim()
        .toLowerCase()

      // Make sure the message contains "help" - but eliminate direct calls to help.
      if (messageText.indexOf("help") <= 0) {
        return next()
      }

      // Expect "help" to be the second or third word in the message.
      // We want to avoid catching things like reminders with the word "help"
      // in the reminder message.
      if (messageText.split(" ").indexOf("help") <= 2) {
        let possibleCommand = context.response.message.text
          .replace(robotRespondPatternInText, "")
          .trim()
          .split(" ")[0]
        let flippedHelpRequest = `help ${possibleCommand}`

        // Do not DOS the robot
        // TODO: Nix this? The indexOf checks should eliminate this possibility.
        // Is there any case where this could still happen?
        if (flippedHelpRequest === "help help") {
          return done()
        }

        let messageToRobot = new TextMessage(
          context.response.envelope.user,
          `${robot.alias}${flippedHelpRequest}`,
        )
        // Add metadata to message, if present, so reply is properly threaded.
        if (context.response.message && context.response.message.metadata) {
          messageToRobot.metadata = context.response.message.metadata
        }
        robot.adapter.receive(messageToRobot)
        return next()
      } else {
        next()
      }
    } else {
      next()
    }
  })
}
