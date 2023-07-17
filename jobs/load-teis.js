fn(state => {
  const { patient, claim } = state;

  const vaccine = claim.item[0].productOrService.coding[0];
  const treatmentName = `${vaccine.display} (${vaccine.code})`;
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  console.log('patient', patient);
  console.log('claim', claim);
  console.log('treatmentName', treatmentName);

  return { ...state, treatmentName, today };
});

create('trackedEntityInstances', {
  program: 'GMfuAqBFS1g', // Vaccination
  orgUnit: 'KUVJPjmUmWc', // Madagascar
  trackedEntityType: 'x5fZpgCyv50', // Patient
  attributes: state => [
    {
      attribute: 'E4f4wBsDVgR',
      value: state.patient.name.family,
    },
    {
      attribute: 'Fz33peSkK1I',
      value: state.patient.name[0].given[0],
    },
    {
      attribute: 'POCXiJxpYX1',
      value: state.treatmentName, // "MUMPS VACCINE (871737006)"
    },
    {
      attribute: 'dA6ShmrHmhk',
      value: state.patient.birthDate,
    },
    {
      attribute: 'mWOlfweGigO',
      value: state.patient.gender,
    },
  ],
  enrollments: [
    {
      orgUnit: 'KUVJPjmUmWc',
      program: 'GMfuAqBFS1g',
      status: 'ACTIVE', // active
      enrollmentDate: state.today,
      incidentDate: state.today,
    },
  ],
});
