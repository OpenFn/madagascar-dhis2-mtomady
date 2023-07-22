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


  const patientsWithClaims = patients
    // drop all patients without identifiers
    .filter(p => p.resource.identifier)
    .map(p => ({
      ...p,
      claims: claims.filter(c => {

      // A bunch of data quality issues make for a more complex workflow...
      if (!c.resource) throw new Error('there is no claim!');
      if (!c.resource.item) throw new Error('there is no claim item!');;

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
  console.log(state.data.patientsWithClaims.map(p => p.resource.id));
  return state;
})
