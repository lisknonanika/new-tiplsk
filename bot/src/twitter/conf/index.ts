const DM_MONITOR_INTERVAL = 60;
const DM_COUNT = 50;
const API_RATE_LIMIT = "application/rate_limit_status";
const API_PATH_DM_GET = "direct_messages/events/list";
const API_PATH_DM_SEND = "direct_messages/events/new";
const options = {
  subdomain: "api",
  version: "1.1",
  consumer_key: "",
  consumer_secret: "",
  access_token_key: "",
  access_token_secret: ""
}

export {
  options,
  API_RATE_LIMIT,
  DM_MONITOR_INTERVAL, DM_COUNT,
  API_PATH_DM_GET, API_PATH_DM_SEND
}