const axios = require("axios")

module.exports = async function({ inputs }) {
  const { url, username, avatar_url, content } = inputs

  const result = await axios.post(url, {
    username,
    avatar_url,
    content,
  })

  return {
    httpStatus: result.status,
  }
}
