function Due(callback) {

  var self = this;

  this.id = Math.floor(Math.random() * 100000);

  this.value = undefined;
  this.status = 'pending';
  this.deferral = [];
  this.followers = [];
  this.futures = [];

  this.defer = function(onSettlement) {
    /*  Defer the execution of the settlement handler
     */
    self.deferral.push(onSettlement);
  }

  this.link = function(follower) {
    /*  Link the status of follower to the status of the future due
     */
    if (this.status !== 'pending')
      follower.apply(null, this.value)
    else 
      this.defer(follower);
  }

  this.resolve = function() {
    /*  ++ Resolve Due ++
     *  If the current due is settled (1)
     *  Execute every settlement handler, and store the (future) results (2).
     *  Link every follower (4) added by a returned due (returned.9) to every future returned by the current resolution (3)
     */

    if (self.status !== 'pending') { // (1)
      self.futures = self.deferral.map(function(deferred) { // (2)
        return deferred.apply(null, self.value);
      })

      self.futures.forEach(function(future) {
        if (future && future.isDue) { // (3)
          self.followers.forEach(function(follower) {
            future.link(follower); // (4)
          })
        }
      });
    }
  }

  // Call the deferred computation with the settlement function as argument
  callback(function() {
    self.value = arguments;
    self.status = 'settled';
    self.resolve();
  });
}

Due.prototype.isDue = true;

Due.prototype.then = function(onSettlement) {
  this.defer(onSettlement);
  this.resolve();

  var self = this;
  return new Due(function(settle) {
    /*  ++ Returned Due ++
     *  If the current due is settled (1), then the future is available.
     *  If this future value is a due, link the returned due to it (2)
     *  If this future value is not a due, settle the returned due with the future value (3).
     *  If the current due is pending (4), add the settlement handler to the followers (5), to be deferred to the future dues of the current due. (resolve.4)
     */

    if (self.status !== 'pending') { // (1)
      self.futures.forEach(function(future) {
        if (future && future.isDue)
          future.link(settle); // (2)
        else
          settle.apply(null, future); // (3)
      })
    } else { // (4)
      self.followers.push(settle); // (5)
    }
  });
}

// Transform a function expecting callback into a function returning due.
Due.mock = function(fn) {
  return function() {
    var _args = Array.prototype.slice.call(arguments),
        _this = this;
    return new Due(function(settle) {
      _args.push(settle);
      fn.apply(_this, _args);
    })
  }
}

module.exports = Due;