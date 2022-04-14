

let data = [
  ['', ''], ['', ''], ['', ''], ['', ''], ['', '']
];

let container = document.getElementById('spreadsheet');
let hot = new Handsontable(container, {
  data: data,
  rowHeaders: true,
  colHeaders: ['変換前', '変換後'],
  filters: false,
  dropdownMenu: false,
  contextMenu: {
    items: {
        row_below: {
            name: '下に行を挿入',
            callback: function (key, normalizedSelection) {
                var latestSelection = normalizedSelection[Math.max(normalizedSelection.length - 1, 0)];
                this.alter('insert_row', latestSelection.end.row + 1);
                var col = hot.propToCol(COL_PRODUCTCODE);
                hot.selectCell(latestSelection.end.row + 1, col);
            }
        }
    }
  }
});

/**
 * 追加変換  行追加
 */
function addRow() {
    hot.alter('insert_row', hot.countRows());
    var col = hot.propToCol(COL_PRODUCTCODE);
    hot.selectCell(hot.countRows() - 1, col);
}

/**
 * 追加変換  項目取得
 */
 let array = {};

 function getAddHenkan(){
  	const getData = hot.getData();
 	let bef = '';
 	let aft = '';
 	for(let i=0; i<getData.length; i++){
 		bef = nullChk(getData[i][0]);
 		aft = nullChk(getData[i][1]);
 		if( bef!=='' && aft!=='' ){
 			array[bef] = aft;
 		}
 	}
 	return array;
 }

 /**
 * 追加変換  文字数チェック
 */
 let errFlg = 0;

 function getAddHenkanStrCnt(){
 	const getData = hot.getData();
 	let bef = '';
 	let aft = '';
 	for(let i=0; i<getData.length; i++){
 		bef = nullChk(getData[i][0]);
 		aft = nullChk(getData[i][1]);
 		if(bef==null || aft==null || bef.length<=1 && aft.length<=1){
 			errFlg = 0;
 		}else {
 			errFlg = 1;
 			break;
 		}
 	}
 }

 /**
 * null undefined チェック
 */
 function nullChk(val){
	 if(val==null || val==undefined) val=''
	 return val
 }

 /**
 * 追加変換項目（変換前）を正規表現に変換
 */
let regStr = function(){
	let m = '';
	let reg = '';
	let last_key = Object.keys(array)[Object.keys(array).length -1]
	for(const property in array){
		if(property.match(/[\.\\\(\)\[\]\^\$\|\{\}\*\?\+]/g)){
			m = m.concat('\\',property);
		} else {
			m += property;
		}
		if(last_key!==property) {
			m += '|';
		}
	}

	return m;
}

