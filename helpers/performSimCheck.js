const fetch = require('node-fetch')
exports.performSimCheck = async (phoneNumber, accessToken) => {
  let simChanged
  let numberSupported = true

  const body = JSON.stringify({ phone_number: phoneNumber })
  const response = await fetch(`https://eu.api.tru.id/sim_check/v0.1/checks`, {
    method: 'POST',
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 201) {
    const data = await response.json()
    console.log(data)

    simChanged = !data.no_sim_change
  } else if (response.status === 400) {
    numberSupported = false
  } else {
    throw new Error(`Unexpected API response ${res.status}`, res.toString())
  }
  return { simChanged, numberSupported }
}