/* eslint-disable eol-last */
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/database';
import Config from 'react-native-config';

const firebaseConfig = {
  apiKey: 'AIzaSyAzcddrrv_gEkFA5pI_OFh5tZyrgWomzBI',
  projectId: 'smarttaxi-cfb04',
  appId: '1:309654726853:android:714dfae21b5ba2b2c028ac',
};
console.log(Config.API_KEY,'Config');
if (!firebase.apps.length) {
  console.log(firebase,'firebase');
  firebase.initializeApp(firebaseConfig);
}

export default firebase;