/**
 * 全角⇒半角、半角⇒全角　変換関数
 */
 function henkanStr(input,numType,latinType,kanaType,symbolType,spaceType){
	 let henkanWord = '';
	 let henkanStr = '';

	let reg = new RegExp('(' + regStr() + ')', 'g');

	 //一文字ずつ分割して個別変換
	 for(let i=0;i<input.length;i++){
		let str = input.substr(i,1);

		if(regStr()!==''){
		 	//追加変換項目に一致するものがある場合、指定の文字に変換
			 if(str.match(reg)){
		 		henkanStr = str.replace(reg, function (match) { return array[match]; });
			 	henkanWord += henkanStr;
		 		continue;
			 }
		}
	    
	    //数字
		if(str.match(/[0-9０-９]/g)){
			 switch(numType){
			 	case '':
			 		henkanStr = str;
			 		break;
			 	case 'half':
			 		if(str.match(/[０-９]/g)){
			 			henkanStr = toHalfWidth(str);
			 		}else{
			 			henkanStr = str;
			 		}
			 		break;
			 	case 'full':
			 		if(str.match(/[0-9]/g)){
			 			henkanStr = toFullWidth(str);
			 		}else{
			 			henkanStr = str;
			 		}
			 }

		//英字
		 }else if(str.match(/[A-Za-zＡ-Ｚａ-ｚ]/g)){
			 switch(latinType){
			 	case '':
			 		henkanStr = str;
			 		break;
			 	case 'half':
			 		if(str.match(/[Ａ-Ｚａ-ｚ]/g)){
				 		henkanStr = toHalfWidth(str);
				 	}else{
			 			henkanStr = str;
			 		}
			 		break;
			 	case 'full':
			 		if(str.match(/[A-Za-z]/g)){
			 			henkanStr = toFullWidth(str);
			 		}else{
			 			henkanStr = str;
			 		}
			 }

		//カナ
		 }else if(str.match(/[\u30A1-\u30FA\u31F0-\u31FF\uFF66-\uFF9D]/g)){
			 switch(kanaType){
			 	case '':
			 		henkanStr = str;
			 		break;
			 	case 'half':
			 		if(str.match(/[\u30A1-\u30FA\u31F0-\u31FF]/g)){
			 			henkanStr = zenkana2Hankana(str);
			 		}else{
			 			henkanStr = str;
			 		}
			 		break;
			 	case 'full':
			 		if(str.match(/[\uFF66-\uFF9D]/g)){
			 			henkanStr = hankana2Zenkana(str);
			 		}else{
			 			henkanStr = str;
			 		}
			 }

		//スペース
		 }else if(str.match(/[　 ]/g)){
			 switch(spaceType){
			 	case '':
			 		henkanStr = str;
			 		break;
			 	case 'half':
			 		if(str.match(/[　]/g)){
			 			henkanStr = String.fromCharCode(32);
			 		}else{
			 			henkanStr = str;
			 		}
			 		break;
			 	case 'full':
			 		if(str.match(/[ ]/g)){
			 			henkanStr = String.fromCharCode(12288);
			 		}else{
			 			henkanStr = str;
			 		}
			 }

		//記号
		 }else if(str.match(/[!-~！-～\uFFE5\u301C]/g)){
			 switch(symbolType){
			 	case '':
			 		henkanStr = str;
			 		break;
			 	case 'half':
			 		if(str.match(/[！-～\uFFE5\u301C]/g)){
			 			henkanStr = toHalfWidth(str);
			 		}else{
			 			henkanStr = str;
			 		}
			 		break;
			 	case 'full':
			 		if(str.match(/[!-~]/g)){
			 			henkanStr = toFullWidth(str);
			 		}else{
			 			henkanStr = str;
			 		}
			 }
		 }else{
			 henkanStr = str;
		 }
		henkanWord += henkanStr;
	 }

	 return henkanWord;
 };

/**
 * 変換対象ハイライト
 */
function highlightStr(strInput,list){
	let highlightStr = ''
	let li = document.getElementById("highlightLi")
	if(strInput!=='') {
		let div = document.createElement("div");
		div.id = 'highlightInput';

		// 半角全角変換対象文字ハイライト
		for(let i=0;i<strInput.length;i++){
			let str = strInput.substr(i,1)
			highlightStr += highlightIns(str, list)
		}

		// 個別変換対象文字ハイライト
		let reg = new RegExp('(' + regStr() + ')', 'g');
		if (regStr()!=='') {
			highlightStr = highlightStr.replace(reg, '<span class="highlight">$1</span>')
		}

		highlightStr = highlightStr.replace(new RegExp(/\n/||/\r/||/\r\n/, 'g'), '<br/>')
		let divBef = document.getElementById("highlightInput")
		if (nullChk(divBef)!=='' ){
			li.removeChild(divBef)
		}

		div.innerHTML = highlightStr
		li.append(div);
		li.style.display = 'block' 
	}else {
		li.style.display = 'none'
	}
}

