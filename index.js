const axios = require("axios");
const cheerio = require("cheerio");
let saveFirstTitle = null; // 첫 번째 제목을 저장할 변수
const { Client, Events, GatewayIntentBits } = require('discord.js');
require("dotenv").config();  // env 연결

const getDongyangNotices = async () => {
    try {
        const dongyang = await axios.get("https://www.dongyang.ac.kr/dmu/4904/subview.do");
        const $ = cheerio.load(dongyang.data);
        const NoticeList = $(".board-table tbody tr:not(.notice)"); // notice 클래스는 제외
        const firstTitle = NoticeList.first().find(".td-subject a strong").text().trim(); // 첫 번째 제목
        const newTitle = []; // 새로운 제목(들) 저장
        let allNotices = []; // 모든 공지사항 저장

        NoticeList.each((index, e) => { 
            const subjectAll = $(e).find(".td-subject a strong").text().trim();
            if (subjectAll) {  // 제목이 있는 경우에만 추가
                allNotices.push(`${index+1}. ${subjectAll}`);
            }
        });


        if (saveFirstTitle===firstTitle) { // 저장된 첫번째 이름과 가져온 첫번째 이름이 같을때
            console.log("게시글이 갱신되지 않았습니다.");
        } else {
            if (saveFirstTitle===null)
                saveFirstTitle = firstTitle;
            NoticeList.each((index , title) => {
                const subject = $(title).find(".td-subject a strong").text().trim();
                if (subject===saveFirstTitle) { // 첫번째 제목
                    saveFirstTitle = firstTitle;
                    console.log('순회 끝');
                    return false;
                }
                newTitle.push(subject);
            });
        }
        console.log(`첫번째 제목 : ${saveFirstTitle}`);
        return { newTitle, allNotices };
    } catch (error) {
        console.error(`getDongyangNotices ERROR: ${error.message}`);
        return { newTitle: [], allNotices: [] }; // 에러를 대비해 빈 배열을 return
    }
};

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});

client.once(Events.ClientReady, readyClient => { // 30분마다 메세지 보냄
    console.log(`✅ ${readyClient.user.tag} 로그인 성공 `);

    setInterval(async () => {
        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID); // 공지를 보낼 채널 ID
        if (!channel) {
            console.error("❌ 채널을 찾을 수 없습니다.");
            return;
        }

        const { newTitle } = await getDongyangNotices();
        if (newTitle.length > 0) {
            channel.send(`📢 새로운 공지사항이 있습니다!\n\n -${newTitle.join("\n")}`);
        } else {
            channel.send(`❌ 갱신된 공지사항이 없습니다.`);
        }
    }, 10000);
    // 1800000
});

client.on('messageCreate', async (message) => { // !공지 입력 시 첫번째 공지사항 출력
    if (message.content === "!공지") {
        await getDongyangNotices();
        message.reply(`📢 최근 공지사항:  ${saveFirstTitle}`);
    }
    else if (message.content === "!전부") {
        const { allNotices } = await getDongyangNotices();
        message.reply(`📢 최근 공지사항 모음 : \n\n ${allNotices.join("\n")}`);
    }
});


client.login(process.env.DISCORD_KEY);