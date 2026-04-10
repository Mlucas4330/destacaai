import type { z } from 'zod'
import type { CVDataSchema } from '@shared/schemas'

type CVData = z.infer<typeof CVDataSchema>

const s = {
  root: {
    fontFamily: '\'Times New Roman\', Times, serif',
    fontSize: '14px',
    lineHeight: '1.5',
    padding: '48px 64px',
    margin: '0',
    color: '#111',
  } as React.CSSProperties,
  name: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 4px',
  } as React.CSSProperties,
  contact: {
    textAlign: 'center',
    fontSize: '12px',
    margin: '0 0 16px',
  } as React.CSSProperties,
  link: {
    color: '#111827',
    textDecoration: 'none',
  } as React.CSSProperties,
  sectionHeading: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 'bold',
    paddingBottom: '2px',
    margin: '16px 0 8px',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  entryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px',
  } as React.CSSProperties,
  entryLeft: {} as React.CSSProperties,
  entryOrg: {
    fontWeight: 'bold',
    fontSize: '12px',
  } as React.CSSProperties,
  entryRole: {
    fontStyle: 'italic',
    fontSize: '12px',
  } as React.CSSProperties,
  entryRight: {
    textAlign: 'right',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    paddingLeft: '16px',
  } as React.CSSProperties,
  entryLocation: {
    fontStyle: 'italic',
  } as React.CSSProperties,
  bullets: {
    display: 'block',
    listStyle: 'disc',
    margin: '4px 0 12px',
    paddingLeft: '20px',
  } as React.CSSProperties,
  bullet: {
    fontSize: '12px',
    marginBottom: '2px',
  } as React.CSSProperties,
  skillsList: {
    listStyle: 'none',
    padding: '0',
    margin: '4px 0',
  } as React.CSSProperties,
  skillItem: {
    fontSize: '12px',
    marginBottom: '2px',
  } as React.CSSProperties,
  educationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  } as React.CSSProperties,
}

interface EntryProps {
  org: string
  role: string
  location: string
  dates: string
  bullets: string[]
}

function Entry({ org, role, location, dates, bullets }: EntryProps) {
  return (
    <>
      <div style={s.entryRow}>
        <div style={s.entryLeft}>
          <div style={s.entryOrg}>{org}</div>
          <div style={s.entryRole}>{role}</div>
        </div>
        <div style={s.entryRight}>
          <div style={s.entryLocation}>{location}</div>
          <div>{dates}</div>
        </div>
      </div>
      <ul style={s.bullets}>
        {bullets.map((b, i) => (
          <li key={i} style={s.bullet}>{b}</li>
        ))}
      </ul>
    </>
  )
}

interface CVTemplateProps {
  data: CVData
}

function CVTemplate({ data }: CVTemplateProps) {
  return (
    <div style={s.root}>
      <h1 style={s.name}>{data.name}</h1>
      <p style={s.contact}>
        {data.location} &bull;{' '}
        <a href={`mailto:${data.email}`} style={s.link}>{data.email}</a> &bull;{' '}
        <a href={data.linkedin} style={s.link}>{data.linkedin}</a> &bull;{' '}
        <a href={data.github} style={s.link}>{data.github}</a>
      </p>

      {data.leadership.length > 0 && (
        <>
          <h2 style={s.sectionHeading}>Leadership Activities</h2>
          <hr />
          {data.leadership.map((entry, i) => (
            <Entry key={i} {...entry} />
          ))}
        </>
      )}

      <h2 style={s.sectionHeading}>Experience</h2>
      <hr />
      {data.experience.map((entry, i) => (
        <Entry key={i} {...entry} />
      ))}

      <h2 style={s.sectionHeading}>Skills</h2>
      <hr />
      <ul style={s.skillsList}>
        <li style={s.skillItem}><strong>Technical:</strong> {data.skills.technical}</li>
        <li style={s.skillItem}><strong>Languages:</strong> {data.skills.languages}</li>
      </ul>

      <h2 style={s.sectionHeading}>Education</h2>
      <hr />
      {data.education.map((edu, i) => (
        <div key={i} style={s.educationRow}>
          <div>
            <div style={s.entryOrg}>{edu.university}</div>
            <div style={s.entryRole}>{edu.degree}</div>
          </div>
          <div style={s.entryRight}>
            <div style={s.entryLocation}>{edu.location}</div>
            <div>{edu.dates}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CVTemplate
