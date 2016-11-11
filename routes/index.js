module.exports = function(app, Member) {
  // 회원가입 addMember
  app.post('/api/members', function (req, res) {
    var member = new Member();
    member.nickname = req.body.nickname;
    member.connectKey = "abcdfadfadfd";  //원래 서버에서 생성해줘야함.
    member.majors = new Array(req.body.majors);
    member.join_date = new Date(req.body.join_date);
    member.last_login_date = new Date(req.body.join_date);

    member.save(function (err) {
      if (err) {
        console.error(err);
        return;
      }
      res.json({result: 1});
    });
  });
  app.get('/api/members/', function(req, res){
    Member.find({}, function(err, members){
      if(err) return res.status(500).json({error:err});
      if(members.length===0) return res.status(404).json({error:'member not found'});
      res.json(members);
    });
  });
}
  //
  // // 게시판 _id 값으로 전공별 게시판 조회
  // app.get('/api/boards/:board_id', function(req, res){
  //   res.end();
  // });
  //
  // // 게시글 작성
  // app.post('/api/boards', function(req, res){
  //   res.send('OK');
  // });
  //
  // // 게시글 수정
  // app.put('/api/boards/:board_id', function(req, res){
  //   res.send('OK');
  // });
  //
  // // 게시글 삭제
  // app.delete('/api/boards/:board_id', function(req, res){
  //   res.send('OK');
  // });
  //
  // // 댓글 작성
  // app.post('/api/boards/:board_id/comments', function(req, res){
  //   res.send('OK');
  // });
  //
  // // 댓글 수정
  // app.put('/api/boards/:board_id/comments/:comments_id', function(req, res){
  //   res.send('OK');
  // });
  //
  // // 댓글 삭제
  // app.delete('/api/boards/:board_id/comments/:comments_id', function(req, res){
  //   res.send('OK');
  // });
  //
  // //작성자로 게시글 조회 (내가 쓴글 보기)
  // app.get('/api/boards/:user_id', function(req, res){
  //   res.send('OK');
  // })

