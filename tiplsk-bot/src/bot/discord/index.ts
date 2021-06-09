import * as discord from 'discord.js';
import * as conf from './conf';

const client = new discord.Client();    

client.on("ready", ()=> {
    console.log("ready...");
});

client.on("message", async message => {
  const botId = client.user?.id? client.user?.id: "";
  if(message.author.id === botId ||message.author.bot ||
     !(message.channel instanceof discord.DMChannel || message.mentions.has(botId))){
      return;
  }

  const content = message.content.trim().replace(/\s+/g," ");
  const author = message.author;

  try {
    if (conf.COMMANDS.help.test(content)) {
      await author.send("help command!");

    } else if (conf.COMMANDS.reg.test(content)) {
      const matches = content.match(conf.COMMANDS.reg);
      const command = matches? matches[0].trim(): "";
      const address = command.split(" ")[1];
      await author.send(`reg command! address=${address}`);
      
    } else if (conf.COMMANDS.tip.test(content)) {
      const matches = content.match(conf.COMMANDS.tip);
      const command = matches? matches[0].trim(): "";
      const arr = command.split(" ");
      const amount = arr[1];
      const recipient = arr[2];
      for (const user of message.mentions.users) {
        if (recipient !== `<@!${user[1].id}>`) continue;
        await author.send(`tip command! target=${user[1].id} amount=${amount}`);
        break;
      }
    }
  } catch (error) {
    console.log(error);
  }
});

client.login(conf.TOKEN);