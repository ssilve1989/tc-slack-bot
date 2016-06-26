"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (skill, info, bot, message) {
  console.log("INVOCATON OF NON-CONFIGURED SKILL: " + skill);
  bot.reply(message, "I understood this as: " + skill + ", but you haven't configured how to make me work yet!");
};

module.exports = exports["default"]; /**
                                      * Created by ssilvestri on 6/25/16.
                                      */