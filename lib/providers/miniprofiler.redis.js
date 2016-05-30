var redisSendCommand;
var blacklist = ['info'];

module.exports = function(redis) {
  redisSendCommand = redisSendCommand || redis.RedisClient.prototype.internal_send_command;

  return {
    name: 'redis',
    handler: function(req, res, next) {

      redis.RedisClient.prototype.internal_send_command = !req.miniprofiler.enabled ? redisSendCommand : function(command, args, callback) {
        var query = `${command} ${args.join(', ')}`.trim();
        if (this.ready && blacklist.indexOf(command) == -1)
          req.miniprofiler.timeQuery('redis', query, redisSendCommand.bind(this), command, args, callback);
        else
          redisSendCommand.call(this, command, args, callback);
      };

      next();
    }
  };
};