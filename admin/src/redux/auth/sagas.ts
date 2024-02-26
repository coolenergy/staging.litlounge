import { flatten } from "lodash";
import { put } from "redux-saga/effects";
import { createSagas } from "@lib/redux";
import Router from 'next/router';
import { login, loginSuccess, logout, loginFail, logoutSuccess } from "./actions";
import { updateCurrentUser } from '../user/actions';
import { authService, userService } from "src/services";
import { ILogin } from "src/interfaces";
import { resetAppState } from '@redux/actions';
import { message } from "antd";

const authSagas = [
  {
    on: login,
    *worker(data: any) {
      try {
        const payload = data.payload as ILogin;
        const resp = (yield authService.login(payload)).data;
        // store token, update store and redirect to dashboard page
        yield authService.setToken(resp.token);

        const userResp = (yield userService.me()).data;
        if (!userResp.roles.includes('admin')) {
          message.error('You don\'t have permission to access this page')
          return yield logout();
        }
        yield put(updateCurrentUser(userResp));
        yield put(loginSuccess());

        Router.push('/dashboard');
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(loginFail(error));
      }
    }
  },

  {
    on: logout,
    *worker() {
      try {
        yield authService.removeToken();
        yield put(logoutSuccess());
        yield put(resetAppState());
        // TODO - should use a better way?
        Router.push('/auth/login');
      } catch (e) {
        // message.error('Something went wrong!');
      }
    }
  }
];

export default flatten(createSagas(authSagas));