/**
 * 変換対象ハイライト(span挿入)
 */
 function highlightIns(strInput, list){

 	    //数字
		if(strInput.match(/[0-9０-９]/g)){
			if (list['num'].value=='half'){
				strInput = strInput.replace(/([０-９])/g, '<span class="highlight">$1</span>')
			}else if (list['num'].value=='full'){
				strInput = strInput.replace(/([0-9])/g, '<span class="highlight">$1</span>')
			}

		//英字
		 }else if(strInput.match(/[A-Za-zＡ-Ｚａ-ｚ]/g)){
			if (list['lat'].value=='half'){
				strInput = strInput.replace(/([ａ-ｚＡ-Ｚ])/g, '<span class="highlight">$1</span>')
			}else if (list['lat'].value=='full'){
				strInput = strInput.replace(/([a-zA-Z])/g, '<span class="highlight">$1</span>')
			}

		//カナ
		 }else if(strInput.match(/[\u30A1-\u30FA\u31F0-\u31FF\uFF66-\uFF9D]/g)){
			if (list['kana'].value=='half'){
				strInput = strInput.replace(/([\u30A1-\u30FA\u31F0-\u31FF])/g, '<span class="highlight">$1</span>')
			}else if (list['kana'].value=='full'){
				strInput = strInput.replace(/([\uFF66-\uFF9D])/g, '<span class="highlight">$1</span>')
			 }

		//スペース
		 }else if(strInput.match(/[ 　]/g)){
			if (list['sp'].value=='half'){
				strInput = strInput.replace(/([　])/g, '<span class="highlight">$1</span>')
			}else if (list['sp'].value=='full'){
				strInput = strInput.replace(/([ ])/g, '<span class="highlight">$1</span>')
			 }

		//記号
		 }else if(strInput.match(/[!-~！-～\uFFE5\u301C]/g)){
			if (list['sym'].value=='half'){
				strInput = strInput.replace(/([！-～\uFFE5\u301C])/g, '<span class="highlight">$1</span>')
			}else if (list['sym'].value=='full'){
				strInput = strInput.replace(/([!-~])/g, '<span class="highlight">$1</span>')
			 }

		 }
	
	return strInput
 }

//--------------------------------------
// 記号：全角 ⇒ 半角
//--------------------------------------
function toHalfWidth(strVal){
  // 半角変換
  var halfVal = strVal.replace(/./g,
    function( tmpStr ) {
      // 文字コードをシフト
      if(!tmpStr.match(/[\u2018\u2019\u201D\uFFE5\u301C]/g)){
    	 return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
      }else{
    	 // 文字コードシフトで対応できない文字の変換
    	 return tmpStr.replace(/”/g, "\"")
    	    .replace(/’/g, "'")
    	    .replace(/❛/g, "`")
    	    .replace(/￥/g, "\\")
    	    .replace(/〜/g, "~");
      }
    });
    return halfVal;
};

//--------------------------------------
// 記号：半角 ⇒ 全角
//--------------------------------------
 function toFullWidth(strVal) {
	 // 全角変換
	  var fullVal = strVal.replace(/./g,
	    function( tmpStr ) {
	      // 文字コードをシフト
	      return String.fromCharCode( tmpStr.charCodeAt(0) + 0xFEE0 );
	    }
	  );

	  return fullVal;
};

