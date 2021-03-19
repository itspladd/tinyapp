class MessageHandler {
  /*
  * A custom middleware message handler, to allow the site to pass
  * one-time messages and alerts to be displayed to a user.
  *
  * The handler is currently accessed via its addError and
  * checkFlags functions. addError adds an alert message to a page,
  * and checkFlags monitors the handler's status flags to see if
  * errors should be maintained or cleared.
  * 
  */
  constructor(options) {
    /* The following lines aren't isn't great, I don't think - we're directly modifying TEMPLATEVARS
    and passing an entire function in from the helper, instead of
    actually letting the helper or TEMPLATEVARS do their own things.
    But it seemed like overkill to make TEMPLATEVARS and helper into
    separate classes, and it currently works as-is. ¯\_(ツ)_/¯*/
    this.TEMPLATEVARS = options.TEMPLATEVARS;
    this.removeFromAny = options.helper.removeFromAny;

    this.errorMessageFlag = false;
    this.removeErrorsFlag = false;

    // checkFlags is the function that actually runs as middleware.
    // We have to bind it to 'this' so that app.use can grab and run it.
    this.checkFlags = this.checkFlagsUnbound.bind(this);
  }

  /*******
   * checkFlags(): The "middleware" part. checkFlags should be called on every request.
   */
  checkFlagsUnbound(req, res, next) {
    // Should we wipe errors on this request? If so, do it.
    if (this.removeErrorsFlag) {
      this.wipeErrors();
    }

    // If we have an error message flag raised, then lower it and set the "remove" flag.
    // Next time we load a page, we'll remove the error so we don't see it again.
    if (this.errorMessageFlag) {
      this.setRemovalFlag(true);
    }
    next();
  }

  /*******
   * addError: Adds an error-like message to a page's templatevars.
   * INPUT
   *  page: (string) The key in TEMPLATEVARS corresponding to the page you wish to add an error to.
   *  message: (string) The message to be displayed.
   *  redirectCallback: Expects a res.redirect('destination') function.
   *
   * SIDE EFFECTS:
   *  - Adds a new key/value pair to TEMPLATEVARS['page']: 'error':'message'
   *  - Raises the errorMessageFlag
   *  - Forces a lower on the removeErrorsFlag
   *  -- If we just added a new error, we want to make sure it won't get removed immediately.
   *  -- For instance, if we're on a page that's currently displaying an error, removeErrorsFlag will be raised.
   *  -- If we happen to add an error on the next request, then the error will get cleared unless we force removeErrorsFlag to lower.
   */
  addError({ page, code, message }) {
    this.TEMPLATEVARS[page]['errorMsg'] = message;
    this.TEMPLATEVARS[page]['error'] = code || undefined;
    this.setErrorFlag(true);
    this.setRemovalFlag(false);
  }

  addGenericLoginError(action) {
    this.addError({ page: 'login', message: `You have to log in to ${action}!`});
  }

  addGenericPermissionsError(action) {
    this.addError({ page: 'urls_index', message: `You can't ${action} URLs that don't belong to you!`});
  }

  addRegistrationError(message) {
    this.addError({ page: 'register', message: `${message}`});
  }

  addLoginValidationError(message) {
    this.addError({ page: 'login', message: `${message}`});
  }

  addBadURLError(shortURL) {
    this.TEMPLATEVARS.bad_url['shortURL'] = shortURL;
    this.setErrorFlag(true);
    this.setRemovalFlag(false);
  }

  wipeErrors() {
    this.removeFromAny(this.TEMPLATEVARS, 'error');
    this.removeFromAny(this.TEMPLATEVARS, 'errorMsg');
    delete this.TEMPLATEVARS.bad_url.shortURL;
    
    this.setRemovalFlag(false);
    this.setErrorFlag(false);
  }

  setErrorFlag(value) {
    this.errorMessageFlag = value;
  }

  setRemovalFlag(value) {
    this.removeErrorsFlag = value;
  }
}

module.exports = MessageHandler;