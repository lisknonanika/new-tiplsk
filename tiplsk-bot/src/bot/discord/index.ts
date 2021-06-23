import * as discord from 'discord.js';
import * as conf from './conf';
import { WEB_URL } from '../../conf';
import { help, balance, registration, tip } from '../../command';

const client = new discord.Client();

const runHelpCommand = async(author:discord.User) => {
  // command execute
  const ret = await help.execute(conf.TYPE, author.id);
  
  // send message
  if (ret.result) await author.send(
    `${conf.MESSAGE.HELP}\n\n` +
    `**[Your Address]**\n${ret.data}\n\n` +
    `**[TipLSK WEB]**\n` +
    `- Generate Address -\n${WEB_URL}\n\n` +
    `- Your Page -\n${WEB_URL}/accounts/discord-${author.id}`
    );
  else await author.send(`${conf.MESSAGE.ERROR}\n${ret.data}`);
}

const runBalanceCommand = async(author:discord.User) => {
  // command execute
  const ret = await balance.execute(conf.TYPE, author.id);
  
  // send message
  if (ret.result) await author.send(`${conf.MESSAGE.BALANCE}\n${ret.data}`);
  else await author.send(`${conf.MESSAGE.ERROR}\n${ret.data}`);
}

const runRegistrationCommand = async(author:discord.User, content:string) => {
  const matches = content.match(conf.COMMANDS.reg);
  const command = matches? matches[0].trim(): "";
  const address = command.split(" ")[1].trim();

  // command execute
  const ret = await registration.execute(conf.TYPE, author.id, address);

  // send message
  if (ret.result) await author.send(`${conf.MESSAGE.REGISTRATION}\n${WEB_URL}/transactions/${ret.data}\n${conf.MESSAGE.EXPIRED_ANOUNCE}`);
  else await author.send(`${conf.MESSAGE.ERROR}\n${ret.data}`);
}

const runTipCommand = async(author:discord.User, users:discord.Collection<string, discord.User>, content:string) => {
  const matches = content.match(conf.COMMANDS.tip);
  const command = matches? matches[0].trim(): "";
  const arr = command.split(" ");
  const amount = arr[1];
  const recipient = arr[2];
  for (const user of users) {
    if (recipient !== `<@!${user[1].id}>`) continue;
  
    // command execute
    const ret = await tip.execute(conf.TYPE, author.id, user[1].id, user[1].username, amount);

    // send message
    if (ret.result) await author.send(`${conf.MESSAGE.TIP}\n${WEB_URL}/transactions/${ret.data}\n${conf.MESSAGE.EXPIRED_ANOUNCE}`);
    else await author.send(`${conf.MESSAGE.ERROR}\n${ret.data}\n${conf.MESSAGE.RECIPIENT_NOT_REGISTER_ANOUNCE}`);
    break;
  }
}

client.on("ready", ()=> {
  console.log("TipLSK - ready...");
});

client.on("message", async message => {
  const botId = client.user?.id? client.user?.id: "";
  if(message.author.id === botId || message.author.bot) return;
  if (message.channel.type !== "dm" && !message.mentions.has(botId)) return;

  const content = message.content.trim().replace(/\s+/g," ");
  if (!content) return;
  
  const author = message.author;

  // help command
  if (conf.COMMANDS.help.test(content)) {
    await runHelpCommand(author);
    return;
  }

  // balance command
  if (conf.COMMANDS.balance.test(content)) {
    await runBalanceCommand(author);
    return;
  }

  // registration command
  if (conf.COMMANDS.reg.test(content)) {
    await runRegistrationCommand(author, content);
    return;
  }
  
  // tip command
  if (conf.COMMANDS.tip.test(content)) {
    await runTipCommand(author, message.mentions.users, content);
    return;
  }
});

client.login(conf.TOKEN);