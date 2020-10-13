const axios = require("axios")

module.exports = async function ({ inputs }) {
  const { url, value1, value2, value3, value4, value5 } = inputs

  // send the platform to make sure zaps always work, even
  // if no values supplied
  const result = await axios.post(url, {
    platform: "budibase",
    value1,
    value2,
    value3,
    value4,
    value5,
  })

  return {
    httpStatus: result.status,
    zapierStatus: result.data ? result.data.status : null,
  }
}
