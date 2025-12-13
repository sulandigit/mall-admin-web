import Cookies from 'js-cookie'

const TokenKey = 'loginToken'
const UserInfoKey = 'userInfo'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUserInfo() {
  const userInfoStr = localStorage.getItem(UserInfoKey)
  try {
    return userInfoStr ? JSON.parse(userInfoStr) : null
  } catch (error) {
    console.error('解析用户信息失败:', error)
    return null
  }
}

export function setUserInfo(userInfo) {
  return localStorage.setItem(UserInfoKey, JSON.stringify(userInfo))
}

export function removeUserInfo() {
  return localStorage.removeItem(UserInfoKey)
}
