// operation 1 - grab claim data
get(state => `Claim/${state.data.claimNo}/_history/2`, {
   query: { _pretty: true },
   headers: {'content-type': 'application/json'}
});

// custom function to see what we get!
fn(state => {
  console.log(JSON.stringify(state.data, null, 2));
  return { ...state, claim: state.data };
})

// Now, get the patient which is referenced in the claim
get(state => `${state.claim.patient.reference}/_history/2`, {
   query: { _pretty: true },
   headers: {'content-type': 'application/json'}
});

// log the patient
fn(state => {
  console.log(JSON.stringify(state.data, null, 2));
  return { ...state, patient: state.data };
})