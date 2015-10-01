
(function(func){

	if(typeof module === 'object' && typeof module.exports === 'object'){
		module.exports = func;
	}else{
		window.checkJson = func;
	}

}(function(str){
	
	var sign = null;
	var pop = null;
	var i = 0,j = 0;

	var startJson = '{';
	var endJson = '}';
	var startArr = '[';
	var endArr = ']';

	var douhao = ',';
	var maohao = ':';
	var shuangyin = '"';
	var shuangyinStart = 'shuangyinStart';

	var chars = /\S/;

	var keySign = 'key';
	var valueSign = 'value';
	var objSign = 'obj';
	var pairSign = 'pair';
	var arrSign = 'array';

	var stack = [];
	str = str.trim();

	//@note 检查头尾
	if((str[0] !== startArr && str[0] !== startJson) ||
		(str[str.length - 1] !== endArr && str[str.length -1] !== endJson)){
			return false;
	}

	for(var i = 0;i < str.length;i++){

		cur = stack[stack.length -1];

		//@note 双引号的规则
		if(shuangyin === str[i]){
			if(cur.type !== shuangyinStart){
				stack.push({
					"char": shuangyin,
					type: shuangyinStart,
					index:i
				});
			}else{
				pop = stack.pop();
				cur = stack[stack.length - 1];
				if(pop.type !== shuangyinStart){
					return false;
				}
				if(cur["char"] === maohao){
					stack.push({
						sign: valueSign
					});	
				}else{
					stack.push({
						sign: keySign
					});
				}
			}
			continue;
		}

		//@note 冒号规则
		if(maohao === str[i]){
			if(cur.sign !== keySign){
				return false;
			}
			stack.push({
				"char": maohao,
				index: i
			});
			continue;
		}

		//@note 逗号规则
		if(douhao === str[i]){
			if(cur.sign === objSign || cur.sign === keySign){
				stack.push({
					"char": douhao,
					index: i
				});
			}else if(cur.sign === valueSign){
				pop = stack.pop();
				if(!pop && (pop.sign !== valueSign &&
					pop.sign !== objSign &&
					pop.sign !== arrSign)){
					return false;
				}
				pop = stack.pop();
				if(!pop || pop['char'] !== maohao){
					return false;
				}
				pop = stack.pop();
				if(!pop || pop.sing !== keySign){
					return false;
				}
				stack.push({
					sign: pairSign
				});
				stack.push({
					"char": douhao,
					index: i
				});
			}else{
				return false;
			}
			continue;
		}

		//@note 大括号的规则
		if(startJson === str[i]){
			stack.push({
				"char": startJson,
				index: i
			});
			continue;
		}	
		if(endJson === str[i]){
			pop = stack.pop();

			//@note }前不允许时逗号
			if(pop["char"] === douhao){
				return false;
			} 

			//@note 空json
			if(pop["char"] === startJson){
				stack.push({
					sign: objSign
				});
				continue;
			}

			if(!pop || (pop.sign !== valueSign && 
				pop.sign !== objSign &&
				pop.sign !== arrSign)){
				return false;
			}
			pop = stack.pop();
			if(!pop && pop['char'] !== douhao){
				return false;
			}
			pop = stack.pop();
			if(!pop && pop.sing !== keySign){
				return false;
			}
			stack.push({
				sign: pairSign
			});
			pop = stack.pop();
			if(pop.sign !== pairSign){
				return false;
			}

			do{
				if(pop["char"] === startJson){
					break;
				}
				cur = stack[stack.length - 1];
				if(pop.sign === pairSign){
					if(cur["char"] !== startJson && cur['char'] !== douhao){
						return false;
					}
					continue;
				}	
				if(pop["char"] === douhao){
					if(cur.sign !== pairSign && cur["char"] !== startJson){
						return false;
					}
					continue;
				}
				return false;
			}while(pop = stack.pop());
			if(pop === undefined){
				return false;
			}else{
				stack.push({
					sign: objSign
				});
			}
			continue;
		}

		//@note 中括号的规则
		if(startArr === str[i]){
			stack.push({
				"char": startArr,
				index: i	
			});
			continue;
		}
		if(endArr === str[i]){
			pop = stack.pop();

			//@note ]前不允许是逗号
			if(pop["char"] === douhao){
				return false;
			}

			do{
				if(pop["char"] === startArr){
					break;
				}
				cur = stack[stack.length - 1];
				if(pop.sign === keySign || 
					pop.sign === arrSign ||
					pop.sign ===objSign){
					if(cur["char"] !== douhao && cur["char"] !== startArr){
						return false;
					}
					continue;
				}
				if(pop["char"] === douhao){
					if(cur.sign !== keySign && 
					cur.sign !== arrSign &&
					cur.sign !==objSign){
						return false;
					}
					continue;
				}
				return false;

			}while(pop = stack.pop());
			if(pop["char"] === startArr){
				stack.push({
					sign: arrSign
				});
			}else{
				return false;
			}
			continue;
		}

		//@note 字符规则
		if(chars.test(str[i])){
			if(cur.type !== shuangyinStart){
				return false;
			}
			continue;
		}

	}
	if(stack.length === 1 && (stack[0].sign === objSign || stack[0].sign === arrSign)){
		return true;
	}else{
		return false;
	}
}));