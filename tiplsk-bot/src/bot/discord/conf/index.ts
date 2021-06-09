export const TYPE: string = "discord";
export const TOKEN: string = "";
export const COMMANDS = {
  "help": /(\s|^)!help(\s|$)/,
  "balance": /(\s|^)!balance(\s|$)/,
  "reg": /(\s|^)!reg(\s+)tip[a-z0-9]{38}(\s|$)/,
  "tip": /(\s|^)!tip(\s+)([0]{1}|([1-9]{1}[0-9]{0,4}))(\.[0-9]{0,8})?(\s+)(<@![a-z0-9]+>)(\s|$)/,
};
export const HELP_TEXT: string =
  "[Command]\r\n" +
  "!help\r\n" +
  "  - Display Command list and Registered address.\r\n" +
  "  e.g. !help\r\n" +
  "  e.g. @TipLSK !help\r\n" +
  "\r\n" +
  "!balance\r\n" +
  "  - Display Your Balance.\r\n" +
  "  e.g. !balance\r\n" +
  "  e.g. @TipLSK !balance\r\n" +
  "\r\n" +
  "!reg [Your Address]\r\n" +
  "  - Register [Your Address].\r\n" +
  "  e.g. !reg tipgame2jsvqktwwx2txppudvxt2v8dtdfvxdbrhg\r\n" +
  "  e.g. @TipLSK !reg tipgame2jsvqktwwx2txppudvxt2v8dtdfvxdbrhg\r\n" +
  "\r\n" +
  "!tip [amount] [recipient]\r\n" +
  "  - Send an [amount] to [recipient].\r\n" +
  "    *[amount]: min=0.00000001 max=99999.99999999\r\n" +
  "  e.g. !tip 1 @mdmg\r\n" +
  "  e.g. @TipLSK !tip 1 @mdmg\r\n";