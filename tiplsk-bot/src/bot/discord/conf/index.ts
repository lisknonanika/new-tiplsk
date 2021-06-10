export const TYPE: string = "discord";
export const TOKEN: string = "";
export const DM_ONLY: boolean = false;
export const COMMANDS = {
  help: /(\s|^)!help(\s|$)/,
  balance: /(\s|^)!balance(\s|$)/,
  reg: /(\s|^)!reg(\s+)tip[a-z0-9]{38}(\s|$)/,
  tip: /(\s|^)!tip(\s+)([0]{1}|([1-9]{1}[0-9]{0,4}))(\.[0-9]{0,8})?(\s+)(<@![a-z0-9]+>)(\s|$)/,
};
export const MESSAGE = {
  ERROR: "**[Error]**\r\n",
  HELP: "**[Command List]**\r\n" +
        "**!help** - Display command list and registered tiplsk address.\r\n" +
        "> e.g. !help\r\n" +
        "\r\n" +
        "**!balance** - Display your balance.\r\n" +
        "> e.g. !balance\r\n" +
        "\r\n" +
        "**!reg** [`tiplsk address`] - Register your tiplsk address.\r\n" +
        "> e.g. !reg `tipgame2jsvqktwwx2txppudvxt2v8dtdfvxdbrhg`\r\n" +
        "\r\n" +
        "**!tip** [`tip amount`] [`recipient`] - Send tip to user.\r\n" +
        "> * [amount]: min=0.00000001 max=99999.99999999\r\n" +
        "> e.g. !tip `1.2345` `@mdmg`\r\n" +
        "\r\n" +
        "**[Your Address]**\r\n",
  BALANCE: "**[Your Balance]**\r\n",
  REGISTRATION: "**[Registration]**\r\n"+
                "To complete the process, please access the following URL and enter your passphrase.\r\n",
  TIP: "**[Tip]**\r\n"+
       "To complete the process, please access the following URL and enter your passphrase.\r\n"
}
  