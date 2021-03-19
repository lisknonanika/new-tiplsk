import Twitter from 'twitter-lite';
import {
  options, DM_COUNT, DM_MONITOR_INTERVAL,
  API_RATE_LIMIT, API_PATH_DM_GET
} from './conf';
import { sleep } from '../util';

const client = new Twitter({
  subdomain: options.subdomain,
  version: options.version,
  consumer_key: options.consumer_key,
  consumer_secret: options.consumer_secret,
  access_token_key: options.access_token_key,
  access_token_secret: options.access_token_secret
});

let latestID = "";
const getDM = async(next_cursor: string, remaining: number, isStart: boolean): Promise<any[]> => {
  console.log(next_cursor);

  if (remaining <= 1) return [];
  remaining -= 1;

  // DM取得
  const params = next_cursor? {count: DM_COUNT, cursor: next_cursor}: {count: DM_COUNT}
  const data = await client.get(API_PATH_DM_GET, params);

  // メッセージが取得できなかったら終了
  if (data.events.length === 0) return [];

  // 最新のメッセージIDが未設定なら設定して終了
  if (!latestID) {
    latestID = data.events[0].id;
    return [];
  }

  // 次カーソルがない または 同値なの場合終了
  if (!data.next_cursor || data.next_cursor === next_cursor) return [];

  // 対象IDまで配列に設定
  const ret = [];
  for(const e of data.events)  {
    if (e.id === latestID) break;
    ret.push(e);
  }

  // 最新のメッセージIDを設定
  if (isStart) latestID = data.events[0].id;

  // 配列の要素数が取得最大数より少ない場合は終了
  if (ret.length < DM_COUNT) return ret;

  // DM取得再帰処理
  return ret.concat(await getDM(data.next_cursor, remaining, false));
}

(async () => {
  try {
    while (true) {
      // DM取得のレート取得
      const limitData = await client.get(API_RATE_LIMIT, {resources: "direct_messages"});
      let remaining: number = limitData.resources.direct_messages["/direct_messages/events/list"].remaining;

      // DM取得
      const data = await getDM("", remaining, true);
      console.log(JSON.stringify(data));

      // 1分停止
      await sleep(DM_MONITOR_INTERVAL);
    }
  } catch (err) {
    console.log(err)
  }
})();