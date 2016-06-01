//Backup for instrument functions
//Do we need this?

//exports.instrument = addProfilingInstrumentation;

/*
 * Modifies `toInstrument` such that each function has been instrumented for miniprofiler purposes.
 *
 *
 * Descends recursively, but will terminate even if there are cycles in the object graph.
 *
 * Adds `miniprofiler_instrumented` to `toInstrument`, any contained objects, and any contained functions.

function addProfilingInstrumentation(toInstrument) {
	if(!toInstrument){
		throw new Error('toInstrument must be set');
	}

	if(!_.isObject(toInstrument)) {
		throw new Error('toInstrument must be an object');
	}

	if(!toInstrument.miniprofiler_instrumented) {
		addProfilingImpl(toInstrument);
	}

	return toInstrument;
}


function instrument(func, defaultName) {
	var name = func.name || defaultName || 'Unnamed';

	var ret = function() {
		var toApply = func;
		var that = this;
		var args = Array.prototype.slice.call(arguments);

		if(args) {
			for(var i = 0; i < args.length; i++){
				var arg = args[i];
				if(arg && _.isFunction(arg)){
					args[i] = instrument(arg, name+' arg #'+i);
				}
			}
		}

		return step(
				name,
				function() {
					var ret = toApply.apply(that, args);

					return ret;
				}
			);
	};

	ret.miniprofiler_instrumented = true;

	return ret;
}

function addProfilingImpl(toInstrument) {
	if(toInstrument.miniprofiler_instrumented) {
		throw new Error('already instrumented');
	}

	toInstrument.miniprofiler_instrumented = true;

	for(var prop in toInstrument) {
		if(!toInstrument.hasOwnProperty(prop)) continue;

		var toWrap = toInstrument[prop];

		if(!toWrap || toWrap.miniprofiler_instrumented) continue;

		if(Array.isArray(toWrap)){
			for(var i = 0; i < toWrap.length; i++) {
				var member = toWrap[i];
				if(member.miniprofiler_instrumented) continue;

				addProfilingImpl(member);
			}

			continue;
		}

		if(_.isFunction(toWrap)) {
			var wrappedFunc = instrument(toWrap, prop);

			toInstrument[prop] = wrappedFunc;

			continue;
		}

    if(_.isObject(toWrap)) {
      addProfilingImpl(toWrap);

      continue;
    }
	}
}
*/
