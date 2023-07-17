// Get claim data based on webhook payload
get(
  state => `Claim/${state.data.claimNo}/_history/2`,
  {},
  next => ({ ...next, claim: next.data })
);

// Now, get the patient which is referenced in the claim
get(
  state => `${state.claim.patient.reference}/_history/2`,
  {},
  next => ({ ...next, patient: next.data })
);
