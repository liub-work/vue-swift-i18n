const Puid = require("puid");
const {
	getRange,
} = require(".");
const {
	scriptRegexp,
	propertyRegexp,
	templateTextInAngleBracketsRegexp,
	angleBracketSpaceRegexp,
	templateTextInLineRegexp,
	angleBracketsRegexp,
	quotationRegexp,
	spaceRegexp,
	firstSpaceRegexp,
	commentRegexp,
	warnRegexp
} = require("./regex");


const getLineCnWord = ({ lineText, reg, resoloveReg, initWordArr = [] }) => {
	let word = lineText.match(reg) || initWordArr;
	if (Array.isArray(word) && word.length > 0) {
		word = word
			.map(v => {
				//过滤特殊字符的匹配
				if (v.match(warnRegexp)) {
					return false;
				} else {
					return reg === propertyRegexp
						? v.split("=")[1].replace(resoloveReg, "")
						: v.replace(resoloveReg, "");
				}
			})
			.filter(v => !!v)
			.concat(initWordArr);
	}
	console.log(word);
	return word;
};

const getlinesObj = (arr, puid) =>
	arr.reduce((p, c) => {
		const id = puid.generate();
		p[id] = c;
		return p;
	}, {});

//return linesObj
module.exports = (currentEditor, puidType) => {
	if (!currentEditor || !currentEditor.document) return {};
	const { lineCount, languageId, lineAt } = currentEditor.document;
	const isJavascript = languageId === "javascript";
	const isVue = languageId === "vue";
	const { template, script } = getRange(currentEditor);
	const lines = [];
	for (let i = 0; i < lineCount; i++) {
		const lineText = lineAt(i).text;
		let cnWordArr = [];

		//跳过单行注释
		if (lineText.match(commentRegexp)) {
			continue;
		}
		//js文件(诸如mixin.js等)
		if (isJavascript) {
			cnWordArr = getLineCnWord({
				lineText,
				reg: scriptRegexp,
				resoloveReg: quotationRegexp,
				initWordArr: cnWordArr
			});
		}

		//vue文件
		if (isVue) {
			const inVueTemplate = i <= template.end && i >= template.begin;
			const inVueScript = i <= script.end && i >= script.begin;
			if (inVueTemplate) {
				const text = lineText;
				const inAngleBracketSpacet = lineText.match(angleBracketSpaceRegexp);
				
				const inText = lineText.match(templateTextInLineRegexp);
				const warning = lineText.match(warnRegexp);
				if (inAngleBracketSpacet && !warning) {
				}
			}
			if (inVueScript) {
			}
		}
		// //过滤单行注释，多行注释不考虑
		// if (!lineText.match(commentRegexp)) {
		// 	//匹配 template ><下的汉字
		// 	if (lineText.match(templateTextInAngleBracketsRegexp)) {
		// 		cnWordArr = getLineCnWord({
		// 			lineText,
		// 			reg: templateTextInAngleBracketsRegexp,
		// 			resoloveReg: spaceRegexp
		// 		});
		// 	}

		// 	//配合template range 判断 是否是template中的, warnRegexp判断是一整行 空字符开头结尾的 汉字
		// 	if (
		// 		lineText.match(templateTextInLineRegexp) &&
		// 		!lineText.match(warnRegexp) &&
		// 		isTemplate
		// 	) {
		// 		cnWordArr = getLineCnWord({
		// 			lineText,
		// 			reg: templateTextInLineRegexp,
		// 			resoloveReg: firstSpaceRegexp,
		// 			initWordArr: cnWordArr
		// 		});
		// 	}

		// 	//匹配属性中的汉字
		// 	if (lineText.match(propertyRegexp)) {
		// 		cnWordArr = getLineCnWord({
		// 			lineText,
		// 			reg: propertyRegexp,
		// 			resoloveReg: quotationRegexp,
		// 			initWordArr: cnWordArr
		// 		});
		// 	}

		// 	//匹配script中的汉字
		// 	if (lineText.match(scriptRegexp)) {
		// 		cnWordArr = getLineCnWord({
		// 			lineText,
		// 			reg: scriptRegexp,
		// 			resoloveReg: quotationRegexp,
		// 			initWordArr: cnWordArr
		// 		});
		// 	}
		// }
		if (cnWordArr.length > 0) {
			lines.push(...cnWordArr);
		}
	}
	const puid = new Puid(puidType === "short");
	const result = getlinesObj(Array.from(new Set(lines)), puid);
	return result;
};
