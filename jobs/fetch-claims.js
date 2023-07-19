// Get last 10 claims and related patients from HAPI
get(
  'Claim',
  {
    query: {
      _include: 'Claim:patient',
      _revinclude: '*',
      _sort: '-_lastUpdated',
      _count: 1,
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
