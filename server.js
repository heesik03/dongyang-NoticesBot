const express = require("express");
const server = express();
server.all('/', (req,res) => {
    res.send('봇 상태 : \n온라인');
});
function StartServer() {
    server.listen(3000, ()=> {
        console.log('서버 가동 시작');
    })
}

module.exports = StartServer;