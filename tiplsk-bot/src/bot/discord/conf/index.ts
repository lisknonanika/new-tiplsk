import * as discordBotConfig from './discord-bot-config.json';

const TYPE = discordBotConfig.TYPE;
const TOKEN = discordBotConfig.TOKEN;
const DM_ONLY = discordBotConfig.DM_ONLY;

const COMMANDS = {
  help: /(\s|^)!help(\s|$)/,
  balance: /(\s|^)!balance(\s|$)/,
  reg: /(\s|^)!reg(\s+)tip[a-z0-9]{38}(\s|$)/,
  tip: /(\s|^)!tip(\s+)([0]{1}|([1-9]{1}[0-9]{0,4}))(\.[0-9]{0,8})?(\s+)(<@![a-z0-9]+>)(\s|$)/,
};

const MESSAGE = {
  ERROR: "**[Error]**",
  HELP: "**[Command List]**\n" +
        "**!help** - Display command list and registered tiplsk address.\n" +
        "> e.g. !help\n\n" +
        "**!balance** - Display your balance.\n" +
        "> e.g. !balance\n\n" +
        "**!reg** [`tiplsk address`] - Register your tiplsk address.\n" +
        "> e.g. !reg `tipgame2jsvqktwwx2txppudvxt2v8dtdfvxdbrhg`\n\n" +
        "**!tip** [`tip amount`] [`recipient`] - Send tip to user.\n" +
        "> * [amount]: min=0.00000001 max=99999.99999999\n" +
        "> e.g. !tip `1.2345` `@mdmg`",
  BALANCE: "**[Your Balance]**",
  REGISTRATION: "**[Registration]**\nTo complete the process, please access the following URL and enter your passphrase.",
  TIP: "**[Tip]**\nTo complete the process, please access the following URL and enter your passphrase.",
  EXPIRED_ANOUNCE: "*Please access the above URL and complete the process within `30 minutes.`",
  RECIPIENT_NOT_REGISTER_ANOUNCE: "*If you get the message `\"Recipient Account is unregistered.\"`, please encourage the recipient to register :wink:"
}

export { TYPE, TOKEN, DM_ONLY, COMMANDS, MESSAGE };