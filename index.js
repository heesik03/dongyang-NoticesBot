const { getDongyangNotices } = require("./notices/MainNotices");
const { getDepartmnetNotices } = require("./notices/DepartmentNotices");
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { DateTime } = require("luxon");
require("dotenv").config();  // env 연결

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});
const alarmInterval = 100000; // setInterval 의 시간 3600000

client.once(Events.ClientReady, readyClient => { 
    console.log(`✅ ${readyClient.user.tag} 로그인 성공 `);

    setInterval(async () => { // 30분마다 메세지 보냄
        const koreaTime = DateTime.now().setZone('Asia/Seoul');
        const formattedTime = koreaTime.toFormat('yyyy-LL-dd HH:mm');
        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID); // 공지를 보낼 채널 ID
        if (!channel) {
            console.error("❌ 채널을 찾을 수 없습니다.");
            return;
        }

        const { newTitle , newLink } = await getDongyangNotices();
        const { computerTitle , departmnetLink } = await getDepartmnetNotices();
        if (newTitle.length > 0) {
            channel.send(`📢 새로운 공지사항이 있습니다! (${formattedTime}) \n\n ${newTitle.join("\n")} \n ${newLink.join("\n")} `);
        } else if (computerTitle.length > 0) {
            channel.send(`🖥 새로운 학과 공지사항이 있습니다! (${formattedTime}) \n\n ${computerTitle.join("\n")} \n ${departmnetLink} `);
        } else {
            channel.send(`❌ 갱신된 공지사항이 없습니다 (${formattedTime})`);
        }
    }, alarmInterval);
}); 

client.on('messageCreate', async (message) => { // !공지 입력 시 첫번째 공지사항 출력
    const koreaTime = DateTime.now().setZone('Asia/Seoul');
    const formattedTime = koreaTime.toFormat('yyyy-LL-dd HH:mm');
    if (message.content === "!공지") {
        const { saveFirstTitle, saveFirstTitleLink } = await getDongyangNotices();
        const { saveComputerTitle , departmnetLink } = await getDepartmnetNotices();
        message.reply(`📢 최근 공지사항 (${formattedTime}) :  ${saveFirstTitle} ${saveFirstTitleLink} \n 🖥 최근 학과 공지사항:  ${saveComputerTitle} ${departmnetLink}`);
    } else if (message.content === "!전부") {
        const { allNotices } = await getDongyangNotices();
        message.reply(`📢 최근 공지사항 모음 (${formattedTime}) : \n ${allNotices.join("\n")}`);
    } else if (message.content === "!학과") {
        const { allComputerTitle } = await getDepartmnetNotices();
        message.reply(`🖥 최근 컴퓨터소프트웨어과 공지사항 모음 (${formattedTime}) : \n ${allComputerTitle.join("\n")}`);
    }
});

client.login(process.env.DISCORD_KEY);