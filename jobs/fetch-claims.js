// establish a baseline for the cursor
fn(state => {
  const today = new Date().toISOString().split('T')[0];
  console.log(`Fetching all claims updated on or after ${state.cursor || '2023-07-19'}`);
  return { ...state, today }
});

// Get claims and related patients from HAPI, updated since cursor date
get(
  'Claim',
  {
    query: {
      _lastUpdated: `ge${state.cursor || '2023-07-19'}`,
      _include: 'Claim:patient',
      _sort: '-_lastUpdated',
      _count: 200,
    },
  },
  next => {
    const byType = next.data.entry.reduce((r, a) => {
      r[a.resource.resourceType] = r[a.resource.resourceType] || [];
      r[a.resource.resourceType].push(a);
      return r;
    }, Object.create(null));

    return {
      ...next,
      data: {
        claims: byType.Claim,
        patients: byType.Patient,
      },
    };
  }
);

// clean and merge data
fn(state => {
  const { claims, patients } = state.data;
  
  const patientsWithClaims = patients
    // drop all patients without identifiers
    .filter(p => p.resource.identifier)
    .map(p => ({
      ...p,
      claims: claims.filter(c => {
        // console.log(JSON.stringify(c, null, 2));
        return (
          // has item
          c.resource.item &&
          // has coding
          c.resource.item[0].productOrService.coding &&
          // for this patient
          p.resource.id == c.resource.patient.reference.split('/')[1]
        );
      }),
    }));

  return { ...state, data: { patientsWithClaims } };
});

// print some logs and update the cursor for next time
fn(state => {
  const { data, today } = state;
  
  console.log("Found the following patients and claims in FHIR:")
  console.log(JSON.stringify(data.patientsWithClaims.map(p => ({
    patient: p.resource.id,
    claims: p.claims.map(c => c.resource.id)
  })), null, 2));
  
  return { data: state.data, cursor: today };
});
