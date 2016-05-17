if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}

module.exports = {

	isObject: function(val) {
		return Function.prototype.call.bind(Object.prototype.toString)(val) == '[object Object]';
	},

	isFunction: function(func) {
		var getType = {};
		return getType.toString.call(func) === '[object Function]';
	},

	htmlEscape: function(str) {
		return String(str)
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
	}

};
