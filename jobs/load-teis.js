// build and log nested dhis2 records
fn(state => {
  const { patient, claim } = state;

  // Create "treatmentName" by concatenating...
  const vaccine = claim.item[0].productOrService.coding[0];
  const treatmentName = `${vaccine.display} (${vaccine.code})`;

  const today = new Date().toISOString().split('T')[0];

  const tei = {
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

  console.log('tei', JSON.stringify(tei, null, 2));
  return { ...state, tei };
});

// send data to DHIS2
// create('trackedEntityInstances', state => tei);