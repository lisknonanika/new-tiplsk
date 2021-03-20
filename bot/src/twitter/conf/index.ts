export const PROFILE_URL = "https://twitter.com/intent/user?user_id=";
export const DM_MONITOR_INTERVAL = 65;
export const DM_COUNT = 50;
export const API_RATE_LIMIT = "application/rate_limit_status";
export const API_PATH_DM_GET = "direct_messages/events/list";
export const API_PATH_DM_SEND = "direct_messages/events/new";

export const APIKEY = {
  subdomain: "api",
  version: "1.1",
  consumer_key: "",
  consumer_secret: "",
  access_token_key: "",
  access_token_secret: ""
}

export const COMMAND = {
  tweet: {
    reg: new RegExp(/(^|\s+)(@|＠)tiplsk\s+(reg|登録|とうろく)\s+tip[0-9a-zA-Z_]{38}($|\s)/i),
    tip: new RegExp(/(^|\s+)(@|＠)tiplsk\s+(tip|チップ|ちっぷ)\s+(@|＠)[0-9a-zA-Z_]{5,15}\s+([1-9][0-9]{0,2}|0)(\.\d{1,5})?($|\s)/i),
    balance: new RegExp(/(^|\s+)(@|＠)tiplsk\s+(balance|残高|ざんだか)($|\s)/i),
    help: new RegExp(/(^|\s+)(@|＠)tiplsk\s+(help|おしえて)($|\s)/i),
  },
  dm: {
    reg: new RegExp(/(^|\s+)(reg|登録|とうろく)\s+tip[0-9a-zA-Z_]{38}($|\s)/i),
    tip: new RegExp(/(^|\s+)(tip|チップ|ちっぷ)\s+(@|＠)[0-9a-zA-Z_]{5,15}\s+([1-9][0-9]{0,2}|0)(\.\d{1,5})?($|\s)/i),
    balance: new RegExp(/(^|\s+)(balance|残高|ざんだか)($|\s)/i),
    help: new RegExp(/(^|\s+)(help|おしえて)($|\s)/i),
  }
}