const fetch = require('node-fetch');
exports.performSimCheck = async (phone_number, access_token) => {
  let no_sim_change;
  let sim_changed;
  let number_not_supported;
  // perform SIMCheck
  const body = JSON.stringify({ phone_number });
  const response = await fetch(`https://eu.api.tru.id/sim_check/v0.1/checks`, {
    method: 'POST',
    body,
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  console.log(data);
  if (data.hasOwnProperty('no_sim_change') && data.no_sim_change === false) {
    sim_changed = true;
  } else if (
    data.hasOwnProperty('no_sim_change') &&
    data.no_sim_change === true
  ) {
    no_sim_change = true;
  } else {
    number_not_supported = true;
  }
  return { no_sim_change, sim_changed, number_not_supported };
};
