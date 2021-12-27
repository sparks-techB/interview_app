import React from "react";
import axios from "axios";
import config from '../config';

var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();

function userReducer(state, action) {
  console.log(state);
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true, authId: action.authId, authName: action.authName, authEmail: action.authEmail };
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false, authName: null, authEmail: null };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {
  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!localStorage.getItem("id_token"),
    authId: localStorage.getItem("authId") ? localStorage.getItem("authId") : null,
    authName: localStorage.getItem("authName") ? localStorage.getItem("authName") : null,
    authEmail: localStorage.getItem("authEmail") ? localStorage.getItem("authEmail") : null,
  });

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut };

// ###########################################################

const loginUser = async (dispatch, name, email, mobile, clg_name, reg_no, year_passing, history, setIsLoading, setError) => {
  setError(false);
  setIsLoading(true);

  if (!!name && !!email && !!mobile) {
    await axios(
      config.baseUrl + 'signup', {
      method: 'POST',
      headers: {},
      data: { name, email, mobile, clg_name, reg_no, year_passing },
      withCredentials: null
    })
      .then(response => {
        setTimeout(() => {
          localStorage.setItem('id_token', response.data.user._id);
          localStorage.setItem('authId', response.data.user._id);
          localStorage.setItem('authName', response.data.user.name);
          localStorage.setItem('authEmail', response.data.user.email);
          setError(null)
          setIsLoading(false)
          dispatch({ type: 'LOGIN_SUCCESS', authId: response.data.user._id, authName: response.data.user.name, authEmail: response.data.user.email })

          history.push('/app/questions')
        }, 2000);
      })
      .catch(error => {
        let errdata = {};
        if (error.response.status === 400) {
          errdata = {
            status: error.response.status,
            message: error.response.data.message,
            error: error.response.data.error
          }
        }
        dispatch({
          type: 'ERROR',
          errorMessage: errdata || 'Request failed!',
        });
      })
    // setTimeout(() => {
    //   localStorage.setItem('id_token', 1)
    //   setError(null)
    //   setIsLoading(false)
    //   dispatch({ type: 'LOGIN_SUCCESS' })

    //   history.push('/app/questions')
    // }, 2000);
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
    setError(true);
    setIsLoading(false);
  }
}

function signOut(dispatch, history) {
  localStorage.removeItem("id_token");
  dispatch({ type: "SIGN_OUT_SUCCESS" });
  history.push("/login");
}
