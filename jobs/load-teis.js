// build and log nested dhis2 records
fn(state => {
  const { patients, claims } = state.data;
  const today = new Date().toISOString().split('T')[0];

  const teis = claims.map(c => {
    const claim = c.resource;

    // Create "treatmentName" by concatenating...
    const { coding } = claim.item[0].productOrService;
    const treatmentName = coding
      ? `${coding[0].display} (${coding[0].code})`
      : 'unknown';

    const patient = patients.find(
      p => p.resource.id == claim.patient.reference.split('/')[1]
    ).resource;

    return {
      program: 'GMfuAqBFS1g', // Vaccination
      orgUnit: 'KUVJPjmUmWc', // Madagascar
      trackedEntityType: 'x5fZpgCyv50', // Patient
      attributes: [
        { attribute: 'E4f4wBsDVgR', value: patient.name[0].family },
        { attribute: 'Fz33peSkK1I', value: patient.name[0].given[0] },
        { attribute: 'POCXiJxpYX1', value: treatmentName },
        { attribute: 'dA6ShmrHmhk', value: patient.birthDate },
        { attribute: 'mWOlfweGigO', value: patient.gender },
      ],
      enrollments: [
        {
          orgUnit: 'KUVJPjmUmWc',
          program: 'GMfuAqBFS1g',
          status: 'ACTIVE', // active
          enrollmentDate: today,
          incidentDate: today,
        },
      ],
    };
  });

  console.log('teis', JSON.stringify(teis, null, 2));
  return { ...state, teis };
});

// send data to DHIS2
// create('trackedEntityInstances', state => state.teis);
