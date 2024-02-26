import { merge } from 'lodash';
import { combineReducers } from 'redux';

// load reducer here
import ui from './ui/reducers';
import user from './user/reducers';
import auth from './auth/reducers';
import settings from './settings/reducers';

const reducers = merge(ui, user, auth, settings);

export default combineReducers(reducers);
