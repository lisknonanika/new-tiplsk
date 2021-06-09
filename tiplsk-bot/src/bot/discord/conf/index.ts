export const TOKEN: string = "";
export const COMMANDS = {
  "help": /(\s|^)!help(\s|$)/,
  "balance": /(\s|^)!balance(\s|$)/,
  "reg": /(\s|^)!reg(\s+)tip[a-z0-9]{38}(\s|$)/,
  "tip": /(\s|^)!tip(\s+)([0]{1}|([1-9]{1}[0-9]{0,4}))(\.[0-9]{0,8})?(\s+)(<@![a-z0-9]+>)(\s|$)/,
};
