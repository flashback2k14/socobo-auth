/**
 * Base URL for firebase db
 * @type {string}
 */
var firebaseBaseUrl = 'https://socobo.firebaseio.com/';
/**
 * Socobo Auth Object
 * @type {{_createUser: Function, _getUserName: Function, _getUserEmailAddress: Function, registerUserAndLogin: Function, loginWithProvider: Function, loginWithEmailaddress: Function}}
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
   * get email address from social provider
   * @param userObj
   * @returns {String}
   * @private
   */
  _getUserEmailAddress: function(userObj) {
    switch(userObj.provider) {
      case "password":
        return user.password.email;
      case "google":
        if (userObj.google.hasOwnProperty("email")) return userObj.google.email;
        else return userObj.google.cachedUserProfile.link;
      case "twitter":
        return "";
      case "facebook":
        if (userObj.facebook.hasOwnProperty("email")) return userObj.facebook.email;
        else return userObj.facebook.cachedUserProfile.email;
    }
  },
  /**
   * register user on firebase and log user in
   * @param provider
   * @param userObj
   * @returns {Promise}
   */
  registerUserAndLogin: function(provider, userObj) {
    var that = this;
    if (userObj === null) {
      return that.loginWithProvider(provider, true);
    } else {
      return this._createUser(userObj)
        .then(function() {
          return that.loginWithEmailaddress(userObj, true);
        })
        .catch(function(err) {
          return err;
        });
    }
  },
  /**
   * ToDo: Generate API Keys for
   *  - Twitter
   *  - Facebook
   * auth user with social media provider
   * @param provider
   * @param isRegister
   * @returns {Promise}
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
              email: that._getUserEmailAddress(user)
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
   * @param isRegister
   * @returns {Promise}
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
              email: that._getUserEmailAddress(user)
            });
          }
          resolve(user);
        }
      });
    });
  }
};
