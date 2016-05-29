var redisSendCommand;

module.exports = function(redis) {
  redisSendCommand = redis.RedisClient.prototype.internal_send_command;
	return function(req, res, next) {

    redis.RedisClient.prototype.internal_send_command = !req.miniprofiler.enabled ? redisSendCommand : function(command, args, callback) {
      var query = `${command} ${args.join(', ')}`.trim();
      if (this.ready)
        req.miniprofiler.timeQuery('redis', query, redisSendCommand.bind(this), command, args, callback);
      else
        redisSendCommand.call(this, command, args, callback);
    };
		next();
	};
};
