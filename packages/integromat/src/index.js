const axios = require("axios")

module.exports = async function ({ inputs }) {
  const { url, value1, value2, value3, value4, value5 } = inputs

  const result = await axios.post(url, {
    value1,
    value2,
    value3,
    value4,
    value5,
  })

  return {
    success: result.status === 200,
    response: result.data ? result.data : {},
  }
}

