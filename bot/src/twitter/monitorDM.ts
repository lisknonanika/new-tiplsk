import Twitter from 'twitter-lite';
import {
  APIKEY, COMMAND, BOT_TYPE,
  DM_COUNT, DM_MONITOR_INTERVAL,
  API_RATE_LIMIT, API_PATH_DM_GET
} from './conf';
import { sleep } from '../util';
import { registration, tip, balance, help } from '../command';
import { TIPLSK_ID } from '../const';

const client = new Twitter({
  subdomain: APIKEY.subdomain,
  version: APIKEY.version,
  consumer_key: APIKEY.consumer_key,
  consumer_secret: APIKEY.consumer_secret,
  access_token_key: APIKEY.access_token_key,
  access_token_secret: APIKEY.access_token_secret
});

let latestID = "";

/*****************************
 * DM取得
 * @param next_cursor 
 * @param remaining 
 * @param isStart 
 * @returns 
 *****************************/
const getDM = async(next_cursor: string, remaining: number, isStart: boolean): Promise<any[]> => {

  // DM取得可能回数が1回未満なら終了
  if (remaining < 1) return [];
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

  // 次カーソルがない または 同値の場合終了
  if (data.next_cursor && data.next_cursor === next_cursor) return [];

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

/*****************************
 * コマンド実行
 * @param data 
 *****************************/
const executeCommand = async(data: any[]) => {
  const senderIds = [TIPLSK_ID];
  for(const dm of data) {
    // DM送信者のIDを取得
    const senderId: string = dm.message_create.sender_id;

    // 送信者がコマンド実行済みなら終了(最新のコマンドのみ有効化)
    if (senderIds.indexOf(senderId) >= 0) continue;

    // DM本文を取得
    let text: string = dm.message_create.message_data.text;
    text = text.replace(/\s+/g, " ");

    // ----------------------------
    // 登録コマンドの場合
    // ----------------------------
    if (COMMAND.dm.reg.test(text)) {
      // コマンド抽出
      const commands = text.match(COMMAND.dm.reg);
      if (!commands) continue;
      const command = commands[0].trim();

      // コマンド実行
      const ret = await registration.execute(BOT_TYPE, command, senderId);
      if (!ret) continue;
      console.log(ret);

      // DM送信

      // 送信者をコマンド実行済みとする
      senderIds.push(senderId);
    }

    // ----------------------------
    // チップコマンドの場合
    // ----------------------------
    else if (COMMAND.dm.tip.test(text)) {
      // コマンド抽出
      const commands = text.match(COMMAND.dm.tip);
      if (!commands) continue;
      const command = commands[0].trim();

      // 本文中に存在するユーザーのIDを取得する
      const words: string[] = command.split(/\s/g);
      const mentions: any[] = dm.message_create.message_data.entities.user_mentions;
      for (const mention of mentions) {
        // tiplsk宛てなら次
        const recipientId = mention.id_str;
        if (recipientId === TIPLSK_ID) continue;

        // スクリーンネームが一致しなければ次
        const screenName: string = mention.screen_name;
        const screenNames: string[] = [`@${screenName.toLowerCase()}`, `＠${screenName.toLowerCase()}`];
        if (!words.find(v => screenNames.indexOf(v.toLowerCase()) >= 0)) continue;

        // コマンド実行
      const ret = await tip.execute(BOT_TYPE, command, senderId, recipientId);
      if (!ret) continue;
      console.log(ret);

      // DM送信

      // 送信者をコマンド実行済みとする
        senderIds.push(senderId);
      }
    }
    
    // ----------------------------
    // 残高コマンドの場合
    // ----------------------------
    else if (COMMAND.dm.balance.test(text)) {
      // コマンド抽出
      const commands = text.match(COMMAND.dm.balance);
      if (!commands) continue;
      const command = commands[0].trim();
      
      // コマンド実行
      const ret = await balance.execute(command);
      if (!ret) continue;
      console.log(ret);

      // DM送信

      // 送信者をコマンド実行済みとする
      senderIds.push(senderId);
    }
    
    // ----------------------------
    // ヘルプコマンドの場合
    // ----------------------------
    else if (COMMAND.dm.help.test(text)) {
      // コマンド実行

      // DM送信
      const ret = await help.execute(BOT_TYPE, senderId);
      if (!ret) continue;
      console.log(ret);

      // 送信者をコマンド実行済みとする
      senderIds.push(senderId);
    }
  }
}

/*****************************
 * メイン
 *****************************/
(async () => {
  try {
    while (true) {
      // DM取得のレート取得
      const limitData = await client.get(API_RATE_LIMIT, {resources: "direct_messages"});
      let remaining: number = limitData.resources.direct_messages["/direct_messages/events/list"].remaining;
      console.log(`remaining: ${remaining}`);

      // DM取得
      const data = await getDM("", remaining, true);
      console.log(data.length);
      console.log(JSON.stringify(data));

      // コマンド実行
      await executeCommand(data);

      // 1分停止
      await sleep(DM_MONITOR_INTERVAL);
    }
  } catch (err) {
    console.log(err)
  }
})();