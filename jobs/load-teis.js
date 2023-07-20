// build and log nested dhis2 records
fn(state => {
  const { patientsWithClaims } = state.data;
  const today = new Date().toISOString().split('T')[0];

  const teis = patientsWithClaims.map(p => {
    const patient = p.resource;
    const claims = p.claims;
    const treatments = claims.map(c => c.item);

    const enrollments = claims.map(c => {
      const claim = c.resource;
      const display = claim.insurance && claim.insurance[0].coverage.display;

      const oclMapping = {
        PARN: 'GMfuAqBFS1g',
        'Santé Maternelle': 'wBUDpZSS4Bh',
      };

      console.log(`We will map "${display}" to "${oclMapping[display]}"`);

      return {
        orgUnit: 'KUVJPjmUmWc',
        program: oclMapping[display] || 'q5Qyv66pIAI',
        status: 'ACTIVE', // active
        enrollmentDate: today,
        incidentDate: today,
      };
    });

    return {
      program: 'GMfuAqBFS1g', // Vaccination
      orgUnit: 'KUVJPjmUmWc', // Madagascar
      trackedEntityType: 'x5fZpgCyv50', // Patient
      attributes: [
        { attribute: 'rDeWj9yYtzv', value: patient.identifier[0].value },
        { attribute: 'E4f4wBsDVgR', value: patient.name[0].family },
        { attribute: 'Fz33peSkK1I', value: patient.name[0].given[0] },
        // { attribute: 'POCXiJxpYX1', value: JSON.stringify(treatments) },
        { attribute: 'dA6ShmrHmhk', value: patient.birthDate },
        { attribute: 'mWOlfweGigO', value: patient.gender },
      ],
      enrollments: enrollments,
    };
  });

  return { ...state, teis };
});

get('tracker/trackedEntities', {
  orgUnit: 'KUVJPjmUmWc',
  trackedEntityType: 'x5fZpgCyv50',
});

fn(state => {
  const { teis } = state;
  const existing = state.data.instances;

  const createable = [];
  const updateable = [];

  teis.forEach(t => {
    const match = existing.find(e => {
      const idAttr = e.attributes.find(a => a.displayName == 'Unique ID');
      return idAttr && idAttr.value == t.attributes[0].value;
    });

    if (match) {
      const enrollments =
        (match.enrollments && match.enrollments.concat(t.enrollments)) ||
        t.enrollments;

      updateable.push({ ...match, ...t, enrollments });
    } else {
      createable.push(t);
    }
  });

  console.log(`${updateable.length} to update; ${createable.length} to create`);
  console.log(JSON.stringify(updateable, null, 2));
  return { ...state, createable, updateable };
});

// send data to DHIS2
create('trackedEntityInstances', state => state.createable);
