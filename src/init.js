/*
CowGL Status Bot/init.js

Simple bot to check status of CowGL.xyz.

by Cow Team / JustApple
*/

//load node packages
const fs = require('fs');

//load config
const config = require('./config.json');

//create client
const discord = require('@jnode/discord');
const client = new discord.Client(config.token);

//send init message
client.apiRequest('POST', `/channels/${config.channelId}/messages`, {
	embeds: [
		{
			title: 'CowGL.xyz 伺服器狀態',
			description: '❓**等待查詢...**',
			image: { url: 'https://sr-api.sfirew.com/server/cowgl.xyz/banner/motd.png?hl=tw&v=bRsinFZkaZ' }
		}
	]
}).then((d) => {
	config.messageId = d.json().id;
	fs.writeFileSync('./config.json', JSON.stringify(config, null, '\t'));
});