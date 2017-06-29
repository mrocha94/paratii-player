/* eslint-disable no-alert */

import { createWallet, restoreWallet, getSeed } from '/imports/lib/ethereum/wallet.js';
import { userPrettyName, getUserPTIaddress, getPassword } from '/imports/api/users.js';
import { Events } from '/imports/api/events.js';
import '/imports/ui/components/edit-profile/edit-profile.js';
import './profile.html';


function showSeed() {
  // do not close when user clicks outside of the window
  getSeed(
    function (err, seed) {
      const modalOptions = {
        backdrop: 'static',
        keyboard: false,
      };
      Modal.show('show-seed', {
        seed,
        username: userPrettyName(),
      }, modalOptions);
    },
  );
}


Template.profile.helpers({
  ethNode() {
    return Session.get('ethNode');
  },
  ethAccount() {
    return Session.get('ethAccount');
  },
  balance() {
    return Session.get('balance');
  },
  events() {
    // Perform a reactive database query against minimongo
    return Events.find();
  },
  userEmail() {
    return Meteor.user().emails[0].address;
  },
});

Template.profile.events({
  'click #create-wallet'() {
    getPassword().then(function (password) {
      if (password) {
        wallet = createWallet(password);
        showSeed(wallet);
      }
    });
  },
  'submit #form-send-paratii'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form elements
    const transaction = {};
    const target = event.target;

    transaction.sender = getUserPTIaddress();
    transaction.receiver = target.wallet_friend_number.value;
    transaction.amount = target.wallet_pti_amount.value;
    transaction.description = 'send pti';

    // Events have
    // sender , receiver, description , transactionId and amount
    Meteor.call('events.sendPTI', transaction, function (error) {
      if (error) {
        // TODO notify error
        return;
      }
      // Clear form
      target.wallet_pti_amount.value = '';
      target.wallet_friend_number.value = '';
    });
    Meteor.call('events.balance', getUserPTIaddress(), function (error, result) {
      Session.set('balance', result);
    });
  },


  'click #restore-wallet'() {
    const seedPhrase = prompt('Please enter your 12-word seed phrase', '');
    getPassword().then(function (password) {
      if (password) {
        wallet = restoreWallet(password, seedPhrase);
      }
    });
  },
  'click #show-seed'() {
    showSeed();
  },
  'click #edit-profile'() {
    const modalOptions = {
    };
    Modal.show('editProfile', {
    }, modalOptions);
  },
});

Template.transaction.helpers({
  sendCheck() {
    if (this.sender === getUserPTIaddress()) {
      return true;
    }
    return false;
  },
});


// Meteor.user is not available when the application start,
// autorun restart the function till user is defined
Tracker.autorun(() => {
  const user = Meteor.user();
  if (user !== undefined) {
    const userPTIaddress = getUserPTIaddress();
    Meteor.subscribe('userTransactions', userPTIaddress);
    Meteor.call('events.balance', userPTIaddress, function (error, result) {
      Session.set('balance', result);
    });
  }
});