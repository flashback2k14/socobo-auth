var SocoboAuth = (function() {
  /**
   * Instance stores a reference to the Singleton
   */
  var instance;
  /**
   * Singleton functions
   * @returns {{registerUserAndLogin: registerUserAndLogin, loginWithProvider: loginWithProvider, loginWithEmailaddress: loginWithEmailaddress}}
   */
  function init() {
    /**
     * create user on firebase
     * @param baseURL
     * @param userObj
     * @return {Promise}
     * @private
     */
    function _createUser(baseURL, userObj) {
      return new Promise(function(resolve, reject) {
        var rootRef = new Firebase(baseURL);
        rootRef.createUser(userObj, function(err, user) {
          if (err) reject(err);
          if (user) resolve(user);
        });
      });
    }
    /**
     * get username from auth data
     * @param authData
     * @return {String}
     * @private
     */
    function _getUserName(authData) {
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
    }
    /**
     * get email address from auth data
     * @param userObj
     * @return {String}
     * @private
     */
    function _getUserEmailAddress(userObj) {
      switch(userObj.provider) {
        case "password":
          return userObj.password.email;
        case "google":
          if (userObj.google.hasOwnProperty("email")) return userObj.google.email;
          else return userObj.google.cachedUserProfile.link;
        case "twitter":
          return "";
        case "facebook":
          if (userObj.facebook.hasOwnProperty("email")) return userObj.facebook.email;
          else return userObj.facebook.cachedUserProfile.email;
      }
    }
    /**
     * get profile image from auth data
     * @param userObj
     * @return {String}
     * @private
     */
    function _getUserProfileImage(userObj) {
      switch(userObj.provider) {
        case "password":
          return userObj.password.profileImageURL;
        case "google":
          return userObj.google.profileImageURL;
        case "twitter":
          return userObj.twitter.profileImageURL;
        case "facebook":
          return userObj.facebook.profileImageURL;
      }
    }
    /**
     * register user on firebase and log user in
     * @param baseURL
     * @param provider
     * @param userObj
     * @param isAdmin
     * @return {Promise}
     */
    function registerUserAndLogin(baseURL ,provider, userObj, isAdmin) {
      if (userObj === null) {
        return loginWithProvider(baseURL ,provider, true, isAdmin);
      } else {
        return _createUser(baseURL, userObj)
          .then(function() {
            return loginWithEmailaddress(baseURL ,userObj, true, isAdmin);
          }.bind(this))
          .catch(function(err) {
            return err;
          });
      }
    }
    /**
     * ToDo: Generate API Keys for
     *  - Facebook
     * auth user with social media provider
     * @param baseURL
     * @param provider
     * @param isRegister
     * @param isAdmin
     * @return {Promise}
     */
    function loginWithProvider(baseURL, provider, isRegister, isAdmin) {
      return new Promise(function(resolve, reject) {
        var rootRef = new Firebase(baseURL);
        rootRef.authWithOAuthPopup(provider, function(err, user) {
          if (err) reject(err);
          if (user) {
            if (isRegister) {
              rootRef.child("users").child(user.uid).set({
                provider: user.provider,
                isAdmin: isAdmin
              });
              rootRef.child("profiles").child(user.uid).set({
                name: _getUserName(user),
                email: _getUserEmailAddress(user),
                biography: "Please tell us something about you!",
                profileImage: _getUserProfileImage(user),
                provider: user.provider
              });
            }
            resolve(user);
          }
        }.bind(this));
      });
    }
    /**
     * auth user with Email Address
     * @param baseURL
     * @param userObj
     * @param isRegister
     * @param isAdmin
     * @return {Promise}
     */
    function loginWithEmailaddress(baseURL, userObj, isRegister, isAdmin) {
      return new Promise(function(resolve, reject) {
        var rootRef = new Firebase(baseURL);
        rootRef.authWithPassword(userObj, function onAuth(err, user) {
          if (err) reject(err);
          if (user) {
            if (isRegister) {
              rootRef.child("users").child(user.uid).set({
                provider: user.provider,
                isAdmin: isAdmin
              });
              rootRef.child("profiles").child(user.uid).set({
                name: _getUserName(user),
                email: _getUserEmailAddress(user),
                biography: "Please tell us something about you!",
                profileImage: _getUserProfileImage(user),
                provider: user.provider
              });
            }
            resolve(user);
          }
        }.bind(this));
      });
    }
    /**
     * Provide public functions
     */
    return {
      registerUserAndLogin  : registerUserAndLogin,
      loginWithProvider     : loginWithProvider,
      loginWithEmailaddress : loginWithEmailaddress
    }
  }
  /**
   * Return Singleton Instance
   */
  return {
    /**
     * Get the Singleton instance if one exist or create one if it doesn't
     * @return {Object}
     */
    getInstance: function() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();
