var redisSendCommand;

module.exports = function(redis) {
	return function(req, res, next) {
    redisSendCommand = redisSendCommand || redis.RedisClient.prototype.internal_send_command;
    if (req.miniprofiler.enabled) {
      redis.RedisClient.prototype.internal_send_command = function(command, args, callback) {
        var query = `${command} ${args}`;
				req.miniprofiler.timeQuery('redis', query, redisSendCommand.bind(this), command, args, callback);
			};
		}
		next();
	};
};
