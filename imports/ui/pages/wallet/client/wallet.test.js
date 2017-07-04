/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, arrow-parens */

import { assert } from 'chai';
import { $ } from 'meteor/jquery';

import { withRenderedTemplate } from '../../../test-helpers.js';
import '../wallet.js';

describe('wallet', function () {
  it('renders signin form when user is not logged in', function () {
    const data = {};
    withRenderedTemplate('account', data, el => {
      assert.equal($(el).find('#at-pwd-form').length, 1);
    });
  });
});