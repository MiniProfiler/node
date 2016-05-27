/*
var redisSendCommand;

module.exports = function(redis) {
	return function(req, res, next) {
    redisSendCommand = redisSendCommand || redis.RedisClient.prototype.internal_send_command;
    redis.RedisClient.prototype.internal_send_command = !req.miniprofiler.enabled ? redisSendCommand : function(command, args, callback) {
      var query = `${command} ${args}`;
      req.miniprofiler.timeQuery('redis', query, redisSendCommand.bind(this), command, args, callback);
    };

		next();
	};
};
*/
