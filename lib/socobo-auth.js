/**
 * Base URL for firebase db
 * @type {string}
 */
var firebaseBaseUrl = 'https://socobo.firebaseio.com/';
/**
 * Socobo Auth Object
 * @type {{_createUser: Function, _getUserName: Function, registerUserAndLogin: Function, loginWithProvider: Function, loginWithEmailaddress: Function}}
 */
var SocoboAuth = {
  /**
   * create user on firebase
   * @param userObj
   * @returns {Promise}
   * @private
   */
  _createUser: function(userObj) {
    return new Promise(function(resolve, reject) {
      var rootRef = new Firebase(firebaseBaseUrl);
      rootRef.createUser(userObj, function(err, user) {
        if (err) reject(err);
        if (user) resolve(user);
      });
    });
  },
  /**
   * get username from auth data
   * @param authData
   * @returns {String}
   * @private
   */
  _getUserName: function(authData) {
    switch(authData.provider) {
      case 'password':
        return authData.password.email.replace(/@.*/, '');
      case 'google':
        return authData.google.displayName;
      case 'twitter':
        return authData.twitter.displayName;
      case 'facebook':
        return authData.facebook.displayName;
    }
  },
  /**
   * register user on firebase and log user in
   * @param provider
   * @param userObj
   */
  registerUserAndLogin: function(provider, userObj) {
    var that = this;
    return this._createUser(userObj)
      .then(function() {
        if (provider === 'email') return that.loginWithEmailaddress(userObj, true);
        else return that.loginWithProvider(provider, true);
      })
      .catch(function(err) {
        return err;
      });
  },
  /**
   * ToDo: Generate API Keys for
   *  - Google+
   *  - Twitter
   *  - Facebook
   * auth user with social media provider
   * @param provider
   * @returns {Promise}
   * @param isRegister
   */
  loginWithProvider: function(provider, isRegister) {
    var that = this;
    return new Promise(function(resolve, reject) {
      var rootRef = new Firebase(firebaseBaseUrl);
      rootRef.authWithOAuthPopup(provider, function(err, user) {
        if (err) reject(err);
        if (user) {
          if (isRegister) {
            rootRef.child("users").child(user.uid).set({
              provider: user.provider,
              name: that._getUserName(user),
              email: user.password.email
            });
          }
          resolve(user);
        }
      });
    });
  },
  /**
   * auth user with Email Address
   * @param userObj
   * @returns {Promise}
   * @param isRegister
   */
  loginWithEmailaddress: function(userObj, isRegister) {
    var that = this;
    return new Promise(function(resolve, reject) {
      var rootRef = new Firebase(firebaseBaseUrl);
      rootRef.authWithPassword(userObj, function onAuth(err, user) {
        if (err) reject(err);
        if (user) {
          if (isRegister) {
            rootRef.child("users").child(user.uid).set({
              provider: user.provider,
              name: that._getUserName(user),
              email: user.password.email
            });
          }
          resolve(user);
        }
      });
    });
  }
};
