const axios = require("axios");
const cheerio = require("cheerio");
let saveFirstTitle = null; // 첫 번째 제목을 저장할 변수

const getDepartmnetNotices = async () => {
    try {
        const departmnetLink = `https://www.dongyang.ac.kr/dmu/4580/subview.do` 
        const departmnet = await axios.get(departmnetLink);
        const $ = cheerio.load(departmnet.data); // 공지사항 페이지 크롤링
        const noticeList = $(".board-table tbody tr"); // notice 클래스는 제외
        const firstTitle = noticeList.first().find(".td-subject a").text().trim(); // 첫 번째 제목
        const newTitle = []; // 새로운 제목(들) 저장
        let allNotices = []; // 모든 공지사항 저장
    
        noticeList.each((index, e) => {  // 모든 공지사항 allNotices에 저장 (index+1로 넘버링)
            const titleAll = $(e).find(".td-subject a").text().trim();
            if (titleAll) { 
                allNotices.push(`${index+1}. ${titleAll}`);
            }
        });
    
        if (saveFirstTitle===firstTitle) { // 저장된 첫번째 이름과 가져온 첫번째 이름이 같을때
            console.log("학과 공지 게시글이 갱신되지 않았습니다.");
        } else {
            if (saveFirstTitle===null) // 저장된 첫번째 제목이나 링크가 null일때
                saveFirstTitle = firstTitle;
            noticeList.each((index , title) => {
                const noticeTitle = $(title).find(".td-subject").text().trim(); 
                if (noticeTitle===saveFirstTitle) { // 순회 중인 제목이 저장된 첫번째 제목과 같을 시
                    saveFirstTitle = firstTitle; // 첫번째 제목과 링크를 변수에 저장
                    return false;
                }
                newTitle.push(noticeTitle);
            });
        }
        
        return { 
            computerTitle : newTitle, 
            allComputerTitle : allNotices, 
            saveComputerTitle: saveFirstTitle, 
            departmnetLink : departmnetLink, 
        };
    } catch (error) {
        console.error(`getDepartmnetNotices ERROR: ${error.message}`);
        return { computerTitle: [], allComputerTitle:[], saveComputerTitle: [], departmnetLink:''  }; // 에러를 대비해 빈 배열을 return
    }
}

module.exports = {
    getDepartmnetNotices,
};