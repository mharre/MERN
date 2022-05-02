import { useState, useCallback, useEffect } from 'react';

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    const tokenExpirationDate = expirationDate || new Date(
      new Date().getTime() + 1000 * 60 * 60); //second new Date call is for getting current date. add 1 second -> conver to minute -> hour

    setTokenExpirationDate(tokenExpirationDate);

    localStorage.setItem(
      'userData',
      JSON.stringify({ userId: uid, //way of storing obj in localStorage because JSON just turns object into text that looks like object
        token: token,
        expiration: tokenExpirationDate.toISOString()
      })
    ); 
    setUserId(uid);
  }, [])

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem('userData');
  }, [])

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime(); //gives us the difference in milliseconds
      logoutTimer = setTimeout(logout, remainingTime)
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate])

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData')); // parse to turn back into JS obj
    if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) { //if > that means expiration date is still in the future therefore valid token
      login(storedData.userId, storedData.token, new Date(storedData.expiration));
    }
  }, [login]);

  return { token, login, logout, userId }

};