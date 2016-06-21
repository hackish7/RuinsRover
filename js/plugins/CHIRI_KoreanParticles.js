//=============================================================================
// RPG Maker MV용 한국어 조사 처리 스크립트 151113 by Chiri
// CHIRI_KoreanParticles.js
// Version: 1.02
//=============================================================================

/*:
 * @plugindesc 받침 유무에 따라 자동으로 한국어 조사를 처리합니다. 자세한 사용법은 도움말을 확인해 주세요.
 * @author 치리
 *
 * @help 플러그인은 되도록이면 아랫쪽으로 배치하시기 바랍니다.
 *
 * 기본적으로 [이;가] 와 같이 
 *  [받침이 있을 경우의 조사;받침이 없을 경우의 조사]
 * 의 순서로 사용할 조사를 입력해 주시면 됩니다.
 *
 * > 예 - \N[1][은;는] %1[을;를] 얻었다!
 *
 * '(으)로'와 같이 받침이 있을 경우에만 형태소가 붙는 경우에는 
 * '%1[으;]로 가야 해요' 와 같이 받침이 없을 때의 부분을 비워주는 식으로 사용하시면 됩니다.
 *
 * '와/과'의 경우, 원칙적으로는 반대의 순서로 [과;와]로 적어주셔야 하지만 [와;과]로도 문제는 없습니다.
 * 
 * 이벤트의 텍스트 출력 및 전투 스크립트 등 윈도에서 출력되는 부분이라면 거의 사용이 가능할 것입니다.
 *
 * 적용 가능한 조사의 예시들 : 
 * 
 * [이;가]
 * [은;는]
 * [을;를]
 * [과;와] ([와;과])
 * [으;]로
 * [이;]라
 * [이에;예]
 * ...
 *
 */

var Chiri = Chiri || {};
Chiri.Message = Chiri.Message || {};
Chiri.KoreanParticles = Chiri.KoreanParticles || {};


Chiri.Message.Window_Base_convertEscapeCharacters =
		Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
		text = Chiri.Message.Window_Base_convertEscapeCharacters.call(this, text);
 
    	text = text.replace(/(.{1})((\e[a-zA-Z\$\.\|\^!><\{\}\\](\[[\w,]+?\])?)*?)\[(.{0,2}\;.?)\]/gi, function() {
    			return Chiri.KoreanParticles.GetProposition(arguments[1],arguments[5],arguments[2]);
    	}.bind(this));
    	
   		return text;

};

Chiri.KoreanParticles.GetProposition = function(word, proposition, cc) {
	const KOREANNUMBER = {'1' : '일', '2' : '이', '3' : '삼', '4' : '사', '5' : '오', '6' : '육', '7' : '칠', '8' : '팔', '9' : '구', '0' : '영'}
	const KOREANALPHABET = {'A' : '이', 'B' : '비', 'C' : '씨', 'D' : '디', 'E' : '이', 'F' : '프', 'G' : '지', 'H' : '치', 'I' : '이', 'J' : '이', 'K' : '이', 'L' : '엘', 'M' : '엠', 'N' : '엔', 'O' : '오', 'P' : '피', 'Q' : '큐', 'R' : '알', 'S' : '스', 'T' : '티', 'U' : '유', 'V' : '이', 'W' : '유', 'X' : '스', 'Y' : '이', 'Z' : '트'}
	const KOREANALPHABETFULL = {'Ａ' : '이', 'Ｂ' : '비', 'Ｃ' : '씨', 'Ｄ' : '디', 'Ｅ' : '이', 'Ｆ' : '프', 'Ｇ' : '지', 'Ｈ' : '치', 'Ｉ' : '이', 'Ｊ' : '이', 'Ｋ' : '이', 'Ｌ' : '엘', 'Ｍ' : '엠', 'Ｎ' : '엔', 'Ｏ' : '오', 'Ｐ' : '피', 'Ｑ' : '큐', 'Ｒ' : '알', 'Ｓ' : '스', 'Ｔ' : '티', 'Ｕ' : '유', 'Ｖ' : '이', 'Ｗ' : '유', 'Ｘ' : '스', 'Ｙ' : '이', 'Ｚ' : '트'}

	// 와;과를 과;와로 변환
	if (proposition == "와;과") proposition = "과;와";

	var propositionArray = proposition.split(';');
	var original_word = word;

	if (word.length == 0) return '';

	// 조사 앞 문자열이 숫자일 때 변환
	if (Chiri.isNumber(word) == true) word = KOREANNUMBER[word];
	
	// 조사 앞 문자열이 알파벳(대, 소, 전각)일 때 한글로 변환
	var pattern_up = /[A-Z]/;
	var pattern_low = /[a-z]/;
	var pattern_full = /[Ａ-Ｚ]/;
	
	if (pattern_up.test(word) == true) word = KOREANALPHABET[word];
	if (pattern_low.test(word) == true) word = KOREANALPHABET[word.toUpperCase()];
	if (pattern_full.test(word) == true) word = KOREANALPHABETFULL[word];

	// 한글 코드를 구한 뒤 종성을 판단
	
	var code = word.charCodeAt(word.length-1) - 44032;
	var coda = code % 28; // 종성

	//console.log(word);

	if (coda == 0 || coda == 8) return original_word + cc + ((propositionArray[1] === undefined) ? "" : propositionArray[1]); // 받침이 없을 경우와 ㄹ(으)로 예외 규칙에 해당할 때
	else return original_word + cc + ((propositionArray[0] === undefined) ? "" : propositionArray[0]); // 그 외, 받침이 있을 경우
};

// 숫자 여부 판단 함수; 숫자인지 문자인지; isNumber
// 출처 : http://mwultong.blogspot.com/2007/01/isnum-isnumeric-isnumber-javascript.html
Chiri.isNumber = function(s) {
  s += ''; // 문자열로 변환
  s = s.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거
  if (s == '' || isNaN(s)) return false;
  return true;
};
