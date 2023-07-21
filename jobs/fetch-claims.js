// Get last 10 claims and related patients from HAPI
get(
  'Claim',
  {
    query: {
      created: 'ge2023-07-19',
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

  // A bunch of data quality issues make for a more complex workflow...
  // if (!claim) throw new Error('there is no claim!');
  // if (!claim.item) throw new Error('there is no claim item!');
  // if (!patient.name[0].given[0]) throw new Error('there is no patient!');
  // if (!patient.identifier) throw new Error('no patient identifier');

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
