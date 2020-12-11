const eco = require('./index.js');
const bal = new eco.Balance();
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '!';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(' ');  
    const command = args.shift().toLowerCase();

    if(command === 'work'){
        const coins = random(1000);

        bal.add(message.author.id, coins);
        message.reply('you won ' + coins + ' coins!')
    }
    else if(command === 'balance'){
        message.reply(`you have ${bal.fetch(message.author.id)} coins!`)
    }
    else if(command === 'slots'){
        if(bal.has(message.author.id, 1) === false) return message.reply(`you can't do slots as you have 0 coins!`);
        const slots = bal.slots(message.author.id, parseInt(args[0]));
        // message.reply(`**${slots.result}**: ${slots.amount} coins!\nBoard - ${slots.board}`)
        message.reply(slots.board + ": " + slots.result)
    }
    else if (command === 'lb'){
        let embed = new Discord.MessageEmbed()
        .setDescription(bal.leaderboard(1).join('\n'))
        message.channel.send(embed);
    }
    else if (command === 'transfer'){
        amount = parseInt(args[1])
        user = message.mentions.users.first().id;

        bal.transfer({from: message.author.id, to: user, amount: amount})
    }

});

client.login('Nzg0NzgwMjY2MzgwMDY2ODQ4.X8uRlA.waTlc_ncBeRed0-3JbAjrWpkw2A');

function random(n){
    return Math.floor(Math.random() * n) + 1;
}