//--------------------------------------
// カナ：全角 ⇒ 半角
//--------------------------------------
 function zenkana2Hankana(str) {
	    var kanaMap = {
	         "ガ": "ｶﾞ", "ギ": "ｷﾞ", "グ": "ｸﾞ", "ゲ": "ｹﾞ", "ゴ": "ｺﾞ",
	         "ザ": "ｻﾞ", "ジ": "ｼﾞ", "ズ": "ｽﾞ", "ゼ": "ｾﾞ", "ゾ": "ｿﾞ",
	         "ダ": "ﾀﾞ", "ヂ": "ﾁﾞ", "ヅ": "ﾂﾞ", "デ": "ﾃﾞ", "ド": "ﾄﾞ",
	         "バ": "ﾊﾞ", "ビ": "ﾋﾞ", "ブ": "ﾌﾞ", "ベ": "ﾍﾞ", "ボ": "ﾎﾞ",
	         "パ": "ﾊﾟ", "ピ": "ﾋﾟ", "プ": "ﾌﾟ", "ペ": "ﾍﾟ", "ポ": "ﾎﾟ",
	         "ヴ": "ｳﾞ", "ヷ": "ﾜﾞ", "ヺ": "ｦﾞ",
	         "ア": "ｱ", "イ": "ｲ", "ウ": "ｳ", "エ": "ｴ", "オ": "ｵ",
	         "カ": "ｶ", "キ": "ｷ", "ク": "ｸ", "ケ": "ｹ", "コ": "ｺ",
	         "サ": "ｻ", "シ": "ｼ", "ス": "ｽ", "セ": "ｾ", "ソ": "ｿ",
	         "タ": "ﾀ", "チ": "ﾁ", "ツ": "ﾂ", "テ": "ﾃ", "ト": "ﾄ",
	         "ナ": "ﾅ", "ニ": "ﾆ", "ヌ": "ﾇ", "ネ": "ﾈ", "ノ": "ﾉ",
	         "ハ": "ﾊ", "ヒ": "ﾋ", "フ": "ﾌ", "ヘ": "ﾍ", "ホ": "ﾎ",
	         "マ": "ﾏ", "ミ": "ﾐ", "ム": "ﾑ", "メ": "ﾒ", "モ": "ﾓ",
	         "ヤ": "ﾔ", "ユ": "ﾕ", "ヨ": "ﾖ",
	         "ラ": "ﾗ", "リ": "ﾘ", "ル": "ﾙ", "レ": "ﾚ", "ロ": "ﾛ",
	         "ワ": "ﾜ", "ヲ": "ｦ", "ン": "ﾝ",
	         "ァ": "ｧ", "ィ": "ｨ", "ゥ": "ｩ", "ェ": "ｪ", "ォ": "ｫ",
	         "ッ": "ｯ", "ャ": "ｬ", "ュ": "ｭ", "ョ": "ｮ",
	    }
	    var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
	    return str
	            .replace(reg, function (match) {
	                return kanaMap[match];
	            });
};

//--------------------------------------
// カナ：半角 ⇒ 全角
//--------------------------------------
function hankana2Zenkana(str) {
    var kanaMap = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
    };

    var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return str
            .replace(reg, function (match) {
                return kanaMap[match];
            });
};

//****************
//  全て全角変換
//****************
function allToZenkaku() {
	let num = document.getElementsByName("number");
	let latin = document.getElementsByName("latin");
	let kana = document.getElementsByName("kana");
	let symbol = document.getElementsByName("symbol");
	let space = document.getElementsByName("space");

	num[0].checked = true;
	latin[0].checked = true;
	kana[0].checked = true;
	symbol[0].checked = true;
	space[0].checked = true;
}

//****************
//  全て半角変換
//****************
function allToHankaku() {
	let num = document.getElementsByName("number");
	let latin = document.getElementsByName("latin");
	let kana = document.getElementsByName("kana");
	let symbol = document.getElementsByName("symbol");
	let space = document.getElementsByName("space");

	num[1].checked = true;
	latin[1].checked = true;
	kana[1].checked = true;
	symbol[1].checked = true;
	space[1].checked = true;
}
//*************
//  変換処理
//*************
function henkan(){
	getAddHenkanStrCnt();
	if(errFlg == 1) {
		alert('今回のみ適用したい表記は、変換前・変換後のどちらとも1文字のみしか適用できません');
	} else {
		getAddHenkan();
		let strInput = document.getElementById("text").value;
		let element = document.getElementById("text-form");
		let list = {
			num: element.number,
			lat: element.latin,
			kana: element.kana,
		 	sym: element.symbol,
			sp: element.space
		};
		let strHenkan = henkanStr(strInput, list.num.value, list.lat.value, list.kana.value, list.sym.value, list.sp.value);
		document.getElementById("result").value = strHenkan;

		//変換対象ハイライト
		highlightStr(strInput, list);
	}

	array = new Object();
};

//***********************
//  変換対象テキスト削除
//***********************
function reset(){
	document.getElementById("text").value = null;
}

//*********
//  コピー
//*********
function copy(){
	const tgt = document.getElementById("result");
	if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
	  const range = document.createRange();
	  range.selectNode(tgt);
	  window.getSelection().addRange(range);
	  document.execCommand('copy');
	} else {
	  tgt.select();
	  document.execCommand('copy');
	}
}