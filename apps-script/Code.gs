/**
 * 우리 아이와 남은 시간 — 대기자 수집 + 주간(또는 매일) 이메일 알림
 * 구글 Apps Script (서버·비용 0, 구글 크론으로 발송). SETUP.md 참고.
 *
 * 구성:
 *  - doPost(e)        : 사이트 이메일칸에서 {email, birthday} POST 받아 시트에 저장
 *  - sendReminders()  : 시트의 구독자 전원에게 남은 시간 이메일 발송 (시간 트리거로 주1회/매일)
 *
 * MailApp 무료 한도: 개인 gmail 하루 100통, Workspace 1,500통. (구독자 그 이하일 때 무료 충분)
 */

// ===== 설정 =====
var SHEET_NAME = 'subscribers';
var FROM_NAME  = '우리 아이와 남은 시간';
var SITE_URL   = 'https://canakara0221-boop.github.io/kids-time/';

// ===== 수집 endpoint =====
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = String(data.email || '').trim();
    var bday  = String(data.birthday || '').trim();
    if (!email || email.indexOf('@') < 0) {
      return _json({ ok: false, error: 'invalid email' });
    }
    var sh = _sheet();
    // 중복 이메일이면 생일만 갱신
    var vals = sh.getDataRange().getValues();
    for (var i = 1; i < vals.length; i++) {
      if (String(vals[i][1]).trim().toLowerCase() === email.toLowerCase()) {
        if (bday) sh.getRange(i + 1, 3).setValue(bday);
        return _json({ ok: true, dup: true });
      }
    }
    sh.appendRow([new Date(), email, bday, 'active']);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// ===== 발송 (시간 트리거가 호출) =====
function sendReminders() {
  var sh = _sheet();
  var vals = sh.getDataRange().getValues();
  var sent = 0;
  for (var i = 1; i < vals.length; i++) {
    var email = String(vals[i][1]).trim();
    var bday  = String(vals[i][2]).trim();
    var status = String(vals[i][3] || 'active').trim();
    if (!email || !bday || status !== 'active') continue;
    var r = _remaining(bday);
    if (r == null) continue;
    try {
      MailApp.sendEmail({
        to: email,
        name: FROM_NAME,
        subject: '이번 주, 아이와 함께 보낼 주말이 ' + _fmt(r.weekends) + '번 남았어요 ⏰',
        htmlBody: _emailHtml(r, email)
      });
      sent++;
    } catch (err) {
      // 개별 실패는 건너뜀(한도 초과 등)
    }
  }
  Logger.log('sent: ' + sent);
  return sent;
}

// ===== 계산 (사이트 index.html 과 동일 로직) =====
function _remaining(bday) {
  var b = new Date(bday + 'T00:00:00');
  if (isNaN(b.getTime())) return null;
  var now = new Date();
  var MS = 86400000;
  function daysUntilAge(age) {
    var t = new Date(b.getFullYear() + age, b.getMonth(), b.getDate());
    return Math.ceil((t - now) / MS);
  }
  var ageY = (now - b) / (365.25 * MS);
  var d18 = daysUntilAge(18);
  return {
    weekends: Math.max(0, Math.round(d18 / 7)),
    summers:  Math.max(0, 18 - Math.floor(ageY)),
    play:     daysUntilAge(10),
    daysTo18: d18,
    pct:      Math.min(100, Math.max(0, ageY / 18 * 100))
  };
}

function _emailHtml(r, email) {
  var unsub = SITE_URL; // 간단 MVP: 별도 수신거부 페이지 대신 안내문
  var play = r.play > 0 ? (_fmt(r.play) + '일') : '이미 지났어요 💔';
  return ''
    + '<div style="max-width:460px;margin:0 auto;font-family:Pretendard,\'Malgun Gothic\',sans-serif;'
    + 'background:linear-gradient(180deg,#fffdf7,#fff6e6);border:3px solid #efd39a;border-radius:22px;padding:24px;color:#4a3421">'
    + '<div style="font-size:13px;font-weight:800;color:#e8623a">⏰ 이번 주, 우리 아이와</div>'
    + '<div style="text-align:center;margin:14px 0">'
    +   '<div style="font-size:14px;color:#8a6f4e;font-weight:700">함께 보낼 주말이</div>'
    +   '<div style="font-size:52px;font-weight:900;color:#e8623a;line-height:1">' + _fmt(r.weekends) + '</div>'
    +   '<div style="font-size:18px;font-weight:900">번 남았어요</div>'
    + '</div>'
    + '<div style="background:#fffaf0;border:2px solid #f0dcb3;border-radius:14px;padding:12px 14px;font-size:14px;font-weight:700">'
    +   '🏖️ 함께할 여름방학 <b style="color:#2f8f4e;float:right">' + _fmt(r.summers) + '번</b></div>'
    + '<div style="background:#fffaf0;border:2px solid #f0dcb3;border-radius:14px;padding:12px 14px;font-size:14px;font-weight:700;margin-top:8px">'
    +   '🧸 “놀자”고 먼저 다가올 날 <b style="color:#2f8f4e;float:right">' + play + '</b></div>'
    + '<div style="text-align:center;font-family:Gaegu,cursive;font-size:18px;font-weight:700;margin:18px 0 4px">'
    +   '오늘, 딱 10분만<br/>같이 놀아줄까요? 🧸</div>'
    + '<div style="text-align:center;font-size:11px;color:#b79c74;margin-top:14px">'
    +   '<a href="' + SITE_URL + '" style="color:#b79c74">우리 아이와 남은 시간</a> · '
    +   '수신을 원치 않으시면 이 메일에 “그만”이라고 답장해 주세요</div>'
    + '</div>';
}

// ===== 유틸 =====
function _sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['가입시각', '이메일', '생일', '상태']);
  }
  return sh;
}
function _fmt(n) { return Number(n).toLocaleString('ko-KR'); }
function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 테스트용: 스크립트 에디터에서 직접 실행해 자기 메일로 1통 보내보기
function testSendToMe() {
  var me = Session.getActiveUser().getEmail();
  var r = _remaining('2021-09-15'); // 예시 생일
  MailApp.sendEmail({ to: me, name: FROM_NAME, subject: '[테스트] 남은 시간 알림', htmlBody: _emailHtml(r, me) });
}
