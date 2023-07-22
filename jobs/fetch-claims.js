fn(state => {
  const today = new Date().toISOString().split('T')[0];
  const cursor = state.cursor || '2023-07-19'
  return { ...state, today, cursor }
})

// Get last 10 claims and related patients from HAPI
get(
  'Claim',
  {
    query: {
      _lastUpdated: 'ge2023-07-19',
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
      ...state,
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
  
  console.log(JSON.stringify(claims, null, 2));
  
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

fn(state => {
  console.log(JSON.strinfify(state.data.patientsWithClaims.map(p => ({
    patient: p.resource.id,
    claims: p.claims.map(c => c.resource.id)
  }))), null, 2);
  return { data: state.data };
})
