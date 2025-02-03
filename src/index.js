/*
CowGL Status Bot

Simple bot to check status of CowGL.xyz.

by Cow Team / JustApple
*/

//load packages
const https = require('https');
const request = require('@jnode/request');

//load config
const config = require('./config.json');

//create client
const discord = require('@jnode/discord');
const client = new discord.Client(config.token);

//load minecraft checker
const mcje = require('@jnode/minecraft').java;
const mcClient = new mcje.Client('cowgl.xyz');

//motd image
let motd;
let lastId;

//update status
async function updateStatus() {
	try {
		//get status
		let isOn = false;
		let needUpdate = false;
		let status = {};
		const time = Date.now();
		try {
			status = await mcClient.getServerStatus();
			isOn = true;
		} catch {
			isOn = false;
		}
		
		const ping = Date.now() - time;
		
		//update motd image
		if ((lastId !== Math.round(time/600000)) && isOn) {
			needUpdate = true;
			motd = (await request.request('GET', `https://sr-api.sfirew.com/server/cowgl.xyz/banner/motd.png?hl=tw&v=${Math.round(time/600000)}&ping=false&mc_font=true`)).body;
			lastId = Math.round(time/600000);
		}
		
		//update status message
		const res = (await client.apiRequestMultipart('PATCH', `/channels/${config.channelId}/messages/${config.messageId}`, {
			embeds: [
				{
					title: 'CowGL.xyz 伺服器狀態',
					description: isOn ? `✅ **上線中**\n上次檢查：<t:${Math.round(time/1000)}>\n玩家數：\`${status.players.online}\` / \`${status.players.max}\`\nPing：\`${ping}\` ms` : `🛑 **離線**\n上次檢查：<t:${Math.round(time/1000)}>`,
					...(isOn ? { image: { url: 'attachment://motd.png' } } : {}),
					color: isOn ? 0x70e000 : 0xef233c
				}
			],
			attachments: isOn ? [{ id: 0 }] : []
		}, isOn ? [
			{
				id: 0,
				type: 'image/png',
				name: 'motd.png',
				data: motd
			}
		] : [])).json();
	} catch (err) { console.error(err); }
	
	return;
}

//auto update status
updateStatus();
setInterval(() => {
	updateStatus();
}, config.rate);

//error catcher
process.on('uncaughtException', (e) => {
	console.error(e, JSON.stringify(e.body, null, 2));
});