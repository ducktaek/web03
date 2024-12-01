module.exports = {
  idCheck: `select * from member where member_id =?`,
  memberInsert: `insert into member set ?`,

  loginCheck: `select * from member where member_id=? and pwd =? `,
};
